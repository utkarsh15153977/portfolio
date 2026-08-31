"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

interface ConversationSummary {
  id: number;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ConversationDetail {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: number;
    role: string;
    content: string;
    createdAt: string;
  }[];
}

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------

const POLL_INTERVAL = 2000;
const MAX_POLL_DURATION = 60_000;

function useChatPoller(
  correlationId: string | null,
  onComplete: (aiResponse: string) => void,
  onError: (error: string) => void,
  onExpire: () => void
) {
  const startTime = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!correlationId) return;

    startTime.current = Date.now();

    intervalRef.current = setInterval(async () => {
      try {
        const status = await apiFetch<{
          correlationId: string;
          conversationId: number;
          status: string;
          aiResponse?: string;
          error?: string;
        }>(`/api/ai/chat/status/${correlationId}`);

        if (status.status === "COMPLETED" || status.status === "FAILED") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (status.status === "COMPLETED" && status.aiResponse) {
            onComplete(status.aiResponse);
          } else {
            onError(status.error || "AI response failed");
          }
          return;
        }

        // Timeout
        if (Date.now() - startTime.current > MAX_POLL_DURATION) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onExpire();
        }
      } catch {
        if (Date.now() - startTime.current > MAX_POLL_DURATION) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onExpire();
        }
      }
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [correlationId, onComplete, onError, onExpire]);
}

// ---------------------------------------------------------------------------
// Chat Panel
// ---------------------------------------------------------------------------

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [correlationId, setCorrelationId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    apiFetch<ConversationSummary[]>("/api/ai/conversations")
      .then(setConversations)
      .catch(() => {
        // Silently ignore — not critical
      });
  }, []);

  // Polling callbacks
  const handlePollComplete = useCallback((aiResponse: string) => {
    setCorrelationId(null);
    setSending(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.pending ? { ...m, content: aiResponse, pending: false } : m
      )
    );
    // Refresh conversation list
    apiFetch<ConversationSummary[]>("/api/ai/conversations")
      .then(setConversations)
      .catch(() => {});
  }, []);

  const handlePollError = useCallback((error: string) => {
    setCorrelationId(null);
    setSending(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.pending
          ? { ...m, content: `Error: ${error}`, pending: false }
          : m
      )
    );
  }, []);

  const handlePollExpire = useCallback(() => {
    setCorrelationId(null);
    setSending(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.pending
          ? { ...m, content: "Response timed out. Please try again.", pending: false }
          : m
      )
    );
  }, []);

  useChatPoller(correlationId, handlePollComplete, handlePollError, handlePollExpire);

  // Send message
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setFetchError(null);
    setInput("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      pending: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const response = await apiFetch<{
        correlationId: string;
        conversationId: number;
        status: string;
      }>("/api/ai/chat", {
        method: "POST",
        json: {
          message: trimmed,
          conversationId: conversationId,
        },
      });

      setCorrelationId(response.correlationId);
      setConversationId(response.conversationId);
    } catch (err) {
      setSending(false);
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setFetchError("Authentication required");
        } else if (err.status === 429) {
          setFetchError("Too many requests. Please wait.");
        } else {
          setFetchError(err.message || "Failed to send message");
        }
      } else {
        setFetchError("Failed to send message");
      }
      // Remove the pending assistant message
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
    }
  };

  // New conversation
  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setCorrelationId(null);
    setSending(false);
    setShowConversations(false);
  };

  // Load a past conversation
  const loadConversation = async (id: number) => {
    setShowConversations(false);
    setMessages([]);
    setConversationId(id);
    setCorrelationId(null);
    setSending(false);

    try {
      const detail = await apiFetch<ConversationDetail>(
        `/api/ai/conversations/${id}`
      );
      const loaded: ChatMessage[] = detail.messages.map((m) => ({
        id: `loaded-${m.id}`,
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));
      setMessages(loaded);
    } catch {
      setFetchError("Failed to load conversation");
    }
  };

  // Delete conversation
  const deleteConversation = async (id: number) => {
    try {
      await apiFetch(`/api/ai/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        handleNewConversation();
      }
    } catch {
      // Silently ignore
    }
  };

  // Keyboard: Enter sends (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex flex-col border border-line bg-gradient-to-b from-surface-2/80 to-surface/60">
      {/* =========================================================
          HEADER
          ========================================================= */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-warn" aria-hidden />
          <p className="font-mono text-[10px] tracking-[0.2em] text-ink-dim">
            AI ASSISTANT
          </p>
          {conversationId && (
            <span className="border border-line px-1.5 py-0.5 font-mono text-[8px] tracking-[0.15em] text-ink-faint">
              CONV #{conversationId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Conversation list toggle */}
          {conversations.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConversations(!showConversations)}
              className="inline-flex items-center gap-1.5 border border-line px-2 py-1 font-mono text-[9px] tracking-[0.18em] text-ink-faint transition-colors hover:border-accent/50 hover:text-accent"
            >
              <ChevronDown className="size-3" aria-hidden />
              HISTORY
            </button>
          )}

          {/* New conversation */}
          <button
            type="button"
            onClick={handleNewConversation}
            className="inline-flex items-center gap-1.5 border border-accent/30 bg-accent-soft px-2 py-1 font-mono text-[9px] tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-background"
          >
            <Plus className="size-3" aria-hidden />
            NEW
          </button>
        </div>
      </div>

      {/* =========================================================
          CONVERSATION LIST (collapsible)
          ========================================================= */}
      {showConversations && conversations.length > 0 && (
        <div className="max-h-40 overflow-y-auto border-b border-line bg-background/50">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "flex items-center justify-between px-4 py-2 transition-colors",
                conv.id === conversationId
                  ? "bg-accent-soft/50"
                  : "hover:bg-white/[0.02]"
              )}
            >
              <button
                type="button"
                onClick={() => loadConversation(conv.id)}
                className="flex-1 text-left"
              >
                <p className="font-mono text-[10px] tracking-[0.15em] text-ink truncate">
                  {conv.title || `Conversation ${conv.id}`}
                </p>
                <p className="font-mono text-[9px] tracking-[0.12em] text-ink-faint">
                  {conv.messageCount} messages
                </p>
              </button>
              <button
                type="button"
                onClick={() => deleteConversation(conv.id)}
                className="ml-2 inline-flex size-6 shrink-0 items-center justify-center text-ink-faint transition-colors hover:text-warn"
                aria-label={`Delete conversation ${conv.id}`}
              >
                <Trash2 className="size-3" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          MESSAGES
          ========================================================= */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ minHeight: "200px", maxHeight: "400px" }}
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[10px] tracking-[0.2em] text-ink-faint/60">
              ASK ME ANYTHING ABOUT UTKARSH&apos;S WORK
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] px-3 py-2 font-mono text-[11px] leading-relaxed tracking-[0.04em]",
                msg.role === "user"
                  ? "border border-accent/40 bg-accent-soft text-ink"
                  : "border border-line bg-surface-2/80 text-ink-dim"
              )}
            >
              {msg.pending ? (
                <span className="inline-flex items-center gap-1.5 text-ink-faint">
                  <span className="inline-block size-1 rounded-full bg-warn animate-pulse-dot" />
                  Thinking...
                </span>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* =========================================================
          ERROR
          ========================================================= */}
      {fetchError && (
        <div className="flex items-center gap-2 border-t border-warn/30 bg-warn/[0.05] px-4 py-2">
          <AlertTriangle className="size-3 shrink-0 text-warn" aria-hidden />
          <p className="font-mono text-[10px] tracking-[0.15em] text-warn">
            {fetchError}
          </p>
        </div>
      )}

      {/* =========================================================
          INPUT
          ========================================================= */}
      <form onSubmit={handleSend} className="border-t border-line">
        <div className="flex items-end gap-2 p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 resize-none border border-line bg-background/70 px-3 py-2 font-mono text-[11px] leading-relaxed text-ink placeholder:text-ink-faint/70 transition-colors hover:border-line-strong focus:border-accent/60 focus:bg-background focus:outline-none disabled:opacity-60"
            style={{ minHeight: "36px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="inline-flex size-9 shrink-0 items-center justify-center bg-accent text-background transition-colors hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="size-4" aria-hidden />
          </button>
        </div>
      </form>
    </div>
  );
}

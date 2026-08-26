"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { CornerDownLeft, LoaderCircle, Terminal } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-preferences";
import { cn } from "@/lib/utils";

/**
 * Phase 4.6 — live UTKARSH AI agent console.
 *
 * Talks to the Next.js route handler (app/api/ai-agent-chat/route.ts), which
 * bridges to the Spring Boot agent (POST /api/ai/agent/chat). The backend is
 * the single source of truth: grounded answers come from the RAG vector store
 * plus the read-only portfolio tools running on local Ollama — no keys, no
 * other AI provider, nothing fabricated in the frontend.
 */

const MAX_MESSAGE_LENGTH = 1000; // mirrors the backend ChatRequest contract

// Slightly above the proxy's 180s backend timeout so the proxy's own error
// mapping wins while still guaranteeing the browser never waits forever.
const FETCH_TIMEOUT_MS = 185_000;

const TIMEOUT_MESSAGE = "The agent took too long to respond - please try again.";

interface Turn {
  id: number;
  question: string;
  answer?: string;
  source?: string;
  error?: string;
}

// Quick queries keep the console usable without typing; they mirror what the
// agent can actually answer from portfolio knowledge.
const QUICK_QUERIES = [
  "What technologies did Utkarsh use at EdgeVerve?",
  "Which skills are production vs exploration?",
  "How does the real-time chat architecture work?",
  "What is Kafka used for in his experience?",
] as const;

export function AiAgentChat() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const nextId = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeRequest = useRef<AbortController | null>(null);

  // Abort any in-flight request if the console unmounts.
  useEffect(() => {
    const active = activeRequest;
    return () => active.current?.abort();
  }, []);

  // Keep the latest turn visible as the conversation grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }, [turns, loading, reducedMotion]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const turnId = ++nextId.current;
    setTurns((prev) => [...prev, { id: turnId, question: trimmed }]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    activeRequest.current = controller;
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch("/api/ai-agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const error =
          payload !== null &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof (payload as { error: unknown }).error === "string"
            ? (payload as { error: string }).error
            : "AI service unavailable - try again later";
        throw new Error(error);
      }

      if (
        payload === null ||
        typeof payload !== "object" ||
        typeof (payload as { answer?: unknown }).answer !== "string"
      ) {
        throw new Error("the AI service returned an unexpected response");
      }

      const { answer } = payload as { answer: string };
      const source =
        typeof (payload as { source?: unknown }).source === "string"
          ? (payload as { source: string }).source
          : "portfolio";

      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === turnId ? { ...turn, answer, source } : turn
        )
      );
    } catch (err) {
      // Aborted requests surface as a clear timeout message — never a raw
      // browser error like "Failed to fetch".
      const timedOut =
        controller.signal.aborted ||
        (err instanceof DOMException && err.name === "AbortError");
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === turnId
            ? {
                ...turn,
                error: timedOut
                  ? TIMEOUT_MESSAGE
                  : err instanceof Error && err.message
                    ? err.message
                    : "AI service unavailable - try again later",
              }
            : turn
        )
      );
    } finally {
      clearTimeout(timer);
      if (activeRequest.current === controller) {
        activeRequest.current = null;
      }
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void ask(input);
  };

  // Enter submits, Shift+Enter inserts a newline; IME composition safe.
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void ask(input);
    }
  };

  const canSubmit = !loading && input.trim().length > 0;

  return (
    <section
      aria-label="Live UTKARSH AI agent chat"
      aria-busy={loading}
      className="panel corner-brackets p-6 sm:p-7"
    >
      {/* console header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] text-ink-faint">
          <Terminal className="size-3.5 text-accent" aria-hidden />
          UTKARSH AI — LIVE AGENT CONSOLE
        </p>
        <p className="flex items-center gap-1.5 font-mono text-[8.5px] tracking-[0.22em] text-ok">
          <span
            className="animate-pulse-dot inline-block size-1 rounded-full bg-ok"
            aria-hidden
          />
          WIRED · SPRING BOOT AGENT · LOCAL OLLAMA
        </p>
      </div>

      {/* transcript */}
      <div
        aria-live="polite"
        className="mt-5 max-h-[380px] min-h-[120px] space-y-5 overflow-y-auto border border-line bg-background/60 p-4 sm:p-5"
      >
        {turns.length === 0 && (
          <div className="space-y-4">
            <p className="font-mono text-[11px] leading-relaxed tracking-[0.12em] text-ink-faint">
              {"// ASK ABOUT THE PORTFOLIO — EXPERIENCE, PROJECTS, SKILLS,"}
              <br />
              {"// ARCHITECTURE. ANSWERS COME FROM THE REAL BACKEND AGENT."}
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Suggested questions">
              {QUICK_QUERIES.map((query) => (
                <li key={query}>
                  <button
                    type="button"
                    onClick={() => void ask(query)}
                    disabled={loading}
                    className="chip chip--ai cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                  >
                    {query}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {turns.map((turn) => (
          <article key={turn.id} className="space-y-3">
            <p className="break-words font-mono text-xs leading-relaxed tracking-[0.08em] text-accent">
              <span aria-hidden className="text-ink-faint">{"> "}</span>
              {turn.question}
            </p>

            {turn.answer !== undefined ? (
              <div className="border-l-2 border-warn/40 bg-warn/[0.04] py-3 pl-4 pr-3">
                <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-ink-dim">
                  {turn.answer}
                </p>
                <p className="mt-2.5 font-mono text-[8.5px] tracking-[0.24em] text-warn/80">
                  SOURCE: {turn.source === "portfolio" ? "PORTFOLIO" : turn.source?.toUpperCase() ?? "PORTFOLIO"}
                </p>
              </div>
            ) : turn.error !== undefined ? (
              <div
                role="alert"
                className="border border-red-400/35 bg-red-400/[0.05] px-4 py-3"
              >
                <p className="font-mono text-[10px] leading-relaxed tracking-[0.14em] text-red-300">
                  ✕ {turn.error.toUpperCase()}
                </p>
              </div>
            ) : null}
          </article>
        ))}

        {loading && (
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-violet">
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
            AGENT THINKING — QUERYING PORTFOLIO KNOWLEDGE…
          </p>
        )}
        <div ref={bottomRef} aria-hidden />
      </div>

      {/* input */}
      <form onSubmit={onSubmit} aria-label="Ask the portfolio AI agent">
        <label
          htmlFor="ai-agent-message"
          className="mt-5 mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-ink-dim"
        >
          MESSAGE *
        </label>
        <textarea
          id="ai-agent-message"
          name="message"
          rows={2}
          maxLength={MAX_MESSAGE_LENGTH}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g. What technologies did Utkarsh use at EdgeVerve? (Enter to send · Shift+Enter for newline)"
          className="w-full resize-y border border-line bg-background/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint/85 focus:border-accent/60 focus:outline-none"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[9px] tracking-[0.18em] text-ink-faint/80">
            {input.length}/{MAX_MESSAGE_LENGTH} CHARS
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "inline-flex items-center justify-center gap-2 bg-accent px-6 py-3",
              "font-mono text-xs font-bold tracking-[0.25em] text-background transition-all",
              "hover:bg-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)]",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent disabled:hover:shadow-none"
            )}
          >
            <CornerDownLeft className="size-4" aria-hidden />
            {loading ? "THINKING…" : "SEND QUERY"}
          </button>
        </div>
      </form>

      <p className="mt-4 font-mono text-[9px] leading-relaxed tracking-[0.2em] text-ink-faint/80">
        {"// ROUTE: NEXT.JS → SPRING BOOT AGENT → READ-ONLY PORTFOLIO TOOLS + RAG (LOCAL OLLAMA)"}
      </p>
    </section>
  );
}

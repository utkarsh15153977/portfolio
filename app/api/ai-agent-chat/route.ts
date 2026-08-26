import { NextResponse } from "next/server";

/**
 * Phase 4.6 — server-side bridge to the Spring Boot AI agent.
 * Phase 4.7 — production hardening: input validation, bounded timeout,
 * per-IP rate limiting and concise safe logging.
 *
 * Browser → POST /api/ai-agent-chat (this route) → POST :8090/api/ai/agent/chat
 *
 * Why a route handler instead of calling the backend directly from the client:
 * - the Spring Boot API does not allow cross-origin browser calls, and CORS
 *   should stay closed;
 * - the backend base URL never reaches the client bundle;
 * - timeouts and backend failures can be normalized into one safe error shape.
 *
 * Security notes:
 * - PORTFOLIO_BACKEND_URL is a SERVER-side env var (no NEXT_PUBLIC_ prefix);
 * - nothing here requires an API key: the local Ollama backend holds any
 *   provider configuration itself;
 * - only message LENGTH is logged, never the message content;
 * - every failure returns a fixed safe JSON message — never stack traces.
 */

// Explicit 127.0.0.1: Node may resolve "localhost" to ::1, which Spring Boot
// does not listen on by default. Only http/https URLs are accepted; anything
// else falls back to the safe default.
function resolveBackendBaseUrl(): string {
  const raw = process.env.PORTFOLIO_BACKEND_URL ?? "";
  return /^https?:\/\//i.test(raw) ? raw.replace(/\/+$/, "") : "http://127.0.0.1:8090";
}

const BACKEND_BASE_URL = resolveBackendBaseUrl();

// Local Ollama inference can be slow — especially a 7B model on CPU-only
// machines doing multi-round tool calling — so allow up to three minutes.
// Deliberately generous; do not reduce for CPU deployments.
const BACKEND_TIMEOUT_MS = 180_000;

// Documented for platforms that enforce route durations.
export const maxDuration = 180;

const MAX_MESSAGE_LENGTH = 1000; // mirrors ChatRequest validation on the backend

// ---------------------------------------------------------------------------
// Rate limiting (Phase 4.7)
//
// Smallest safe mechanism: an in-memory fixed window per client IP. All
// public traffic funnels through this single Next.js process, so per-process
// counting is accurate here (the backend would only ever see 127.0.0.1).
//
// Known limitations (accepted for this deployment, Redis deliberately NOT
// added): counters live in process memory, reset on restart, and are not
// shared across multiple instances. Behind a load balancer each instance
// would enforce its own budget.
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_MAX_TRACKED_IPS = 10_000;

const recentRequests = new Map<string, number[]>();

function clientIpOf(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || "unknown";
}

function allowRequest(ip: string): boolean {
  const now = Date.now();

  // Bound memory: drop stale entries once the map grows large.
  if (recentRequests.size > RATE_LIMIT_MAX_TRACKED_IPS) {
    for (const [key, stamps] of recentRequests) {
      const newest = stamps[stamps.length - 1];
      if (newest === undefined || now - newest >= RATE_LIMIT_WINDOW_MS) {
        recentRequests.delete(key);
      }
    }
  }

  const stamps = (recentRequests.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  const allowed = stamps.length < RATE_LIMIT_MAX_REQUESTS;
  if (allowed) {
    stamps.push(now);
    recentRequests.set(ip, stamps);
  } else {
    recentRequests.set(ip, stamps); // refresh pruning state
  }
  return allowed;
}

// ---------------------------------------------------------------------------

interface AgentChatSuccess {
  answer: string;
  source: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeError(message: string, status: number, headers?: HeadersInit): NextResponse {
  return NextResponse.json({ error: message }, { status, headers });
}

export async function POST(request: Request): Promise<NextResponse> {
  const startedAt = Date.now();
  const ip = clientIpOf(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.warn(`[ai-agent-chat] rejected status=400 durMs=${Date.now() - startedAt} reason=malformed-body`);
    return safeError("malformed request body", 400);
  }

  // null / non-string / whitespace-only all normalize to "" here.
  const message =
    isRecord(body) && typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    console.warn(`[ai-agent-chat] rejected status=400 durMs=${Date.now() - startedAt} reason=blank-message`);
    return safeError("message must not be blank", 400);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    console.warn(
      `[ai-agent-chat] rejected status=400 durMs=${Date.now() - startedAt} reason=oversized chars=${message.length}`
    );
    return safeError(`message must not exceed ${MAX_MESSAGE_LENGTH} characters`, 400);
  }

  if (!allowRequest(ip)) {
    console.warn(`[ai-agent-chat] limited status=429 ip=${ip}`);
    return safeError("too many requests - please wait a moment and try again", 429, {
      "Retry-After": String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
    });
  }

  // Only the message LENGTH is logged — never its content.
  console.info(`[ai-agent-chat] start ip=${ip} chars=${message.length}`);

  let response: Response;
  try {
    response = await fetch(`${BACKEND_BASE_URL}/api/ai/agent/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
  } catch (err) {
    // Network failure or timeout — never leak backend internals.
    const kind =
      err instanceof Error && err.name === "TimeoutError" ? "timeout" : "unreachable";
    console.error(
      `[ai-agent-chat] failed status=502 durMs=${Date.now() - startedAt} reason=${kind}`
    );
    return safeError("AI service is not reachable right now", 502);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // fall through — handled as an upstream failure below
  }

  if (response.ok && isRecord(payload)) {
    const { answer, source } = payload as Partial<AgentChatSuccess>;
    if (typeof answer === "string" && answer.length > 0) {
      console.info(
        `[ai-agent-chat] done status=200 durMs=${Date.now() - startedAt} chars=${message.length} answerChars=${answer.length}`
      );
      return NextResponse.json({
        answer,
        source: typeof source === "string" ? source : "portfolio",
      });
    }
    console.error(`[ai-agent-chat] failed status=502 durMs=${Date.now() - startedAt} reason=unexpected-upstream-shape`);
    return safeError("the AI service returned an unexpected response", 502);
  }

  if (response.status === 400 && isRecord(payload) && typeof payload.error === "string") {
    // Validation feedback from the backend is safe to relay verbatim.
    console.warn(`[ai-agent-chat] relayed status=400 durMs=${Date.now() - startedAt}`);
    return safeError(payload.error, 400);
  }
  if (response.status === 429) {
    console.warn(`[ai-agent-chat] relayed status=429 durMs=${Date.now() - startedAt}`);
    return safeError("the AI service is busy - please try again shortly", 429);
  }
  if (response.status === 503) {
    console.warn(`[ai-agent-chat] relayed status=503 durMs=${Date.now() - startedAt}`);
    return safeError("the AI agent is currently disabled on the server", 503);
  }
  console.error(
    `[ai-agent-chat] failed status=502 durMs=${Date.now() - startedAt} upstream=${response.status}`
  );
  return safeError("AI service unavailable - try again later", 502);
}

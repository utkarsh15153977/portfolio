import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

/**
 * Phase 4.7 — contract tests for the AI proxy route.
 *
 * The Spring Boot backend is stubbed via global.fetch; every mapping the
 * route performs is covered: validation, safe error shapes, upstream status
 * translation and the per-IP rate limit. Module state (the rate-limit map)
 * is reset per test via vi.resetModules() + dynamic import.
 */

const BACKEND_URL = "http://127.0.0.1:8090/api/ai/agent/chat";

function makeRequest(body: string, ip = "203.0.113.1"): Request {
  return new Request("http://site.local/api/ai-agent-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body,
  });
}

function okUpstream(answer = "Grounded portfolio answer.", source = "portfolio"): Response {
  return new Response(JSON.stringify({ answer, source }), { status: 200 });
}

async function loadRoute() {
  vi.resetModules();
  return await import("./route");
}

describe("POST /api/ai-agent-chat — input validation", () => {
  let fetchMock: Mock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("accepts a valid request and returns answer + source", async () => {
    fetchMock.mockResolvedValue(okUpstream());
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(JSON.stringify({ message: "What technologies did Utkarsh use at EdgeVerve?" })));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ answer: "Grounded portfolio answer.", source: "portfolio" });
    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe(BACKEND_URL);
    expect(JSON.parse(String(init.body))).toEqual({ message: "What technologies did Utkarsh use at EdgeVerve?" });
  });

  it.each([
    ["missing message field", "{}"],
    ["null message", JSON.stringify({ message: null })],
    ["blank message", JSON.stringify({ message: "" })],
    ["whitespace-only message", JSON.stringify({ message: "   \n\t " })],
  ])("rejects %s with a safe 400", async (_name, body) => {
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(body));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "message must not be blank" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects oversized messages with a safe 400", async () => {
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(JSON.stringify({ message: "x".repeat(1001) })));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "message must not exceed 1000 characters" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON bodies with a safe 400", async () => {
    const { POST } = await loadRoute();

    const res = await POST(makeRequest("{not-json"));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "malformed request body" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/ai-agent-chat — upstream failure handling", () => {
  let fetchMock: Mock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("maps an unreachable backend to a safe 502", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(JSON.stringify({ message: "hi" }), "203.0.113.10"));

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ error: "AI service is not reachable right now" });
  });

  it("maps a backend timeout to the same safe 502", async () => {
    const timeout: Error = Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" });
    fetchMock.mockRejectedValue(timeout);
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(JSON.stringify({ message: "hi" }), "203.0.113.11"));

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ error: "AI service is not reachable right now" });
  });

  it("relays backend 400 validation errors verbatim", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: "message must not be blank" }), { status: 400 }));
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(JSON.stringify({ message: "hi" }), "203.0.113.12"));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "message must not be blank" });
  });

  it("maps backend 503 (agent disabled) to 503", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: "disabled" }), { status: 503 }));
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(JSON.stringify({ message: "hi" }), "203.0.113.13"));

    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({ error: "the AI agent is currently disabled on the server" });
  });

  it("maps backend 429 to a safe 429", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: "busy" }), { status: 429 }));
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(JSON.stringify({ message: "hi" }), "203.0.113.14"));

    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({ error: "the AI service is busy - please try again shortly" });
  });

  it("maps unexpected upstream payloads to a safe 502", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ weird: true }), { status: 200 }));
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(JSON.stringify({ message: "hi" }), "203.0.113.15"));

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ error: "the AI service returned an unexpected response" });
  });

  it("maps backend 500s to a generic safe 502", async () => {
    fetchMock.mockResolvedValue(
      new Response("internal stack trace of doom", { status: 500 })
    );
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(JSON.stringify({ message: "hi" }), "203.0.113.16"));

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ error: "AI service unavailable - try again later" });
  });

  it("defaults the source to portfolio when the backend omits it", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ answer: "ok" }), { status: 200 }));
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(JSON.stringify({ message: "hi" }), "203.0.113.17"));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ answer: "ok", source: "portfolio" });
  });
});

describe("POST /api/ai-agent-chat — rate limiting", () => {
  let fetchMock: Mock;

  beforeEach(() => {
    fetchMock = vi.fn(async () => okUpstream());
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("allows the configured burst then returns 429 with Retry-After", async () => {
    const { POST, maxDuration } = await loadRoute();
    expect(maxDuration).toBe(180);

    for (let i = 0; i < 10; i++) {
      const res = await POST(makeRequest(JSON.stringify({ message: `q${i}` }), "198.51.100.7"));
      expect(res.status).toBe(200);
    }

    const limited = await POST(makeRequest(JSON.stringify({ message: "one too many" }), "198.51.100.7"));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBe("60");
    await expect(limited.json()).resolves.toEqual({
      error: "too many requests - please wait a moment and try again",
    });
    // The blocked request must never reach the backend.
    expect(fetchMock).toHaveBeenCalledTimes(10);
  });

  it("does not count other clients against one client's budget", async () => {
    const { POST } = await loadRoute();

    for (let i = 0; i < 10; i++) {
      await POST(makeRequest(JSON.stringify({ message: "q" }), "198.51.100.8"));
    }
    const otherClient = await POST(makeRequest(JSON.stringify({ message: "q" }), "198.51.100.9"));
    expect(otherClient.status).toBe(200);
  });

  it("unblocks a client once the window has passed", async () => {
    const { POST } = await loadRoute();

    for (let i = 0; i < 10; i++) {
      await POST(makeRequest(JSON.stringify({ message: "q" }), "198.51.100.10"));
    }
    expect((await POST(makeRequest(JSON.stringify({ message: "q" }), "198.51.100.10"))).status).toBe(429);

    vi.advanceTimersByTime(61_000);

    const afterWindow = await POST(makeRequest(JSON.stringify({ message: "q" }), "198.51.100.10"));
    expect(afterWindow.status).toBe(200);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We import the handler dynamically after setting env vars
let handler;

/** Helper: collect all SSE events from a Response */
async function collectSSE(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const events = [];
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const part of parts) {
      if (!part.startsWith("data: ")) continue;
      const raw = part.slice(6);
      if (raw === "[DONE]") { events.push({ done: true }); continue; }
      try { events.push(JSON.parse(raw)); } catch {}
    }
  }
  return events;
}

/** Helper: create a mock Request */
function mockReq(body, method = "POST") {
  return {
    method,
    json: async () => body,
  };
}

/** Helper: create a fake Gemini SSE stream (streamGenerateContent?alt=sse) */
function fakeGeminiStream(textChunks, finishReason = "STOP") {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      textChunks.forEach((text, i) => {
        const last = i === textChunks.length - 1;
        const evt = {
          candidates: [{
            content: { parts: [{ text }], role: "model" },
            ...(last ? { finishReason } : {}),
          }],
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
      });
      controller.close();
    },
  });
}

describe("generate-plan serverless function", () => {
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns 405 for non-POST requests", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const mod = await import("../../../../netlify/functions/generate-plan.js");
    handler = mod.default;
    const res = await handler(mockReq({}, "GET"));
    expect(res.status).toBe(405);
  });

  it("returns error when API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    const mod = await import("../../../../netlify/functions/generate-plan.js");
    handler = mod.default;
    const res = await handler(mockReq({ prompt: "test" }));
    const text = await res.text();
    expect(text).toContain("GEMINI_API_KEY not configured");
  });

  it("returns error when prompt is missing", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const mod = await import("../../../../netlify/functions/generate-plan.js");
    handler = mod.default;
    const res = await handler(mockReq({}));
    const text = await res.text();
    expect(text).toContain("Missing prompt");
  });

  it("streams mock plan when MOCK_PLAN=true", async () => {
    process.env.MOCK_PLAN = "true";
    const mod = await import("../../../../netlify/functions/generate-plan.js");
    handler = mod.default;
    const res = await handler(mockReq({ prompt: "test" }));
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    const events = await collectSSE(res);
    const textChunks = events.filter(e => e.t);
    expect(textChunks.length).toBeGreaterThan(0);
    const accumulated = textChunks.map(e => e.t).join("");
    const plan = JSON.parse(accumulated);
    expect(plan.week).toHaveLength(7);
    expect(plan.batch.length).toBeGreaterThan(0);
    expect(plan.shops.length).toBeGreaterThan(0);
    expect(events[events.length - 1]).toEqual({ done: true });
  });

  it("transforms Gemini SSE into simplified SSE", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const planJson = '{"week":[{"day":"Lunes"}]}';
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      body: fakeGeminiStream([planJson]),
    }));
    const mod = await import("../../../../netlify/functions/generate-plan.js");
    handler = mod.default;
    const res = await handler(mockReq({ prompt: "test" }));
    const events = await collectSSE(res);
    const textChunks = events.filter(e => e.t);
    expect(textChunks.map(e => e.t).join("")).toBe(planJson);
  });

  it("forwards truncation error when finishReason is MAX_TOKENS", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      body: fakeGeminiStream(['{"partial":'], "MAX_TOKENS"),
    }));
    const mod = await import("../../../../netlify/functions/generate-plan.js");
    handler = mod.default;
    const res = await handler(mockReq({ prompt: "test" }));
    const events = await collectSSE(res);
    const errors = events.filter(e => e.error);
    expect(errors.length).toBe(1);
    expect(errors[0].error).toContain("truncada");
  });

  it("handles Gemini API error responses", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => JSON.stringify({ error: { message: "Rate limited" } }),
    }));
    const mod = await import("../../../../netlify/functions/generate-plan.js");
    handler = mod.default;
    const res = await handler(mockReq({ prompt: "test" }));
    const text = await res.text();
    expect(text).toContain("Rate limited");
  });
});

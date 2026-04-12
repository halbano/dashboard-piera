import { describe, it, expect, vi } from "vitest";
import { readPlanStream } from "./stream-plan.js";

/** Helper: create a ReadableStream from an array of SSE strings */
function sseStream(events) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const evt of events) {
        controller.enqueue(encoder.encode(evt));
      }
      controller.close();
    },
  });
}

/** Helper: build SSE data line for a text chunk */
const chunk = (text) => `data: ${JSON.stringify({ t: text })}\n\n`;

describe("readPlanStream", () => {
  const PLAN = { week: [{ day: "Lunes" }], batch: [], shops: [] };

  it("parses a clean single-chunk stream", async () => {
    const body = sseStream([chunk(JSON.stringify(PLAN)), "data: [DONE]\n\n"]);
    const onChunk = vi.fn();
    const result = await readPlanStream(body, onChunk);
    expect(result).toEqual(PLAN);
    expect(onChunk).toHaveBeenCalled();
  });

  it("accumulates multiple chunks into valid JSON", async () => {
    const json = JSON.stringify(PLAN);
    const mid = Math.floor(json.length / 2);
    const body = sseStream([
      chunk(json.slice(0, mid)),
      chunk(json.slice(mid)),
      "data: [DONE]\n\n",
    ]);
    const onChunk = vi.fn();
    const result = await readPlanStream(body, onChunk);
    expect(result).toEqual(PLAN);
    expect(onChunk).toHaveBeenCalledTimes(2);
  });

  it("handles preamble text before JSON", async () => {
    const body = sseStream([
      chunk("Acá va el plan:\n"),
      chunk(JSON.stringify(PLAN)),
      "data: [DONE]\n\n",
    ]);
    const result = await readPlanStream(body, vi.fn());
    expect(result).toEqual(PLAN);
  });

  it("repairs trailing commas in streamed JSON", async () => {
    const broken = '{"week": [{"day": "Lunes"},], "batch": [], "shops": []}';
    const body = sseStream([chunk(broken), "data: [DONE]\n\n"]);
    const result = await readPlanStream(body, vi.fn());
    expect(result.week[0].day).toBe("Lunes");
  });

  it("throws on SSE error events", async () => {
    const body = sseStream([
      chunk('{"week'),
      `data: ${JSON.stringify({ error: "API rate limited" })}\n\n`,
    ]);
    await expect(readPlanStream(body, vi.fn())).rejects.toThrow("API rate limited");
  });

  it("handles chunks split across ReadableStream reads", async () => {
    // Simulate a chunk being split mid-SSE-event across two reads
    const json = JSON.stringify(PLAN);
    const fullEvent = chunk(json);
    const splitAt = Math.floor(fullEvent.length / 2);
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(fullEvent.slice(0, splitAt)));
        controller.enqueue(encoder.encode(fullEvent.slice(splitAt)));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    const result = await readPlanStream(body, vi.fn());
    expect(result).toEqual(PLAN);
  });

  it("handles realistic multi-chunk plan", async () => {
    const plan = {
      week: Array.from({ length: 7 }, (_, i) => ({
        day: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][i],
        lunch: `Plato ${i}`, din: `Cena ${i}`, dt: "beef",
      })),
      batch: [{ id: "b1", title: "Tuco" }],
      shops: [{ id: "dc", name: "Del Campo", items: [{ id: "dc1", name: "Pollo" }] }],
    };
    const json = JSON.stringify(plan);
    // Split into ~80 char chunks like the real API does
    const chunks = [];
    for (let i = 0; i < json.length; i += 80) {
      chunks.push(chunk(json.slice(i, i + 80)));
    }
    chunks.push("data: [DONE]\n\n");
    const body = sseStream(chunks);
    const onChunk = vi.fn();
    const result = await readPlanStream(body, onChunk);
    expect(result.week).toHaveLength(7);
    expect(result.batch).toHaveLength(1);
    expect(onChunk.mock.calls.length).toBe(Math.ceil(json.length / 80));
  });
});

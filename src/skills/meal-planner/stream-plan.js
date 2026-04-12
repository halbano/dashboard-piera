import { parsePlanJson } from "./parse-plan-json.js";

/**
 * Reads an SSE stream of plan chunks, accumulates text, and parses the result.
 * @param {ReadableStream} body - The response body stream
 * @param {(accumulated: string) => void} onChunk - Called with accumulated text on each chunk
 * @returns {Promise<object>} Parsed plan object
 */
export async function readPlanStream(body, onChunk) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
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
      if (raw === "[DONE]") continue;
      try {
        const evt = JSON.parse(raw);
        if (evt.error) throw new Error(evt.error);
        if (evt.t) {
          accumulated += evt.t;
          onChunk(accumulated);
        }
      } catch (e) {
        if (e.message && e.message !== "Unexpected end of JSON input") throw e;
      }
    }
  }

  return parsePlanJson(accumulated);
}

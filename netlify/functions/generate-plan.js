export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(`data: ${JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" })}\n\n`, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(`data: ${JSON.stringify({ error: "Missing prompt" })}\n\n`, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    }

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 5000,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      let msg = `API returned ${apiRes.status}`;
      try { msg = JSON.parse(errBody).error?.message || msg; } catch {}
      return new Response(`data: ${JSON.stringify({ error: msg })}\n\n`, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    }

    // Pipe Anthropic SSE → simplified SSE to client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const reader = apiRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
            try {
              const evt = JSON.parse(line.slice(6));
              if (evt.type === "content_block_delta" && evt.delta?.text) {
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ t: evt.delta.text })}\n\n`)
                );
              }
            } catch {}
          }
        }
      } catch (e) {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: e.message })}\n\n`)
        );
      }

      await writer.write(encoder.encode("data: [DONE]\n\n"));
      await writer.close();
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return new Response(`data: ${JSON.stringify({ error: e.message })}\n\n`, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  }
};

export const config = {
  path: "/api/generate-plan",
  method: "POST",
};

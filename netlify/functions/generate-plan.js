const MOCK_PLAN = {
  week: [
    { day:"Domingo", short:"DOM", free:true, isOrder:false, pax:4, sug:"Asado largo de tira", sugD:"Fuego bajo 3hs · chimichurri casero", din:"Picada de quesos", dinD:"Gouda + Parmesano + Criollitos", dt:"mixed" },
    { day:"Lunes", short:"LUN", type:"chicken", pax:5, helper:true, lunch:"Suprema de pollo al horno", ld:"Boniatos asados (batch dom) · zapallitos salteados · limón", lq:"~1.2kg · boniatos ya listos, solo recalentar", din:"Huevos revueltos con Gouda", dinD:"Manteca + crema + Gouda rallado", dt:"eggs" },
    { day:"Martes", short:"MAR", type:"beef", pax:5, helper:true, lunch:"Albóndigas de picada con salsa tomate", ld:"Boniatos al horno · salsa del batch · Parmesano", lq:"~800g picada · salsa ya lista del batch", din:"Omelette simple de queso", dinD:"Huevos + Gouda + manteca · 5 min", dt:"eggs" },
    { day:"Miércoles", short:"MIÉ", type:"chicken", pax:5, helper:true, lunch:"Chop suey de pollo con fideos arroz", ld:"Pollo en tiras + zanahorias + zapallitos · fuego alto", lq:"~1.1kg · completo en 20 min", din:"Salmón a la plancha", dinD:"Limón + sal + manteca · zucchini · 4 pax", dt:"fish", dinNote:"cena familia · Johanna no está" },
    { day:"Jueves", short:"JUE", type:"eggs", pax:5, helper:true, lunch:"Tortilla española de papas", ld:"Huevos + papas en láminas + sal · sartén tapada", lq:"8 huevos · papas del batch · 25 min", din:"Pollo frío con rúcula", dinD:"Sobras pollo miércoles · rúcula + limón + oliva", dt:"chicken" },
    { day:"Viernes", short:"VIE", type:"beef", pax:5, helper:true, lunch:"Milanesa de Nalga SG", ld:"Puré de boniatos cremoso · ensalada rúcula + tomate", lq:"~1.1kg · puré con boniatos del batch", din:"Huevos fritos en manteca", dinD:"Sal gruesa · 5 minutos", dt:"eggs" },
    { day:"Sábado", short:"SAB", free:true, isOrder:true, pax:4, sug:"Cuadril a la parrilla", sugD:"Con chimichurri · sin apuro · día del pedido.", din:"Sobras + tabla de quesos", dinD:"Restos fríos + Gouda + Criollitos", dt:"mixed" },
  ],
  batch: [
    { id:"b1", title:"Salsa de tomate doble", icon:"🍅", color:"#C8401A", bg:"#FDF0EB", when:"~35 min", reason:"Albóndigas martes", steps:["Tomate triturado + cebolla + ajo · rehogar 25 min","Hacer el doble para freezar"], saves:"Martes: solo calentar", storage:"Heladera 4 días" },
    { id:"b2", title:"Boniatos al horno", icon:"🥔", color:"#C89000", bg:"#FFFBEE", when:"~25 min (horno)", reason:"Side lunes + puré viernes", steps:["Cubos de boniato · oliva + sal · 200°C 25 min"], saves:"Lunes: side listo · Viernes: solo pisar para puré", storage:"Heladera 5 días" },
  ],
  shops: [
    { id:"dc", name:"Del Campo", sub:"Av. Sarmiento 2394 · pedir sábados", c:"#7A2A10", bg:"#FDF0EB", items:[
      { id:"dc1", name:"Suprema de pollo", qty:"1.2 kg", note:"$630/kg", eff:"~$756", use:"Lunes" },
      { id:"dc2", name:"Picada Magra", qty:"800 g", note:"$630/kg", eff:"~$504", use:"Albóndigas martes" },
      { id:"dc3", name:"Milanesa SG Nalga", qty:"1.1 kg", note:"$870/kg", eff:"~$957", use:"Viernes" },
      { id:"dc4", name:"Pollo trozado", qty:"1.1 kg", note:"$430/kg", eff:"~$473", use:"Chop suey miércoles" },
    ]},
    { id:"nm", name:"Capitán Nemo", sub:"capitannemo.com.uy", c:"#0A3A6A", bg:"#E8F2FC", items:[
      { id:"n1", name:"Salmón Chileno", qty:"700 g", note:"$1150/kg", eff:"~$805", use:"Miércoles cena" },
    ]},
    { id:"fe", name:"Feria", sub:"Sábado o martes", c:"#0A5A28", bg:"#EAF5EF", items:[
      { id:"f1", name:"Boniatos", qty:"2 kg", note:"~$100/kg", eff:"~$200", use:"Batch + puré" },
      { id:"f2", name:"Zapallitos", qty:"x4", note:"~$30/un", eff:"~$120", use:"Lunes + miércoles" },
    ]},
  ],
};

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Mock mode: stream a known-good plan without hitting Anthropic
  if (process.env.MOCK_PLAN === "true") {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const text = JSON.stringify(MOCK_PLAN);
    (async () => {
      // Simulate streaming in chunks
      const chunkSize = 80;
      for (let i = 0; i < text.length; i += chunkSize) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ t: text.slice(i, i + chunkSize) })}\n\n`));
      }
      await writer.write(encoder.encode("data: [DONE]\n\n"));
      await writer.close();
    })();
    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
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
        max_tokens: 8192,
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
              if (evt.type === "message_delta" && evt.delta?.stop_reason === "max_tokens") {
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ error: "Respuesta truncada (max_tokens). Intentá de nuevo." })}\n\n`)
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

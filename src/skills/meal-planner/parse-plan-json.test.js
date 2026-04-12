import { describe, it, expect } from "vitest";
import { parsePlanJson } from "./parse-plan-json.js";

describe("parsePlanJson", () => {
  const VALID_PLAN = {
    week: [{ day: "Lunes", lunch: "Milanesa", din: "Huevos" }],
    batch: [{ id: "b1", title: "Tuco" }],
    shops: [{ id: "dc", name: "Del Campo", items: [] }],
  };
  const VALID_JSON = JSON.stringify(VALID_PLAN);

  it("parses valid JSON", () => {
    expect(parsePlanJson(VALID_JSON)).toEqual(VALID_PLAN);
  });

  it("strips markdown fences", () => {
    expect(parsePlanJson("```json\n" + VALID_JSON + "\n```")).toEqual(VALID_PLAN);
  });

  it("ignores preamble text before JSON", () => {
    const raw = "Acá está tu plan semanal:\n\n" + VALID_JSON;
    expect(parsePlanJson(raw)).toEqual(VALID_PLAN);
  });

  it("ignores trailing text after JSON", () => {
    const raw = VALID_JSON + "\n\nEspero que te guste el plan!";
    expect(parsePlanJson(raw)).toEqual(VALID_PLAN);
  });

  it("fixes trailing comma before ]", () => {
    const broken = '{"week": [{"day": "Lunes"},]}';
    expect(parsePlanJson(broken)).toEqual({ week: [{ day: "Lunes" }] });
  });

  it("fixes trailing comma before }", () => {
    const broken = '{"week": [{"day": "Lunes",}]}';
    expect(parsePlanJson(broken)).toEqual({ week: [{ day: "Lunes" }] });
  });

  it("fixes nested trailing commas", () => {
    const broken = '{"a": [1, 2, 3,], "b": {"x": 1,},}';
    expect(parsePlanJson(broken)).toEqual({ a: [1, 2, 3], b: { x: 1 } });
  });

  it("closes truncated JSON (unclosed array and object)", () => {
    const truncated = '{"week": [{"day": "Lunes"';
    const result = parsePlanJson(truncated);
    expect(result.week[0].day).toBe("Lunes");
  });

  it("closes truncated string + brackets", () => {
    const truncated = '{"week": [{"day": "Lun';
    const result = parsePlanJson(truncated);
    expect(result.week[0].day).toBe("Lun");
  });

  it("handles unescaped newlines inside string values", () => {
    const broken = '{"note": "line1\nline2"}';
    expect(parsePlanJson(broken)).toEqual({ note: "line1\nline2" });
  });

  it("throws on empty input", () => {
    expect(() => parsePlanJson("")).toThrow("No se encontró JSON válido");
  });

  it("throws on input with no JSON object", () => {
    expect(() => parsePlanJson("just some text")).toThrow("No se encontró JSON válido");
  });

  it("handles realistic plan-sized JSON with trailing commas", () => {
    // Simulate what the model actually produces
    const plan = {
      week: Array.from({ length: 7 }, (_, i) => ({
        day: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][i],
        lunch: "Plato " + i,
        ld: "Detalle del plato",
        din: "Cena " + i,
        dinD: "Detalle de cena",
        dt: ["mixed", "chicken", "beef", "chicken", "beef", "eggs", "mixed"][i],
      })),
      batch: [{ id: "b1", title: "Tuco", steps: ["paso 1", "paso 2"] }],
      shops: [{ id: "dc", name: "Del Campo", items: [{ id: "dc1", name: "Pollo", qty: "1kg" }] }],
    };
    // Stringify then inject trailing commas at various points
    let broken = JSON.stringify(plan, null, 2);
    broken = broken.replace(/\}\n/g, "},\n"); // add trailing commas after objects
    // Wrap in preamble + fence
    broken = "Aquí va el plan:\n```json\n" + broken + "\n```\nListo!";
    const result = parsePlanJson(broken);
    expect(result.week).toHaveLength(7);
    expect(result.batch).toHaveLength(1);
    expect(result.shops).toHaveLength(1);
  });

  it("handles property value with unescaped quote-like characters", () => {
    // Model sometimes outputs curly quotes or similar
    const json = '{"note": "Puré de papas — cremoso"}';
    expect(parsePlanJson(json)).toEqual({ note: "Puré de papas — cremoso" });
  });
});

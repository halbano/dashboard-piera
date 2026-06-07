import { describe, it, expect } from "vitest";
import { flattenWeekDishes, buildNoRepeatList, buildPlanPrompt, buildRefinePrompt } from "./build-prompt.js";

const WEEK_A = [
  { day: "Lun", lunch: "Aguja braseada", din: "Omelette" },
  { day: "Mar", lunch: "Suprema al horno", din: "Salmón" },
  { day: "Dom", free: true, sug: "Asado", din: "Sobras" },
];

const WEEK_B = [
  { day: "Lun", lunch: "Pastel de carne", din: "Huevos fritos" },
  { day: "Mar", lunch: "Suprema al horno", din: "Sopa" }, // duplica Suprema
];

describe("flattenWeekDishes", () => {
  it("collects lunch and dinner from each day", () => {
    expect(flattenWeekDishes(WEEK_A)).toEqual([
      "Aguja braseada", "Omelette",
      "Suprema al horno", "Salmón",
      "Asado", "Sobras",
    ]);
  });

  it("uses sug as fallback when lunch is missing (free days)", () => {
    expect(flattenWeekDishes([{ day: "Dom", free: true, sug: "Asado libre", din: "" }]))
      .toEqual(["Asado libre"]);
  });

  it("skips falsy dishes", () => {
    expect(flattenWeekDishes([{ day: "X", lunch: "", din: null }])).toEqual([]);
  });

  it("handles empty or undefined week", () => {
    expect(flattenWeekDishes([])).toEqual([]);
    expect(flattenWeekDishes(undefined)).toEqual([]);
  });
});

describe("buildNoRepeatList", () => {
  it("dedups dishes across multiple weeks", () => {
    const list = buildNoRepeatList([WEEK_A, WEEK_B]);
    const supremas = list.filter(d => d === "Suprema al horno");
    expect(supremas).toHaveLength(1);
    expect(list).toContain("Aguja braseada");
    expect(list).toContain("Pastel de carne");
  });

  it("returns empty array for no weeks", () => {
    expect(buildNoRepeatList([])).toEqual([]);
    expect(buildNoRepeatList(undefined)).toEqual([]);
  });
});

describe("buildPlanPrompt", () => {
  const prompt = buildPlanPrompt({ recentWeeks: [WEEK_A, WEEK_B], changes: "más pescado" });

  it("includes every recent dish in the no-repeat block", () => {
    expect(prompt).toContain("Aguja braseada");
    expect(prompt).toContain("Pastel de carne");
    expect(prompt).toContain("Salmón");
  });

  it("includes the user changes", () => {
    expect(prompt).toContain("más pescado");
  });

  it("instructs the LLM to invent new dishes (B1)", () => {
    expect(prompt).toMatch(/ideas NUEVAS|platos.*NUEVOS|nuevas/i);
  });

  it("includes the JSON output instructions", () => {
    expect(prompt).toContain('"week"');
    expect(prompt).toContain('"batch"');
    expect(prompt).toContain('"shops"');
  });

  it("includes the system context", () => {
    expect(prompt).toContain("BANCO DE IDEAS");
  });
});

describe("buildRefinePrompt", () => {
  const prompt = buildRefinePrompt({ previewWeek: WEEK_A, followUp: "cambiá el lunes" });

  it("includes the proposed week and the follow-up request", () => {
    expect(prompt).toContain("Aguja braseada");
    expect(prompt).toContain("cambiá el lunes");
  });

  it("includes the JSON output instructions", () => {
    expect(prompt).toContain('"week"');
  });
});

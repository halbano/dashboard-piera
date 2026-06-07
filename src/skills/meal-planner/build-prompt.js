import { PLAN_SYSTEM_CONTEXT, JSON_INSTRUCTIONS } from "./data.js";

// Extrae los platos (almuerzo + cena) de una semana, ignorando vacíos.
// Días de semana usan `lunch`; días libres usan `sug`. La cena siempre es `din`.
export function flattenWeekDishes(week) {
  if (!Array.isArray(week)) return [];
  return week
    .flatMap(d => [d.lunch || d.sug, d.din])
    .filter(Boolean);
}

// Junta y deduplica los platos de varias semanas → lista "no repetir".
export function buildNoRepeatList(recentWeeks) {
  if (!Array.isArray(recentWeeks)) return [];
  const all = recentWeeks.flatMap(flattenWeekDishes);
  return [...new Set(all)];
}

const FRESH_IDEAS_INSTRUCTION =
  "Antes de armar el plan, generá 6-8 ideas NUEVAS de platos que NO estén en el banco " +
  "ni en la lista de arriba, alineadas a la dieta, las reglas y los proveedores. " +
  "Usá al menos 2-3 de esas ideas nuevas en el plan para que la semana se sienta distinta.";

// Lever A (memoria multi-semana) + Lever B1 (ideas nuevas inline).
export function buildPlanPrompt({ recentWeeks, changes }) {
  const noRepeat = buildNoRepeatList(recentWeeks);
  const noRepeatBlock = noRepeat.length
    ? `Platos de las ÚLTIMAS SEMANAS (NO repetir ninguno de estos):\n${noRepeat.join("\n")}`
    : "No hay historial previo.";

  return `${PLAN_SYSTEM_CONTEXT}

${noRepeatBlock}

Cambios/pedidos para la nueva semana: "${changes}"

${FRESH_IDEAS_INSTRUCTION}

Generá un plan semanal DIFERENTE a las semanas anteriores. Variá proteínas, cortes, sides y preparaciones.

${JSON_INSTRUCTIONS}`;
}

export function buildRefinePrompt({ previewWeek, followUp }) {
  const compact = (previewWeek || []).map(d => ({ day: d.day, lunch: d.lunch || d.sug, dinner: d.din }));
  return `${PLAN_SYSTEM_CONTEXT}

Plan propuesto: ${JSON.stringify(compact)}

El usuario revisó el plan y pide estos ajustes: "${followUp}"

Modificá el plan según lo pedido, manteniendo lo que no se mencionó.

${JSON_INSTRUCTIONS}`;
}

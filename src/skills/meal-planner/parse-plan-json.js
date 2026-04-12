/**
 * Extracts and repairs a JSON object from raw LLM output.
 * Handles: markdown fences, preamble text, trailing commas,
 * unclosed brackets/braces (truncation), unescaped newlines in strings.
 */
export function parsePlanJson(raw) {
  const clean = raw.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  if (start === -1) {
    throw new Error("No se encontró JSON válido en la respuesta");
  }
  const end = clean.lastIndexOf("}");
  // If there's a closing brace, extract between first { and last }
  // If not (truncated), take everything from first { onward — closeBrackets will fix it
  let json = end > start ? clean.slice(start, end + 1) : clean.slice(start);

  // 1. Try as-is
  try { return JSON.parse(json); } catch {}

  // 2. Fix trailing commas before } or ]
  json = json.replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(json); } catch {}

  // 3. Fix unescaped control characters inside strings
  json = fixUnescapedControlChars(json);
  try { return JSON.parse(json); } catch {}

  // 4. Close unclosed structures (truncation repair)
  json = closeBrackets(json);
  json = json.replace(/,\s*([}\]])/g, "$1");

  return JSON.parse(json);
}

/** Replace literal newlines/tabs inside JSON string values with escaped versions */
function fixUnescapedControlChars(json) {
  let result = "";
  let inStr = false;
  let esc = false;
  for (let i = 0; i < json.length; i++) {
    const ch = json[i];
    if (esc) { result += ch; esc = false; continue; }
    if (ch === "\\") { result += ch; esc = true; continue; }
    if (ch === '"') { inStr = !inStr; result += ch; continue; }
    if (inStr) {
      if (ch === "\n") { result += "\\n"; continue; }
      if (ch === "\r") { result += "\\r"; continue; }
      if (ch === "\t") { result += "\\t"; continue; }
    }
    result += ch;
  }
  return result;
}

/** Close unclosed strings, arrays, and objects in correct nesting order */
function closeBrackets(json) {
  let inStr = false, esc = false;
  const stack = []; // tracks nesting order
  for (const ch of json) {
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }
  if (inStr) json += '"';
  while (stack.length) json += stack.pop();
  return json;
}

// Local storage helpers (auth state — per device)
export const localGet = (key) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
};

export const localSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

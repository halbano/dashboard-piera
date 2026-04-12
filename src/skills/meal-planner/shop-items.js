/**
 * Pure transforms for shop item operations.
 * Each function takes a shops array and returns a new shops array.
 */

export function addItem(shops, shopId, item) {
  if (!item?.id || !item?.name?.trim()) return shops;
  return shops.map(s => {
    if (s.id !== shopId) return s;
    if (s.items.some(i => i.id === item.id)) return s;
    return { ...s, items: [...s.items, item] };
  });
}

export function removeItem(shops, shopId, itemId) {
  return shops.map(s => {
    if (s.id !== shopId) return s;
    return { ...s, items: s.items.filter(i => i.id !== itemId) };
  });
}

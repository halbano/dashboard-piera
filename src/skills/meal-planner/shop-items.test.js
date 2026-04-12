import { describe, it, expect } from "vitest";
import { addItem, removeItem } from "./shop-items.js";

const SHOPS = [
  { id: "dc", name: "Del Campo", items: [
    { id: "dc1", name: "Pollo", qty: "1kg" },
    { id: "dc2", name: "Picada", qty: "800g" },
  ]},
  { id: "fe", name: "Feria", items: [
    { id: "f1", name: "Boniatos", qty: "2kg" },
  ]},
];

describe("addItem", () => {
  it("appends an item to the correct shop", () => {
    const item = { id: "dc3", name: "Cuadril", qty: "900g" };
    const result = addItem(SHOPS, "dc", item);
    expect(result[0].items).toHaveLength(3);
    expect(result[0].items[2]).toEqual(item);
  });

  it("does not mutate the original array", () => {
    const item = { id: "dc3", name: "Cuadril", qty: "900g" };
    const result = addItem(SHOPS, "dc", item);
    expect(SHOPS[0].items).toHaveLength(2);
    expect(result).not.toBe(SHOPS);
    expect(result[0]).not.toBe(SHOPS[0]);
  });

  it("leaves other shops untouched", () => {
    const item = { id: "dc3", name: "Cuadril", qty: "900g" };
    const result = addItem(SHOPS, "dc", item);
    expect(result[1]).toBe(SHOPS[1]);
  });

  it("returns shops unchanged if shopId not found", () => {
    const item = { id: "x1", name: "X", qty: "1" };
    const result = addItem(SHOPS, "nonexistent", item);
    expect(result).toEqual(SHOPS);
  });

  it("rejects item with missing id", () => {
    const result = addItem(SHOPS, "dc", { name: "Bad" });
    expect(result).toBe(SHOPS);
  });

  it("rejects item with empty name", () => {
    const result = addItem(SHOPS, "dc", { id: "dc3", name: "  " });
    expect(result).toBe(SHOPS);
  });

  it("prevents duplicate item ids", () => {
    const dupe = { id: "dc1", name: "Duplicate", qty: "1kg" };
    const result = addItem(SHOPS, "dc", dupe);
    expect(result[0].items).toHaveLength(2);
  });
});

describe("removeItem", () => {
  it("removes an item by id from the correct shop", () => {
    const result = removeItem(SHOPS, "dc", "dc1");
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].id).toBe("dc2");
  });

  it("does not mutate the original array", () => {
    const result = removeItem(SHOPS, "dc", "dc1");
    expect(SHOPS[0].items).toHaveLength(2);
    expect(result[0]).not.toBe(SHOPS[0]);
  });

  it("leaves other shops untouched", () => {
    const result = removeItem(SHOPS, "dc", "dc1");
    expect(result[1]).toBe(SHOPS[1]);
  });

  it("returns shops unchanged if itemId not found", () => {
    const result = removeItem(SHOPS, "dc", "nonexistent");
    expect(result[0].items).toHaveLength(2);
  });

  it("returns shops unchanged if shopId not found", () => {
    const result = removeItem(SHOPS, "nonexistent", "dc1");
    expect(result).toEqual(SHOPS);
  });
});

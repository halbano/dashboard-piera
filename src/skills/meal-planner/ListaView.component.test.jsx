// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ListaView } from "./index";

const SHOPS = [
  { id: "dc", name: "Del Campo", c: "#7A2A10", bg: "#FDF0EB", sub: "test", items: [
    { id: "dc1", name: "Pollo", qty: "1kg", note: "$630/kg", eff: "~$630", use: "Lunes" },
    { id: "dc2", name: "Picada", qty: "800g", note: "$630/kg", eff: "~$504", use: "Martes" },
  ]},
  { id: "fe", name: "Feria", c: "#0A5A28", bg: "#EAF5EF", sub: "sábado", items: [
    { id: "f1", name: "Boniatos", qty: "2kg", note: "~$100/kg", eff: "~$200", use: "Batch" },
  ]},
];

describe("ListaView", () => {
  it("renders all shop names and items", () => {
    render(<ListaView shops={SHOPS} shopChecked={{}} toggle={() => {}} clear={() => {}} total={3} checked={0} />);
    expect(screen.getByText("Del Campo")).toBeInTheDocument();
    expect(screen.getByText("Feria")).toBeInTheDocument();
    expect(screen.getByText("Pollo")).toBeInTheDocument();
    expect(screen.getByText("Picada")).toBeInTheDocument();
    expect(screen.getByText("Boniatos")).toBeInTheDocument();
  });

  it("shows progress as checked/total", () => {
    render(<ListaView shops={SHOPS} shopChecked={{ dc1: true }} toggle={() => {}} clear={() => {}} total={3} checked={1} />);
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("calls toggle when an item is clicked", () => {
    const toggle = vi.fn();
    render(<ListaView shops={SHOPS} shopChecked={{}} toggle={toggle} clear={() => {}} total={3} checked={0} />);
    fireEvent.click(screen.getByText("Pollo"));
    expect(toggle).toHaveBeenCalledWith("dc1", true);
  });

  it("calls toggle with false when a checked item is clicked", () => {
    const toggle = vi.fn();
    render(<ListaView shops={SHOPS} shopChecked={{ dc1: true }} toggle={toggle} clear={() => {}} total={3} checked={1} />);
    fireEvent.click(screen.getByText("Pollo"));
    expect(toggle).toHaveBeenCalledWith("dc1", false);
  });

  it("shows clear button only when items are checked", () => {
    const { rerender } = render(<ListaView shops={SHOPS} shopChecked={{}} toggle={() => {}} clear={() => {}} total={3} checked={0} />);
    expect(screen.queryByText("limpiar")).not.toBeInTheDocument();
    rerender(<ListaView shops={SHOPS} shopChecked={{ dc1: true }} toggle={() => {}} clear={() => {}} total={3} checked={1} />);
    expect(screen.getByText("limpiar")).toBeInTheDocument();
  });

  it("renders add item buttons when onAddItem is provided", () => {
    render(<ListaView shops={SHOPS} shopChecked={{}} toggle={() => {}} clear={() => {}} total={3} checked={0} onAddItem={() => {}} />);
    const addButtons = screen.getAllByText("+ Agregar item");
    expect(addButtons).toHaveLength(2); // one per shop
  });

  it("does not render add item buttons when onAddItem is absent", () => {
    render(<ListaView shops={SHOPS} shopChecked={{}} toggle={() => {}} clear={() => {}} total={3} checked={0} />);
    expect(screen.queryByText("+ Agregar item")).not.toBeInTheDocument();
  });

  it("opens add form on click and submits a new item", () => {
    const onAdd = vi.fn();
    render(<ListaView shops={SHOPS} shopChecked={{}} toggle={() => {}} clear={() => {}} total={3} checked={0} onAddItem={onAdd} />);
    // Click the first "Agregar item"
    fireEvent.click(screen.getAllByText("+ Agregar item")[0]);
    // Fill the form
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Cuadril" } });
    fireEvent.change(inputs[1], { target: { value: "900g" } });
    fireEvent.click(screen.getByText("Agregar"));
    expect(onAdd).toHaveBeenCalledWith("dc", expect.objectContaining({
      name: "Cuadril",
      qty: "900g",
      note: "manual",
    }));
  });

  it("shows remove button only for manual items when onRemoveItem is provided", () => {
    const shopsWithManual = [
      { ...SHOPS[0], items: [
        ...SHOPS[0].items,
        { id: "dc_m1", name: "Manual Item", qty: "1", note: "manual", eff: "", use: "Agregado manual" },
      ]},
      SHOPS[1],
    ];
    const onRemove = vi.fn();
    render(<ListaView shops={shopsWithManual} shopChecked={{}} toggle={() => {}} clear={() => {}} total={4} checked={0} onRemoveItem={onRemove} />);
    const removeBtn = screen.getByTitle("Eliminar");
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledWith("dc", "dc_m1");
  });
});

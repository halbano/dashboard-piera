// Food Cost Tracker — próximamente
// Este skill va a incluir:
// - Registro de precios por ítem con fecha (Del Campo, Capitán Nemo, feria)
// - Seguimiento del gasto semanal real vs. presupuesto
// - Ahorro acumulado por descuento Itaú (~15% en Del Campo)
// - Variación estacional de precios en feria

export default function FoodCosts() {
  return (
    <div style={{ textAlign:"center", padding:"3rem 1rem", fontFamily:"-apple-system, sans-serif" }}>
      <div style={{ fontSize:"2rem", marginBottom:12 }}>🧾</div>
      <div style={{ fontSize:"1rem", fontWeight:600, color:"#1C1810", marginBottom:8 }}>Food Cost Tracker</div>
      <div style={{ fontSize:".8125rem", color:"#887060", lineHeight:1.6, maxWidth:280, margin:"0 auto" }}>
        Próximamente — registrá facturas de Del Campo y Capitán Nemo para rastrear precios y medir el ahorro real con el descuento Itaú.
      </div>
    </div>
  );
}

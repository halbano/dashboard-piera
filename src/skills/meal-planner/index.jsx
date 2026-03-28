import { useState, useEffect, useCallback, useRef } from "react";
import { db, ref, onValue, set, get, FB_READY } from "../../lib/firebase";
import { DEFAULT_WEEK, DEFAULT_SHOPS, PLAN_SYSTEM_CONTEXT } from "./data";

// ── Styles ───────────────────────────────────────────────────────
const S = {
  body: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#1C1810" },
  LB:  { fontSize: ".6rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#C8B89A", marginBottom: 4 },
};

const TS = {
  beef:   { bg:"#FDF0EB", bo:"#F0C0A8", tx:"#7A2A10", dot:"#C44A20" },
  chicken:{ bg:"#FFFBEE", bo:"#EDD898", tx:"#7A5800", dot:"#C89000" },
  eggs:   { bg:"#F0F8F2", bo:"#9ED4B0", tx:"#0A5A28", dot:"#1A8A48" },
  fish:   { bg:"#E8F2FC", bo:"#90C4E8", tx:"#0A3A6A", dot:"#1A6ACC" },
  mixed:  { bg:"#F5F0F8", bo:"#C8B0E0", tx:"#4A2A7A", dot:"#7A4ACC" },
};
const LI = { beef:"🥩", chicken:"🍗", eggs:"🥚", fish:"🐟" };
const DI = { eggs:"🥚", fish:"🐟", chicken:"🍗", mixed:"🧀", beef:"🥩" };

// ── Shared small components ──────────────────────────────────────
function CB({ on, c }) {
  return (
    <div style={{ width:22, height:22, borderRadius:6, flexShrink:0, border:on?`2px solid ${c}`:"2px solid #D0C8B8", background:on?c:"#fff", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>
      {on && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  );
}

function Toggle({ on, set: setOn }) {
  return (
    <div onClick={() => setOn(!on)} style={{ width:36, height:20, borderRadius:10, cursor:"pointer", background:on?"#C8883A":"#C8C0B0", position:"relative", transition:"background .2s", flexShrink:0 }}>
      <div style={{ width:14, height:14, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:on?19:3, transition:"left .2s", boxShadow:"0 1px 2px rgba(0,0,0,.2)" }}/>
    </div>
  );
}

function DBox({ short, icon, bg, bo, tx }) {
  return (
    <div style={{ width:34, height:34, borderRadius:9, background:bg, border:bo, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <div style={{ fontSize:".5rem", fontWeight:800, color:tx, lineHeight:1 }}>{short}</div>
      <div style={{ fontSize:".75rem", lineHeight:1, marginTop:2 }}>{icon}</div>
    </div>
  );
}

function Pill({ bg, bo, dot, tx, children }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:bg, border:`1px solid ${bo}`, borderRadius:20, padding:"4px 12px" }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:dot }}/>
      <span style={{ fontSize:".75rem", fontWeight:500, color:tx }}>{children}</span>
    </div>
  );
}

// ── Day cards ────────────────────────────────────────────────────
function FreeCard({ d, showDin }) {
  const ds = TS[d.dt] || TS.mixed;
  return (
    <div style={{ background:"#FDFBF7", border:"1.5px dashed #D8D0C0", borderRadius:14, overflow:"hidden", marginBottom:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#F7F4EF", borderBottom:"1px dashed #EAE4DA" }}>
        <DBox short={d.short} icon="🎲" bg="#F0EBE2" bo="1.5px dashed #C8B8A0" tx="#9A8870"/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:".875rem", fontWeight:600, color:"#3A3020" }}>{d.day}</div>
          <div style={{ fontSize:".6875rem", color:"#9A8870", marginTop:1 }}>
            {d.isOrder ? "📦 pedido Del Campo + Capitán Nemo" : "fin de semana libre · 4 pax"}
          </div>
        </div>
        <span style={{ fontSize:".6875rem", fontWeight:600, padding:"2px 8px", borderRadius:20, background:"#EAE4DA", color:"#8A7A68", border:"1px dashed #C8B8A0" }}>libre</span>
      </div>
      <div style={{ padding:"12px 14px" }}>
        <div style={S.LB}>Sugerencia</div>
        <div style={{ fontSize:".9375rem", fontWeight:500, color:"#5A4A38", fontStyle:"italic", marginBottom:3 }}>{d.sug}</div>
        <div style={{ fontSize:".8125rem", color:"#A89878", lineHeight:1.5 }}>{d.sugD}</div>
      </div>
      {showDin && (
        <div style={{ padding:"11px 14px", borderTop:"1px dashed #EAE4DA", background:"#FAF8F4" }}>
          <div style={S.LB}>Cena · 4 pax</div>
          <div style={{ fontSize:".875rem", fontWeight:500, color:"#3C3020", marginBottom:2 }}>{d.din}</div>
          <div style={{ fontSize:".8125rem", color:"#A89878", lineHeight:1.5 }}>{d.dinD}</div>
        </div>
      )}
    </div>
  );
}

function WeekdayCard({ d, showDin }) {
  const ls = TS[d.type] || {};
  const ds = TS[d.dt] || TS.mixed;
  return (
    <div style={{ background:"#fff", border:"1px solid #E5E0D8", borderRadius:14, overflow:"hidden", marginBottom:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#FAFAF8", borderBottom:"1px solid #F0EBE3" }}>
        <DBox short={d.short} icon={LI[d.type]} bg={ls.bg} bo={`1px solid ${ls.bo}`} tx={ls.tx}/>
        <div style={{ flex:1, fontSize:".875rem", fontWeight:600, color:"#1C1810" }}>{d.day}</div>
        <span style={{ fontSize:".6rem", fontWeight:600, padding:"2px 8px", borderRadius:20, background:"#FFF8EC", color:"#7A5000", border:"1px solid #E8D090" }}>{"●".repeat(d.pax)} {d.pax}</span>
      </div>
      <div style={{ padding:"12px 14px" }}>
        <div style={S.LB}>Almuerzo</div>
        <div style={{ fontSize:".9375rem", fontWeight:600, color:"#1C1810", marginBottom:3, lineHeight:1.3 }}>{d.lunch}</div>
        <div style={{ fontSize:".8125rem", color:"#887060", lineHeight:1.5 }}>{d.ld}</div>
        <div style={{ fontSize:".75rem", color:"#B8A890", marginTop:5, fontStyle:"italic" }}>{d.lq}</div>
      </div>
      {showDin && (
        <div style={{ padding:"11px 14px", borderTop:"1px solid #F5F0E8", background:d.dt==="fish"?"#F0F6FF":"#FDFCFA" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap" }}>
            <div style={S.LB}>Cena · 4 pax</div>
            <span style={{ fontSize:".6875rem", padding:"1px 7px", borderRadius:20, fontWeight:600, background:ds.bg, color:ds.tx, border:`1px solid ${ds.bo}` }}>
              {DI[d.dt]} {d.dt==="fish"?"Pescado":d.dt==="eggs"?"Huevos":d.dt==="beef"?"Vacuno":d.dt==="chicken"?"Pollo":"Mixto"}
            </span>
            {d.dinBatch && <span style={{ fontSize:".6875rem", color:"#C8883A", fontWeight:500 }}>🔄 {d.dinBatch}</span>}
            {d.dinNote  && <span style={{ fontSize:".6875rem", color:"#1A6ACC", fontWeight:500 }}>{d.dinNote}</span>}
          </div>
          <div style={{ fontSize:".875rem", fontWeight:500, color:"#1C2030", marginBottom:2 }}>{d.din}</div>
          <div style={{ fontSize:".8125rem", color:"#887060", lineHeight:1.5 }}>{d.dinD}</div>
        </div>
      )}
    </div>
  );
}

// ── Views ────────────────────────────────────────────────────────
export function PlanView({ week, readOnly }) {
  const [showDin, setShowDin] = useState(false);
  const w = week || DEFAULT_WEEK;
  return (
    <>
      <div style={{ display:"flex", gap:8, marginBottom:"1rem", flexWrap:"wrap", alignItems:"center" }}>
        <Pill bg="#FFF8EC" bo="#E8D090" dot="#C8883A" tx="#7A5000">Lun–Vie · 5 pax</Pill>
        <Pill bg="#F5F0F8" bo="#C8B0E0" dot="#7A4ACC" tx="#4A2A7A">Dom + Sáb · libre</Pill>
        {!readOnly && (
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:".75rem", color:"#B8A890" }}>Cenas</span>
            <Toggle on={showDin} set={setShowDin}/>
          </div>
        )}
      </div>
      {/* Protein strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:"1.25rem" }}>
        {w.map((d, i) => {
          const dot = d.free ? "#C8B0E0" : (TS[d.type]?.dot || "#ccc");
          return (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ height:4, borderRadius:2, background:dot, marginBottom:4, opacity:d.free?.45:1 }}/>
              <div style={{ fontSize:".5625rem", fontWeight:700, color:"#B8A890" }}>{d.short}</div>
              <div style={{ fontSize:".75rem" }}>{d.free ? "🎲" : LI[d.type]}</div>
            </div>
          );
        })}
      </div>
      {w.map(d => d.free
        ? <FreeCard key={d.day} d={d} showDin={showDin}/>
        : <WeekdayCard key={d.day} d={d} showDin={showDin}/>
      )}
    </>
  );
}

export function ListaView({ shops, shopChecked, toggle, clear, total, checked }) {
  const s = shops || DEFAULT_SHOPS;
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
        <div style={{ flex:1, height:5, background:"#E0D8CC", borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", background:"#C8883A", borderRadius:3, width:`${total>0?(checked/total)*100:0}%`, transition:"width .3s" }}/>
        </div>
        <span style={{ fontSize:".8rem", color:"#887060", minWidth:48, textAlign:"right" }}>{checked}/{total}</span>
        {checked > 0 && <button onClick={clear} style={{ fontSize:".75rem", color:"#C8B89A", background:"none", border:"none", cursor:"pointer", textDecoration:"underline", padding:0 }}>limpiar</button>}
      </div>
      <div style={{ background:"#EAF5EF", border:"1px solid #9ED4B0", borderRadius:10, padding:"10px 14px", marginBottom:"1.25rem", fontSize:".8rem", color:"#0A4A20", lineHeight:1.5 }}>
        Lista compartida — los tildados se sincronizan entre dispositivos.
      </div>
      {s.map(shop => {
        const done = shop.items.filter(i => shopChecked[i.id]).length;
        return (
          <div key={shop.id} style={{ marginBottom:"1.25rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:".6875rem", fontWeight:700, padding:"3px 12px", borderRadius:20, background:shop.bg, color:shop.c, border:`1px solid ${shop.c}28` }}>{shop.name}</span>
              <span style={{ fontSize:".75rem", color:"#A89878", flex:1 }}>{shop.sub}</span>
              <span style={{ fontSize:".75rem", color:done===shop.items.length?"#0A5A28":"#A89878", fontWeight:done===shop.items.length?600:400 }}>{done}/{shop.items.length}</span>
            </div>
            {shop.link && <a href={shop.link} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:".75rem", color:"#1A6ACC", textDecoration:"none", marginBottom:8, padding:"4px 12px", background:"#E8F2FC", borderRadius:20, border:"1px solid #90C4E8" }}>🌐 ver salmón →</a>}
            <div style={{ background:"#fff", border:"1px solid #E5E0D8", borderRadius:12, overflow:"hidden" }}>
              {shop.items.map((item, idx) => {
                const on = !!shopChecked[item.id];
                return (
                  <div key={item.id} onClick={() => toggle(item.id, !on)} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px", borderBottom:idx<shop.items.length-1?"1px solid #F5F0E8":"none", cursor:"pointer", background:on?"#FAFAF8":"#fff", userSelect:"none" }}>
                    <CB on={on} c={shop.c}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:".875rem", fontWeight:500, color:on?"#B0A090":"#1C1810", textDecoration:on?"line-through":"none" }}>{item.name}</div>
                      <div style={{ fontSize:".75rem", color:"#B8A890", marginTop:1 }}>{item.use} · {item.note}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:".8125rem", fontWeight:500, color:on?"#C0B8A8":"#4A3A28" }}>{item.qty}</div>
                      <div style={{ fontSize:".75rem", fontWeight:500, color:on?"#C0B8A8":"#2A7A4F", marginTop:1 }}>{item.eff}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {shop.altNote && <div style={{ fontSize:".75rem", color:"#7A6A50", marginTop:6, padding:"7px 12px", background:"#FFF8EC", borderRadius:8, border:"1px solid #E8D8B0" }}>💡 {shop.altNote}</div>}
          </div>
        );
      })}
    </>
  );
}

export function BatchView({ batchItems, batchChecked, toggle }) {
  if (!batchItems || batchItems.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
        <div style={{ fontSize:"2rem", marginBottom:12 }}>🔄</div>
        <div style={{ fontSize:".875rem", color:"#887060", lineHeight:1.6 }}>
          El batch de esta semana se genera junto con el plan.<br/>
          Usá <strong>✨ Nueva</strong> para generar uno.
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ background:"#FFF8EC", border:"1px solid #E8D090", borderRadius:12, padding:"13px 16px", marginBottom:"1.25rem" }}>
        <div style={{ fontSize:".75rem", fontWeight:700, color:"#C8883A", marginBottom:6 }}>Prep del domingo</div>
        <div style={{ fontSize:".8125rem", color:"#6B5000", lineHeight:1.6 }}>Preparaciones derivadas del plan de esta semana.</div>
      </div>
      {batchItems.map(b => {
        const on = !!batchChecked[b.id];
        const c = b.color || b.c || "#C8883A";
        const bg = b.bg || "#FFF8EC";
        return (
          <div key={b.id} style={{ background:on?"#FAFAF8":"#fff", border:"1px solid #E5E0D8", borderRadius:14, overflow:"hidden", marginBottom:10 }}>
            <div onClick={() => toggle(b.id, !on)} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", cursor:"pointer", userSelect:"none" }}>
              <div style={{ width:38, height:38, borderRadius:10, background:on?"#F0EBE2":bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.25rem", flexShrink:0 }}>{on?"✓":b.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:".9375rem", fontWeight:600, color:on?"#B0A090":"#1C1810", textDecoration:on?"line-through":"none" }}>{b.title}</div>
                <div style={{ fontSize:".75rem", color:on?"#C0B8A8":"#A89878", marginTop:1 }}>{b.when}</div>
              </div>
              <CB on={on} c={c}/>
            </div>
            {!on && (
              <div style={{ padding:"0 16px 14px" }}>
                {b.reason && (
                  <div style={{ fontSize:".75rem", color:"#C8883A", fontWeight:500, marginBottom:8 }}>💡 {b.reason}</div>
                )}
                {b.steps.map((s, i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:5 }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", background:bg, color:c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:".6rem", fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</div>
                    <span style={{ fontSize:".8125rem", color:"#555040", lineHeight:1.5 }}>{s}</span>
                  </div>
                ))}
                <div style={{ background:"#F5F2ED", borderRadius:8, padding:"8px 12px", fontSize:".8125rem", color:"#6B5A40", lineHeight:1.5, marginTop:8, marginBottom:6 }}>
                  <strong style={{ color:c }}>Desbloquea: </strong>{b.saves}
                </div>
                <div style={{ fontSize:".75rem", color:"#A89878" }}>🧊 {b.storage}</div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export function HistorialView({ allPlanIds, activePlanId }) {
  const [viewPlan, setViewPlan] = useState(null);
  const [loading, setLoading] = useState(null);

  const load = async (id) => {
    setLoading(id);
    if (!db) { setLoading(null); return; }
    const snap = await get(ref(db, `dashboard/plans/${id}`));
    setViewPlan(snap.val());
    setLoading(null);
  };

  if (viewPlan) return (
    <div>
      <button onClick={() => setViewPlan(null)} style={{ display:"flex", alignItems:"center", gap:6, fontSize:".8125rem", color:"#C8883A", background:"none", border:"none", cursor:"pointer", padding:0, marginBottom:"1rem", fontWeight:500 }}>
        ← Volver
      </button>
      <div style={{ background:"#FFF8EC", border:"1px solid #E8D090", borderRadius:10, padding:"10px 14px", marginBottom:"1rem", fontSize:".8rem", color:"#6B5000" }}>
        📋 Solo lectura · {viewPlan.label}
      </div>
      <PlanView week={viewPlan.week} readOnly/>
    </div>
  );

  if (!FB_READY) return (
    <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
      <div style={{ fontSize:"2rem", marginBottom:12 }}>📋</div>
      <div style={{ fontSize:".875rem", color:"#887060", lineHeight:1.6 }}>El historial requiere Firebase configurado.</div>
    </div>
  );

  return (
    <>
      <div style={{ fontSize:".75rem", color:"#A89878", marginBottom:"1rem" }}>Las listas de cada semana se preservan en solo lectura.</div>
      {allPlanIds.length === 0 && <div style={{ textAlign:"center", padding:"2rem", color:"#B8A890", fontSize:".875rem" }}>Todavía no hay semanas archivadas.</div>}
      {allPlanIds.map(id => {
        const isActive = id === activePlanId;
        return (
          <div key={id} onClick={() => load(id)} style={{ background:"#fff", border:`1px solid ${isActive?"#E8D090":"#E5E0D8"}`, borderRadius:12, padding:"14px 16px", marginBottom:8, cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:".875rem", fontWeight:600, color:"#1C1810" }}>{id}</div>
              {isActive && <div style={{ fontSize:".6875rem", color:"#C8883A", fontWeight:500, marginTop:2 }}>semana activa</div>}
            </div>
            {loading === id ? <div style={{ fontSize:".75rem", color:"#A89878" }}>cargando…</div> : <div style={{ fontSize:".75rem", color:"#C8B89A" }}>ver →</div>}
          </div>
        );
      })}
    </>
  );
}

export function NuevaView({ activePlan, shops, onPublish }) {
  const [changes, setChanges] = useState("");
  const [status, setStatus] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState("");

  const generate = async () => {
    if (!changes.trim()) return;
    setStatus("generating"); setErr("");
    try {
      const currentPlan = (activePlan?.week || DEFAULT_WEEK).map(d => ({ day:d.day, lunch:d.lunch||d.sug, dinner:d.din }));
      const prompt = `${PLAN_SYSTEM_CONTEXT}\n\nPlan actual: ${JSON.stringify(currentPlan)}\n\nCambios para la nueva semana: "${changes}"\n\nDado el contexto familiar y los cambios pedidos, generá el plan semanal completo.\n\nRespondé SOLO con un objeto JSON válido con esta estructura exacta:\n{\n  "week": [ ...7 objetos de días... ],\n  "batch": [ ...preparaciones del domingo derivadas del plan... ]\n}\n\nPara "week", cada objeto de día libre: day,short,free(true),isOrder(bool),pax,sug,sugD,din,dinD,dt.\nPara días de semana: day,short,type,pax,helper(true),lunch,ld,lq,din,dinD,dt. Opcionales: dinBatch,dinNote.\nValores válidos para type/dt: beef,chicken,eggs,fish,mixed.\n\nPara el array "batch", identificá qué tiene sentido preparar el domingo basándote en el plan de la semana. Incluí SOLO lo que aplica a este plan específico:\n- Bases que se usan en múltiples días (tucos, caldos, salsas)\n- Sides que se repiten 2+ días (vale asar una bandeja grande)\n- Prep que ahorra tiempo en días ocupados (huevos duros si hay pastel, caldo si hay pollo)\n\nCada objeto en "batch": { "id": "b1", "title": "...", "icon": "...", "when": "...", "reason": "...", "steps": ["..."], "saves": "...", "storage": "...", "color": "#...", "bg": "#..." }\n\nIconos por tipo: Tuco/salsa 🍅 #C8401A/#FDF0EB · Papas/boniatos 🥔 #C89000/#FFFBEE · Huevos duros 🥚 #0A5A28/#EAF5EF · Caldo 🍲 #1A3A7A/#EAF0FC · Pollo desmenuzado 🍗 #C89000/#FFFBEE\n\nSin markdown, sin texto extra.`;

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      const text = data.content?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setPreview(parsed);
      setStatus("preview");
    } catch(e) {
      setErr("Error al generar. Verificá la conexión e intentá de nuevo."); setStatus("error");
    }
  };

  const publish = async () => {
    setStatus("publishing");
    const id = new Date().toISOString().split("T")[0];
    const label = `Semana ${new Date().toLocaleDateString("es-UY", { day:"numeric", month:"long", year:"numeric" })}`;
    const week = preview.week || preview;
    const batch = preview.batch || [];
    const plan = { id, label, week, batch, shops:shops||DEFAULT_SHOPS, shopChecked:{}, batchChecked:{}, createdAt:Date.now() };
    if (db) {
      await set(ref(db, `dashboard/plans/${id}`), plan);
      await set(ref(db, "dashboard/activeWeekId"), id);
    }
    onPublish(plan); setStatus("done"); setChanges(""); setPreview(null);
  };

  return (
    <>
      <div style={{ background:"#FFF8EC", border:"1px solid #E8D090", borderRadius:12, padding:"14px 16px", marginBottom:"1.25rem" }}>
        <div style={{ fontSize:".75rem", fontWeight:700, color:"#C8883A", marginBottom:6 }}>✨ Nueva semana</div>
        <div style={{ fontSize:".8125rem", color:"#6B5000", lineHeight:1.6 }}>Describí los cambios. Si el plan está bien, dejalo vacío y se genera con el plan base.</div>
      </div>
      <textarea value={changes} onChange={e => setChanges(e.target.value)}
        placeholder="Ej: Cambiá el chop suey por aguja braseada. No hay berenjenas esta semana..."
        disabled={status==="generating"||status==="publishing"}
        style={{ width:"100%", minHeight:90, padding:"12px 14px", fontSize:".8125rem", color:"#1C1810", background:"#fff", border:"1px solid #E5E0D8", borderRadius:12, outline:"none", resize:"vertical", lineHeight:1.6, marginBottom:12, fontFamily:"inherit" }}
      />
      {(status==="idle"||status==="error") && (
        <button onClick={generate} style={{ width:"100%", padding:"13px", background:"#C8883A", border:"none", borderRadius:12, color:"#fff", fontSize:".9375rem", fontWeight:600, cursor:"pointer" }}>
          Generar plan con Claude
        </button>
      )}
      {status==="generating" && <div style={{ textAlign:"center", padding:"1.5rem", color:"#887060", fontSize:".875rem" }}>⏳ Generando plan…</div>}
      {status==="preview" && (
        <>
          <div style={{ background:"#EAF5EF", border:"1px solid #9ED4B0", borderRadius:10, padding:"10px 14px", marginBottom:"1rem", fontSize:".8rem", color:"#0A4A20" }}>✓ Plan generado — revisá y publicá.</div>
          <PlanView week={preview.week || preview} readOnly/>
          <div style={{ display:"flex", gap:10, marginTop:"1rem" }}>
            <button onClick={() => { setStatus("idle"); setPreview(null); }} style={{ flex:1, padding:"12px", background:"transparent", border:"1px solid #E5E0D8", borderRadius:12, color:"#887060", fontSize:".875rem", fontWeight:500, cursor:"pointer" }}>Descartar</button>
            <button onClick={publish} style={{ flex:2, padding:"12px", background:"#2A7A4F", border:"none", borderRadius:12, color:"#fff", fontSize:".9375rem", fontWeight:600, cursor:"pointer" }}>Publicar semana activa →</button>
          </div>
        </>
      )}
      {status==="publishing" && <div style={{ textAlign:"center", padding:"1.5rem", color:"#887060", fontSize:".875rem" }}>Publicando…</div>}
      {status==="done" && (
        <div style={{ textAlign:"center", padding:"2rem 1rem" }}>
          <div style={{ fontSize:"2rem", marginBottom:8 }}>✅</div>
          <div style={{ fontSize:".9375rem", fontWeight:600, color:"#1C1810", marginBottom:6 }}>Plan publicado</div>
          <div style={{ fontSize:".8125rem", color:"#887060" }}>Sofía ya ve el plan actualizado.</div>
        </div>
      )}
      {status==="error" && <div style={{ marginTop:10, fontSize:".8125rem", color:"#C06050", lineHeight:1.5 }}>{err}</div>}
    </>
  );
}

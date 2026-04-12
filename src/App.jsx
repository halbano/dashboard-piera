import { useState, useEffect, useCallback, useRef } from "react";
import PinScreen from "./shell/PinScreen";
import { db, ref, onValue, set, get, FB_READY } from "./lib/firebase";
import {
  PlanView, ListaView, BatchView,
  HistorialView, NuevaView,
} from "./skills/meal-planner/index";
import { DEFAULT_WEEK, DEFAULT_SHOPS, DEFAULT_BATCH } from "./skills/meal-planner/data";
import { addItem, removeItem } from "./skills/meal-planner/shop-items";
import FoodCosts from "./skills/food-costs/index";

export default function App() {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    setAuthed(localStorage.getItem("auth_v1") === "true");
  }, []);

  if (authed === null) return (
    <div style={{ minHeight:"100vh", background:"#1C1810", display:"flex", alignItems:"center", justifyContent:"center", color:"#786A55", fontSize:".875rem", fontFamily:"-apple-system, sans-serif" }}>
      cargando…
    </div>
  );

  return authed ? <Dashboard/> : <PinScreen onAuth={() => setAuthed(true)}/>;
}

const SECTIONS = [
  { id:"comida",    icon:"🥗", label:"Comida Semanal",   sub:"Plan, lista de compras y batch", color:"#C8883A", bg:"#FFF8EC", bo:"#E8D090", ready:true },
  { id:"todo",      icon:"📝", label:"TODO",              sub:"Tareas y pendientes",            color:"#1A6ACC", bg:"#E8F2FC", bo:"#90C4E8", ready:false },
  { id:"calendario",icon:"📅", label:"Calendario",        sub:"Eventos y agenda familiar",      color:"#7A4ACC", bg:"#F5F0F8", bo:"#C8B0E0", ready:false },
  { id:"finanzas",  icon:"💰", label:"Finanzas",          sub:"Gastos, presupuesto y control",  color:"#0A5A28", bg:"#EAF5EF", bo:"#9ED4B0", ready:false },
  { id:"wishlist",  icon:"🎁", label:"Amazon Wishlist",   sub:"Ideas de compras y regalos",     color:"#C44A20", bg:"#FDF0EB", bo:"#F0C0A8", ready:false },
];

function HomeScreen({ onSelect, fbStatus }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxWidth:600, margin:"0 auto", background:"#F5F1EB", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background:"#1C1810", flexShrink:0 }}>
        <div style={{ padding:".875rem 1.25rem .75rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:".625rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#786A55", marginBottom:2 }}>Casa de Arriba</div>
            <div style={{ fontSize:".9375rem", fontWeight:600, color:"#F0EAE0" }}>Dashboard · Familia</div>
          </div>
          <div style={{ fontSize:".6875rem", fontWeight:500, padding:"3px 10px", borderRadius:20, background:fbStatus==="ok"?"#1A3A28":fbStatus==="local"?"#2A2810":"#3A1818", color:fbStatus==="ok"?"#5ABA78":fbStatus==="local"?"#C8B050":"#C07060", border:`1px solid ${fbStatus==="ok"?"#2A5A38":fbStatus==="local"?"#4A4018":"#5A2828"}` }}>
            {fbStatus==="ok"?"● sync":fbStatus==="local"?"○ local":fbStatus==="connecting"?"○ …":"● offline"}
          </div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"1.25rem" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => s.ready && onSelect(s.id)} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background:"#fff", border:`1px solid ${s.bo}`, borderRadius:14, cursor:s.ready?"pointer":"default", opacity:s.ready?1:0.55, textAlign:"left", width:"100%", transition:"transform .1s" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", flexShrink:0 }}>{s.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:".9375rem", fontWeight:600, color:"#1C1810" }}>{s.label}</div>
                <div style={{ fontSize:".75rem", color:"#A89878", marginTop:2 }}>{s.sub}</div>
              </div>
              {s.ready
                ? <div style={{ fontSize:".75rem", color:s.color, fontWeight:600 }}>→</div>
                : <div style={{ fontSize:".6rem", fontWeight:700, padding:"3px 8px", borderRadius:20, background:"#F0EBE2", color:"#B8A890", textTransform:"uppercase", letterSpacing:".08em" }}>Pronto</div>
              }
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MealPlannerSection({ onBack }) {
  const [nav, setNav] = useState("plan");
  const [activePlan, setActivePlan] = useState(null);
  const [allPlanIds, setAllPlanIds] = useState([]);
  const [fbStatus, setFbStatus] = useState(FB_READY ? "connecting" : "local");
  const unsubRef = useRef(null);
  const planRef = useRef(null);

  useEffect(() => { planRef.current = activePlan; }, [activePlan]);

  useEffect(() => {
    if (!db) {
      setFbStatus("local");
      setActivePlan({ id:"local", label:"Plan base", week:DEFAULT_WEEK, shops:DEFAULT_SHOPS, shopChecked:{}, batchChecked:{} });
      return;
    }

    const activeIdRef = ref(db, "dashboard/activeWeekId");
    const unsubActive = onValue(activeIdRef, async (snap) => {
      let id = snap.val();

      if (!id) {
        id = new Date().toISOString().split("T")[0];
        const label = `Semana ${new Date().toLocaleDateString("es-UY", { day:"numeric", month:"long", year:"numeric" })}`;
        const seed = { id, label, week:DEFAULT_WEEK, batch:DEFAULT_BATCH, shops:DEFAULT_SHOPS, shopChecked:{}, batchChecked:{}, createdAt:Date.now() };
        await set(ref(db, `dashboard/plans/${id}`), seed);
        await set(ref(db, "dashboard/activeWeekId"), id);
        return;
      }

      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      const planDbRef = ref(db, `dashboard/plans/${id}`);
      const unsub = onValue(planDbRef, (pSnap) => {
        const plan = pSnap.val();
        if (plan) {
          if (plan.week && !plan.batch) {
            plan.batch = DEFAULT_BATCH;
            set(ref(db, `dashboard/plans/${id}/batch`), DEFAULT_BATCH);
          }
          setActivePlan(plan);
        }
        setFbStatus("ok");
      }, () => setFbStatus("error"));
      unsubRef.current = unsub;
    }, () => {
      setFbStatus("error");
      setActivePlan({ id:"local", label:"Plan base (offline)", week:DEFAULT_WEEK, shops:DEFAULT_SHOPS, shopChecked:{}, batchChecked:{} });
    });

    const plansRef = ref(db, "dashboard/plans");
    const unsubPlans = onValue(plansRef, (snap) => {
      const plans = snap.val();
      if (plans) setAllPlanIds(Object.keys(plans).sort((a, b) => b.localeCompare(a)));
    });

    return () => {
      unsubActive();
      unsubPlans();
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const updateShop = useCallback(async (id, val) => {
    setActivePlan(p => ({ ...p, shopChecked: { ...(p.shopChecked||{}), [id]: val } }));
    const p = planRef.current;
    if (db && p?.id && p.id !== "local") await set(ref(db, `dashboard/plans/${p.id}/shopChecked/${id}`), val);
  }, []);

  const clearShop = useCallback(async () => {
    setActivePlan(p => ({ ...p, shopChecked: {} }));
    const p = planRef.current;
    if (db && p?.id && p.id !== "local") await set(ref(db, `dashboard/plans/${p.id}/shopChecked`), {});
  }, []);

  const addShopItem = useCallback(async (shopId, item) => {
    setActivePlan(prev => ({ ...prev, shops: addItem(prev.shops || DEFAULT_SHOPS, shopId, item) }));
    const p = planRef.current;
    if (db && p?.id && p.id !== "local") {
      await set(ref(db, `dashboard/plans/${p.id}/shops`), addItem(p.shops || DEFAULT_SHOPS, shopId, item));
    }
  }, []);

  const removeShopItem = useCallback(async (shopId, itemId) => {
    setActivePlan(prev => ({ ...prev, shops: removeItem(prev.shops || DEFAULT_SHOPS, shopId, itemId) }));
    const p = planRef.current;
    if (db && p?.id && p.id !== "local") {
      await set(ref(db, `dashboard/plans/${p.id}/shops`), removeItem(p.shops || DEFAULT_SHOPS, shopId, itemId));
    }
  }, []);

  const updateBatch = useCallback(async (id, val) => {
    setActivePlan(p => ({ ...p, batchChecked: { ...(p.batchChecked||{}), [id]: val } }));
    const p = planRef.current;
    if (db && p?.id && p.id !== "local") await set(ref(db, `dashboard/plans/${p.id}/batchChecked/${id}`), val);
  }, []);

  const shops      = activePlan?.shops || DEFAULT_SHOPS;
  const shopChecked  = activePlan?.shopChecked  || {};
  const batchChecked = activePlan?.batchChecked || {};
  const totalItems   = shops.reduce((a, s) => a + s.items.length, 0);
  const totalChecked = Object.values(shopChecked).filter(Boolean).length;

  const NAVS = [
    { id:"plan",    icon:"🥗", label:"Plan" },
    { id:"lista",   icon:"✅", label:`Lista${totalChecked > 0 ? ` ${totalChecked}/${totalItems}` : ""}` },
    { id:"batch",   icon:"🔄", label:"Batch" },
    { id:"hist",    icon:"📋", label:"Historial" },
    { id:"nueva",   icon:"✨", label:"Nueva" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxWidth:600, margin:"0 auto", background:"#F5F1EB", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#1C1810", flexShrink:0 }}>
        <div style={{ padding:".875rem 1.25rem .75rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={onBack} style={{ background:"none", border:"none", color:"#C8883A", fontSize:".875rem", cursor:"pointer", padding:0, fontWeight:600 }}>← Inicio</button>
            <div>
              <div style={{ fontSize:".625rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#786A55", marginBottom:2 }}>
                {activePlan?.label || "Cargando…"}
              </div>
              <div style={{ fontSize:".9375rem", fontWeight:600, color:"#F0EAE0" }}>Comida Semanal</div>
            </div>
          </div>
          <div style={{ fontSize:".6875rem", fontWeight:500, padding:"3px 10px", borderRadius:20, background:fbStatus==="ok"?"#1A3A28":fbStatus==="local"?"#2A2810":"#3A1818", color:fbStatus==="ok"?"#5ABA78":fbStatus==="local"?"#C8B050":"#C07060", border:`1px solid ${fbStatus==="ok"?"#2A5A38":fbStatus==="local"?"#4A4018":"#5A2828"}` }}>
            {fbStatus==="ok"?"● sync":fbStatus==="local"?"○ local":fbStatus==="connecting"?"○ …":"● offline"}
          </div>
        </div>
      </div>

      {/* Scrollable body — views stay mounted to preserve state */}
      <div style={{ flex:1, overflowY:"auto", padding:"1.25rem", paddingBottom:"calc(72px + env(safe-area-inset-bottom,0))" }}>
        {!activePlan && <div style={{ textAlign:"center", padding:"3rem", color:"#887060", fontSize:".875rem" }}>Cargando…</div>}
        {activePlan && <div style={{ display:nav==="plan"?"block":"none" }}><PlanView week={activePlan.week}/></div>}
        {activePlan && <div style={{ display:nav==="lista"?"block":"none" }}><ListaView shops={shops} shopChecked={shopChecked} toggle={updateShop} clear={clearShop} total={totalItems} checked={totalChecked} onAddItem={addShopItem} onRemoveItem={removeShopItem}/></div>}
        {activePlan && <div style={{ display:nav==="batch"?"block":"none" }}><BatchView batchItems={activePlan.batch} batchChecked={batchChecked} toggle={updateBatch}/></div>}
        <div style={{ display:nav==="hist"?"block":"none" }}><HistorialView allPlanIds={allPlanIds} activePlanId={activePlan?.id}/></div>
        <div style={{ display:nav==="nueva"?"block":"none" }}><NuevaView activePlan={activePlan} shops={shops} onPublish={p => { setActivePlan(p); setNav("plan"); }}/></div>
      </div>

      {/* Bottom nav */}
      <div style={{ background:"#1C1810", borderTop:".5px solid #2E2820", display:"flex", flexShrink:0, paddingBottom:"env(safe-area-inset-bottom,0)" }}>
        {NAVS.map(n => (
          <button key={n.id} onClick={() => setNav(n.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, border:"none", background:"transparent", cursor:"pointer", padding:"8px 0 7px" }}>
            <span style={{ fontSize:"1.1rem", lineHeight:1 }}>{n.icon}</span>
            <span style={{ fontSize:".575rem", fontWeight:700, letterSpacing:".05em", textTransform:"uppercase", color:nav===n.id?"#C8883A":"#786A55" }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const [section, setSection] = useState(null);
  const [fbStatus, setFbStatus] = useState(FB_READY ? "connecting" : "local");

  useEffect(() => {
    if (!db) { setFbStatus("local"); return; }
    // Quick ping to confirm Firebase is up
    const pingRef = ref(db, "dashboard/activeWeekId");
    const unsub = onValue(pingRef, () => setFbStatus("ok"), () => setFbStatus("error"));
    return unsub;
  }, []);

  if (section === "comida") return <MealPlannerSection onBack={() => setSection(null)}/>;

  return <HomeScreen onSelect={setSection} fbStatus={fbStatus}/>;
}

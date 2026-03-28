import { useState, useEffect, useCallback, useRef } from "react";
import PinScreen from "./shell/PinScreen";
import { db, ref, onValue, set, get, FB_READY } from "./lib/firebase";
import {
  PlanView, ListaView, BatchView,
  HistorialView, NuevaView,
} from "./skills/meal-planner/index";
import { DEFAULT_WEEK, DEFAULT_SHOPS } from "./skills/meal-planner/data";
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

function Dashboard() {
  const [nav, setNav] = useState("plan");
  const [subTab, setSubTab] = useState("semana");
  const [activePlan, setActivePlan] = useState(null);
  const [allPlanIds, setAllPlanIds] = useState([]);
  const [fbStatus, setFbStatus] = useState(FB_READY ? "connecting" : "local");
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!db) {
      setFbStatus("local");
      setActivePlan({ id:"local", label:"Plan base", week:DEFAULT_WEEK, shops:DEFAULT_SHOPS, shopChecked:{}, batchChecked:{} });
      return;
    }

    // Watch active plan ID
    const activeIdRef = ref(db, "dashboard/activeWeekId");
    const unsubActive = onValue(activeIdRef, (snap) => {
      const id = snap.val();
      if (!id) {
        setFbStatus("ok");
        setActivePlan({ id:"local", label:"Plan base", week:DEFAULT_WEEK, shops:DEFAULT_SHOPS, shopChecked:{}, batchChecked:{} });
        return;
      }
      // Unsubscribe previous plan listener
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      // Watch active plan document
      const planRef = ref(db, `dashboard/plans/${id}`);
      const unsub = onValue(planRef, (pSnap) => {
        const plan = pSnap.val();
        if (plan) setActivePlan(plan);
        setFbStatus("ok");
      }, () => setFbStatus("error"));
      unsubRef.current = unsub;
    }, () => {
      setFbStatus("error");
      setActivePlan({ id:"local", label:"Plan base (offline)", week:DEFAULT_WEEK, shops:DEFAULT_SHOPS, shopChecked:{}, batchChecked:{} });
    });

    // Watch all plan IDs for history
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
    if (db && activePlan?.id !== "local") await set(ref(db, `dashboard/plans/${activePlan.id}/shopChecked/${id}`), val);
  }, [activePlan]);

  const clearShop = useCallback(async () => {
    setActivePlan(p => ({ ...p, shopChecked: {} }));
    if (db && activePlan?.id !== "local") await set(ref(db, `dashboard/plans/${activePlan.id}/shopChecked`), {});
  }, [activePlan]);

  const updateBatch = useCallback(async (id, val) => {
    setActivePlan(p => ({ ...p, batchChecked: { ...(p.batchChecked||{}), [id]: val } }));
    if (db && activePlan?.id !== "local") await set(ref(db, `dashboard/plans/${activePlan.id}/batchChecked/${id}`), val);
  }, [activePlan]);

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

  // Sub-tabs for future sections
  const showSubTabs = ["plan","lista","batch","hist","nueva"].includes(nav);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxWidth:600, margin:"0 auto", background:"#F5F1EB", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background:"#1C1810", flexShrink:0 }}>
        <div style={{ padding:".875rem 1.25rem .75rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:".625rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#786A55", marginBottom:2 }}>
              {activePlan?.label || "Cargando…"}
            </div>
            <div style={{ fontSize:".9375rem", fontWeight:600, color:"#F0EAE0" }}>Dashboard · Familia</div>
          </div>
          <div style={{ fontSize:".6875rem", fontWeight:500, padding:"3px 10px", borderRadius:20, background:fbStatus==="ok"?"#1A3A28":fbStatus==="local"?"#2A2810":"#3A1818", color:fbStatus==="ok"?"#5ABA78":fbStatus==="local"?"#C8B050":"#C07060", border:`1px solid ${fbStatus==="ok"?"#2A5A38":fbStatus==="local"?"#4A4018":"#5A2828"}` }}>
            {fbStatus==="ok"?"● sync":fbStatus==="local"?"○ local":fbStatus==="connecting"?"○ …":"● offline"}
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex:1, overflowY:"auto", padding:"1.25rem", paddingBottom:"calc(72px + env(safe-area-inset-bottom,0))" }}>
        {!activePlan && <div style={{ textAlign:"center", padding:"3rem", color:"#887060", fontSize:".875rem" }}>Cargando…</div>}
        {activePlan && nav === "plan"  && <PlanView week={activePlan.week}/>}
        {activePlan && nav === "lista" && <ListaView shops={shops} shopChecked={shopChecked} toggle={updateShop} clear={clearShop} total={totalItems} checked={totalChecked}/>}
        {activePlan && nav === "batch" && <BatchView batchChecked={batchChecked} toggle={updateBatch}/>}
        {nav === "hist"  && <HistorialView allPlanIds={allPlanIds} activePlanId={activePlan?.id}/>}
        {nav === "nueva" && <NuevaView activePlan={activePlan} onPublish={p => { setActivePlan(p); setNav("plan"); }}/>}
        {nav === "costos" && <FoodCosts/>}
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

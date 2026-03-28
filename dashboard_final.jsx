import { useState, useEffect, useCallback, useRef } from "react";

const PIN = "PIERA";
const FB = { apiKey:"", authDomain:"", databaseURL:"", projectId:"", storageBucket:"", messagingSenderId:"", appId:"" };

const DEFAULT_WEEK = [
  {day:"Domingo", short:"DOM",free:true,pax:4,sug:"Pastel de carne o asado largo",sugD:"Lo que apetezca — prep de la semana va en Batch.",din:"Sobras o quesos",dinD:"Sin cocción",dt:"mixed"},
  {day:"Lunes",   short:"LUN",type:"chicken",pax:5,helper:true,lunch:"Suprema de pollo al horno",ld:"Papas semi-fritas (batch dom) · zapallitos · limón",lq:"~1.2kg · papas ya asadas, solo dorar 15 min",din:"Pollo frío con rúcula",dinD:"Sobras · rúcula + limón + oliva",dt:"chicken"},
  {day:"Martes",  short:"MAR",type:"beef",pax:5,helper:true,lunch:"Lasagna de zucchini y berenjena",ld:"Capas zucchini/berenjena · tuco del batch · Gouda + Parmesano · 35 min horno",lq:"Armar noche del lunes · hornear al mediodía",din:"Fideos de arroz con tuco",dinD:"Tuco del batch · 4 min · Parmesano",dt:"beef",dinBatch:"usa tuco del domingo"},
  {day:"Miércoles",short:"MIÉ",type:"chicken",pax:5,helper:true,lunch:"Chop suey de pollo saltado",ld:"Pollo en tiras + fideos arroz + zanahorias + zapallitos · fuego alto",lq:"~1.1kg · completo en 20 min",din:"🐟 Salmón a la plancha",dinD:"Limón + sal + manteca · zucchini · 4 pax",dt:"fish",dinNote:"cena familia · Johanna no está"},
  {day:"Jueves",  short:"JUE",type:"beef",pax:5,helper:true,lunch:"Pastel de carne picada",ld:"Picada + pasas + huevo duro + Parmesano · cubierto con puré boniato",lq:"~800g · armar la noche anterior en 10 min",din:"Huevos fritos simples",dinD:"Manteca + sal gruesa · 5 minutos",dt:"eggs"},
  {day:"Viernes", short:"VIE",type:"beef",pax:5,helper:true,lunch:"Milanesa de Nalga",ld:"Puré de papas cremoso · zanahoria al vapor · Parmesano",lq:"~1.1kg · puré con papas del batch si quedan",din:"Tortilla española o soufflé",dinD:"Huevos + papas en láminas",dt:"eggs"},
  {day:"Sábado",  short:"SAB",free:true,isOrder:true,pax:4,sug:"Asado o lo que apetezca",sugD:"Cuadril, tira, chorizos · sin apuro · día del pedido.",din:"Sobras + tabla de quesos",dinD:"Restos fríos + Gouda + Parmesano + Criollitos",dt:"mixed"},
];

const DEFAULT_SHOPS = [
  {id:"dc",name:"Del Campo",sub:"Av. Sarmiento 2394 · pedir sábados",c:"#7A2A10",bg:"#FDF0EB",items:[
    {id:"dc1",name:"Suprema de pollo",qty:"1.2 kg",note:"$630/kg",eff:"~$643",use:"Lunes"},
    {id:"dc2",name:"Picada Magra",qty:"1.2 kg",note:"$630/kg",eff:"~$643",use:"Tuco + pastel"},
    {id:"dc3",name:"Milanesa SG Nalga",qty:"1.1 kg",note:"$870/kg",eff:"~$812",use:"Viernes"},
    {id:"dc4",name:"Pollo trozado",qty:"1.1 kg",note:"$430–490/kg",eff:"~$390",use:"Chop suey miércoles"},
    {id:"dc5",name:"Cuadril / tira",qty:"~900 g",note:"$790/kg",eff:"~$604",use:"Sábado libre"},
  ]},
  {id:"nm",name:"Capitán Nemo",sub:"capitannemo.com.uy · delivery mismo día",c:"#0A3A6A",bg:"#E8F2FC",link:"https://www.capitannemo.com.uy/producto/salmon-chileno-1-kg/",altNote:"Alt.: Merluza $440/kg o Cazón $400/kg",items:[
    {id:"n1",name:"Salmón Chileno Fresco",qty:"700 g",note:"$1.150/kg ★★★★★",eff:"~$805",use:"Miércoles cena"},
  ]},
  {id:"qs",name:"El Establecimiento",sub:"Emilio Frugoni 949 · quincenal",c:"#7A5000",bg:"#FFF8EC",items:[
    {id:"q1",name:"Gouda",qty:"~400 g",note:"$580/kg",eff:"~$232",use:"Lasagna + cenas"},
    {id:"q2",name:"Parmesano Don Nelson",qty:"~350 g",note:"$780/kg",eff:"~$273",use:"Pastel + lasagna"},
    {id:"q3",name:"Criollitos",qty:"~400 g",note:"$445/kg",eff:"~$178",use:"Cenas + snack"},
  ]},
  {id:"fe",name:"Feria",sub:"Sábado o martes · orgánicos cuando hay",c:"#0A5A28",bg:"#EAF5EF",items:[
    {id:"f1",name:"Boniatos",qty:"2.0 kg",note:"~$100/kg",eff:"~$200",use:"Batch + pastel"},
    {id:"f2",name:"Zucchini",qty:"x4–5 un.",note:"~$30/un.",eff:"~$130",use:"Lasagna + chop suey"},
    {id:"f3",name:"Berenjenas",qty:"x2–3 un.",note:"~$40/un.",eff:"~$100",use:"Lasagna"},
    {id:"f4",name:"Zanahorias",qty:"x4–5 un.",note:"~$20/un.",eff:"~$90",use:"Chop suey + vapor"},
    {id:"f5",name:"Papas",qty:"1.5 kg",note:"~$60/kg",eff:"~$90",use:"Batch + milanesa"},
    {id:"f6",name:"Tomates",qty:"500 g",note:"~$240/kg",eff:"~$120",use:"Tuco + ensaladas"},
    {id:"f7",name:"Rúcula",qty:"2 bolsas",note:"~$80/bolsa",eff:"~$160",use:"Verde toda la semana"},
    {id:"f8",name:"Limones",qty:"x6 un.",note:"~$10/un.",eff:"~$60",use:"Carnes + salmón"},
  ]},
  {id:"di",name:"Disco / Géant",sub:"Reposición quincenal",c:"#1A3A7A",bg:"#EAF0FC",items:[
    {id:"d1",name:"Huevos",qty:"30 un.",note:"~$16/un.",eff:"~$480",use:"Dom + cenas"},
    {id:"d2",name:"Fideos de arroz",qty:"400 g",note:"~$180",eff:"~$180",use:"Chop suey + fideos"},
    {id:"d3",name:"Pasas de uva",qty:"100 g",note:"~$80",eff:"~$80",use:"Pastel"},
    {id:"d4",name:"Tomate triturado",qty:"x2 latas",note:"~$80/lata",eff:"~$160",use:"Tuco batch"},
    {id:"d5",name:"Manteca",qty:"200 g",note:"~$160",eff:"~$160",use:"Cocción + puré"},
    {id:"d6",name:"Crema de leche",qty:"200 ml",note:"~$95",eff:"~$95",use:"Puré + cenas"},
    {id:"d7",name:"Aceite oliva EVOO",qty:"500 ml",note:"~$420",eff:"~$210",use:"Prorrateado"},
  ]},
];

const BATCH_ITEMS = [
  {id:"b1",title:"Tuco doble",when:"~40 min activos",icon:"🍅",c:"#C8401A",bg:"#FDF0EB",steps:["Picada 400g + tomate triturado + cebolla + ajo · rehogar 25 min","Hacé el DOBLE — mitad lasagna martes, mitad fideos martes noche"],saves:"Martes almuerzo: solo ensamblar · Martes cena: solo hervir fideos 5 min",storage:"Heladera 4 días · congela 3 meses"},
  {id:"b2",title:"Papas y boniatos al horno",when:"~25 min (horno solo)",icon:"🥔",c:"#C89000",bg:"#FFFBEE",steps:["Cubos de papa y boniato · oliva + sal gruesa · 200°C 25 min","Guardar en tupper hermético en heladera"],saves:"Lunes side en 10 min · Jueves puré: solo pisar · Viernes: recalentar",storage:"Heladera 5 días"},
  {id:"b3",title:"Huevos duros (6–8 und.)",when:"12 min pasivos",icon:"🥚",c:"#0A5A28",bg:"#EAF5EF",steps:["Hervir 10 min desde hervor · agua fría inmediata · guardar con cáscara"],saves:"Jueves pastel: listos para picar · Cena emergencia: huevo + queso en 0 min",storage:"Heladera 7 días con cáscara"},
  {id:"b4",title:"Caldo de huesos",when:"~2hs pasivas",icon:"🍲",c:"#1A3A7A",bg:"#EAF0FC",steps:["Carcasas o huesos + agua + sal + laurel · fuego mínimo tapado · sin atención"],saves:"Cena de emergencia cualquier día · las niñas lo toman como sopa",storage:"Heladera 4 días · congela en porciones"},
];

const TS = {beef:{bg:"#FDF0EB",bo:"#F0C0A8",tx:"#7A2A10",dot:"#C44A20"},chicken:{bg:"#FFFBEE",bo:"#EDD898",tx:"#7A5800",dot:"#C89000"},eggs:{bg:"#F0F8F2",bo:"#9ED4B0",tx:"#0A5A28",dot:"#1A8A48"},fish:{bg:"#E8F2FC",bo:"#90C4E8",tx:"#0A3A6A",dot:"#1A6ACC"},mixed:{bg:"#F5F0F8",bo:"#C8B0E0",tx:"#4A2A7A",dot:"#7A4ACC"}};
const LI = {beef:"🥩",chicken:"🍗",eggs:"🥚",fish:"🐟"};
const DI = {eggs:"🥚",fish:"🐟",chicken:"🍗",mixed:"🧀",beef:"🥩"};
const LB = {fontSize:".6rem",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#C8B89A",marginBottom:4};

// Storage helpers
async function lGet(k){try{const r=await window.storage.get(k,false);return r?.value?JSON.parse(r.value):null;}catch{return null;}}
async function lSet(k,v){try{await window.storage.set(k,JSON.stringify(v),false);}catch{}}

// Firebase init (lazy)
let db=null;
async function initFB(){
  if(db)return db;
  if(!FB.apiKey||!FB.databaseURL)return null;
  return new Promise(res=>{
    const s1=document.createElement("script");
    s1.src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js";
    s1.onload=()=>{
      const s2=document.createElement("script");
      s2.src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js";
      s2.onload=()=>{try{if(!firebase.apps.length)firebase.initializeApp(FB);db=firebase.database();}catch(e){}res(db);};
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  });
}

// ── COMPONENTS ──────────────────────────────────────────────────
function CB({on,c}){return <div style={{width:22,height:22,borderRadius:6,flexShrink:0,border:on?`2px solid ${c}`:"2px solid #D0C8B8",background:on?c:"#fff",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>{on&&<svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>;}
function Toggle({on,set}){return <div onClick={()=>set(!on)} style={{width:36,height:20,borderRadius:10,cursor:"pointer",background:on?"#C8883A":"#C8C0B0",position:"relative",transition:"background .2s",flexShrink:0}}><div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?19:3,transition:"left .2s",boxShadow:"0 1px 2px rgba(0,0,0,.2)"}}/></div>;}
function DBox({short,icon,bg,bo,tx}){return <div style={{width:34,height:34,borderRadius:9,background:bg,border:bo,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}><div style={{fontSize:".5rem",fontWeight:800,color:tx,lineHeight:1}}>{short}</div><div style={{fontSize:".75rem",lineHeight:1,marginTop:2}}>{icon}</div></div>;}
function Pill({bg,bo,dot,tx,children}){return <div style={{display:"inline-flex",alignItems:"center",gap:5,background:bg,border:`1px solid ${bo}`,borderRadius:20,padding:"4px 12px"}}><div style={{width:6,height:6,borderRadius:"50%",background:dot}}/><span style={{fontSize:".75rem",fontWeight:500,color:tx}}>{children}</span></div>;}

function Strip({week}){return <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:"1.25rem"}}>{week.map((d,i)=>{const dot=d.free?"#C8B0E0":(TS[d.type]?.dot||"#ccc");return <div key={i} style={{textAlign:"center"}}><div style={{height:4,borderRadius:2,background:dot,marginBottom:4,opacity:d.free?.45:1}}/><div style={{fontSize:".5625rem",fontWeight:700,color:"#B8A890"}}>{d.short}</div><div style={{fontSize:".75rem"}}>{d.free?"🎲":LI[d.type]}</div></div>;})}</div>;}

function FreeCard({d,showDin}){const ds=TS[d.dt]||TS.mixed;return(<div style={{background:"#FDFBF7",border:"1.5px dashed #D8D0C0",borderRadius:14,overflow:"hidden",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#F7F4EF",borderBottom:"1px dashed #EAE4DA"}}><DBox short={d.short} icon="🎲" bg="#F0EBE2" bo="1.5px dashed #C8B8A0" tx="#9A8870"/><div style={{flex:1}}><div style={{fontSize:".875rem",fontWeight:600,color:"#3A3020"}}>{d.day}</div><div style={{fontSize:".6875rem",color:"#9A8870",marginTop:1}}>{d.isOrder?"📦 pedido Del Campo + Capitán Nemo":"fin de semana libre · 4 pax"}</div></div><span style={{fontSize:".6875rem",fontWeight:600,padding:"2px 8px",borderRadius:20,background:"#EAE4DA",color:"#8A7A68",border:"1px dashed #C8B8A0"}}>libre</span></div><div style={{padding:"12px 14px"}}><div style={LB}>Sugerencia</div><div style={{fontSize:".9375rem",fontWeight:500,color:"#5A4A38",fontStyle:"italic",marginBottom:3}}>{d.sug}</div><div style={{fontSize:".8125rem",color:"#A89878",lineHeight:1.5}}>{d.sugD}</div></div>{showDin&&<div style={{padding:"11px 14px",borderTop:"1px dashed #EAE4DA",background:"#FAF8F4"}}><div style={LB}>Cena · 4 pax</div><div style={{fontSize:".875rem",fontWeight:500,color:"#3C3020",marginBottom:2}}>{d.din}</div><div style={{fontSize:".8125rem",color:"#A89878",lineHeight:1.5}}>{d.dinD}</div></div>}</div>);}

function WeekdayCard({d,showDin}){const ls=TS[d.type]||{};const ds=TS[d.dt]||TS.mixed;return(<div style={{background:"#fff",border:"1px solid #E5E0D8",borderRadius:14,overflow:"hidden",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#FAFAF8",borderBottom:"1px solid #F0EBE3"}}><DBox short={d.short} icon={LI[d.type]} bg={ls.bg} bo={`1px solid ${ls.bo}`} tx={ls.tx}/><div style={{flex:1,fontSize:".875rem",fontWeight:600,color:"#1C1810"}}>{d.day}</div><span style={{fontSize:".6rem",fontWeight:600,padding:"2px 8px",borderRadius:20,background:"#FFF8EC",color:"#7A5000",border:"1px solid #E8D090"}}>{"●".repeat(d.pax)} {d.pax}</span></div><div style={{padding:"12px 14px"}}><div style={LB}>Almuerzo</div><div style={{fontSize:".9375rem",fontWeight:600,color:"#1C1810",marginBottom:3,lineHeight:1.3}}>{d.lunch}</div><div style={{fontSize:".8125rem",color:"#887060",lineHeight:1.5}}>{d.ld}</div><div style={{fontSize:".75rem",color:"#B8A890",marginTop:5,fontStyle:"italic"}}>{d.lq}</div></div>{showDin&&<div style={{padding:"11px 14px",borderTop:"1px solid #F5F0E8",background:d.dt==="fish"?"#F0F6FF":"#FDFCFA"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap"}}><div style={LB}>Cena · 4 pax</div><span style={{fontSize:".6875rem",padding:"1px 7px",borderRadius:20,fontWeight:600,background:ds.bg,color:ds.tx,border:`1px solid ${ds.bo}`}}>{DI[d.dt]} {d.dt==="fish"?"Pescado":d.dt==="eggs"?"Huevos":d.dt==="beef"?"Vacuno":d.dt==="chicken"?"Pollo":"Mixto"}</span>{d.dinBatch&&<span style={{fontSize:".6875rem",color:"#C8883A",fontWeight:500}}>🔄 {d.dinBatch}</span>}{d.dinNote&&<span style={{fontSize:".6875rem",color:"#1A6ACC",fontWeight:500}}>{d.dinNote}</span>}</div><div style={{fontSize:".875rem",fontWeight:500,color:"#1C2030",marginBottom:2}}>{d.din}</div><div style={{fontSize:".8125rem",color:"#887060",lineHeight:1.5}}>{d.dinD}</div></div>}</div>);}

// ── VIEWS ────────────────────────────────────────────────────────
function PlanView({week,readOnly}){
  const [showDin,setShowDin]=useState(false);
  return(<><div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap",alignItems:"center"}}><Pill bg="#FFF8EC" bo="#E8D090" dot="#C8883A" tx="#7A5000">Lun–Vie · 5 pax</Pill><Pill bg="#F5F0F8" bo="#C8B0E0" dot="#7A4ACC" tx="#4A2A7A">Dom + Sáb · libre</Pill>{!readOnly&&<div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:".75rem",color:"#B8A890"}}>Cenas</span><Toggle on={showDin} set={setShowDin}/></div>}</div><Strip week={week}/>{week.map(d=>d.free?<FreeCard key={d.day} d={d} showDin={showDin}/>:<WeekdayCard key={d.day} d={d} showDin={showDin}/>)}</>);
}

function ListaView({shops,shopChecked,toggle,clear,total,checked}){return(<><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1rem"}}><div style={{flex:1,height:5,background:"#E0D8CC",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:"#C8883A",borderRadius:3,width:`${total>0?(checked/total)*100:0}%`,transition:"width .3s"}}/></div><span style={{fontSize:".8rem",color:"#887060",minWidth:48,textAlign:"right"}}>{checked}/{total}</span>{checked>0&&<button onClick={clear} style={{fontSize:".75rem",color:"#C8B89A",background:"none",border:"none",cursor:"pointer",textDecoration:"underline",padding:0}}>limpiar</button>}</div><div style={{background:"#EAF5EF",border:"1px solid #9ED4B0",borderRadius:10,padding:"10px 14px",marginBottom:"1.25rem",fontSize:".8rem",color:"#0A4A20",lineHeight:1.5}}>Lista compartida — los tildados se sincronizan entre dispositivos.</div>{shops.map(s=>{const done=s.items.filter(i=>shopChecked[i.id]).length;return(<div key={s.id} style={{marginBottom:"1.25rem"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}><span style={{fontSize:".6875rem",fontWeight:700,padding:"3px 12px",borderRadius:20,background:s.bg,color:s.c,border:`1px solid ${s.c}28`}}>{s.name}</span><span style={{fontSize:".75rem",color:"#A89878",flex:1}}>{s.sub}</span><span style={{fontSize:".75rem",color:done===s.items.length?"#0A5A28":"#A89878",fontWeight:done===s.items.length?600:400}}>{done}/{s.items.length}</span></div>{s.link&&<a href={s.link} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:".75rem",color:"#1A6ACC",textDecoration:"none",marginBottom:8,padding:"4px 12px",background:"#E8F2FC",borderRadius:20,border:"1px solid #90C4E8"}}>🌐 ver salmón →</a>}<div style={{background:"#fff",border:"1px solid #E5E0D8",borderRadius:12,overflow:"hidden"}}>{s.items.map((item,idx)=>{const on=!!shopChecked[item.id];return(<div key={item.id} onClick={()=>toggle(item.id,!on)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderBottom:idx<s.items.length-1?"1px solid #F5F0E8":"none",cursor:"pointer",background:on?"#FAFAF8":"#fff",userSelect:"none"}}><CB on={on} c={s.c}/><div style={{flex:1}}><div style={{fontSize:".875rem",fontWeight:500,color:on?"#B0A090":"#1C1810",textDecoration:on?"line-through":"none"}}>{item.name}</div><div style={{fontSize:".75rem",color:"#B8A890",marginTop:1}}>{item.use} · {item.note}</div></div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:".8125rem",fontWeight:500,color:on?"#C0B8A8":"#4A3A28"}}>{item.qty}</div><div style={{fontSize:".75rem",fontWeight:500,color:on?"#C0B8A8":"#2A7A4F",marginTop:1}}>{item.eff}</div></div></div>);})}</div>{s.altNote&&<div style={{fontSize:".75rem",color:"#7A6A50",marginTop:6,padding:"7px 12px",background:"#FFF8EC",borderRadius:8,border:"1px solid #E8D8B0"}}>💡 {s.altNote}</div>}</div>);})}</>);}

function BatchView({batch,toggle}){return(<><div style={{background:"#FFF8EC",border:"1px solid #E8D090",borderRadius:12,padding:"13px 16px",marginBottom:"1.25rem"}}><div style={{fontSize:".75rem",fontWeight:700,color:"#C8883A",marginBottom:6}}>Prep del domingo · ~45 min totales</div><div style={{fontSize:".8125rem",color:"#6B5000",lineHeight:1.6}}>El tuco es el núcleo — hacelo una vez, cubre la lasagna del martes y los fideos del martes noche.</div></div>{BATCH_ITEMS.map(b=>{const on=!!batch[b.id];return(<div key={b.id} style={{background:on?"#FAFAF8":"#fff",border:"1px solid #E5E0D8",borderRadius:14,overflow:"hidden",marginBottom:10}}><div onClick={()=>toggle(b.id,!on)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",cursor:"pointer",userSelect:"none"}}><div style={{width:38,height:38,borderRadius:10,background:on?"#F0EBE2":b.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.25rem",flexShrink:0}}>{on?"✓":b.icon}</div><div style={{flex:1}}><div style={{fontSize:".9375rem",fontWeight:600,color:on?"#B0A090":"#1C1810",textDecoration:on?"line-through":"none"}}>{b.title}</div><div style={{fontSize:".75rem",color:on?"#C0B8A8":"#A89878",marginTop:1}}>{b.when}</div></div><CB on={on} c={b.c}/></div>{!on&&<div style={{padding:"0 16px 14px"}}>{b.steps.map((s,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:5}}><div style={{width:18,height:18,borderRadius:"50%",background:b.bg,color:b.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".6rem",fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</div><span style={{fontSize:".8125rem",color:"#555040",lineHeight:1.5}}>{s}</span></div>)}<div style={{background:"#F5F2ED",borderRadius:8,padding:"8px 12px",fontSize:".8125rem",color:"#6B5A40",lineHeight:1.5,marginTop:8,marginBottom:6}}><strong style={{color:b.c}}>Desbloquea: </strong>{b.saves}</div><div style={{fontSize:".75rem",color:"#A89878"}}>🧊 {b.storage}</div></div>}</div>);})}</>);}

function HistorialView({allPlanIds,activePlanId}){
  const [viewPlan,setViewPlan]=useState(null);
  const [loading,setLoading]=useState(null);
  const load=async(id)=>{setLoading(id);if(!db){setLoading(null);return;}const snap=await db.ref(`dashboard/plans/${id}`).once("value");setViewPlan(snap.val());setLoading(null);};
  if(viewPlan)return(<div><button onClick={()=>setViewPlan(null)} style={{display:"flex",alignItems:"center",gap:6,fontSize:".8125rem",color:"#C8883A",background:"none",border:"none",cursor:"pointer",padding:0,marginBottom:"1rem",fontWeight:500}}>← Volver</button><div style={{background:"#FFF8EC",border:"1px solid #E8D090",borderRadius:10,padding:"10px 14px",marginBottom:"1rem",fontSize:".8rem",color:"#6B5000"}}>📋 Solo lectura · {viewPlan.label}</div><PlanView week={viewPlan.week||DEFAULT_WEEK} readOnly/></div>);
  if(!FB.apiKey)return(<div style={{textAlign:"center",padding:"3rem 1rem"}}><div style={{fontSize:"2rem",marginBottom:12}}>📋</div><div style={{fontSize:".875rem",color:"#887060",lineHeight:1.6}}>El historial requiere Firebase configurado.<br/>Cada semana se archiva automáticamente.</div></div>);
  return(<><div style={{fontSize:".75rem",color:"#A89878",marginBottom:"1rem"}}>Las listas de cada semana se preservan en solo lectura.</div>{allPlanIds.length===0&&<div style={{textAlign:"center",padding:"2rem",color:"#B8A890",fontSize:".875rem"}}>Todavía no hay semanas archivadas.</div>}{allPlanIds.map(id=>{const isActive=id===activePlanId;return(<div key={id} onClick={()=>load(id)} style={{background:"#fff",border:`1px solid ${isActive?"#E8D090":"#E5E0D8"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><div style={{fontSize:".875rem",fontWeight:600,color:"#1C1810"}}>{id}</div>{isActive&&<div style={{fontSize:".6875rem",color:"#C8883A",fontWeight:500,marginTop:2}}>semana activa</div>}</div>{loading===id?<div style={{fontSize:".75rem",color:"#A89878"}}>cargando…</div>:<div style={{fontSize:".75rem",color:"#C8B89A"}}>ver →</div>}</div>);})}</>);
}

function NuevaView({activePlan,onPublish}){
  const [changes,setChanges]=useState("");
  const [status,setStatus]=useState("idle");
  const [preview,setPreview]=useState(null);
  const [err,setErr]=useState("");

  const context=`Familia en Montevideo. Dieta animal-based (carnes, huevos, quesos, pescado, verduras). 2 adultos + 2 niñas (5 y 2.5 años). Lun–Vie: 5 pax (incluye asistente del hogar Johanna). Cenas y finde: 4 pax. Sábado: pedido carnes + asado libre. Domingo: libre + batch cooking. Cortes Del Campo: Suprema pollo $630/kg, Aguja $430/kg, Picada Magra $630/kg, Milanesa Nalga $870/kg, Cuadril $790/kg, Patita $430/kg (desc. Itaú ~15%). Salmón Capitán Nemo $1150/kg. Platos favoritos: pastel de carne con pasas+huevo duro+Parmesano+puré boniato, lasagna zucchini/berenjena con tuco, chop suey pollo con fideos arroz y zanahorias, milanesa, albóndigas de picada. Batch domingo: tuco doble (lasagna martes + fideos martes noche), papas/boniatos al horno, huevos duros, caldo de huesos.

Plan actual: ${JSON.stringify((activePlan?.week||DEFAULT_WEEK).map(d=>({day:d.day,lunch:d.lunch||d.sug,dinner:d.din})),null,2)}`;

  const generate=async()=>{
    if(!changes.trim())return;
    setStatus("generating");setErr("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:`${context}\n\nCambios para la nueva semana: "${changes}"\n\nGenerá el nuevo plan semanal Dom→Sáb. Reglas: nunca dos días seguidos con la misma proteína. Salmón solo en cenas. Si hay lasagna el martes, el tuco del domingo aplica. Cenas pueden ser huevos, sobras, quesos o pescado. Fines de semana libres con sugerencia.\n\nRespondé SOLO con un array JSON de 7 objetos, sin markdown ni texto extra. Campos: day,short,free(bool),pax,sug,sugD,din,dinD,dt para días libres; day,short,type,pax,helper,lunch,ld,lq,din,dinD,dt para días de semana. Opcionales: dinBatch,dinNote,isOrder. Valores válidos para type/dt: beef,chicken,eggs,fish,mixed.`}]})});
      const data=await res.json();
      const text=data.content?.[0]?.text||"";
      const clean=text.replace(/```json|```/g,"").trim();
      setPreview(JSON.parse(clean));
      setStatus("preview");
    }catch(e){setErr("Error al generar. Intentá de nuevo.");setStatus("error");}
  };

  const publish=async()=>{
    setStatus("publishing");
    const id=new Date().toISOString().split("T")[0];
    const label=`Semana ${new Date().toLocaleDateString("es-UY",{day:"numeric",month:"long",year:"numeric"})}`;
    const plan={id,label,week:preview,shops:activePlan?.shops||DEFAULT_SHOPS,shopChecked:{},batchChecked:{},createdAt:Date.now()};
    if(db){await db.ref(`dashboard/plans/${id}`).set(plan);await db.ref("dashboard/activeWeekId").set(id);}
    onPublish(plan);setStatus("done");setChanges("");setPreview(null);
  };

  return(<>
    <div style={{background:"#FFF8EC",border:"1px solid #E8D090",borderRadius:12,padding:"14px 16px",marginBottom:"1.25rem"}}><div style={{fontSize:".75rem",fontWeight:700,color:"#C8883A",marginBottom:6}}>✨ Nueva semana</div><div style={{fontSize:".8125rem",color:"#6B5000",lineHeight:1.6}}>Describí los cambios. Si está todo bien, dejalo vacío y se genera con el plan base.</div></div>
    <textarea value={changes} onChange={e=>setChanges(e.target.value)} placeholder="Ej: Cambiá el chop suey por aguja braseada. No hay berenjenas esta semana. Agregá tortilla el miércoles..." disabled={status==="generating"||status==="publishing"} style={{width:"100%",minHeight:90,padding:"12px 14px",fontSize:".8125rem",color:"#1C1810",background:"#fff",border:"1px solid #E5E0D8",borderRadius:12,outline:"none",resize:"vertical",lineHeight:1.6,marginBottom:12,fontFamily:"inherit"}}/>
    {(status==="idle"||status==="error")&&<button onClick={generate} style={{width:"100%",padding:"13px",background:"#C8883A",border:"none",borderRadius:12,color:"#fff",fontSize:".9375rem",fontWeight:600,cursor:"pointer"}}>Generar plan con Claude</button>}
    {status==="generating"&&<div style={{textAlign:"center",padding:"1.5rem",color:"#887060",fontSize:".875rem"}}>⏳ Claude está generando el plan…</div>}
    {status==="preview"&&<><div style={{background:"#EAF5EF",border:"1px solid #9ED4B0",borderRadius:10,padding:"10px 14px",marginBottom:"1rem",fontSize:".8rem",color:"#0A4A20"}}>✓ Plan generado — revisá y publicá.</div><PlanView week={preview} readOnly/><div style={{display:"flex",gap:10,marginTop:"1rem"}}><button onClick={()=>{setStatus("idle");setPreview(null);}} style={{flex:1,padding:"12px",background:"transparent",border:"1px solid #E5E0D8",borderRadius:12,color:"#887060",fontSize:".875rem",fontWeight:500,cursor:"pointer"}}>Descartar</button><button onClick={publish} style={{flex:2,padding:"12px",background:"#2A7A4F",border:"none",borderRadius:12,color:"#fff",fontSize:".9375rem",fontWeight:600,cursor:"pointer"}}>Publicar semana activa →</button></div></>}
    {status==="publishing"&&<div style={{textAlign:"center",padding:"1.5rem",color:"#887060",fontSize:".875rem"}}>Publicando en Firebase…</div>}
    {status==="done"&&<div style={{textAlign:"center",padding:"2rem 1rem"}}><div style={{fontSize:"2rem",marginBottom:8}}>✅</div><div style={{fontSize:".9375rem",fontWeight:600,color:"#1C1810",marginBottom:6}}>Plan publicado</div><div style={{fontSize:".8125rem",color:"#887060"}}>Sofía ya ve el plan actualizado.</div></div>}
    {status==="error"&&<div style={{marginTop:10,fontSize:".8125rem",color:"#C06050",lineHeight:1.5}}>{err}</div>}
  </>);
}

// ── DASHBOARD ────────────────────────────────────────────────────
function Dashboard(){
  const [nav,setNav]=useState("plan");
  const [activePlan,setActivePlan]=useState(null);
  const [allPlanIds,setAllPlanIds]=useState([]);
  const [fbStatus,setFbStatus]=useState(FB.apiKey?"connecting":"local");
  const unsubRef=useRef(null);

  useEffect(()=>{
    initFB().then(database=>{
      if(!database){setFbStatus("local");setActivePlan({id:"local",label:"Plan base (sin Firebase)",week:DEFAULT_WEEK,shops:DEFAULT_SHOPS,shopChecked:{},batchChecked:{}});return;}
      database.ref("dashboard/activeWeekId").on("value",snap=>{
        const id=snap.val();
        if(!id){setFbStatus("ok");setActivePlan({id:"local",label:"Plan base",week:DEFAULT_WEEK,shops:DEFAULT_SHOPS,shopChecked:{},batchChecked:{}});return;}
        if(unsubRef.current)unsubRef.current();
        const planRef=database.ref(`dashboard/plans/${id}`);
        const h=planRef.on("value",pSnap=>{const p=pSnap.val();if(p)setActivePlan(p);setFbStatus("ok");});
        unsubRef.current=()=>planRef.off("value",h);
      },()=>{setFbStatus("error");setActivePlan({id:"local",label:"Plan base (offline)",week:DEFAULT_WEEK,shops:DEFAULT_SHOPS,shopChecked:{},batchChecked:{}});});
      database.ref("dashboard/plans").on("value",snap=>{const plans=snap.val();if(plans)setAllPlanIds(Object.keys(plans).sort((a,b)=>b.localeCompare(a)));});
      database.ref(".info/connected").on("value",s=>{if(fbStatus==="ok"&&!s.val())setFbStatus("error");});
    });
    return()=>{if(unsubRef.current)unsubRef.current();};
  },[]);

  const updateShop=useCallback(async(id,val)=>{
    setActivePlan(p=>({...p,shopChecked:{...(p.shopChecked||{}),[id]:val}}));
    if(db&&activePlan?.id!=="local")await db.ref(`dashboard/plans/${activePlan.id}/shopChecked/${id}`).set(val);
  },[activePlan]);
  const clearShop=useCallback(async()=>{
    setActivePlan(p=>({...p,shopChecked:{}}));
    if(db&&activePlan?.id!=="local")await db.ref(`dashboard/plans/${activePlan.id}/shopChecked`).set({});
  },[activePlan]);
  const updateBatch=useCallback(async(id,val)=>{
    setActivePlan(p=>({...p,batchChecked:{...(p.batchChecked||{}),[id]:val}}));
    if(db&&activePlan?.id!=="local")await db.ref(`dashboard/plans/${activePlan.id}/batchChecked/${id}`).set(val);
  },[activePlan]);

  const shops=activePlan?.shops||DEFAULT_SHOPS;
  const shopChecked=activePlan?.shopChecked||{};
  const batchChecked=activePlan?.batchChecked||{};
  const totalItems=shops.reduce((a,s)=>a+s.items.length,0);
  const totalChecked=Object.values(shopChecked).filter(Boolean).length;

  const NAVS=[{id:"plan",icon:"🥗",label:"Plan"},{id:"lista",icon:"✅",label:`Lista${totalChecked>0?` ${totalChecked}/${totalItems}`:""}`},{id:"batch",icon:"🔄",label:"Batch"},{id:"hist",icon:"📋",label:"Historial"},{id:"nueva",icon:"✨",label:"Nueva"}];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",maxWidth:600,margin:"0 auto",background:"#F5F1EB"}}>
      <div style={{background:"#1C1810",flexShrink:0}}>
        <div style={{padding:".875rem 1.25rem .75rem",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:".625rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#786A55",marginBottom:2}}>{activePlan?.label||"Cargando…"}</div><div style={{fontSize:".9375rem",fontWeight:600,color:"#F0EAE0"}}>Dashboard · Familia</div></div>
          <div style={{fontSize:".6875rem",fontWeight:500,padding:"3px 10px",borderRadius:20,background:fbStatus==="ok"?"#1A3A28":fbStatus==="local"?"#2A2810":"#3A1818",color:fbStatus==="ok"?"#5ABA78":fbStatus==="local"?"#C8B050":"#C07060",border:`1px solid ${fbStatus==="ok"?"#2A5A38":fbStatus==="local"?"#4A4018":"#5A2828"}`}}>{fbStatus==="ok"?"● sync":fbStatus==="local"?"○ local":fbStatus==="connecting"?"○ …":"● offline"}</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"1.25rem",paddingBottom:"calc(72px + env(safe-area-inset-bottom,0))"}}>
        {!activePlan&&<div style={{textAlign:"center",padding:"3rem",color:"#887060",fontSize:".875rem"}}>Cargando…</div>}
        {activePlan&&nav==="plan"&&<PlanView week={activePlan.week||DEFAULT_WEEK}/>}
        {activePlan&&nav==="lista"&&<ListaView shops={shops} shopChecked={shopChecked} toggle={updateShop} clear={clearShop} total={totalItems} checked={totalChecked}/>}
        {activePlan&&nav==="batch"&&<BatchView batch={batchChecked} toggle={updateBatch}/>}
        {nav==="hist"&&<HistorialView allPlanIds={allPlanIds} activePlanId={activePlan?.id}/>}
        {nav==="nueva"&&<NuevaView activePlan={activePlan} onPublish={p=>{setActivePlan(p);setNav("plan");}}/>}
      </div>
      <div style={{background:"#1C1810",borderTop:".5px solid #2E2820",display:"flex",flexShrink:0,paddingBottom:"env(safe-area-inset-bottom,0)"}}>
        {NAVS.map(n=><button key={n.id} onClick={()=>setNav(n.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,border:"none",background:"transparent",cursor:"pointer",padding:"8px 0 7px"}}><span style={{fontSize:"1.1rem",lineHeight:1}}>{n.icon}</span><span style={{fontSize:".575rem",fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",color:nav===n.id?"#C8883A":"#786A55"}}>{n.label}</span></button>)}
      </div>
    </div>
  );
}

// ── PIN SCREEN ───────────────────────────────────────────────────
function PinScreen({onAuth}){
  const [val,setVal]=useState("");const [err,setErr]=useState(false);
  const attempt=async()=>{if(val.toUpperCase().trim()===PIN){await lSet("auth_v2",true);onAuth();}else{setErr(true);setVal("");setTimeout(()=>setErr(false),600);}};
  return(<div style={{minHeight:"100vh",background:"#1C1810",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}><div style={{fontSize:"2.5rem",marginBottom:"1rem"}}>🏠</div><div style={{fontSize:"1.25rem",fontWeight:700,color:"#F0EAE0",marginBottom:4}}>Dashboard Familiar</div><div style={{fontSize:".8125rem",color:"#786A55",marginBottom:"2.5rem"}}>Ingresá el PIN compartido</div><div style={{width:"100%",maxWidth:280,animation:err?"shake .5s":"none"}}><input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder="PIN" autoFocus type="password" style={{width:"100%",padding:"14px 18px",fontSize:"1.25rem",fontWeight:600,letterSpacing:".2em",textAlign:"center",background:err?"#3A1A18":"#2A2418",border:`1.5px solid ${err?"#C06050":"#3A3028"}`,borderRadius:12,color:"#F0EAE0",outline:"none",marginBottom:12,fontFamily:"inherit",transition:"all .2s"}}/><button onClick={attempt} style={{width:"100%",padding:"13px",background:"#C8883A",border:"none",borderRadius:12,color:"#fff",fontSize:".9375rem",fontWeight:600,cursor:"pointer"}}>Entrar</button></div><style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-8px)}50%{transform:translateX(8px)}}`}</style></div>);
}

// ── ROOT ─────────────────────────────────────────────────────────
export default function App(){
  const [authed,setAuthed]=useState(null);
  useEffect(()=>{lGet("auth_v2").then(v=>setAuthed(!!v));},[]);
  if(authed===null)return <div style={{minHeight:"100vh",background:"#1C1810",display:"flex",alignItems:"center",justifyContent:"center",color:"#786A55",fontSize:".875rem"}}>cargando…</div>;
  return authed?<Dashboard/>:<PinScreen onAuth={()=>setAuthed(true)}/>;
}

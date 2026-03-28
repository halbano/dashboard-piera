export const DEFAULT_WEEK = [
  { day:"Domingo",   short:"DOM", free:true,  isOrder:false, pax:4,
    sug:"Pastel de carne o asado largo",
    sugD:"Lo que apetezca — prep de la semana va en Batch.",
    din:"Sobras o quesos", dinD:"Sin cocción · lo que haya quedado", dt:"mixed" },
  { day:"Lunes",     short:"LUN", type:"chicken", pax:5, helper:true,
    lunch:"Suprema de pollo al horno",
    ld:"Papas semi-fritas (batch dom) · zapallitos salteados · limón",
    lq:"~1.2kg · papas ya asadas, solo dorar 15 min",
    din:"Pollo frío con rúcula", dinD:"Sobras · rúcula + limón + oliva", dt:"chicken" },
  { day:"Martes",    short:"MAR", type:"beef", pax:5, helper:true,
    lunch:"Lasagna de zucchini y berenjena",
    ld:"Capas zucchini/berenjena · tuco del batch · Gouda + Parmesano · 35 min horno",
    lq:"Armar noche del lunes (10 min) · hornear al mediodía",
    din:"Fideos de arroz con tuco", dinD:"Tuco sobrante · 4 min · Parmesano", dt:"beef",
    dinBatch:"usa tuco del domingo" },
  { day:"Miércoles", short:"MIÉ", type:"chicken", pax:5, helper:true,
    lunch:"Chop suey de pollo saltado",
    ld:"Pollo en tiras + fideos arroz + zanahorias + zapallitos · fuego alto",
    lq:"~1.1kg · completo en 20 min",
    din:"🐟 Salmón a la plancha", dinD:"Limón + sal + manteca · zucchini · 4 pax",
    dt:"fish", dinNote:"cena familia · Johanna no está" },
  { day:"Jueves",    short:"JUE", type:"beef", pax:5, helper:true,
    lunch:"Pastel de carne picada",
    ld:"Picada + pasas + huevo duro + Parmesano · puré boniato/calabaza encima",
    lq:"~800g · armar la noche anterior en 10 min",
    din:"Huevos fritos simples", dinD:"Manteca + sal gruesa · 5 minutos", dt:"eggs" },
  { day:"Viernes",   short:"VIE", type:"beef", pax:5, helper:true,
    lunch:"Milanesa de Nalga",
    ld:"Puré de papas cremoso (manteca + sal) · zanahoria al vapor · Parmesano",
    lq:"~1.1kg · puré con papas del batch si quedan",
    din:"Tortilla española o soufflé", dinD:"Huevos + papas en láminas · o soufflé al horno", dt:"eggs" },
  { day:"Sábado",    short:"SAB", free:true, isOrder:true, pax:4,
    sug:"Asado o lo que apetezca",
    sugD:"Cuadril, tira, chorizos · sin apuro · día del pedido.",
    din:"Sobras + tabla de quesos", dinD:"Restos fríos + Gouda + Parmesano + Criollitos", dt:"mixed" },
];

export const DEFAULT_SHOPS = [
  { id:"dc", name:"Del Campo", sub:"Av. Sarmiento 2394 · pedir sábados", c:"#7A2A10", bg:"#FDF0EB",
    items:[
      {id:"dc1",name:"Suprema de pollo",  qty:"1.2 kg", note:"$630/kg", eff:"~$643", use:"Lunes"},
      {id:"dc2",name:"Picada Magra",      qty:"1.2 kg", note:"$630/kg", eff:"~$643", use:"Tuco batch + pastel"},
      {id:"dc3",name:"Milanesa SG Nalga", qty:"1.1 kg", note:"$870/kg", eff:"~$812", use:"Viernes"},
      {id:"dc4",name:"Pollo trozado",     qty:"1.1 kg", note:"$430–490/kg", eff:"~$390", use:"Chop suey miércoles"},
      {id:"dc5",name:"Cuadril / tira",    qty:"~900 g", note:"$790/kg", eff:"~$604", use:"Sábado libre"},
    ]},
  { id:"nm", name:"Capitán Nemo", sub:"capitannemo.com.uy · delivery mismo día", c:"#0A3A6A", bg:"#E8F2FC",
    link:"https://www.capitannemo.com.uy/producto/salmon-chileno-1-kg/",
    altNote:"Alt.: Merluza $440/kg o Cazón $400/kg",
    items:[
      {id:"n1",name:"Salmón Chileno Fresco",qty:"700 g",note:"$1.150/kg ★★★★★",eff:"~$805",use:"Miércoles cena"},
    ]},
  { id:"qs", name:"El Establecimiento", sub:"Emilio Frugoni 949 · quincenal", c:"#7A5000", bg:"#FFF8EC",
    items:[
      {id:"q1",name:"Gouda",              qty:"~400 g", note:"$580/kg", eff:"~$232", use:"Lasagna + cenas"},
      {id:"q2",name:"Parmesano Don Nelson",qty:"~350 g",note:"$780/kg", eff:"~$273", use:"Pastel + lasagna"},
      {id:"q3",name:"Criollitos",          qty:"~400 g", note:"$445/kg", eff:"~$178", use:"Cenas + snack"},
    ]},
  { id:"fe", name:"Feria", sub:"Sábado o martes · orgánicos cuando hay", c:"#0A5A28", bg:"#EAF5EF",
    items:[
      {id:"f1",name:"Boniatos",    qty:"2.0 kg",  note:"~$100/kg",   eff:"~$200", use:"Batch + pastel"},
      {id:"f2",name:"Zucchini",    qty:"x4–5 un.",note:"~$30/un.",   eff:"~$130", use:"Lasagna + chop suey"},
      {id:"f3",name:"Berenjenas",  qty:"x2–3 un.",note:"~$40/un.",   eff:"~$100", use:"Lasagna"},
      {id:"f4",name:"Zanahorias",  qty:"x4–5 un.",note:"~$20/un.",   eff:"~$90",  use:"Chop suey + vapor"},
      {id:"f5",name:"Papas",       qty:"1.5 kg",  note:"~$60/kg",   eff:"~$90",  use:"Batch + milanesa"},
      {id:"f6",name:"Tomates",     qty:"500 g",   note:"~$240/kg",  eff:"~$120", use:"Tuco + ensaladas"},
      {id:"f7",name:"Rúcula",      qty:"2 bolsas",note:"~$80/bolsa",eff:"~$160", use:"Verde toda la semana"},
      {id:"f8",name:"Limones",     qty:"x6 un.",  note:"~$10/un.",  eff:"~$60",  use:"Carnes + salmón"},
    ]},
  { id:"di", name:"Disco / Géant", sub:"Reposición quincenal", c:"#1A3A7A", bg:"#EAF0FC",
    items:[
      {id:"d1",name:"Huevos",           qty:"30 un.",  note:"~$16/un.",  eff:"~$480", use:"Dom + cenas"},
      {id:"d2",name:"Fideos de arroz",  qty:"400 g",   note:"~$180",     eff:"~$180", use:"Chop suey + fideos"},
      {id:"d3",name:"Pasas de uva",     qty:"100 g",   note:"~$80",      eff:"~$80",  use:"Pastel"},
      {id:"d4",name:"Tomate triturado", qty:"x2 latas",note:"~$80/lata", eff:"~$160", use:"Tuco batch"},
      {id:"d5",name:"Manteca",          qty:"200 g",   note:"~$160",     eff:"~$160", use:"Cocción + puré"},
      {id:"d6",name:"Crema de leche",   qty:"200 ml",  note:"~$95",      eff:"~$95",  use:"Puré + cenas"},
      {id:"d7",name:"Aceite oliva EVOO",qty:"500 ml",  note:"~$420",     eff:"~$210", use:"Prorrateado"},
    ]},
];

export const BATCH_ITEMS = [
  { id:"b1", title:"Tuco doble", when:"~40 min activos", icon:"🍅", c:"#C8401A", bg:"#FDF0EB",
    steps:["Picada 400g + tomate triturado + cebolla + ajo · rehogar 25 min",
           "Hacé el DOBLE — mitad lasagna martes, mitad fideos martes noche"],
    saves:"Martes almuerzo: solo ensamblar · Martes cena: solo hervir fideos 5 min",
    storage:"Heladera 4 días · congela 3 meses" },
  { id:"b2", title:"Papas y boniatos al horno", when:"~25 min (horno)", icon:"🥔", c:"#C89000", bg:"#FFFBEE",
    steps:["Cubos de papa y boniato · oliva + sal gruesa · 200°C 25 min",
           "Guardar en tupper hermético en heladera"],
    saves:"Lunes side en 10 min · Jueves puré: solo pisar · Viernes: recalentar",
    storage:"Heladera 5 días" },
  { id:"b3", title:"Huevos duros (6–8 und.)", when:"12 min pasivos", icon:"🥚", c:"#0A5A28", bg:"#EAF5EF",
    steps:["Hervir 10 min desde hervor · agua fría inmediata · guardar con cáscara"],
    saves:"Jueves pastel: listos · Cena emergencia: huevo + queso en 0 min",
    storage:"Heladera 7 días con cáscara" },
  { id:"b4", title:"Caldo de huesos", when:"~2hs pasivas", icon:"🍲", c:"#1A3A7A", bg:"#EAF0FC",
    steps:["Carcasas o huesos + agua + sal + laurel · fuego mínimo tapado"],
    saves:"Cena de emergencia · las niñas lo toman como sopa",
    storage:"Heladera 4 días · congela en porciones" },
];

export const PLAN_SYSTEM_CONTEXT = `Contexto familiar:
- Dieta animal-based: carnes, huevos, quesos, pescado, verduras. Sin cereales, legumbres, azúcar.
- Familia: 2 adultos + 2 niñas (5 años y 2.5 años).
- Lun–Vie: 5 pax (incluye Johanna/Silvia, asistente del hogar que almuerza). Cenas y finde: 4 pax.
- Proveedores: Del Campo Av Sarmiento 2394 (carnes), Capitán Nemo delivery (salmón $1150/kg), El Establecimiento Emilio Frugoni 949 (quesos), feria orgánica, Disco/Géant.
- Sábado: pedido + asado libre. Domingo: libre + batch cooking.
- Platos favoritos: pastel de carne picada (con pasas, huevo duro, Parmesano, puré boniato), lasagna zucchini/berenjena con tuco, chop suey pollo con fideos arroz y zanahorias, milanesa, albóndigas.
- Reglas: nunca dos días seguidos con la misma proteína. Salmón solo en cenas (miércoles preferido). Fines de semana libres con sugerencia.`;

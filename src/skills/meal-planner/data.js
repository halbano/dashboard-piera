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
    dt:"fish", dinNote:"cena familia · Silvia no está" },
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

// Batch items derived from DEFAULT_WEEK — used as seed only.
// AI-generated plans produce their own batch via the API.
export const DEFAULT_BATCH = [
  { id:"b1", title:"Tuco doble", icon:"🍅", color:"#C8401A", bg:"#FDF0EB",
    when:"~40 min activos",
    reason:"Lasagna martes + fideos martes noche",
    steps:["Picada 400g + tomate triturado + cebolla + ajo · rehogar 25 min",
           "Hacé el DOBLE — mitad lasagna martes, mitad fideos martes noche"],
    saves:"Martes almuerzo: solo ensamblar · Martes cena: solo hervir fideos 5 min",
    storage:"Heladera 4 días · congela 3 meses" },
  { id:"b2", title:"Papas y boniatos al horno", icon:"🥔", color:"#C89000", bg:"#FFFBEE",
    when:"~25 min (horno)",
    reason:"Side lunes + puré jueves + puré viernes",
    steps:["Cubos de papa y boniato · oliva + sal gruesa · 200°C 25 min",
           "Guardar en tupper hermético en heladera"],
    saves:"Lunes side en 10 min · Jueves puré: solo pisar · Viernes: recalentar",
    storage:"Heladera 5 días" },
  { id:"b3", title:"Huevos duros (6–8 und.)", icon:"🥚", color:"#0A5A28", bg:"#EAF5EF",
    when:"12 min pasivos",
    reason:"Pastel de carne jueves",
    steps:["Hervir 10 min desde hervor · agua fría inmediata · guardar con cáscara"],
    saves:"Jueves pastel: listos · Cena emergencia: huevo + queso en 0 min",
    storage:"Heladera 7 días con cáscara" },
  { id:"b4", title:"Caldo de huesos", icon:"🍲", color:"#1A3A7A", bg:"#EAF0FC",
    when:"~2hs pasivas",
    reason:"Pollo lunes + chop suey miércoles → huesos disponibles",
    steps:["Carcasas o huesos + agua + sal + laurel · fuego mínimo tapado"],
    saves:"Cena de emergencia · las niñas lo toman como sopa",
    storage:"Heladera 4 días · congela en porciones" },
];

export const PLAN_SYSTEM_CONTEXT = `Sos el planificador de comidas de una familia en Montevideo, Uruguay.

FAMILIA
- 2 adultos + 2 niños (Aurora y León) (5 y 2.5 años)
- Lun–Vie: 5 pax (incluye Silvia, asistente del hogar que almuerza)
- Cenas y fines de semana: 4 pax (solo familia)
- Sábado: día del pedido + asado libre
- Domingo: libre + batch cooking basado en el plan

DIETA
Base animal-based: carnes, huevos, quesos, pescado, verduras.
Arroz y fideos de arroz están permitidos sin restricción (se comen ~1 vez por semana como side o base).
Excepción cereal: hasta 1 receta por semana puede incluir otros cereales, legumbres o masas (fideos de trigo, lentejas, polenta, empanadas, pizza, etc.). Los niños comen lo mismo que los adultos.

PROVEEDORES Y PRECIOS
- Del Campo (Av. Sarmiento 2394, MVD): Suprema pollo $630/kg, Aguja $430/kg, Picada Magra $630/kg,
  Milanesa SG Nalga $870/kg, Cuadril $790/kg, Patita Pollo $430/kg, Cerdo (bondiola/carré/costilla). Descuento Itaú ~15%.
- Capitán Nemo (delivery MVD): Salmón Chileno Fresco $1150/kg, Merluza $440/kg, Cazón $400/kg
- El Establecimiento (Emilio Frugoni 949): Gouda $580/kg, Parmesano Don Nelson $780/kg, Criollitos $445/kg
- Feria orgánica: zucchini, berenjenas, zanahorias, boniatos, papas, tomates, rúcula, zapallitos, limones, coliflor, zapallo, palta, pimientos, remolacha, puerro
- Disco/Géant: huevos, manteca, crema, fideos de arroz, pasas, tomate triturado, aceite oliva, lentejas, arroz, fideos, polenta

BANCO DE IDEAS — ALMUERZOS
Elegí de este banco, variando cada semana, y explorá nuevas ideas alineadas con las reglas generales de la dieta. Sé creativo para no aburrirnos!
Las referencias a páginas son de libros de cocina (El gordo cocina de Mauricio Asta, Narda Lepes).

Vacuno:
  - Aguja vacuna braseada lenta (2hs, muy tierna para la de 2.5) + boniatos
  - Albóndigas de Picada Magra con salsa de tomate + boniatos
  - Albóndigas con puré y salsa de yogur — El gordo cocina, pág. 126
  - Pastel de carne picada (pasas + huevo duro + Parmesano) con puré de papa, boniato, calabaza o mixto
  - Cuadril feteado a la plancha + rúcula + tomate
  - Lasagna de zucchini y berenjena con tuco de picada + Gouda + Parmesano
  - Guiso de carne con zapallitos y zanahorias
  - Estofado de carne con puré de papas
  - Estofado de carne con cintas de arroz — Narda, pág. 226
  - Vacío al horno con verduras (zapallito, zapallo, boniato, zanahoria)
  - Colita de cuadril rellena con jamón, queso y ciruela + boniatos
  - Entraña con puré de boniatos o coliflor — Narda, pág. 234
  - Churrasco con puré de papa + boniato
  - Hamburguesas caseras + puré o ensalada
  - Guiso de lentejas (papa, boniato, zanahoria, zapallo + carne) — usa la excepción cereal
  - Guiso de peceto + osobuco (zapallo, zanahoria, papa, boniato)
  - Carne con verduras salteadas
  - Carne con tomate y palta
  - Zapallitos rellenos con picada

Pollo:
  - Suprema al horno + papas semi-fritas + zapallitos
  - Suprema napolitana (queso y salsa de tomate) + puré o arroz
  - Pollo guisado lento (patita + muslos) + boniatos
  - Chop suey de pollo saltado + fideos de arroz + zanahorias
  - Stroganoff de pollo con puré de papas
  - Wok de pollo con fideos o arroz — El gordo cocina, pág. 133
  - Pollo al horno relleno con boniatos, pimientos, zanahorias y cebolla
  - Pollo a la plancha + puré de boniato
  - Estofado de pollo con verduras
  - Pastel de pollo / chicken pie — Narda, pág. 738
  - Zapallitos rellenos de pollo
  - Lasaña de pollo

Cerdo:
  - Wok de cerdo con fideos o arroz — El gordo cocina, pág. 133
  - Cerdo con puré de boniato
  - Bondiola braseada con boniatos
  - Carré de cerdo al horno con verduras

Huevos / vegetariano:
  - Omelette de queso Gouda + rúcula + tomate
  - Tortilla española (huevo + papa) + ensalada
  - Tortilla de puerro, queso y zucchini
  - Huevos a la plancha con Gouda fundido + tomate
  - Soufflé de queso con zapallitos, zucchini y zanahoria
  - Lasaña de verduras con boloñesa

Pescado: SOLO en cenas (nunca almuerzo — Silvia no come pescado)
  Excepción almuerzo: milanesas de merluza o cazón (SG) — solo si no hay pescado en cena esa semana.

BANCO DE IDEAS — CENAS (4 pax, más livianas)
  - Huevos revueltos con manteca + crema + Gouda
  - Huevos fritos en manteca con sal gruesa
  - Omelette simple de queso
  - Tortilla española rápida
  - Soufflé de huevo al horno
  - 🐟 Salmón a la plancha + limón + zucchini (miércoles preferido)
  - 🐟 Pescado al horno con puré
  - 🐟 Pastel de pescado con papa y boniato — Narda
  - 🐟 Croquetas de pescado al horno con boniatos
  - Milanesa de Nalga (SG) + puré de papas o zapallitos
  - Milanesa de pollo (SG) + ensalada
  - Pollo frío deshuesado con rúcula (sobras almuerzo)
  - Fideos de arroz con tuco (cuando hay tuco del batch)
  - Picada de quesos: Gouda + Parmesano + Criollitos (sin cocción)
  - Caldo de huesos con sal
  - Sopa de verduras
  - Sobras del almuerzo

SIDES FRECUENTES
Boniatos al horno · papas semi-fritas · puré de papas · puré de boniato y zapallo ·
zapallitos salteados en manteca · zucchini a la plancha · zanahorias al vapor ·
coliflor al vapor o gratinada · fideos de arroz · ensalada rúcula + tomate ·
remolacha y zanahoria · puré de palta

REGLAS
1. Nunca dos días seguidos con la misma proteína (beef/chicken/pork/eggs/fish)
2. Pescado SOLO en cenas, nunca almuerzo (Silvia no come pescado). Excepción: milanesa de merluza/cazón SG
3. Milanesas (SG) SOLO en cenas, nunca almuerzo. Excepción: milanesa de merluza/cazón puede ir en almuerzo
4. Al menos 1 día de huevos en almuerzo (económico y liviano)
5. Dom y Sáb son libres — sugerencia, no obligación
6. Variá los sides — no repetir el mismo dos días seguidos
7. Máximo 1 receta por semana con cereales/legumbres/masas (no aplica a arroz/fideos de arroz) — marcarla como "(excepción cereal)"
8. Incluí cerdo al menos 1 vez cada 2 semanas para variar
9. Sé creativo — elegí del banco de ideas pero explorá nuevas combinaciones. Cada semana debe sentirse diferente`;

/* ============================================================
   CATÁLOGOS BASE
   Áreas reales de planta, tipos de equipo, matriz de criticidad
   y listas de estados. Todo editable desde la aplicación.
   ============================================================ */

/* ---------- 1. ZONAS (agrupación de áreas) ---------- */
const ZONAS = [
  { id:"z-servicios",  nombre:"Servicios Industriales", ico:"🏭" },
  { id:"z-recepcion",  nombre:"Recepción y Muelle",     ico:"🚢" },
  { id:"z-pota",       nombre:"Proceso Pota",           ico:"🦑" },
  { id:"z-merluza",    nombre:"Proceso Merluza",        ico:"🐟" },
  { id:"z-bivalvos",   nombre:"Proceso Bivalvos",       ico:"🦪" },
  { id:"z-congelado",  nombre:"Congelamiento",          ico:"❄️" },
  { id:"z-frio",       nombre:"Almacenamiento en Frío", ico:"🧊" },
  { id:"z-despacho",   nombre:"Almacén y Despacho",     ico:"📦" },
  { id:"z-electrica",  nombre:"Distribución Eléctrica", ico:"⚡" },
  { id:"z-comunes",    nombre:"Áreas Comunes y SSHH",   ico:"🚻" }
];

/* ---------- 2. ÁREAS DE PLANTA (49) ---------- */
/* codigo = prefijo que se usará al generar el código de equipo */
const AREAS_PLANTA = [
  // Servicios industriales
  { codigo:"SM1", nombre:"Sala de Máquinas 1",                       zona:"z-servicios" },
  { codigo:"SM2", nombre:"Sala de Máquinas 2",                       zona:"z-servicios" },
  { codigo:"SM3", nombre:"Sala de Máquinas 3",                       zona:"z-servicios" },
  { codigo:"CLD", nombre:"Zona de Calderas",                         zona:"z-servicios" },
  { codigo:"OS1", nombre:"Módulo 1 de Ósmosis",                      zona:"z-servicios" },
  { codigo:"OS2", nombre:"Módulo 2 de Ósmosis",                      zona:"z-servicios" },
  { codigo:"SMH", nombre:"Sala de Máquinas de Hielo",                zona:"z-servicios" },
  { codigo:"SPH", nombre:"Sala de Producción de Hielo",              zona:"z-servicios" },
  { codigo:"PHE", nombre:"Productor de Hielo en Escamas",            zona:"z-servicios" },
  { codigo:"CBM", nombre:"Caseta de Bombeo — Extracción Agua de Mar",zona:"z-servicios" },
  { codigo:"CBS", nombre:"Caseta de Bombeo para Salas",              zona:"z-servicios" },

  // Recepción y muelle
  { codigo:"RMP", nombre:"Recepción de Materia Prima",               zona:"z-recepcion" },
  { codigo:"MUE", nombre:"Muelle",                                   zona:"z-recepcion" },

  // Proceso Pota
  { codigo:"TPO", nombre:"Zona de Tolva de Pota",                    zona:"z-pota" },
  { codigo:"FPO", nombre:"Zona de Fileteros de Pota",                zona:"z-pota" },
  { codigo:"LA1", nombre:"Zona de Laminado 1",                       zona:"z-pota" },
  { codigo:"CPO", nombre:"Zona de Cocina de Pota",                   zona:"z-pota" },
  { codigo:"PRC", nombre:"Zona de Precocido",                        zona:"z-pota" },
  { codigo:"LA2", nombre:"Zona de Laminado 2",                       zona:"z-pota" },
  { codigo:"EPO", nombre:"Zona de Envasado de Pota",                 zona:"z-pota" },
  { codigo:"MPO", nombre:"Zona de Empaque de Pota",                  zona:"z-pota" },

  // Proceso Merluza
  { codigo:"FME", nombre:"Zona de Fileteros de Merluza",             zona:"z-merluza" },
  { codigo:"EME", nombre:"Zona de Envasado de Merluza",              zona:"z-merluza" },
  { codigo:"CPM", nombre:"Zona de Congeladores de Placas de Merluza",zona:"z-merluza" },

  // Bivalvos
  { codigo:"BIV", nombre:"Zona de Bivalvos",                         zona:"z-bivalvos" },

  // Congelamiento
  { codigo:"CYA", nombre:"Zona de Congeladores Yantai",              zona:"z-congelado" },
  { codigo:"TUE", nombre:"Túnel Estático",                           zona:"z-congelado" },

  // Almacenamiento en frío
  { codigo:"PC1", nombre:"Precámara 1",                              zona:"z-frio" },
  { codigo:"CA1", nombre:"Cámara 1",                                 zona:"z-frio" },
  { codigo:"CA2", nombre:"Cámara 2",                                 zona:"z-frio" },
  { codigo:"CA3", nombre:"Cámara 3",                                 zona:"z-frio" },
  { codigo:"PC2", nombre:"Precámara 2",                              zona:"z-frio" },
  { codigo:"CA4", nombre:"Cámara 4",                                 zona:"z-frio" },
  { codigo:"CA5", nombre:"Cámara 5",                                 zona:"z-frio" },

  // Almacén y despacho
  { codigo:"EMB", nombre:"Zona de Embarque",                         zona:"z-despacho" },
  { codigo:"ALG", nombre:"Almacén General",                          zona:"z-despacho" },
  { codigo:"LVC", nombre:"Zona de Lavado de Cajas",                  zona:"z-despacho" },

  // Distribución eléctrica
  { codigo:"SEC", nombre:"Subestación Congelado",                    zona:"z-electrica" },
  { codigo:"SEH", nombre:"Subestación Hielo",                        zona:"z-electrica" },
  { codigo:"SEP", nombre:"Subestación Planta de Harina",             zona:"z-electrica" },

  // Áreas comunes
  { codigo:"SHV", nombre:"Servicios Higiénicos de Varones",          zona:"z-comunes" },
  { codigo:"SHM", nombre:"Servicios Higiénicos de Mujeres",          zona:"z-comunes" },
  { codigo:"VEV", nombre:"Vestuarios Varones",                       zona:"z-comunes" },
  { codigo:"VEM", nombre:"Vestuarios Mujeres",                       zona:"z-comunes" },
  { codigo:"PAS", nombre:"Zona de Pasadizo de Fileteros",            zona:"z-comunes" },
  { codigo:"PED", nombre:"Pediluvio Principal",                      zona:"z-comunes" },
  { codigo:"CMG", nombre:"Comedor General",                          zona:"z-comunes" },
  { codigo:"OFA", nombre:"Oficinas Administrativas",                 zona:"z-comunes" },
  { codigo:"EXT", nombre:"Exteriores",                               zona:"z-comunes" }
];

/* ---------- 3. TIPOS DE EQUIPO ---------- */
const TIPOS_EQUIPO = [
  { codigo:"COM", nombre:"Compresor de amoniaco/freón", familia:"Refrigeración" },
  { codigo:"CAI", nombre:"Compresor de aire",           familia:"Aire comprimido" },
  { codigo:"CND", nombre:"Condensador evaporativo",     familia:"Refrigeración" },
  { codigo:"EVA", nombre:"Evaporador / Forzador",       familia:"Refrigeración" },
  { codigo:"TUN", nombre:"Túnel de congelamiento",      familia:"Refrigeración" },
  { codigo:"CPL", nombre:"Congelador de placas",        familia:"Refrigeración" },
  { codigo:"REC", nombre:"Recipiente / Separador",      familia:"Refrigeración" },
  { codigo:"TRP", nombre:"Trampa de aceite / Aceitera", familia:"Refrigeración" },
  { codigo:"CAL", nombre:"Caldera",                     familia:"Vapor" },
  { codigo:"ABL", nombre:"Ablandador de agua",          familia:"Agua" },
  { codigo:"OSM", nombre:"Módulo de ósmosis inversa",   familia:"Agua" },
  { codigo:"FIL", nombre:"Filtro (arena/carbón/malla)", familia:"Agua" },
  { codigo:"BOM", nombre:"Bomba",                       familia:"Bombeo" },
  { codigo:"TAN", nombre:"Tanque / Cisterna",           familia:"Almacenamiento" },
  { codigo:"INT", nombre:"Intercambiador de calor",     familia:"Térmico" },
  { codigo:"HIE", nombre:"Máquina de hielo",            familia:"Hielo" },
  { codigo:"FAJ", nombre:"Faja transportadora",         familia:"Transporte" },
  { codigo:"MES", nombre:"Mesa de proceso",             familia:"Proceso" },
  { codigo:"COC", nombre:"Cocinador / Marmita",         familia:"Proceso" },
  { codigo:"LAM", nombre:"Laminadora",                  familia:"Proceso" },
  { codigo:"TOL", nombre:"Tolva",                       familia:"Proceso" },
  { codigo:"ENV", nombre:"Envasadora / Selladora",      familia:"Envasado" },
  { codigo:"BAL", nombre:"Balanza",                     familia:"Envasado" },
  { codigo:"DET", nombre:"Detector de metales",         familia:"Envasado" },
  { codigo:"MOT", nombre:"Motor eléctrico",             familia:"Eléctrico" },
  { codigo:"TAB", nombre:"Tablero eléctrico",           familia:"Eléctrico" },
  { codigo:"TRF", nombre:"Transformador",               familia:"Eléctrico" },
  { codigo:"GEN", nombre:"Grupo electrógeno",           familia:"Eléctrico" },
  { codigo:"VEN", nombre:"Ventilador / Extractor",      familia:"HVAC" },
  { codigo:"PUE", nombre:"Puerta de cámara",            familia:"Infraestructura" },
  { codigo:"MON", nombre:"Montacargas / Estoca",        familia:"Transporte" },
  { codigo:"LAV", nombre:"Lavadora de cajas",           familia:"Limpieza" },
  { codigo:"HID", nombre:"Hidrolavadora",               familia:"Limpieza" },
  { codigo:"OTR", nombre:"Otro",                        familia:"General" }
];

/* ---------- 4. MATRIZ DE CRITICIDAD ---------- */
/* Puntaje = Σ(nivel × peso). Rango 1 a 4. */
const CRITICIDAD_FACTORES = [
  {
    id:"produccion", nombre:"Impacto en producción", peso:0.35, ico:"🏭",
    niveles:[
      {v:1, t:"Sin impacto — existe respaldo o no afecta el proceso"},
      {v:2, t:"Impacto parcial — reduce el ritmo de una línea"},
      {v:3, t:"Detiene una línea o área de proceso"},
      {v:4, t:"Detiene toda la planta o pierde el lote/materia prima"}
    ]
  },
  {
    id:"seguridad", nombre:"Riesgo de seguridad", peso:0.25, ico:"⛑️",
    niveles:[
      {v:1, t:"Sin riesgo para las personas"},
      {v:2, t:"Riesgo de lesión leve"},
      {v:3, t:"Riesgo de lesión grave o daño ambiental"},
      {v:4, t:"Riesgo fatal (amoniaco, presión, alta tensión)"}
    ]
  },
  {
    id:"inocuidad", nombre:"Impacto en inocuidad", peso:0.25, ico:"🧪",
    niveles:[
      {v:1, t:"No tiene contacto con el producto"},
      {v:2, t:"Contacto indirecto (ambiente, servicios)"},
      {v:3, t:"Contacto directo con el producto"},
      {v:4, t:"Punto Crítico de Control (PCC) del HACCP"}
    ]
  },
  {
    id:"repuesto", nombre:"Disponibilidad de repuesto", peso:0.15, ico:"🔩",
    niveles:[
      {v:1, t:"Repuesto en stock propio"},
      {v:2, t:"Se consigue local en menos de 1 semana"},
      {v:3, t:"Nacional o importado, hasta 1 mes"},
      {v:4, t:"Importado > 1 mes o de fabricación especial"}
    ]
  }
];

const CRITICIDAD_CLASES = [
  { clase:"A", desde:3.0, nombre:"Crítico",    color:"a", desc:"Máxima prioridad. Requiere plan preventivo, monitoreo y repuesto asegurado." },
  { clase:"B", desde:2.0, nombre:"Importante", color:"b", desc:"Prioridad media. Plan preventivo con frecuencia estándar." },
  { clase:"C", desde:0,   nombre:"General",    color:"c", desc:"Baja prioridad. Mantenimiento correctivo o inspección periódica." }
];

function calcularCriticidad(v){
  let p = 0;
  CRITICIDAD_FACTORES.forEach(f => { p += (Number(v[f.id]) || 1) * f.peso; });
  p = Math.round(p * 100) / 100;
  const c = CRITICIDAD_CLASES.find(x => p >= x.desde) || CRITICIDAD_CLASES[2];
  return { puntaje:p, clase:c.clase, nombreClase:c.nombre, color:c.color };
}

/* ---------- 5. LISTAS DE APOYO ---------- */
const ESTADOS_EQUIPO = [
  { v:"operativo",    t:"Operativo",             badge:"verde" },
  { v:"mantenimiento",t:"En mantenimiento",      badge:"ambar" },
  { v:"parado",       t:"Parado / Fuera de servicio", badge:"rojo" },
  { v:"standby",      t:"En reserva (stand-by)", badge:"azul"  },
  { v:"baja",         t:"Dado de baja",          badge:"gris"  }
];

const UNIDADES_POTENCIA = ["HP","kW","TR (Ton. refrig.)","BHP (caldera)","m³/h","kg/h","W","—"];

const TIPOS_ENERGIA = ["Eléctrica","Vapor","Amoniaco (NH3)","Freón","Aire comprimido","Diésel","GLP","Manual","No aplica"];

/* ---------- 6. Datos de operación ---------- */
const FLUIDOS = [
  "No aplica","Amoniaco (NH3)","R-404A","R-507","R-22","R-134a",
  "Agua potable","Agua de mar","Agua blanda","Agua osmotizada","Salmuera",
  "Vapor","Aire comprimido","Aceite térmico","Diésel","Producto alimenticio"
];

const TENSIONES = ["No aplica","220 V trifásico","380 V trifásico","440 V trifásico","220 V monofásico","110 V","24 VDC","Media tensión 10 kV"];

const TRANSMISIONES = ["No aplica","Acople directo","Fajas y poleas","Cadena y piñones","Engranajes / reductor","Variador de frecuencia"];

const MATERIALES_CONTACTO = [
  "Sin contacto con el producto","Acero inoxidable AISI 304","Acero inoxidable AISI 316",
  "Polipropileno / plástico grado alimentario","Aluminio","Acero al carbono (zona no alimentaria)","Otro"
];

const REGIMENES = ["1 turno (8 h/día)","2 turnos (16 h/día)","3 turnos (24 h/día)","Continuo 24/7","Por campaña / estacional","Uso eventual (respaldo)"];

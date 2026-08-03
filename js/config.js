/* ============================================================
   CONFIGURACIÓN
   ------------------------------------------------------------
   ⚠️  ÚNICO ARCHIVO QUE DEBES EDITAR PARA CONECTAR FIREBASE.
   Sigue GUIA-FIREBASE.md y pega aquí los datos de tu proyecto.
   Mientras los valores digan "PEGAR_AQUI", el sistema funciona
   en MODO DEMO (datos guardados solo en este navegador).
   ============================================================ */

const firebaseConfig = {
  apiKey:            "AIzaSyCuH1mAYITMKWmer7bsc9zAqnr0AElZl7g",
  authDomain:        "gmao-planta.firebaseapp.com",
  projectId:         "gmao-planta",
  storageBucket:     "gmao-planta.firebasestorage.app",
  messagingSenderId: "299614058724",
  appId:             "1:299614058724:web:2f6497e40937915bb494f1"
};

/* ---- Datos de la empresa (se muestran en reportes) ---- */
const EMPRESA = {
  nombre: "Planta de Procesamiento Pesquero",
  areaResponsable: "Departamento de Mantenimiento",
  moneda: "S/"
};

/* ---- Roles y permisos ------------------------------------
   Cada permiso se consulta con Auth.puede('equipos.crear')
   ---------------------------------------------------------- */
const ROLES = {
  admin: {
    nombre: "Jefe de Mantenimiento",
    icono: "👑",
    color: "azul",
    permisos: ["*"]                     // todo
  },
  planificador: {
    nombre: "Planificador / Supervisor",
    icono: "📋",
    color: "verde",
    permisos: [
      "tablero.ver",
      "equipos.ver","equipos.crear","equipos.editar","equipos.importar",
      "ubicaciones.ver",
      "ot.ver","ot.crear","ot.editar","ot.cerrar","ot.asignar",
      "plan.ver","plan.crear","plan.editar",
      "formatos.ver","formatos.llenar",
      "monitoreo.ver","monitoreo.registrar",
      "almacen.ver","almacen.mover",
      "solicitudes.ver","solicitudes.crear","solicitudes.aprobar",
      "procesos.ver","reportes.ver"
    ]
  },
  tecnico: {
    nombre: "Técnico de Mantenimiento",
    icono: "🔧",
    color: "ambar",
    permisos: [
      "tablero.ver",
      "equipos.ver",
      "ot.ver.propias","ot.editar.propias","ot.cerrar.propias",
      "formatos.ver","formatos.llenar",
      "monitoreo.ver","monitoreo.registrar",
      "almacen.ver","almacen.consumir",
      "solicitudes.ver","solicitudes.crear",
      "procesos.ver"
    ]
  },
  solicitante: {
    nombre: "Solicitante (Producción / otras áreas)",
    icono: "🏭",
    color: "gris",
    permisos: [
      "tablero.ver.limitado",
      "equipos.ver",
      "solicitudes.ver.propias","solicitudes.crear",
      "ot.ver.propias"
    ]
  },
  proveedor: {
    nombre: "Proveedor externo",
    icono: "🚚",
    color: "gris",
    permisos: [
      "ot.ver.asignadas","ot.editar.asignadas","ot.cerrar.asignadas",
      "equipos.ver","formatos.llenar"
    ]
  }
};

/* ---- Menú de navegación ----------------------------------
   'estado' puede ser: 'listo' | 'proximo'
   ---------------------------------------------------------- */
const MENU = [
  { grupo: "Principal", items: [
    { id:"tablero",     texto:"Tablero",             ico:"📊", permiso:"tablero.ver",     estado:"listo"   }
  ]},
  { grupo: "Activos", items: [
    { id:"equipos",     texto:"Inventario de equipos", ico:"⚙️", permiso:"equipos.ver",     estado:"listo"   },
    { id:"ubicaciones", texto:"Áreas y ubicaciones",   ico:"📍", permiso:"ubicaciones.ver", estado:"listo"   }
  ]},
  { grupo: "Mantenimiento", items: [
    { id:"plan",        texto:"Plan de mantenimiento", ico:"🗓️", permiso:"plan.ver",        estado:"proximo" },
    { id:"ot",          texto:"Órdenes de trabajo",    ico:"📝", permiso:"ot.ver",          estado:"proximo" },
    { id:"solicitudes", texto:"Solicitudes de trabajo",ico:"📨", permiso:"solicitudes.ver", estado:"proximo" },
    { id:"formatos",    texto:"Formatos del técnico",  ico:"📋", permiso:"formatos.ver",    estado:"proximo" }
  ]},
  { grupo: "Operación", items: [
    { id:"monitoreo",   texto:"Monitoreo de equipos",  ico:"📈", permiso:"monitoreo.ver",   estado:"proximo" },
    { id:"procesos",    texto:"Procesos especiales",   ico:"❄️", permiso:"procesos.ver",    estado:"proximo" },
    { id:"almacen",     texto:"Almacén y materiales",  ico:"📦", permiso:"almacen.ver",     estado:"proximo" }
  ]},
  { grupo: "Administración", items: [
    { id:"usuarios",    texto:"Usuarios y accesos",    ico:"👥", permiso:"usuarios.ver",    estado:"listo"   }
  ]}
];

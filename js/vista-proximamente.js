/* ============================================================
   VISTA · MÓDULOS EN CONSTRUCCIÓN
   Muestra el alcance previsto de cada módulo pendiente.
   ============================================================ */
const ALCANCES = {
  plan: {
    ico:"🗓️", titulo:"Plan de mantenimiento",
    texto:"Tareas preventivas por equipo, con frecuencia por calendario, por horas de operación o por condición del parámetro.",
    puntos:[
      "Catálogo de tareas por tipo de equipo (lubricación, inspección, cambio de aceite, calibración…)",
      "Frecuencias: diaria, semanal, quincenal, mensual, trimestral, semestral, anual",
      "Disparo por horómetro: «cada 2 000 h de operación»",
      "Disparo por condición: si una lectura sale de rango se genera la orden",
      "Calendario anual visual y generación automática de órdenes programadas",
      "Cálculo de cumplimiento del plan (% preventivo ejecutado)"
    ]
  },
  ot: {
    ico:"📝", titulo:"Órdenes de trabajo",
    texto:"El corazón del sistema: toda actividad de mantenimiento queda registrada como una orden.",
    puntos:[
      "Origen de la orden: del plan, de una solicitud de otra área, o correctiva del día a día",
      "Asignación a personal propio o a proveedor externo",
      "Estados: abierta → asignada → en ejecución → en espera de repuesto → cerrada",
      "Registro de horas-hombre, materiales consumidos y costo",
      "Evidencias fotográficas antes y después",
      "Firma de conformidad del solicitante al cerrar"
    ]
  },
  solicitudes: {
    ico:"📨", titulo:"Solicitudes de trabajo",
    texto:"Portal simplificado para que Producción, Calidad y otras áreas pidan atención de mantenimiento.",
    puntos:[
      "Formulario corto: área, equipo, descripción, urgencia y fotos",
      "Seguimiento del estado de su solicitud en tiempo real",
      "Conversión de la solicitud en orden de trabajo por el planificador",
      "Notificación al solicitante cuando el trabajo se cierra",
      "Evidencia de atención visible para quien pidió el trabajo"
    ]
  },
  formatos: {
    ico:"📋", titulo:"Formatos del técnico",
    texto:"Pantalla dedicada donde el técnico solo ve los formatos que le toca llenar, optimizada para el celular.",
    puntos:[
      "Constructor de formatos: campos de texto, número, sí/no, lista, firma y foto",
      "Formatos típicos: check list de arranque, inspección de cámaras, lubricación, permiso de trabajo",
      "Validación de rangos permitidos por campo",
      "Registro con fecha, hora, turno y responsable",
      "Exportación a PDF para auditorías de inocuidad"
    ]
  },
  monitoreo: {
    ico:"📈", titulo:"Monitoreo de equipos críticos",
    texto:"Panel tipo SCADA con los parámetros de compresores, calderas, ósmosis y cámaras.",
    puntos:[
      "Registro manual por turno mediante formulario de parámetros",
      "Tendencias gráficas por equipo y por parámetro",
      "Límites de alarma alto/bajo con aviso visual y generación automática de orden correctiva",
      "Tablero mímico de planta con estado en vivo de los equipos",
      "Preparado para recibir datos automáticos de los equipos más adelante (vía gateway MQTT / OPC UA)"
    ]
  },
  procesos: {
    ico:"❄️", titulo:"Procesos especiales",
    texto:"Sección para procesos propios de la planta que necesitan control detallado.",
    puntos:[
      "Congelamiento: integración del aplicativo que ya está funcionando",
      "Control de tiempos, temperaturas y lotes por túnel",
      "Trazabilidad del proceso ligada al equipo y al área",
      "Base preparada para sumar otros procesos (cocción, precocido, ósmosis, hielo)"
    ]
  },
  almacen: {
    ico:"📦", titulo:"Almacén y materiales",
    texto:"Control interno de repuestos e insumos de mantenimiento con alarmas de reposición.",
    puntos:[
      "Catálogo de materiales con código, unidad, ubicación en almacén y stock mínimo",
      "Entradas por compra y salidas por consumo, siempre ligadas a una orden de trabajo",
      "Kardex de movimientos con responsable y fecha",
      "Alarma automática cuando el stock baja del mínimo",
      "Costo del material consumido por equipo y por orden",
      "Repuestos críticos asociados a cada equipo del inventario"
    ]
  }
};

App.registrar("_proximamente", {
  render(cont, def){
    const a = ALCANCES[def.id] || {ico:def.ico, titulo:def.texto, texto:"", puntos:[]};
    cont.innerHTML = `
      <div class="pagina-cab">
        <div><h2>${a.ico} ${UI.esc(a.titulo)}</h2><p>${UI.esc(a.texto)}</p></div>
      </div>

      <div class="tarjeta tarjeta-pad" style="max-width:760px">
        <span class="badge badge-ambar">Módulo en construcción</span>
        <h3 style="font-size:16px;margin:14px 0 6px">Esto es lo que incluirá</h3>
        <ul style="padding-left:20px;font-size:14px;line-height:1.9;color:var(--texto-2)">
          ${a.puntos.map(p => `<li>${UI.esc(p)}</li>`).join("")}
        </ul>
        <div class="sep"></div>
        <p class="txt-3" style="font-size:13px">
          Vamos módulo por módulo para que cada uno quede completo y probado antes de pasar al siguiente.
          Si quieres cambiar el orden o agregar algo a esta lista, dímelo y lo ajustamos.
        </p>
      </div>`;
  }
});

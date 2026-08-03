/* ============================================================
   VISTA · TABLERO
   ============================================================ */
App.registrar("tablero", (() => {

  async function render(cont){
    const [equipos, ubicaciones] = await Promise.all([
      Datos.listar("equipos", {orden:"codigo", dir:"asc"}),
      Datos.listar("ubicaciones", {orden:"orden", dir:"asc"})
    ]);

    const total = equipos.length;
    const porClase = c => equipos.filter(e => e.criticidad?.clase === c).length;
    const operativos = equipos.filter(e => e.estado === "operativo").length;
    const parados = equipos.filter(e => e.estado === "parado").length;
    const sinFoto = equipos.filter(e => !e.fotoURL).length;
    const conHoro = equipos.filter(e => e.horometro?.aplica).length;
    const areasConEquipos = new Set(equipos.map(e => e.ubicacionId)).size;
    const avanceInventario = ubicaciones.length ? Math.round(areasConEquipos / ubicaciones.length * 100) : 0;

    const hora = new Date().getHours();
    const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

    /* Top 5 áreas con más equipos críticos */
    const rankingAreas = ubicaciones.map(u => ({
      nombre: u.nombre, codigo: u.codigo,
      total: equipos.filter(e => e.ubicacionId === u.id).length,
      criticos: equipos.filter(e => e.ubicacionId === u.id && e.criticidad?.clase === "A").length
    })).filter(x => x.total > 0).sort((a,b) => b.criticos - a.criticos || b.total - a.total).slice(0,6);

    cont.innerHTML = `
      <div class="pagina-cab">
        <div>
          <h2>${saludo}, ${UI.esc((Auth.usuario.nombre||"").split(" ")[0] || "")} 👋</h2>
          <p>${UI.esc(EMPRESA.nombre)} · ${UI.esc(Auth.rolInfo().nombre)} · ${new Date().toLocaleDateString("es-PE",{weekday:"long", day:"numeric", month:"long", year:"numeric"})}</p>
        </div>
      </div>

      ${Datos.esDemo() ? `<div class="banner banner-aviso">
        <strong>Modo demostración activo.</strong> Los datos se guardan únicamente en este navegador.
        Cuando conectes Firebase (ver <code>GUIA-FIREBASE.md</code>), la información pasará a la nube y será compartida por todos los usuarios.
      </div>` : ""}

      <div class="grid-kpi">
        <div class="kpi">      <div class="kpi-label">Equipos en inventario</div><div class="kpi-valor">${total}</div><div class="kpi-sub">${areasConEquipos} de ${ubicaciones.length} áreas cubiertas</div></div>
        <div class="kpi rojo"> <div class="kpi-label">Críticos · Clase A</div><div class="kpi-valor">${porClase("A")}</div><div class="kpi-sub">requieren plan preventivo</div></div>
        <div class="kpi ambar"><div class="kpi-label">Importantes · Clase B</div><div class="kpi-valor">${porClase("B")}</div><div class="kpi-sub">prioridad media</div></div>
        <div class="kpi verde"><div class="kpi-label">Disponibilidad</div><div class="kpi-valor">${total ? Math.round(operativos/total*100) : 0}%</div><div class="kpi-sub">${parados} equipos fuera de servicio</div></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="grid-tablero">

        <div class="tarjeta tarjeta-pad">
          <h3 style="font-size:15px;margin-bottom:4px">📈 Avance del inventario</h3>
          <p class="txt-3" style="font-size:12.5px;margin-bottom:14px">Áreas de planta con al menos un equipo registrado</p>
          <div class="barra"><span style="width:${avanceInventario}%"></span></div>
          <p class="txt-2" style="font-size:13px;margin-top:10px"><strong>${avanceInventario}%</strong> · ${areasConEquipos} de ${ubicaciones.length} áreas</p>
          <div class="sep"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">
            <div><span class="txt-3">Con horómetro</span><br><strong>${conHoro} equipos</strong></div>
            <div><span class="txt-3">Sin fotografía</span><br><strong>${sinFoto} equipos</strong></div>
          </div>
        </div>

        <div class="tarjeta tarjeta-pad">
          <h3 style="font-size:15px;margin-bottom:4px">🎯 Distribución por criticidad</h3>
          <p class="txt-3" style="font-size:12.5px;margin-bottom:14px">Base para priorizar el plan de mantenimiento</p>
          ${CRITICIDAD_CLASES.map(c => {
            const n = porClase(c.clase);
            const pct = total ? Math.round(n/total*100) : 0;
            return `<div style="margin-bottom:12px">
              <div class="fila" style="font-size:13px;margin-bottom:5px">
                <span class="badge badge-${c.color}">Clase ${c.clase}</span>
                <span class="txt-2">${UI.esc(c.nombre)}</span>
                <span class="fila-fin"><strong>${n}</strong> <span class="txt-3">(${pct}%)</span></span>
              </div>
              <div class="barra"><span style="width:${pct}%;background:var(--${c.clase==='A'?'rojo':c.clase==='B'?'ambar':'verde'})"></span></div>
            </div>`;
          }).join("")}
        </div>

        <div class="tarjeta tarjeta-pad" style="grid-column:1/-1">
          <h3 style="font-size:15px;margin-bottom:4px">🏭 Áreas con mayor concentración de equipos críticos</h3>
          <p class="txt-3" style="font-size:12.5px;margin-bottom:12px">Por aquí conviene empezar el plan de mantenimiento</p>
          ${rankingAreas.length ? `
            <table class="tabla">
              <thead><tr><th>Área</th><th style="width:110px">Equipos</th><th style="width:110px">Críticos A</th></tr></thead>
              <tbody>${rankingAreas.map(a=>`
                <tr><td><span class="celda-cod">${UI.esc(a.codigo)}</span> ${UI.esc(a.nombre)}</td>
                <td>${a.total}</td>
                <td>${a.criticos ? `<span class="badge badge-a">${a.criticos}</span>` : `<span class="txt-3">0</span>`}</td></tr>`).join("")}
              </tbody>
            </table>` : `<p class="txt-3" style="font-size:13.5px">Aún no hay equipos registrados.</p>`}
        </div>
      </div>

      <div class="tarjeta tarjeta-pad mt-16">
        <h3 style="font-size:15px;margin-bottom:10px">🧭 Siguientes pasos del proyecto</h3>
        <table class="tabla">
          <tbody>
            <tr><td>✅ <strong>Módulo 1 · Base, áreas e inventario de equipos</strong></td><td><span class="badge badge-verde">Disponible</span></td></tr>
            <tr><td>🗓️ Módulo 2 · Plan de mantenimiento (calendario, horómetro y condición)</td><td><span class="badge badge-gris">Siguiente</span></td></tr>
            <tr><td>📝 Módulo 3 · Órdenes de trabajo y solicitudes de otras áreas</td><td><span class="badge badge-gris">Pendiente</span></td></tr>
            <tr><td>📋 Módulo 4 · Formatos del técnico y monitoreo de equipos críticos</td><td><span class="badge badge-gris">Pendiente</span></td></tr>
            <tr><td>📦 Módulo 5 · Almacén, materiales y alarmas de stock</td><td><span class="badge badge-gris">Pendiente</span></td></tr>
            <tr><td>❄️ Módulo 6 · Procesos especiales (congelamiento)</td><td><span class="badge badge-gris">Pendiente</span></td></tr>
          </tbody>
        </table>
      </div>

      <style>@media(max-width:900px){.grid-tablero{grid-template-columns:1fr !important}}</style>`;
  }

  return { render };
})());

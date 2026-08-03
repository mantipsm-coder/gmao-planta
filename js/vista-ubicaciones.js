/* ============================================================
   VISTA · ÁREAS Y UBICACIONES
   ============================================================ */
App.registrar("ubicaciones", (() => {

  let ubicaciones = [], equipos = [], cont = null, filtroZona = "";

  async function render(contenedor){
    cont = contenedor;
    [ubicaciones, equipos] = await Promise.all([
      Datos.listar("ubicaciones", {orden:"orden", dir:"asc"}),
      Datos.listar("equipos",     {orden:"codigo", dir:"asc"})
    ]);
    pintar();
  }

  function pintar(){
    const puedeEditar = Auth.puede("equipos.crear");   // mismo nivel: planificador/admin
    cont.innerHTML = `
      <div class="pagina-cab">
        <div>
          <h2>📍 Áreas y ubicaciones</h2>
          <p>Estructura física de la planta. Cada equipo, orden de trabajo y solicitud se asocia a un área.</p>
        </div>
        <div class="acciones">
          ${puedeEditar ? `<button class="btn btn-primario" id="btn-nueva">➕ Nueva área</button>` : ""}
        </div>
      </div>

      <div class="grid-kpi">
        <div class="kpi">      <div class="kpi-label">Áreas registradas</div><div class="kpi-valor">${ubicaciones.length}</div><div class="kpi-sub">en ${ZONAS.length} zonas</div></div>
        <div class="kpi verde"><div class="kpi-label">Áreas con equipos</div><div class="kpi-valor">${new Set(equipos.map(e=>e.ubicacionId)).size}</div><div class="kpi-sub">tienen al menos un activo</div></div>
        <div class="kpi ambar"><div class="kpi-label">Áreas sin equipos</div><div class="kpi-valor">${ubicaciones.length - new Set(equipos.map(e=>e.ubicacionId)).size}</div><div class="kpi-sub">pendientes de inventariar</div></div>
      </div>

      <div class="filtros">
        <select id="f-zona"><option value="">Todas las zonas</option>${ZONAS.map(z=>`<option value="${z.id}" ${filtroZona===z.id?"selected":""}>${z.ico} ${UI.esc(z.nombre)}</option>`).join("")}</select>
        <span class="contador-res">${ubicaciones.length} áreas</span>
      </div>

      <div id="lista-zonas"></div>`;

    UI.$("#f-zona").onchange = e => { filtroZona = e.target.value; pintarZonas(); };
    const b = UI.$("#btn-nueva"); if(b) b.onclick = () => formulario();
    pintarZonas();
  }

  function pintarZonas(){
    const zonas = filtroZona ? ZONAS.filter(z => z.id === filtroZona) : ZONAS;
    UI.$("#lista-zonas").innerHTML = zonas.map(z => {
      const us = ubicaciones.filter(u => u.zona === z.id);
      if(!us.length) return "";
      return `
        <div class="seccion-form">
          <header>${z.ico} ${UI.esc(z.nombre)} <span class="txt-3">· ${us.length} áreas</span></header>
          <div style="padding:0">
            <table class="tabla">
              <thead><tr><th style="width:90px">Código</th><th>Área</th><th style="width:110px">Equipos</th><th style="width:90px"></th></tr></thead>
              <tbody>
                ${us.map(u => {
                  const n = equipos.filter(e => e.ubicacionId === u.id).length;
                  const criticos = equipos.filter(e => e.ubicacionId === u.id && e.criticidad?.clase === "A").length;
                  return `<tr>
                    <td class="celda-cod">${UI.esc(u.codigo)}</td>
                    <td>${UI.esc(u.nombre)}${criticos ? ` <span class="badge badge-a">${criticos} crítico${criticos>1?"s":""}</span>` : ""}</td>
                    <td>${n ? `<span class="badge badge-azul">${n}</span>` : `<span class="txt-3">—</span>`}</td>
                    <td><div class="acciones-fila">
                      ${Auth.puede("equipos.crear") ? `<button class="mini-btn" data-editar="${u.id}" title="Editar">✏️</button>` : ""}
                      ${Auth.puede("equipos.crear") ? `<button class="mini-btn rojo" data-borrar="${u.id}" title="Eliminar">🗑️</button>` : ""}
                    </div></td>
                  </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>`;
    }).join("") || UI.vacio({titulo:"Sin áreas en esta zona"});

    UI.$$("[data-editar]").forEach(b => b.onclick = () => formulario(b.dataset.editar));
    UI.$$("[data-borrar]").forEach(b => b.onclick = () => borrar(b.dataset.borrar));
  }

  function formulario(id=null){
    const u = id ? ubicaciones.find(x => x.id === id) : null;
    UI.modal({
      titulo: u ? "Editar área" : "Nueva área",
      cuerpo:`
        <form id="form-ubi">
          <label class="campo"><span>Código <span class="req">*</span></span>
            <input type="text" id="u-codigo" maxlength="4" required value="${UI.esc(u?.codigo||"")}" style="text-transform:uppercase" placeholder="Ej: SM4">
            <span class="ayuda">2 a 4 letras. Se usa como prefijo del código de los equipos de esta área.</span>
          </label>
          <label class="campo"><span>Nombre del área <span class="req">*</span></span>
            <input type="text" id="u-nombre" required value="${UI.esc(u?.nombre||"")}" placeholder="Ej: Sala de Máquinas 4">
          </label>
          <label class="campo"><span>Zona <span class="req">*</span></span>
            <select id="u-zona" required>${ZONAS.map(z=>`<option value="${z.id}" ${u?.zona===z.id?"selected":""}>${z.ico} ${UI.esc(z.nombre)}</option>`).join("")}</select>
          </label>
        </form>`,
      botones:[
        { txt:"Cancelar", clase:"btn-secundario" },
        { txt: u ? "Guardar" : "Crear área", clase:"btn-primario", accion: async (cerrar, m) => {
            const q = s => m.querySelector(s);
            if(!q("#form-ubi").reportValidity()) return;
            const codigo = q("#u-codigo").value.trim().toUpperCase();
            if(ubicaciones.some(x => x.codigo === codigo && x.id !== id)){
              UI.toast("Ese código de área ya existe.", "err"); return;
            }
            await Datos.guardar("ubicaciones", {
              codigo, nombre:q("#u-nombre").value.trim(), zona:q("#u-zona").value,
              activo:true, orden: u?.orden ?? ubicaciones.length
            }, id);
            cerrar(); UI.toast("Área guardada.", "ok"); await render(cont);
          }}
      ]
    });
  }

  function borrar(id){
    const u = ubicaciones.find(x => x.id === id);
    const n = equipos.filter(e => e.ubicacionId === id).length;
    if(n){ UI.toast(`No se puede eliminar: el área tiene ${n} equipo(s) asignado(s).`, "err"); return; }
    UI.confirmar(`¿Eliminar el área <strong>${UI.esc(u.nombre)}</strong>?`, async () => {
      await Datos.eliminar("ubicaciones", id);
      UI.toast("Área eliminada.", "ok"); await render(cont);
    }, {titulo:"Eliminar área"});
  }

  return { render };
})());

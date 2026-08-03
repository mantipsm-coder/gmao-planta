/* ============================================================
   VISTA · INVENTARIO DE EQUIPOS
   ============================================================ */
App.registrar("equipos", (() => {

  let equipos = [], ubicaciones = [], tipos = [];
  let filtros = { texto:"", zona:"", ubicacion:"", tipo:"", criticidad:"", estado:"" };
  let orden = { campo:"codigo", dir:"asc" };
  let cont = null;

  /* ══════════════ RENDER PRINCIPAL ══════════════ */
  async function render(contenedor){
    cont = contenedor;
    [equipos, ubicaciones, tipos] = await Promise.all([
      Datos.listar("equipos",     {orden:"codigo", dir:"asc"}),
      Datos.listar("ubicaciones", {orden:"orden",  dir:"asc"}),
      Datos.listar("tipos_equipo",{orden:"codigo", dir:"asc"})
    ]);
    pintar();
  }

  function pintar(){
    const puedeCrear = Auth.puede("equipos.crear");
    cont.innerHTML = `
      <div class="pagina-cab">
        <div>
          <h2>⚙️ Inventario de equipos</h2>
          <p>Ficha técnica, ubicación y criticidad de cada equipo instalado en planta.</p>
        </div>
        <div class="acciones">
          <button class="btn btn-secundario" id="btn-exportar">⬇️ Exportar</button>
          ${puedeCrear ? `<button class="btn btn-secundario" id="btn-importar">⬆️ Importar CSV</button>` : ""}
          ${puedeCrear ? `<button class="btn btn-primario"  id="btn-nuevo">➕ Nuevo equipo</button>` : ""}
        </div>
      </div>

      ${resumen()}

      <div class="filtros">
        <div class="buscador"><input type="text" id="f-texto" placeholder="Buscar por código, nombre, marca, modelo o serie…" value="${UI.esc(filtros.texto)}"></div>
        <select id="f-zona">   <option value="">Todas las zonas</option>${ZONAS.map(z=>`<option value="${z.id}" ${filtros.zona===z.id?"selected":""}>${z.ico} ${UI.esc(z.nombre)}</option>`).join("")}</select>
        <select id="f-ubicacion"><option value="">Todas las áreas</option>${ubicaciones.map(u=>`<option value="${u.id}" ${filtros.ubicacion===u.id?"selected":""}>${UI.esc(u.codigo)} · ${UI.esc(u.nombre)}</option>`).join("")}</select>
        <select id="f-tipo">   <option value="">Todos los tipos</option>${tipos.map(t=>`<option value="${t.codigo}" ${filtros.tipo===t.codigo?"selected":""}>${UI.esc(t.nombre)}</option>`).join("")}</select>
        <select id="f-crit">   <option value="">Toda criticidad</option>${CRITICIDAD_CLASES.map(c=>`<option value="${c.clase}" ${filtros.criticidad===c.clase?"selected":""}>Clase ${c.clase} · ${c.nombre}</option>`).join("")}</select>
        <select id="f-estado"> <option value="">Todo estado</option>${ESTADOS_EQUIPO.map(e=>`<option value="${e.v}" ${filtros.estado===e.v?"selected":""}>${e.t}</option>`).join("")}</select>
        <span class="contador-res" id="contador"></span>
      </div>

      <div id="lista"></div>`;

    UI.$("#f-texto").oninput     = e => { filtros.texto = e.target.value; pintarLista(); };
    UI.$("#f-zona").onchange     = e => { filtros.zona = e.target.value; pintarLista(); };
    UI.$("#f-ubicacion").onchange= e => { filtros.ubicacion = e.target.value; pintarLista(); };
    UI.$("#f-tipo").onchange     = e => { filtros.tipo = e.target.value; pintarLista(); };
    UI.$("#f-crit").onchange     = e => { filtros.criticidad = e.target.value; pintarLista(); };
    UI.$("#f-estado").onchange   = e => { filtros.estado = e.target.value; pintarLista(); };

    const bn = UI.$("#btn-nuevo");    if(bn) bn.onclick = () => abrirFormulario();
    const bi = UI.$("#btn-importar"); if(bi) bi.onclick = abrirImportador;
    UI.$("#btn-exportar").onclick = exportar;

    pintarLista();
  }

  /* ══════════════ RESUMEN SUPERIOR ══════════════ */
  function resumen(){
    const total = equipos.length;
    const a = equipos.filter(e => e.criticidad?.clase === "A").length;
    const op = equipos.filter(e => e.estado === "operativo").length;
    const par = equipos.filter(e => e.estado === "parado").length;
    return `<div class="grid-kpi">
      <div class="kpi">      <div class="kpi-label">Equipos registrados</div><div class="kpi-valor">${total}</div><div class="kpi-sub">en ${new Set(equipos.map(e=>e.ubicacionId)).size} áreas</div></div>
      <div class="kpi rojo"> <div class="kpi-label">Críticos (clase A)</div><div class="kpi-valor">${a}</div><div class="kpi-sub">${total? Math.round(a/total*100):0}% del inventario</div></div>
      <div class="kpi verde"><div class="kpi-label">Operativos</div>       <div class="kpi-valor">${op}</div><div class="kpi-sub">${total? Math.round(op/total*100):0}% disponibilidad</div></div>
      <div class="kpi ambar"><div class="kpi-label">Fuera de servicio</div><div class="kpi-valor">${par}</div><div class="kpi-sub">requieren atención</div></div>
    </div>`;
  }

  /* ══════════════ FILTRADO Y LISTADO ══════════════ */
  function filtrar(){
    const t = filtros.texto.toLowerCase().trim();
    return equipos.filter(e => {
      if(filtros.zona){
        const u = ubicaciones.find(x => x.id === e.ubicacionId);
        if(!u || u.zona !== filtros.zona) return false;
      }
      if(filtros.ubicacion && e.ubicacionId !== filtros.ubicacion) return false;
      if(filtros.tipo && e.tipoCodigo !== filtros.tipo) return false;
      if(filtros.criticidad && e.criticidad?.clase !== filtros.criticidad) return false;
      if(filtros.estado && e.estado !== filtros.estado) return false;
      if(t){
        const blob = [e.codigo,e.nombre,e.marca,e.modelo,e.serie,e.ubicacionNombre,e.tipoNombre]
          .filter(Boolean).join(" ").toLowerCase();
        if(!blob.includes(t)) return false;
      }
      return true;
    }).sort((x,y) => {
      const a = (x[orden.campo] ?? "").toString().toLowerCase();
      const b = (y[orden.campo] ?? "").toString().toLowerCase();
      return a.localeCompare(b, "es") * (orden.dir === "asc" ? 1 : -1);
    });
  }

  function pintarLista(){
    const lista = filtrar();
    UI.$("#contador").textContent = `${lista.length} de ${equipos.length} equipos`;
    const cajaLista = UI.$("#lista");

    if(!equipos.length){
      cajaLista.innerHTML = UI.vacio({
        emoji:"⚙️", titulo:"Todavía no hay equipos registrados",
        texto:"Registra tus equipos uno por uno con el botón «Nuevo equipo», o carga todos de golpe con la plantilla CSV.",
        boton: Auth.puede("equipos.crear") ? {id:"vacio-nuevo", txt:"➕ Registrar el primer equipo"} : null
      });
      const b = UI.$("#vacio-nuevo"); if(b) b.onclick = () => abrirFormulario();
      return;
    }
    if(!lista.length){
      cajaLista.innerHTML = UI.vacio({emoji:"🔍", titulo:"Sin resultados", texto:"Ningún equipo coincide con los filtros aplicados."});
      return;
    }

    const th = (campo, txt) => `<th class="ordenable" data-orden="${campo}">${txt}${orden.campo===campo ? (orden.dir==="asc"?" ▲":" ▼") : ""}</th>`;

    cajaLista.innerHTML = `
      <div class="tabla-wrap solo-escritorio">
        <table class="tabla">
          <thead><tr>
            ${th("codigo","Código")}${th("nombre","Equipo")}${th("tipoNombre","Tipo")}
            ${th("ubicacionNombre","Área")}<th>Criticidad</th><th>Estado</th><th></th>
          </tr></thead>
          <tbody>
            ${lista.map(e => `
              <tr data-id="${e.id}">
                <td class="celda-cod">${UI.esc(e.codigo)}</td>
                <td><strong>${UI.esc(e.nombre)}</strong>
                    <div class="celda-sec">${UI.esc([e.marca,e.modelo].filter(Boolean).join(" · ") || "—")}</div></td>
                <td>${UI.esc(e.tipoNombre || "—")}</td>
                <td>${UI.esc(e.ubicacionNombre || "—")}</td>
                <td>${badgeCrit(e.criticidad)}</td>
                <td>${badgeEstado(e.estado)}</td>
                <td><div class="acciones-fila">
                  <button class="mini-btn" data-ver="${e.id}" title="Ver ficha">👁️</button>
                  ${Auth.puede("equipos.editar") ? `<button class="mini-btn" data-editar="${e.id}" title="Editar">✏️</button>`:""}
                  ${Auth.puede("equipos.editar") ? `<button class="mini-btn rojo" data-borrar="${e.id}" title="Eliminar">🗑️</button>`:""}
                </div></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>

      <div class="lista-cards solo-movil">
        ${lista.map(e => `
          <div class="card-eq" data-ver="${e.id}">
            ${e.fotoURL
              ? `<img class="foto" src="${e.fotoURL}" alt="">`
              : `<div class="foto">⚙️</div>`}
            <div class="cuerpo-c">
              <h4>${UI.esc(e.nombre)}</h4>
              <div class="celda-cod">${UI.esc(e.codigo)}</div>
              <div class="meta">
                <span>📍 ${UI.esc(e.ubicacionNombre || "—")}</span>
                <span>${UI.esc(e.tipoNombre || "")}</span>
              </div>
              <div class="chip-lista" style="margin-top:8px">${badgeCrit(e.criticidad)} ${badgeEstado(e.estado)}</div>
            </div>
          </div>`).join("")}
      </div>`;

    UI.$$("[data-orden]").forEach(h => h.onclick = () => {
      const c = h.dataset.orden;
      orden = { campo:c, dir: (orden.campo === c && orden.dir === "asc") ? "desc" : "asc" };
      pintarLista();
    });
    UI.$$("[data-ver]").forEach(b => b.onclick = e => { e.stopPropagation(); verFicha(b.dataset.ver); });
    UI.$$("[data-editar]").forEach(b => b.onclick = e => { e.stopPropagation(); abrirFormulario(b.dataset.editar); });
    UI.$$("[data-borrar]").forEach(b => b.onclick = e => { e.stopPropagation(); borrar(b.dataset.borrar); });
  }

  const badgeCrit = c => c
    ? `<span class="badge badge-${c.clase.toLowerCase()}">${c.clase} · ${UI.esc(c.nombreClase || "")}</span>`
    : `<span class="badge badge-gris">Sin evaluar</span>`;

  const badgeEstado = v => {
    const e = ESTADOS_EQUIPO.find(x => x.v === v) || ESTADOS_EQUIPO[0];
    return `<span class="badge badge-${e.badge}">${e.t}</span>`;
  };

  /* ══════════════ GENERADOR DE CÓDIGO ══════════════ */
  function generarCodigo(ubicacionId, tipoCodigo){
    const u = ubicaciones.find(x => x.id === ubicacionId);
    if(!u || !tipoCodigo) return "";
    const pref = `${u.codigo}-${tipoCodigo}-`;
    const usados = equipos.filter(e => (e.codigo||"").startsWith(pref))
      .map(e => parseInt((e.codigo||"").slice(pref.length), 10)).filter(n => !isNaN(n));
    const siguiente = (usados.length ? Math.max(...usados) : 0) + 1;
    return pref + String(siguiente).padStart(3, "0");
  }

  /* ══════════════ FORMULARIO DE EQUIPO ══════════════ */
  function abrirFormulario(id=null){
    const e = id ? equipos.find(x => x.id === id) : null;
    const c = e?.criticidad || {};
    const v = (campo, def="") => UI.esc(e?.[campo] ?? def);

    const cuerpo = `
      <form id="form-eq">

        <div class="seccion-form">
          <header>1 · Identificación</header>
          <div>
            <div class="grid-form">
              <label class="campo"><span>Área / ubicación <span class="req">*</span></span>
                <select id="eq-ubicacion" required>
                  <option value="">— Seleccionar —</option>
                  ${ZONAS.map(z => {
                    const us = ubicaciones.filter(u => u.zona === z.id);
                    if(!us.length) return "";
                    return `<optgroup label="${z.ico} ${UI.esc(z.nombre)}">` +
                      us.map(u => `<option value="${u.id}" ${e?.ubicacionId===u.id?"selected":""}>${UI.esc(u.codigo)} · ${UI.esc(u.nombre)}</option>`).join("") +
                      `</optgroup>`;
                  }).join("")}
                </select>
              </label>

              <label class="campo"><span>Tipo de equipo <span class="req">*</span></span>
                <select id="eq-tipo" required>
                  <option value="">— Seleccionar —</option>
                  ${[...new Set(tipos.map(t=>t.familia))].map(fam => `
                    <optgroup label="${UI.esc(fam)}">
                      ${tipos.filter(t=>t.familia===fam).map(t=>`<option value="${t.codigo}" ${e?.tipoCodigo===t.codigo?"selected":""}>${UI.esc(t.nombre)}</option>`).join("")}
                    </optgroup>`).join("")}
                </select>
              </label>

              <label class="campo"><span>Código del equipo <span class="req">*</span></span>
                <input type="text" id="eq-codigo" required value="${v("codigo")}" placeholder="Se genera solo">
                <span class="ayuda">Formato ÁREA-TIPO-###. Se genera automáticamente, pero puedes cambiarlo.</span>
              </label>

              <label class="campo"><span>Nombre del equipo <span class="req">*</span></span>
                <input type="text" id="eq-nombre" required value="${v("nombre")}" placeholder="Ej: Compresor de tornillo Mycom N°1">
              </label>

              <label class="campo"><span>Estado actual</span>
                <select id="eq-estado">
                  ${ESTADOS_EQUIPO.map(x=>`<option value="${x.v}" ${(e?.estado||"operativo")===x.v?"selected":""}>${x.t}</option>`).join("")}
                </select>
              </label>

              <label class="campo"><span>Equipo padre (opcional)</span>
                <select id="eq-padre">
                  <option value="">— Ninguno —</option>
                  ${equipos.filter(x=>x.id!==id).map(x=>`<option value="${x.id}" ${e?.padreId===x.id?"selected":""}>${UI.esc(x.codigo)} · ${UI.esc(x.nombre)}</option>`).join("")}
                </select>
                <span class="ayuda">Úsalo si este equipo forma parte de otro (ej: motor dentro de un compresor).</span>
              </label>
            </div>
          </div>
        </div>

        <div class="seccion-form">
          <header>2 · Datos técnicos</header>
          <div>
            <div class="grid-form-3">
              <label class="campo"><span>Marca</span><input type="text" id="eq-marca" value="${v("marca")}" placeholder="Mycom, Grundfos…"></label>
              <label class="campo"><span>Modelo</span><input type="text" id="eq-modelo" value="${v("modelo")}"></label>
              <label class="campo"><span>N° de serie</span><input type="text" id="eq-serie" value="${v("serie")}"></label>
              <label class="campo"><span>Potencia / capacidad</span><input type="text" id="eq-potencia" value="${v("potencia")}" placeholder="Ej: 150"></label>
              <label class="campo"><span>Unidad</span>
                <select id="eq-unidad">${UNIDADES_POTENCIA.map(u=>`<option ${e?.unidadPotencia===u?"selected":""}>${u}</option>`).join("")}</select>
              </label>
              <label class="campo"><span>Fuente de energía</span>
                <select id="eq-energia">${TIPOS_ENERGIA.map(u=>`<option ${e?.energia===u?"selected":""}>${u}</option>`).join("")}</select>
              </label>
              <label class="campo"><span>Año de fabricación</span><input type="number" id="eq-anio" min="1950" max="2100" value="${v("anio")}"></label>
              <label class="campo"><span>Fecha de instalación</span><input type="date" id="eq-instalacion" value="${v("fechaInstalacion")}"></label>
              <label class="campo"><span>Garantía hasta</span><input type="date" id="eq-garantia" value="${v("garantiaHasta")}"></label>
            </div>
            <label class="campo"><span>Ficha técnica resumida / observaciones</span>
              <textarea id="eq-obs" placeholder="Refrigerante, presiones de trabajo, particularidades del equipo…">${v("observaciones")}</textarea>
            </label>
          </div>
        </div>

        <div class="seccion-form">
          <header>3 · Criticidad</header>
          <div>
            ${CRITICIDAD_FACTORES.map(f => `
              <label class="campo"><span>${f.ico} ${UI.esc(f.nombre)} <small class="txt-3">(peso ${Math.round(f.peso*100)}%)</small></span>
                <select class="crit-sel" data-factor="${f.id}">
                  ${f.niveles.map(n=>`<option value="${n.v}" ${(c[f.id]||1)==n.v?"selected":""}>${n.v} · ${UI.esc(n.t)}</option>`).join("")}
                </select>
              </label>`).join("")}
            <div class="crit-resultado">
              <div>
                <div class="crit-puntaje" id="crit-puntaje">—</div>
                <div class="crit-clase" id="crit-desc">Selecciona los cuatro factores</div>
              </div>
              <span class="badge crit-badge-grande badge-c" id="crit-badge">C</span>
            </div>
          </div>
        </div>

        <div class="seccion-form">
          <header>4 · Condiciones de operación y mantenimiento</header>
          <div>
            <div class="grid-form-3">
              <label class="campo"><span>Fluido / refrigerante de trabajo</span>
                <select id="eq-fluido">${FLUIDOS.map(x=>`<option ${e?.fluido===x?"selected":""}>${x}</option>`).join("")}</select>
              </label>
              <label class="campo"><span>Presión de trabajo</span>
                <input type="text" id="eq-presion" value="${v("presion")}" placeholder="Ej: 12 bar / 150 psi"></label>
              <label class="campo"><span>Temperatura de operación</span>
                <input type="text" id="eq-temperatura" value="${v("temperatura")}" placeholder="Ej: -25 °C / 180 °C"></label>

              <label class="campo"><span>Tensión de alimentación</span>
                <select id="eq-tension">${TENSIONES.map(x=>`<option ${e?.tension===x?"selected":""}>${x}</option>`).join("")}</select>
              </label>
              <label class="campo"><span>Corriente nominal (A)</span>
                <input type="text" id="eq-corriente" value="${v("corriente")}" placeholder="Ej: 180"></label>
              <label class="campo"><span>Velocidad (RPM)</span>
                <input type="text" id="eq-rpm" value="${v("rpm")}" placeholder="Ej: 1750"></label>

              <label class="campo"><span>Tipo de transmisión</span>
                <select id="eq-transmision">${TRANSMISIONES.map(x=>`<option ${e?.transmision===x?"selected":""}>${x}</option>`).join("")}</select>
              </label>
              <label class="campo"><span>Lubricante y carga</span>
                <input type="text" id="eq-lubricante" value="${v("lubricante")}" placeholder="Ej: ISO VG 68 · 40 L"></label>
              <label class="campo"><span>Grado de protección (IP)</span>
                <input type="text" id="eq-ip" value="${v("gradoIP")}" placeholder="Ej: IP55"></label>

              <label class="campo"><span>Material en contacto con el producto</span>
                <select id="eq-material">${MATERIALES_CONTACTO.map(x=>`<option ${e?.materialContacto===x?"selected":""}>${x}</option>`).join("")}</select>
                <span class="ayuda">Dato requerido en auditorías de inocuidad.</span>
              </label>
              <label class="campo"><span>Régimen de trabajo</span>
                <select id="eq-regimen">${REGIMENES.map(x=>`<option ${e?.regimen===x?"selected":""}>${x}</option>`).join("")}</select>
              </label>
              <label class="campo"><span>Repuestos críticos del equipo</span>
                <input type="text" id="eq-repuestos" value="${v("repuestosCriticos")}" placeholder="Ej: kit de sellos, filtro de aceite">
                <span class="ayuda">Se enlazarán con el almacén en el Módulo 5.</span>
              </label>
            </div>

            <div class="grid-form-3">
              <label class="campo"><span>¿Controla horómetro?</span>
                <select id="eq-horoaplica">
                  <option value="no"  ${!e?.horometro?.aplica ? "selected":""}>No</option>
                  <option value="si"  ${e?.horometro?.aplica  ? "selected":""}>Sí, se registran horas de operación</option>
                </select>
                <span class="ayuda">Actívalo en compresores, calderas, bombas y grupos electrógenos.</span>
              </label>
              <label class="campo"><span>Lectura actual (horas)</span><input type="number" id="eq-horovalor" min="0" step="1" value="${UI.esc(e?.horometro?.valor ?? "")}"></label>
              <label class="campo"><span>Fecha de la lectura</span><input type="date" id="eq-horofecha" value="${UI.esc(e?.horometro?.fecha ?? "")}"></label>
            </div>
          </div>
        </div>

        <div class="seccion-form">
          <header>5 · Fotografía</header>
          <div>
            <div class="subir" id="zona-foto">📷 Toca aquí para tomar o elegir una foto del equipo</div>
            <input type="file" id="eq-foto" accept="image/*" capture="environment" class="oculto">
            <div class="previsualizacion ${e?.fotoURL ? "" : "oculto"}" id="prev-foto">
              <img src="${e?.fotoURL || ""}" alt="">
              <button type="button" class="btn btn-secundario btn-sm" id="quitar-foto">Quitar foto</button>
            </div>
            <div style="height:8px"></div>
          </div>
        </div>
      </form>`;

    const m = UI.modal({
      titulo: e ? `Editar equipo · ${e.codigo}` : "Nuevo equipo",
      cuerpo, ancho:true,
      botones:[
        { txt:"Cancelar", clase:"btn-secundario" },
        { txt: e ? "Guardar cambios" : "Registrar equipo", clase:"btn-primario",
          accion:(cerrar, modalEl) => guardar(id, cerrar, modalEl) }
      ],
      alAbrir: (modalEl) => {
        const q = s => modalEl.querySelector(s);

        /* Criticidad en vivo */
        const recalcular = () => {
          const vals = {};
          modalEl.querySelectorAll(".crit-sel").forEach(s => vals[s.dataset.factor] = Number(s.value));
          const r = calcularCriticidad(vals);
          const info = CRITICIDAD_CLASES.find(x => x.clase === r.clase);
          q("#crit-puntaje").textContent = r.puntaje.toFixed(2);
          q("#crit-desc").textContent = info.desc;
          const b = q("#crit-badge");
          b.className = "badge crit-badge-grande badge-" + r.color;
          b.textContent = `Clase ${r.clase} · ${r.nombreClase}`;
        };
        modalEl.querySelectorAll(".crit-sel").forEach(s => s.onchange = recalcular);
        recalcular();

        /* Código automático */
        const autoCodigo = () => {
          const campo = q("#eq-codigo");
          if(id && campo.value) return;                 // al editar no se pisa
          const cod = generarCodigo(q("#eq-ubicacion").value, q("#eq-tipo").value);
          if(cod) campo.value = cod;
        };
        q("#eq-ubicacion").onchange = autoCodigo;
        q("#eq-tipo").onchange = autoCodigo;

        /* Foto */
        q("#zona-foto").onclick = () => q("#eq-foto").click();
        q("#eq-foto").onchange = async ev => {
          const f = ev.target.files[0]; if(!f) return;
          q("#zona-foto").textContent = "⏳ Procesando imagen…";
          try{
            const url = Datos.esDemo() ? await UI.comprimirImagen(f) : await Datos.subirArchivo(f, "equipos");
            q("#prev-foto img").src = url;
            q("#prev-foto").classList.remove("oculto");
            q("#zona-foto").textContent = "📷 Cambiar la foto";
          }catch(ex){ UI.toast("No se pudo cargar la imagen: " + ex.message, "err"); q("#zona-foto").textContent = "📷 Toca aquí para elegir una foto"; }
        };
        q("#quitar-foto").onclick = () => { q("#prev-foto img").src = ""; q("#prev-foto").classList.add("oculto"); };
      }
    });
  }

  /* ══════════════ GUARDAR ══════════════ */
  async function guardar(id, cerrar, modalEl){
    const q = s => modalEl.querySelector(s);
    const form = q("#form-eq");
    if(!form.reportValidity()) return;

    const ubi = ubicaciones.find(x => x.id === q("#eq-ubicacion").value);
    const tip = tipos.find(x => x.codigo === q("#eq-tipo").value);

    const critVals = {};
    modalEl.querySelectorAll(".crit-sel").forEach(s => critVals[s.dataset.factor] = Number(s.value));
    const crit = calcularCriticidad(critVals);

    const codigo = q("#eq-codigo").value.trim().toUpperCase();
    const repetido = equipos.find(e => e.codigo === codigo && e.id !== id);
    if(repetido){ UI.toast(`El código ${codigo} ya está usado por «${repetido.nombre}».`, "err"); return; }

    const datos = {
      codigo,
      nombre: q("#eq-nombre").value.trim(),
      ubicacionId: ubi?.id || "", ubicacionCodigo: ubi?.codigo || "", ubicacionNombre: ubi?.nombre || "",
      zona: ubi?.zona || "",
      tipoCodigo: tip?.codigo || "", tipoNombre: tip?.nombre || "", familia: tip?.familia || "",
      estado: q("#eq-estado").value,
      padreId: q("#eq-padre").value || "",
      marca: q("#eq-marca").value.trim(),
      modelo: q("#eq-modelo").value.trim(),
      serie: q("#eq-serie").value.trim(),
      potencia: q("#eq-potencia").value.trim(),
      unidadPotencia: q("#eq-unidad").value,
      energia: q("#eq-energia").value,
      anio: q("#eq-anio").value,
      fechaInstalacion: q("#eq-instalacion").value,
      garantiaHasta: q("#eq-garantia").value,
      observaciones: q("#eq-obs").value.trim(),
      fluido: q("#eq-fluido").value,
      presion: q("#eq-presion").value.trim(),
      temperatura: q("#eq-temperatura").value.trim(),
      tension: q("#eq-tension").value,
      corriente: q("#eq-corriente").value.trim(),
      rpm: q("#eq-rpm").value.trim(),
      transmision: q("#eq-transmision").value,
      lubricante: q("#eq-lubricante").value.trim(),
      gradoIP: q("#eq-ip").value.trim(),
      materialContacto: q("#eq-material").value,
      regimen: q("#eq-regimen").value,
      repuestosCriticos: q("#eq-repuestos").value.trim(),
      horometro: {
        aplica: q("#eq-horoaplica").value === "si",
        valor: Number(q("#eq-horovalor").value) || 0,
        fecha: q("#eq-horofecha").value || ""
      },
      criticidad: { ...critVals, ...crit },
      fotoURL: q("#prev-foto img").src && !q("#prev-foto").classList.contains("oculto") ? q("#prev-foto img").src : ""
    };

    try{
      await Datos.guardar("equipos", datos, id);
      cerrar();
      UI.toast(id ? "Equipo actualizado." : `Equipo ${codigo} registrado.`, "ok");
      await render(cont);
    }catch(ex){
      UI.toast("No se pudo guardar: " + ex.message, "err");
    }
  }

  /* ══════════════ FICHA DE DETALLE ══════════════ */
  function verFicha(id){
    const e = equipos.find(x => x.id === id); if(!e) return;
    const fila = (k, v) => `<tr><td style="width:42%;color:var(--texto-2);font-size:13px">${k}</td><td><strong>${UI.esc(v || "—")}</strong></td></tr>`;
    const c = e.criticidad || {};

    UI.modal({
      titulo: `${e.codigo} · ${e.nombre}`, ancho:true,
      cuerpo:`
        ${e.fotoURL ? `<img src="${e.fotoURL}" style="width:100%;max-height:230px;object-fit:cover;border-radius:12px;margin-bottom:16px">` : ""}
        <div class="chip-lista mb-12">${badgeCrit(e.criticidad)} ${badgeEstado(e.estado)} <span class="badge badge-azul">${UI.esc(e.tipoNombre||"")}</span></div>

        <div class="seccion-form"><header>Ubicación e identificación</header><div style="padding:0">
          <table class="tabla">
            ${fila("Área","(" + (e.ubicacionCodigo||"") + ") " + (e.ubicacionNombre||""))}
            ${fila("Tipo", e.tipoNombre)}
            ${fila("Familia", e.familia)}
            ${fila("Equipo padre", equipos.find(x=>x.id===e.padreId)?.nombre)}
          </table>
        </div></div>

        <div class="seccion-form"><header>Datos técnicos</header><div style="padding:0">
          <table class="tabla">
            ${fila("Marca", e.marca)}${fila("Modelo", e.modelo)}${fila("N° de serie", e.serie)}
            ${fila("Potencia", (e.potencia||"") + " " + (e.unidadPotencia||""))}
            ${fila("Energía", e.energia)}${fila("Año", e.anio)}
            ${fila("Instalación", e.fechaInstalacion ? UI.fecha(e.fechaInstalacion) : "")}
            ${fila("Garantía hasta", e.garantiaHasta ? UI.fecha(e.garantiaHasta) : "")}
          </table>
        </div></div>

        <div class="seccion-form"><header>Condiciones de operación</header><div style="padding:0">
          <table class="tabla">
            ${fila("Fluido / refrigerante", e.fluido)}
            ${fila("Presión de trabajo", e.presion)}
            ${fila("Temperatura de operación", e.temperatura)}
            ${fila("Tensión", e.tension)}
            ${fila("Corriente nominal", e.corriente ? e.corriente + " A" : "")}
            ${fila("Velocidad", e.rpm ? e.rpm + " RPM" : "")}
            ${fila("Transmisión", e.transmision)}
            ${fila("Lubricante", e.lubricante)}
            ${fila("Grado de protección", e.gradoIP)}
            ${fila("Material en contacto", e.materialContacto)}
            ${fila("Régimen de trabajo", e.regimen)}
            ${fila("Repuestos críticos", e.repuestosCriticos)}
            ${e.horometro?.aplica ? fila("Horómetro", (e.horometro.valor||0) + " h  (al " + (UI.fecha(e.horometro.fecha)) + ")") : ""}
          </table>
        </div></div>

        <div class="seccion-form"><header>Evaluación de criticidad</header><div style="padding:0">
          <table class="tabla">
            ${CRITICIDAD_FACTORES.map(f => {
              const n = f.niveles.find(x => x.v == (c[f.id]||1));
              return fila(f.ico + " " + f.nombre, (c[f.id]||1) + " · " + (n?n.t:""));
            }).join("")}
            ${fila("Puntaje ponderado", (c.puntaje ?? 0).toFixed ? c.puntaje.toFixed(2) : c.puntaje)}
            ${fila("Clasificación", "Clase " + (c.clase||"—") + " · " + (c.nombreClase||""))}
          </table>
        </div></div>

        <div class="seccion-form"><header>Trazabilidad del registro</header><div style="padding:0">
          <table class="tabla">
            ${fila("Registrado por", e.creadoPor)}
            ${fila("Fecha de registro", UI.fechaHora(e.creadoEn))}
            ${fila("Última actualización", UI.fechaHora(e.actualizadoEn))}
          </table>
        </div></div>

        ${e.observaciones ? `<div class="seccion-form"><header>Observaciones</header><div><p style="padding-bottom:14px;font-size:14px;line-height:1.6">${UI.esc(e.observaciones)}</p></div></div>` : ""}

        <div class="banner banner-info">📌 El historial de órdenes de trabajo, el plan de mantenimiento y las lecturas de este equipo aparecerán aquí cuando activemos esos módulos.</div>`,
      botones: Auth.puede("equipos.editar")
        ? [{ txt:"Cerrar", clase:"btn-secundario" },
           { txt:"✏️ Editar", clase:"btn-primario", accion:(cerrar)=>{ cerrar(); abrirFormulario(id); } }]
        : [{ txt:"Cerrar", clase:"btn-secundario" }]
    });
  }

  /* ══════════════ ELIMINAR ══════════════ */
  function borrar(id){
    const e = equipos.find(x => x.id === id); if(!e) return;
    UI.confirmar(
      `¿Eliminar el equipo <strong>${UI.esc(e.codigo)} · ${UI.esc(e.nombre)}</strong>?<br><br>
       Esta acción no se puede deshacer. Si el equipo salió de servicio, es preferible cambiar su estado a «Dado de baja» para conservar su historial.`,
      async () => {
        await Datos.eliminar("equipos", id);
        UI.toast("Equipo eliminado.", "ok");
        await render(cont);
      },
      {titulo:"Eliminar equipo", txtOk:"Sí, eliminar"}
    );
  }

  /* ══════════════ EXPORTAR ══════════════ */
  const COLS_CSV = [
    "codigo","nombre","area_codigo","tipo_codigo","estado","marca","modelo","serie",
    "potencia","unidad","energia","anio","fecha_instalacion",
    "fluido","presion","temperatura","tension","corriente","rpm","transmision",
    "lubricante","grado_ip","material_contacto","regimen","repuestos_criticos",
    "horometro_aplica","horometro_valor",
    "crit_produccion","crit_seguridad","crit_inocuidad","crit_repuesto","observaciones"
  ];

  function exportar(){
    const lista = filtrar();
    const filas = [["codigo","nombre","area","zona","tipo","estado","marca","modelo","serie",
      "potencia","unidad","energia","anio","instalacion",
      "fluido","presion","temperatura","tension","corriente","rpm","transmision",
      "lubricante","grado_ip","material_contacto","regimen","repuestos_criticos",
      "horometro","criticidad_puntaje","criticidad_clase","observaciones"]];
    lista.forEach(e => filas.push([
      e.codigo, e.nombre, e.ubicacionNombre, ZONAS.find(z=>z.id===e.zona)?.nombre || "",
      e.tipoNombre, ESTADOS_EQUIPO.find(x=>x.v===e.estado)?.t || e.estado,
      e.marca, e.modelo, e.serie, e.potencia, e.unidadPotencia, e.energia, e.anio,
      e.fechaInstalacion,
      e.fluido, e.presion, e.temperatura, e.tension, e.corriente, e.rpm, e.transmision,
      e.lubricante, e.gradoIP, e.materialContacto, e.regimen, e.repuestosCriticos,
      e.horometro?.aplica ? e.horometro.valor : "",
      e.criticidad?.puntaje, e.criticidad?.clase, e.observaciones
    ]));
    UI.descargar(`inventario_equipos_${UI.hoyISO()}.csv`, UI.aCSV(filas));
    UI.toast(`Exportados ${lista.length} equipos.`, "ok");
  }

  /* ══════════════ IMPORTAR ══════════════ */
  function abrirImportador(){
    UI.modal({
      titulo:"Importar equipos desde CSV", ancho:true,
      cuerpo:`
        <p class="txt-2" style="font-size:14px;line-height:1.6">
          Descarga la plantilla, complétala en Excel (una fila por equipo) y súbela aquí.
          Guarda el archivo como <strong>CSV delimitado por punto y coma</strong>.
        </p>
        <div class="banner banner-info" style="margin-top:14px">
          <strong>Columnas obligatorias:</strong> nombre, area_codigo, tipo_codigo.<br>
          Si dejas <code>codigo</code> vacío, el sistema lo genera automáticamente.<br>
          Los factores de criticidad van del 1 al 4; si no los pones, quedan en 1.
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:16px 0">
          <button class="btn btn-secundario" id="btn-plantilla">📄 Descargar plantilla CSV</button>
          <button class="btn btn-secundario" id="btn-codigos">📖 Ver códigos de áreas y tipos</button>
        </div>
        <div class="subir" id="zona-csv">📂 Toca para seleccionar el archivo CSV</div>
        <input type="file" id="csv-file" accept=".csv,text/csv" class="oculto">
        <div id="csv-resultado" class="mt-16"></div>`,
      botones:[{ txt:"Cerrar", clase:"btn-secundario" }],
      alAbrir:(modalEl, cerrar) => {
        const q = s => modalEl.querySelector(s);

        q("#btn-plantilla").onclick = () => {
          const ej = ["SM1-COM-001","Compresor de tornillo Mycom N°1","SM1","COM","operativo","Mycom","250VLD","A-1123",
                      "150","HP","Eléctrica","2015","2015-06-01",
                      "Amoniaco (NH3)","12 bar","-35 °C","440 V trifásico","180","1750","Acople directo",
                      "ISO VG 68 · 40 L","IP55","Sin contacto con el producto","3 turnos (24 h/día)","Kit de sellos, filtro de aceite",
                      "si","12500","4","4","2","3","Compresor principal de la sala 1"];
          UI.descargar("plantilla_equipos.csv", UI.aCSV([COLS_CSV, ej]));
        };

        q("#btn-codigos").onclick = () => UI.modal({
          titulo:"Códigos de referencia", ancho:true,
          cuerpo:`
            <div class="seccion-form"><header>Áreas (area_codigo)</header><div style="padding:0">
              <table class="tabla"><thead><tr><th>Código</th><th>Área</th></tr></thead><tbody>
              ${ubicaciones.map(u=>`<tr><td class="celda-cod">${UI.esc(u.codigo)}</td><td>${UI.esc(u.nombre)}</td></tr>`).join("")}
              </tbody></table></div></div>
            <div class="seccion-form"><header>Tipos de equipo (tipo_codigo)</header><div style="padding:0">
              <table class="tabla"><thead><tr><th>Código</th><th>Tipo</th></tr></thead><tbody>
              ${tipos.map(t=>`<tr><td class="celda-cod">${UI.esc(t.codigo)}</td><td>${UI.esc(t.nombre)}</td></tr>`).join("")}
              </tbody></table></div></div>`,
          botones:[{txt:"Cerrar", clase:"btn-secundario"}]
        });

        q("#zona-csv").onclick = () => q("#csv-file").click();
        q("#csv-file").onchange = ev => {
          const f = ev.target.files[0]; if(!f) return;
          const lector = new FileReader();
          lector.onload = () => procesarCSV(lector.result, q("#csv-resultado"), cerrar);
          lector.readAsText(f, "UTF-8");
        };
      }
    });
  }

  async function procesarCSV(texto, caja, cerrarModal){
    const filas = UI.deCSV(texto);
    if(filas.length < 2){ caja.innerHTML = `<div class="msg-error">El archivo está vacío o no tiene datos.</div>`; return; }

    const cab = filas[0].map(h => h.trim().toLowerCase());
    const idx = n => cab.indexOf(n);
    const nuevos = [], errores = [];
    const usados = new Set(equipos.map(e => e.codigo));

    filas.slice(1).forEach((f, i) => {
      const g = n => (idx(n) >= 0 ? String(f[idx(n)] ?? "").trim() : "");
      const nombre = g("nombre");
      const areaCod = g("area_codigo").toUpperCase();
      const tipoCod = g("tipo_codigo").toUpperCase();
      const linea = i + 2;

      if(!nombre){ errores.push(`Fila ${linea}: falta el nombre.`); return; }
      const ubi = ubicaciones.find(u => u.codigo === areaCod);
      if(!ubi){ errores.push(`Fila ${linea}: el código de área «${areaCod||"vacío"}» no existe.`); return; }
      const tip = tipos.find(t => t.codigo === tipoCod);
      if(!tip){ errores.push(`Fila ${linea}: el código de tipo «${tipoCod||"vacío"}» no existe.`); return; }

      let codigo = g("codigo").toUpperCase();
      if(!codigo){
        const pref = `${ubi.codigo}-${tip.codigo}-`;
        let n = 1;
        while(usados.has(pref + String(n).padStart(3,"0"))) n++;
        codigo = pref + String(n).padStart(3,"0");
      }
      if(usados.has(codigo)){ errores.push(`Fila ${linea}: el código ${codigo} está repetido.`); return; }
      usados.add(codigo);

      const critVals = {
        produccion: Math.min(4, Math.max(1, Number(g("crit_produccion")) || 1)),
        seguridad:  Math.min(4, Math.max(1, Number(g("crit_seguridad"))  || 1)),
        inocuidad:  Math.min(4, Math.max(1, Number(g("crit_inocuidad"))  || 1)),
        repuesto:   Math.min(4, Math.max(1, Number(g("crit_repuesto"))   || 1))
      };
      const crit = calcularCriticidad(critVals);
      const est = g("estado").toLowerCase();

      nuevos.push({
        codigo, nombre,
        ubicacionId:ubi.id, ubicacionCodigo:ubi.codigo, ubicacionNombre:ubi.nombre, zona:ubi.zona,
        tipoCodigo:tip.codigo, tipoNombre:tip.nombre, familia:tip.familia,
        estado: ESTADOS_EQUIPO.some(x=>x.v===est) ? est : "operativo",
        marca:g("marca"), modelo:g("modelo"), serie:g("serie"),
        potencia:g("potencia"), unidadPotencia:g("unidad"), energia:g("energia"), anio:g("anio"),
        fechaInstalacion:g("fecha_instalacion"),
        fluido:g("fluido"), presion:g("presion"), temperatura:g("temperatura"),
        tension:g("tension"), corriente:g("corriente"), rpm:g("rpm"), transmision:g("transmision"),
        lubricante:g("lubricante"), gradoIP:g("grado_ip"),
        materialContacto:g("material_contacto"), regimen:g("regimen"), repuestosCriticos:g("repuestos_criticos"),
        horometro:{ aplica: g("horometro_aplica").toLowerCase()==="si", valor:Number(g("horometro_valor"))||0, fecha:"" },
        criticidad:{ ...critVals, ...crit },
        observaciones:g("observaciones"), fotoURL:""
      });
    });

    caja.innerHTML = `
      <div class="banner ${errores.length ? "banner-aviso" : "banner-info"}">
        <strong>${nuevos.length}</strong> equipos listos para importar.
        ${errores.length ? `<br><strong>${errores.length}</strong> filas con problemas:` : ""}
      </div>
      ${errores.length ? `<ul style="font-size:12.5px;color:var(--texto-2);padding-left:20px;max-height:160px;overflow:auto">${errores.slice(0,30).map(e=>`<li>${UI.esc(e)}</li>`).join("")}</ul>` : ""}
      ${nuevos.length ? `<button class="btn btn-primario mt-16" id="btn-confirmar-import">✅ Importar ${nuevos.length} equipos</button>` : ""}`;

    const b = caja.querySelector("#btn-confirmar-import");
    if(b) b.onclick = async () => {
      b.disabled = true; b.textContent = "Importando…";
      try{
        await Datos.guardarLote("equipos", nuevos);
        cerrarModal();
        UI.toast(`${nuevos.length} equipos importados correctamente.`, "ok");
        await render(cont);
      }catch(ex){ UI.toast("Error al importar: " + ex.message, "err"); b.disabled = false; }
    };
  }

  return { render };
})());

/* ============================================================
   VISTA · USUARIOS Y ACCESOS
   ============================================================ */
App.registrar("usuarios", (() => {

  let usuarios = [], cont = null;

  async function render(contenedor){
    cont = contenedor;
    usuarios = await Datos.listar("usuarios", {orden:"nombre", dir:"asc"});
    pintar();
  }

  function pintar(){
    cont.innerHTML = `
      <div class="pagina-cab">
        <div>
          <h2>👥 Usuarios y accesos</h2>
          <p>Define quién entra al sistema y qué puede hacer dentro de él.</p>
        </div>
        <div class="acciones">
          <button class="btn btn-secundario" id="btn-permisos">🔐 Ver permisos por rol</button>
          <button class="btn btn-primario" id="btn-nuevo">➕ Nuevo usuario</button>
        </div>
      </div>

      ${Datos.esDemo() ? `<div class="banner banner-aviso">
        En modo demo los usuarios se guardan solo en este navegador y la contraseña no es segura.
        Al conectar Firebase, cada usuario creado aquí recibirá una cuenta real con su correo y contraseña.
      </div>` : ""}

      <div class="grid-kpi">
        ${Object.entries(ROLES).map(([k,r]) => {
          const n = usuarios.filter(u => u.rol === k).length;
          return `<div class="kpi ${r.color==='azul'?'':r.color}">
            <div class="kpi-label">${r.icono} ${UI.esc(r.nombre.split(" ")[0])}</div>
            <div class="kpi-valor">${n}</div><div class="kpi-sub">${UI.esc(r.nombre)}</div></div>`;
        }).join("")}
      </div>

      <div class="tabla-wrap">
        <table class="tabla">
          <thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Área</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            ${usuarios.map(u => `
              <tr>
                <td><div class="fila"><span class="avatar">${UI.iniciales(u.nombre||u.email)}</span><strong>${UI.esc(u.nombre||"—")}</strong></div></td>
                <td class="txt-2">${UI.esc(u.email)}</td>
                <td><span class="badge badge-azul">${ROLES[u.rol]?.icono || ""} ${UI.esc(ROLES[u.rol]?.nombre || u.rol)}</span></td>
                <td>${UI.esc(u.area || "—")}</td>
                <td>${u.activo === false ? `<span class="badge badge-gris">Inactivo</span>` : `<span class="badge badge-verde">Activo</span>`}</td>
                <td><div class="acciones-fila">
                  <button class="mini-btn" data-editar="${u.id}" title="Editar">✏️</button>
                </div></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;

    UI.$("#btn-nuevo").onclick = () => formulario();
    UI.$("#btn-permisos").onclick = verPermisos;
    UI.$$("[data-editar]").forEach(b => b.onclick = () => formulario(b.dataset.editar));
  }

  function formulario(id=null){
    const u = id ? usuarios.find(x => x.id === id) : null;
    UI.modal({
      titulo: u ? "Editar usuario" : "Nuevo usuario",
      cuerpo:`
        <form id="form-u">
          <label class="campo"><span>Nombre completo <span class="req">*</span></span>
            <input type="text" id="u-nombre" required value="${UI.esc(u?.nombre||"")}"></label>
          <label class="campo"><span>Correo <span class="req">*</span></span>
            <input type="email" id="u-email" required value="${UI.esc(u?.email||"")}" ${u?"disabled":""}>
            ${u?`<span class="ayuda">El correo no se puede cambiar porque es la llave de la cuenta.</span>`:""}
          </label>
          ${u ? "" : `<label class="campo"><span>Contraseña inicial <span class="req">*</span></span>
            <input type="text" id="u-pass" required minlength="6" value="Mant2026">
            <span class="ayuda">Mínimo 6 caracteres. El usuario podrá cambiarla después.</span></label>`}
          <label class="campo"><span>Rol <span class="req">*</span></span>
            <select id="u-rol" required>
              ${Object.entries(ROLES).map(([k,r])=>`<option value="${k}" ${u?.rol===k?"selected":""}>${r.icono} ${UI.esc(r.nombre)}</option>`).join("")}
            </select></label>
          <label class="campo"><span>Área a la que pertenece</span>
            <input type="text" id="u-area" value="${UI.esc(u?.area||"")}" placeholder="Mantenimiento, Producción, Calidad…"></label>
          <label class="campo"><span>Estado</span>
            <select id="u-activo">
              <option value="si" ${u?.activo !== false ? "selected":""}>Activo — puede entrar al sistema</option>
              <option value="no" ${u?.activo === false ? "selected":""}>Inactivo — acceso bloqueado</option>
            </select></label>
        </form>`,
      botones:[
        { txt:"Cancelar", clase:"btn-secundario" },
        { txt: u ? "Guardar" : "Crear usuario", clase:"btn-primario", accion: async (cerrar, m) => {
            const q = s => m.querySelector(s);
            if(!q("#form-u").reportValidity()) return;
            const perfil = {
              nombre:q("#u-nombre").value.trim(),
              rol:q("#u-rol").value,
              area:q("#u-area").value.trim(),
              activo:q("#u-activo").value === "si"
            };
            try{
              if(u) await Datos.guardar("usuarios", perfil, id);
              else  await Datos.auth.crearUsuario(q("#u-email").value.trim(), q("#u-pass").value, perfil);
              cerrar(); UI.toast("Usuario guardado.", "ok"); await render(cont);
            }catch(ex){
              UI.toast("No se pudo guardar: " + (ex.message||ex), "err");
            }
          }}
      ]
    });
  }

  function verPermisos(){
    UI.modal({
      titulo:"Permisos por rol", ancho:true,
      cuerpo: Object.entries(ROLES).map(([k,r]) => `
        <div class="seccion-form">
          <header>${r.icono} ${UI.esc(r.nombre)}</header>
          <div style="padding-bottom:14px">
            ${r.permisos.includes("*")
              ? `<p class="txt-2">Acceso total a todos los módulos, incluida la administración de usuarios.</p>`
              : `<div class="chip-lista">${r.permisos.map(p=>`<span class="badge badge-gris">${UI.esc(p)}</span>`).join("")}</div>`}
          </div>
        </div>`).join(""),
      botones:[{txt:"Cerrar", clase:"btn-secundario"}]
    });
  }

  return { render };
})());

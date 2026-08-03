/* ============================================================
   MAIN · arranque de la aplicación y enrutador
   ============================================================ */
const App = {

  vistas: {},          // se registran desde cada archivo vista-*.js
  vistaActual: null,

  registrar(id, vista){ App.vistas[id] = vista; },

  /* ---------- Arranque ---------- */
  async iniciar(){
    UI.tema.iniciar();

    /* En modo demo los catálogos y los usuarios de prueba deben existir
       antes del login. Con Firebase, las reglas de seguridad exigen estar
       autenticado, así que la carga inicial se hace después de entrar. */
    if(Datos.esDemo()){
      try{ await Datos.sembrarSiHaceFalta(); }
      catch(e){ console.error("Carga inicial:", e); }
    }

    Datos.auth.alCambiar(async usuario => {
      UI.$("#splash").classList.add("oculto");
      document.body.classList.remove("cargando");

      if(!usuario){
        UI.$("#vista-app").classList.add("oculto");
        UI.$("#vista-login").classList.remove("oculto");
        Login.iniciar();
        return;
      }

      Auth.usuario = usuario;

      /* Primera vez con Firebase: sembrar áreas y tipos de equipo.
         Solo quien tiene permiso de escritura puede hacerlo. */
      if(!Datos.esDemo() && ["admin","planificador"].includes(usuario.rol)){
        try{ await Datos.sembrarSiHaceFalta(); }
        catch(e){ console.error("Carga inicial:", e); UI.toast("No se pudieron cargar los catálogos iniciales. Revisa las reglas de Firestore.", "err", 6000); }
      }

      UI.$("#vista-login").classList.add("oculto");
      UI.$("#vista-app").classList.remove("oculto");
      App.montarShell();
      App.navegar(location.hash.replace("#","") || "tablero");
    });
  },

  /* ---------- Barra superior, menú lateral ---------- */
  montarShell(){
    Auth.pintarUsuario();

    const chip = UI.$("#chip-modo");
    if(Datos.esDemo()){ chip.textContent = "Modo demo"; }
    else chip.classList.add("oculto");

    /* Menú según permisos */
    const nav = UI.$("#nav-principal");
    nav.innerHTML = "";
    MENU.forEach(g => {
      const items = g.items.filter(i => Auth.puede(i.permiso) || i.permiso === "tablero.ver");
      if(!items.length) return;
      const h = document.createElement("div");
      h.className = "nav-grupo"; h.textContent = g.grupo;
      nav.appendChild(h);
      items.forEach(i => {
        const b = document.createElement("button");
        b.className = "nav-item"; b.dataset.vista = i.id;
        b.innerHTML = `<span class="ico">${i.ico}</span><span>${UI.esc(i.texto)}</span>` +
                      (i.estado === "proximo" ? `<span class="pill">pronto</span>` : "");
        b.onclick = () => { App.navegar(i.id); App.cerrarMenuMovil(); };
        nav.appendChild(b);
      });
    });

    /* Acciones de la barra */
    UI.$("#btn-tema").onclick = UI.tema.alternar;
    UI.$("#btn-menu").onclick = () => {
      UI.$("#sidebar").classList.toggle("abierto");
      UI.$("#overlay-sidebar").classList.toggle("oculto");
    };
    UI.$("#overlay-sidebar").onclick = () => App.cerrarMenuMovil();

    const dd = UI.$("#dropdown-usuario");
    UI.$("#btn-usuario").onclick = e => { e.stopPropagation(); dd.classList.toggle("oculto"); };
    document.addEventListener("click", () => dd.classList.add("oculto"));
    UI.$("#btn-salir").onclick = () => UI.confirmar(
      "¿Deseas cerrar la sesión?", () => Auth.salir(),
      {titulo:"Cerrar sesión", txtOk:"Cerrar sesión", peligro:false}
    );

    window.addEventListener("hashchange", () => {
      const v = location.hash.replace("#","");
      if(v && v !== App.vistaActual) App.navegar(v);
    });
  },

  cerrarMenuMovil(){
    UI.$("#sidebar").classList.remove("abierto");
    UI.$("#overlay-sidebar").classList.add("oculto");
  },

  /* ---------- Navegación ---------- */
  async navegar(id){
    const def = MENU.flatMap(g => g.items).find(i => i.id === id);
    if(!def){ return App.navegar("tablero"); }
    if(!Auth.puede(def.permiso) && def.permiso !== "tablero.ver"){
      UI.toast("No tienes permiso para acceder a esa sección.", "err");
      return;
    }

    App.vistaActual = id;
    location.hash = id;
    UI.$$(".nav-item").forEach(b => b.classList.toggle("activo", b.dataset.vista === id));

    const cont = UI.$("#contenido");
    cont.innerHTML = UI.cargando();
    cont.scrollTop = 0;

    const vista = App.vistas[id] || App.vistas["_proximamente"];
    try{
      await vista.render(cont, def);
    }catch(e){
      console.error(e);
      cont.innerHTML = `<div class="banner banner-aviso">Ocurrió un error al cargar la sección:<br><code>${UI.esc(e.message)}</code></div>`;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => App.iniciar());

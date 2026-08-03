/* ============================================================
   AUTH · sesión, roles y permisos
   ============================================================ */
const Auth = {
  usuario: null,

  /* ---------- Permisos ---------- */
  rolInfo(){
    return ROLES[this.usuario?.rol] || { nombre:"—", icono:"👤", permisos:[] };
  },
  puede(permiso){
    if(!this.usuario) return false;
    const p = this.rolInfo().permisos;
    if(p.includes("*")) return true;
    if(p.includes(permiso)) return true;
    /* 'ot.ver' concede acceso si el rol tiene 'ot.ver.propias' o '.asignadas' */
    return p.some(x => x.startsWith(permiso + "."));
  },

  /* ---------- Entrar ---------- */
  async entrar(email, pass){
    const u = await Datos.auth.entrar(email, pass);
    if(u && u.activo === false) {
      await Datos.auth.salir();
      throw new Error("Tu usuario está desactivado. Comunícate con el administrador.");
    }
    return u;
  },

  async salir(){
    await Datos.auth.salir();
    location.reload();
  },

  /* ---------- Pintar datos del usuario en la barra ---------- */
  pintarUsuario(){
    const u = this.usuario; if(!u) return;
    const r = this.rolInfo();
    UI.$("#avatar-usuario").textContent = UI.iniciales(u.nombre || u.email);
    UI.$("#nombre-usuario").textContent = u.nombre || u.email;
    UI.$("#rol-usuario").textContent = r.icono + " " + r.nombre;
    UI.$("#dd-nombre").textContent = u.nombre || "—";
    UI.$("#dd-email").textContent = u.email || "—";
  }
};

/* ============================================================
   Pantalla de login
   ============================================================ */
const Login = {
  iniciar(){
    if(Datos.esDemo()){
      UI.$("#banner-demo").classList.remove("oculto");
      UI.$("#demo-usuarios").classList.remove("oculto");
      UI.$$(".demo-chip").forEach(b => b.onclick = () => {
        const mapa = {
          admin:"admin@planta.com", planificador:"planificador@planta.com",
          tecnico:"tecnico@planta.com", solicitante:"produccion@planta.com"
        };
        UI.$("#login-email").value = mapa[b.dataset.demo];
        UI.$("#login-pass").value  = "demo";
        UI.$("#form-login").requestSubmit();
      });
    }

    UI.$("#tema-login").onclick = UI.tema.alternar;

    /* Si el intento anterior falló al leer el perfil, se muestra aquí.
       No se borra: el manejador del formulario lo necesita porque es
       un mensaje más preciso que el que devuelve la propia consulta. */
    const pendiente = Datos.auth.ultimoError;
    if(pendiente){
      const err = UI.$("#login-error");
      err.textContent = Login.traducirError(pendiente);
      err.classList.remove("oculto");
    }

    UI.$("#form-login").onsubmit = async e => {
      e.preventDefault();
      const btn = UI.$("#btn-entrar");
      const err = UI.$("#login-error");
      err.classList.add("oculto");
      btn.disabled = true; btn.textContent = "Verificando…";
      try{
        await Auth.entrar(UI.$("#login-email").value.trim(), UI.$("#login-pass").value);
        location.reload();
      }catch(ex){
        /* El error registrado por el vigilante de sesión es más
           específico que el que devuelve la consulta bloqueada. */
        err.textContent = Login.traducirError(Datos.auth.ultimoError || ex);
        err.classList.remove("oculto");
        btn.disabled = false; btn.textContent = "Entrar";
      }
    };
  },

  traducirError(ex){
    const c = ex.code || "";
    const texto = String(ex.message || "");

    if(c === "perfil-inexistente") return texto;

    if(c === "permission-denied" || /insufficient permissions/i.test(texto)){
      return "Firestore rechazó la consulta por permisos.\n\n" +
             "Revisa dos cosas:\n" +
             "1) Que las reglas del archivo firestore.rules estén publicadas en Firebase.\n" +
             "2) Que tu correo esté escrito igual en js/config.js (ADMINS_INICIALES) " +
             "y en la función esAdminInicial() de firestore.rules.";
    }

    const m = {
      "auth/invalid-email":"El correo no tiene un formato válido.",
      "auth/user-not-found":"No existe un usuario con ese correo.",
      "auth/wrong-password":"Contraseña incorrecta.",
      "auth/invalid-credential":"Correo o contraseña incorrectos.",
      "auth/too-many-requests":"Demasiados intentos fallidos. Espera unos minutos.",
      "auth/network-request-failed":"Sin conexión a internet.",
      "auth/user-disabled":"Este usuario fue deshabilitado."
    };
    return m[c] || ex.message || "No se pudo iniciar sesión.";
  }
};

/* ============================================================
   DATOS · capa única de acceso a la información
   ------------------------------------------------------------
   Si config.js tiene credenciales válidas  → Firebase (Firestore/Auth/Storage)
   Si no                                    → Modo demo (localStorage)
   El resto de la aplicación NO sabe cuál de los dos está activo.
   ============================================================ */
const Datos = (() => {

  const configValida = firebaseConfig &&
        firebaseConfig.apiKey &&
        !String(firebaseConfig.apiKey).includes("PEGAR_AQUI");

  let modo = configValida ? "firebase" : "demo";
  let db = null, auth = null, storage = null;

  if(modo === "firebase"){
    try{
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      auth = firebase.auth();
      storage = firebase.storage();
      db.enablePersistence({synchronizeTabs:true}).catch(()=>{});
    }catch(e){
      console.error("Firebase no pudo iniciar, se usa modo demo:", e);
      modo = "demo";
    }
  }

  /* ══════════════ ALMACÉN LOCAL (modo demo) ══════════════ */
  const LS = {
    clave: c => "gm_demo_" + c,
    leer(c){ try{ return JSON.parse(localStorage.getItem(LS.clave(c))) || []; }catch(e){ return []; } },
    escribir(c, arr){ localStorage.setItem(LS.clave(c), JSON.stringify(arr)); }
  };

  const nuevoId = () => "id" + Date.now().toString(36) + Math.random().toString(36).slice(2,7);

  /* ══════════════ OPERACIONES GENÉRICAS ══════════════ */

  async function listar(coleccion, {orden="creadoEn", dir="desc"} = {}){
    if(modo === "demo"){
      const arr = LS.leer(coleccion).slice();
      arr.sort((a,b) => {
        const x = a[orden] ?? "", y = b[orden] ?? "";
        if(x === y) return 0;
        return (x > y ? 1 : -1) * (dir === "desc" ? -1 : 1);
      });
      return arr;
    }
    let ref = db.collection(coleccion);
    try{ ref = ref.orderBy(orden, dir); }catch(e){}
    const snap = await ref.get();
    return snap.docs.map(d => ({ id:d.id, ...d.data() }));
  }

  async function obtener(coleccion, id){
    if(modo === "demo") return LS.leer(coleccion).find(x => x.id === id) || null;
    const doc = await db.collection(coleccion).doc(id).get();
    return doc.exists ? { id:doc.id, ...doc.data() } : null;
  }

  async function guardar(coleccion, datos, id=null){
    const ahora = new Date().toISOString();
    const usuario = (window.Auth && Auth.usuario) ? Auth.usuario.email : "sistema";

    if(modo === "demo"){
      const arr = LS.leer(coleccion);
      if(id){
        const i = arr.findIndex(x => x.id === id);
        if(i < 0) throw new Error("Registro no encontrado");
        arr[i] = { ...arr[i], ...datos, actualizadoEn:ahora, actualizadoPor:usuario };
        LS.escribir(coleccion, arr);
        return arr[i];
      }
      const nuevo = { id:nuevoId(), ...datos, creadoEn:ahora, creadoPor:usuario, actualizadoEn:ahora };
      arr.push(nuevo);
      LS.escribir(coleccion, arr);
      return nuevo;
    }

    if(id){
      await db.collection(coleccion).doc(id)
        .set({ ...datos, actualizadoEn:ahora, actualizadoPor:usuario }, {merge:true});
      return { id, ...datos };
    }
    const ref = await db.collection(coleccion)
      .add({ ...datos, creadoEn:ahora, creadoPor:usuario, actualizadoEn:ahora });
    return { id:ref.id, ...datos };
  }

  async function guardarConId(coleccion, id, datos){
    if(modo === "demo"){
      const arr = LS.leer(coleccion);
      const i = arr.findIndex(x => x.id === id);
      const reg = { id, ...(i>=0 ? arr[i] : {}), ...datos };
      if(i >= 0) arr[i] = reg; else arr.push(reg);
      LS.escribir(coleccion, arr);
      return reg;
    }
    await db.collection(coleccion).doc(id).set(datos, {merge:true});
    return { id, ...datos };
  }

  async function eliminar(coleccion, id){
    if(modo === "demo"){
      LS.escribir(coleccion, LS.leer(coleccion).filter(x => x.id !== id));
      return;
    }
    await db.collection(coleccion).doc(id).delete();
  }

  /* Guardado masivo (importación CSV / carga inicial) */
  async function guardarLote(coleccion, registros){
    const ahora = new Date().toISOString();
    const usuario = (window.Auth && Auth.usuario) ? Auth.usuario.email : "sistema";

    if(modo === "demo"){
      const arr = LS.leer(coleccion);
      registros.forEach(r => arr.push({ id:nuevoId(), ...r, creadoEn:ahora, creadoPor:usuario }));
      LS.escribir(coleccion, arr);
      return registros.length;
    }
    // Firestore permite 500 operaciones por lote
    for(let i = 0; i < registros.length; i += 400){
      const lote = db.batch();
      registros.slice(i, i+400).forEach(r => {
        lote.set(db.collection(coleccion).doc(), { ...r, creadoEn:ahora, creadoPor:usuario });
      });
      await lote.commit();
    }
    return registros.length;
  }

  /* Guardado masivo usando un campo como identificador del documento.
     Es idempotente: si se ejecuta dos veces, sobrescribe en lugar de duplicar. */
  async function guardarLoteConId(coleccion, registros, campoId){
    if(modo === "demo"){
      const arr = LS.leer(coleccion);
      registros.forEach(r => {
        const id = String(r[campoId]);
        const i = arr.findIndex(x => x.id === id);
        const reg = { ...r, id };
        if(i >= 0) arr[i] = reg; else arr.push(reg);
      });
      LS.escribir(coleccion, arr);
      return registros.length;
    }
    for(let i = 0; i < registros.length; i += 400){
      const lote = db.batch();
      registros.slice(i, i+400).forEach(r => {
        lote.set(db.collection(coleccion).doc(String(r[campoId])), r, {merge:true});
      });
      await lote.commit();
    }
    return registros.length;
  }

  async function contar(coleccion){
    if(modo === "demo") return LS.leer(coleccion).length;
    const s = await db.collection(coleccion).get();
    return s.size;
  }

  /* ══════════════ ARCHIVOS ══════════════ */
  /* En modo demo se guarda como base64 comprimido dentro del registro. */
  async function subirArchivo(file, ruta){
    if(modo === "demo"){
      if(file.type.startsWith("image/")) return await UI.comprimirImagen(file);
      throw new Error("En modo demo solo se pueden guardar imágenes (los PDF requieren Firebase Storage).");
    }
    const ref = storage.ref().child(ruta + "/" + Date.now() + "_" + file.name.replace(/[^\w.\-]/g,"_"));
    const snap = await ref.put(file);
    return await snap.ref.getDownloadURL();
  }

  /* ══════════════ AUTENTICACIÓN ══════════════ */
  let ultimoErrorPerfil = null;

  const authApi = {
    async entrar(email, pass){
      if(modo === "demo"){
        const u = LS.leer("usuarios").find(x => x.email.toLowerCase() === email.toLowerCase());
        if(!u) throw new Error("Usuario no registrado en el modo demo.");
        if(u.passDemo && u.passDemo !== pass) throw new Error("Contraseña incorrecta.");
        localStorage.setItem("gm_demo_sesion", u.id);
        return u;
      }
      ultimoErrorPerfil = null;
      const cred = await auth.signInWithEmailAndPassword(email, pass);
      /* onAuthStateChanged puede haber evaluado el perfil primero;
         si ya falló ahí, se usa ese mensaje que es el más preciso. */
      if(ultimoErrorPerfil) throw ultimoErrorPerfil;
      try{
        return await perfilDe(cred.user);
      }catch(e){
        throw ultimoErrorPerfil || e;
      }
    },
    async salir(){
      if(modo === "demo"){ localStorage.removeItem("gm_demo_sesion"); return; }
      await auth.signOut();
    },
    alCambiar(cb){
      if(modo === "demo"){
        const id = localStorage.getItem("gm_demo_sesion");
        const u = id ? LS.leer("usuarios").find(x => x.id === id) : null;
        setTimeout(() => cb(u || null), 60);
        return;
      }
      auth.onAuthStateChanged(async user => {
        if(!user) return cb(null);
        try{
          cb(await perfilDe(user));
        }catch(e){
          /* Sin esto, un perfil rechazado dejaba la aplicación
             congelada en la pantalla de carga. */
          console.error("Perfil de usuario:", e);
          ultimoErrorPerfil = e;
          try{ await auth.signOut(); }catch(_){}
          cb(null);
        }
      });
    },
    get ultimoError(){ return ultimoErrorPerfil; },
    limpiarUltimoError(){ ultimoErrorPerfil = null; },
    async crearUsuario(email, pass, perfil){
      if(modo === "demo"){
        return await guardar("usuarios", { ...perfil, email, passDemo:pass, activo:true });
      }
      /* Nota: crear el usuario aquí cerraría la sesión del administrador.
         Se usa una app secundaria de Firebase para evitarlo. */
      const secundaria = firebase.apps.find(a => a.name === "alta")
        || firebase.initializeApp(firebaseConfig, "alta");
      const cred = await secundaria.auth().createUserWithEmailAndPassword(email, pass);
      await guardarConId("usuarios", cred.user.uid, { ...perfil, email, activo:true, creadoEn:new Date().toISOString() });
      await secundaria.auth().signOut();
      return { id:cred.user.uid, email, ...perfil };
    }
  };

  async function perfilDe(user){
    const ref = db.collection("usuarios").doc(user.uid);
    const doc = await ref.get();
    if(doc.exists) return { id:user.uid, email:user.email, ...doc.data() };

    /* El perfil todavía no existe. Solo se crea automáticamente si el
       correo está en la lista de administradores iniciales (config.js).
       No se consulta la colección completa: las reglas de seguridad
       —correctamente— no permiten listar usuarios sin perfil previo. */
    const email = String(user.email || "").toLowerCase();
    const lista = (typeof ADMINS_INICIALES !== "undefined" ? ADMINS_INICIALES : [])
      .map(x => String(x).trim().toLowerCase());

    if(!lista.includes(email)){
      await auth.signOut();
      const err = new Error(
        "Tu cuenta existe en Firebase pero todavía no tiene un perfil en el sistema.\n\n" +
        "· Si eres el administrador: escribe tu correo (" + email + ") en la lista " +
        "ADMINS_INICIALES del archivo js/config.js y en la función esAdminInicial() de firestore.rules.\n" +
        "· Si eres personal de la planta: pide al Jefe de Mantenimiento que te registre en «Usuarios y accesos»."
      );
      err.code = "perfil-inexistente";
      throw err;
    }

    const perfil = {
      nombre: user.displayName || email.split("@")[0],
      email: user.email,
      rol: "admin",
      activo: true,
      creadoEn: new Date().toISOString()
    };
    await ref.set(perfil);
    return { id:user.uid, ...perfil };
  }

  /* ══════════════ CARGA INICIAL ══════════════ */
  let sembrando = null;
  async function sembrarSiHaceFalta(){
    if(sembrando) return sembrando;          // evita ejecuciones simultáneas
    sembrando = (async () => {
    /* Ubicaciones · el código del área es el id del documento,
       así que volver a ejecutarlo nunca duplica registros. */
    const ubis = await listar("ubicaciones", {orden:"codigo", dir:"asc"});
    if(ubis.length === 0){
      const regs = AREAS_PLANTA.map((a, i) => ({
        codigo:a.codigo, nombre:a.nombre, zona:a.zona, orden:i, activo:true
      }));
      await guardarLoteConId("ubicaciones", regs, "codigo");
    }
    /* Tipos de equipo */
    const tipos = await listar("tipos_equipo", {orden:"codigo", dir:"asc"});
    if(tipos.length === 0){
      await guardarLoteConId("tipos_equipo", TIPOS_EQUIPO.map(t => ({ ...t, activo:true })), "codigo");
    }
    /* Usuarios de prueba (solo modo demo) */
    if(modo === "demo"){
      const us = LS.leer("usuarios");
      if(us.length === 0){
        await guardarLote("usuarios", [
          { nombre:"Elvis Mendoza",   email:"admin@planta.com",        rol:"admin",        passDemo:"demo", activo:true, area:"Mantenimiento" },
          { nombre:"Ana Planificadora",email:"planificador@planta.com",rol:"planificador", passDemo:"demo", activo:true, area:"Mantenimiento" },
          { nombre:"Luis Técnico",    email:"tecnico@planta.com",      rol:"tecnico",      passDemo:"demo", activo:true, area:"Mantenimiento" },
          { nombre:"Rosa Producción", email:"produccion@planta.com",   rol:"solicitante",  passDemo:"demo", activo:true, area:"Producción" }
        ]);
      }
    }
    })();
    try{ return await sembrando; }
    finally{ sembrando = null; }
  }

  /* ══════════════ API PÚBLICA ══════════════ */
  return {
    get modo(){ return modo; },
    esDemo: () => modo === "demo",
    listar, obtener, guardar, guardarConId, eliminar, guardarLote, guardarLoteConId, contar,
    subirArchivo, auth:authApi, sembrarSiHaceFalta,
    limpiarDemo(){
      Object.keys(localStorage).filter(k => k.startsWith("gm_demo_")).forEach(k => localStorage.removeItem(k));
    }
  };
})();

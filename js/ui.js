/* ============================================================
   UI · utilidades de interfaz reutilizables
   ============================================================ */
const UI = {

  /* ---------- Selectores ---------- */
  $  : (s, ctx=document) => ctx.querySelector(s),
  $$ : (s, ctx=document) => Array.from(ctx.querySelectorAll(s)),

  /* ---------- Escapado seguro de HTML ---------- */
  esc(t){
    if(t === null || t === undefined) return "";
    return String(t).replace(/[&<>"']/g, c => (
      {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]
    ));
  },

  /* ---------- Notificaciones ---------- */
  toast(mensaje, tipo="ok", ms=3200){
    const raiz = UI.$("#toast-raiz");
    const el = document.createElement("div");
    el.className = "toast " + tipo;
    el.innerHTML = UI.esc(mensaje);
    raiz.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .25s, transform .25s";
      el.style.opacity = 0; el.style.transform = "translateX(24px)";
      setTimeout(() => el.remove(), 260);
    }, ms);
  },

  /* ---------- Modal genérico ----------
     UI.modal({titulo, cuerpo(HTML), ancho, botones:[{txt,clase,accion(cerrar,modalEl)}]})
     Devuelve el elemento del modal.                             */
  modal({titulo, cuerpo, botones=[], ancho=false, alAbrir}){
    const fondo = document.createElement("div");
    fondo.className = "modal-fondo";
    fondo.innerHTML = `
      <div class="modal ${ancho ? "ancho" : ""}">
        <div class="modal-cab">
          <h3>${UI.esc(titulo)}</h3>
          <button class="icono-btn" data-cerrar>✕</button>
        </div>
        <div class="modal-cuerpo">${cuerpo}</div>
        ${botones.length ? `<div class="modal-pie"></div>` : ""}
      </div>`;
    const cerrar = () => fondo.remove();
    fondo.querySelector("[data-cerrar]").onclick = cerrar;
    fondo.addEventListener("mousedown", e => { if(e.target === fondo) cerrar(); });

    const pie = fondo.querySelector(".modal-pie");
    botones.forEach(b => {
      const btn = document.createElement("button");
      btn.className = "btn " + (b.clase || "btn-secundario");
      btn.textContent = b.txt;
      btn.onclick = () => b.accion ? b.accion(cerrar, fondo) : cerrar();
      pie.appendChild(btn);
    });

    UI.$("#modal-raiz").appendChild(fondo);
    if(alAbrir) alAbrir(fondo, cerrar);
    return { el:fondo, cerrar };
  },

  /* ---------- Confirmación ---------- */
  confirmar(texto, alAceptar, {titulo="Confirmar", txtOk="Sí, continuar", peligro=true} = {}){
    UI.modal({
      titulo,
      cuerpo:`<p style="font-size:14.5px;line-height:1.6">${texto}</p>`,
      botones:[
        { txt:"Cancelar", clase:"btn-secundario" },
        { txt:txtOk, clase: peligro ? "btn-peligro" : "btn-primario",
          accion:(cerrar)=>{ cerrar(); alAceptar(); } }
      ]
    });
  },

  /* ---------- Estado vacío ---------- */
  vacio({emoji="📭", titulo="Sin registros", texto="", boton}){
    return `<div class="vacio">
      <span class="emoji">${emoji}</span>
      <h3>${UI.esc(titulo)}</h3>
      <p>${UI.esc(texto)}</p>
      ${boton ? `<button class="btn btn-primario" id="${boton.id}">${UI.esc(boton.txt)}</button>` : ""}
    </div>`;
  },

  /* ---------- Cargando ---------- */
  cargando(txt="Cargando…"){
    return `<div class="vacio"><span class="emoji">⏳</span><p>${UI.esc(txt)}</p></div>`;
  },

  /* ---------- Formato de fechas ---------- */
  fecha(v){
    if(!v) return "—";
    const d = (v instanceof Date) ? v : (v.toDate ? v.toDate() : new Date(v));
    if(isNaN(d)) return "—";
    return d.toLocaleDateString("es-PE", {day:"2-digit", month:"short", year:"numeric"});
  },
  fechaHora(v){
    if(!v) return "—";
    const d = (v instanceof Date) ? v : (v.toDate ? v.toDate() : new Date(v));
    if(isNaN(d)) return "—";
    return d.toLocaleString("es-PE", {day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit"});
  },
  hoyISO(){ return new Date().toISOString().slice(0,10); },

  /* ---------- Iniciales para el avatar ---------- */
  iniciales(nombre=""){
    const p = String(nombre).trim().split(/\s+/).filter(Boolean);
    const a = p[0] ? p[0][0] : "U";
    const b = p[1] ? p[1][0] : "";
    return (a + b).toUpperCase();
  },

  /* ---------- Descargar archivo generado ---------- */
  descargar(nombre, contenido, tipo="text/csv;charset=utf-8;"){
    const blob = new Blob(["﻿" + contenido], {type:tipo});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
  },

  /* ---------- CSV ---------- */
  aCSV(filas){
    return filas.map(f => f.map(c => {
      const s = (c === null || c === undefined) ? "" : String(c);
      return /[",;\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
    }).join(";")).join("\r\n");
  },
  deCSV(texto){
    const filas = []; let fila = []; let campo = ""; let comillas = false;
    texto = texto.replace(/^﻿/, "").replace(/\r\n/g,"\n").replace(/\r/g,"\n");
    for(let i=0; i<texto.length; i++){
      const c = texto[i];
      if(comillas){
        if(c === '"' && texto[i+1] === '"'){ campo += '"'; i++; }
        else if(c === '"'){ comillas = false; }
        else campo += c;
      } else {
        if(c === '"') comillas = true;
        else if(c === ";" || c === ","){ fila.push(campo); campo = ""; }
        else if(c === "\n"){ fila.push(campo); filas.push(fila); fila = []; campo = ""; }
        else campo += c;
      }
    }
    if(campo !== "" || fila.length){ fila.push(campo); filas.push(fila); }
    return filas.filter(f => f.some(x => String(x).trim() !== ""));
  },

  /* ---------- Tema ---------- */
  tema: {
    aplicar(t){
      document.documentElement.setAttribute("data-tema", t);
      localStorage.setItem("gm_tema", t);
      const ico = t === "oscuro" ? "☀️" : "🌙";
      UI.$$("#btn-tema, #tema-login").forEach(b => b.textContent = ico);
      const meta = document.querySelector('meta[name="theme-color"]');
      if(meta) meta.content = t === "oscuro" ? "#0b1220" : "#ffffff";
    },
    alternar(){
      const actual = document.documentElement.getAttribute("data-tema") || "claro";
      UI.tema.aplicar(actual === "oscuro" ? "claro" : "oscuro");
    },
    iniciar(){
      const guardado = localStorage.getItem("gm_tema");
      const prefiere = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "oscuro" : "claro";
      UI.tema.aplicar(guardado || prefiere);
    }
  },

  /* ---------- Imagen a base64 comprimida (modo demo / respaldo) ---------- */
  comprimirImagen(file, maxLado=900, calidad=0.72){
    return new Promise((res, rej) => {
      const lector = new FileReader();
      lector.onload = e => {
        const img = new Image();
        img.onload = () => {
          let {width:w, height:h} = img;
          if(w > maxLado || h > maxLado){
            const f = maxLado / Math.max(w,h); w = Math.round(w*f); h = Math.round(h*f);
          }
          const cv = document.createElement("canvas");
          cv.width = w; cv.height = h;
          cv.getContext("2d").drawImage(img, 0, 0, w, h);
          res(cv.toDataURL("image/jpeg", calidad));
        };
        img.onerror = rej;
        img.src = e.target.result;
      };
      lector.onerror = rej;
      lector.readAsDataURL(file);
    });
  }
};

# Guía paso a paso · Conectar Firebase y publicar en GitHub

Tiempo estimado: 20 minutos. No necesitas saber programar; solo copiar y pegar.

---

## Parte 1 · Probar el sistema ahora mismo (sin configurar nada)

El sistema ya funciona en **modo demo**: los datos se guardan solo en tu navegador.

1. Abre la carpeta del proyecto.
2. Haz doble clic en **`index.html`**.
3. En la pantalla de login, haz clic en cualquiera de los cuatro usuarios de prueba.

> Si algo no carga bien al abrir el archivo directamente, publica el proyecto en GitHub Pages (Parte 4) y ábrelo desde ahí. Es la forma correcta de usarlo.

Cuando conectes Firebase, el modo demo se apaga solo.

---

## Parte 2 · Crear el proyecto en Firebase

### 2.1 Crear el proyecto

1. Entra a **https://console.firebase.google.com** con tu cuenta de Google.
2. Clic en **Agregar proyecto**.
3. Nombre: `gmao-planta` (o el que prefieras). Siguiente.
4. Google Analytics: puedes **desactivarlo**, no hace falta. Crear proyecto.

### 2.2 Activar Authentication (usuarios y contraseñas)

1. Menú izquierdo → **Compilación → Authentication** → **Comenzar**.
2. Pestaña **Sign-in method** → clic en **Correo electrónico/contraseña**.
3. Activa el primer interruptor (**Habilitar**) y **Guardar**.
4. Ve a la pestaña **Users** → **Agregar usuario**:
   - Correo: tu correo de trabajo
   - Contraseña: la que quieras (mínimo 6 caracteres)
   - **Agregar usuario**

> El primer usuario que entre al sistema recibe automáticamente el rol **Jefe de Mantenimiento (admin)**. Desde ahí podrás crear al resto del personal sin volver a la consola de Firebase.

### 2.3 Activar Firestore (la base de datos)

1. Menú izquierdo → **Compilación → Firestore Database** → **Crear base de datos**.
2. Ubicación: **`southamerica-east1`** (São Paulo, la más cercana a Perú). *No se puede cambiar después.*
3. Modo: elige **Comenzar en modo de producción**. Crear.
4. Entra a la pestaña **Reglas**.
5. Borra todo lo que hay y pega el contenido completo del archivo **`firestore.rules`** de esta carpeta.
6. Clic en **Publicar**.

### 2.4 Activar Storage (fotos y archivos)

1. Menú izquierdo → **Compilación → Storage** → **Comenzar**.
2. Acepta la ubicación sugerida (la misma de Firestore) → Listo.
3. Pestaña **Reglas** → borra todo → pega el contenido del archivo **`storage.rules`** → **Publicar**.

> Storage puede pedirte activar la facturación (plan Blaze). El plan Blaze tiene una capa gratuita generosa: con el uso de una planta, el costo mensual suele ser de **US$ 0**. Si prefieres no activarlo por ahora, el sistema funciona igual: las fotos se guardarán comprimidas dentro de la base de datos.

### 2.5 Copiar las credenciales

1. Clic en el **engranaje ⚙️** (arriba a la izquierda) → **Configuración del proyecto**.
2. Baja hasta **Tus apps** → clic en el ícono **`</>`** (Web).
3. Sobrenombre de la app: `GMAO Web`. **No** marques Firebase Hosting. → **Registrar app**.
4. Aparecerá un bloque de código así:

```js
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "gmao-planta.firebaseapp.com",
  projectId: "gmao-planta",
  storageBucket: "gmao-planta.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

5. Abre el archivo **`js/config.js`** de esta carpeta con el Bloc de notas.
6. Reemplaza cada `"PEGAR_AQUI"` por el valor que te dio Firebase. **Respeta las comillas.**
7. Guarda el archivo.

Listo. Al recargar la página, el aviso de «Modo demo» desaparece y ya estás trabajando en la nube.

> **¿Es seguro que estas claves estén visibles?** Sí. Firebase está diseñado así: la `apiKey` solo identifica al proyecto, no da acceso. Quien protege los datos son las **reglas** que publicaste en los pasos 2.3 y 2.4.

---

## Parte 3 · Subir el proyecto a GitHub

### 3.1 Crear el repositorio

1. Entra a **https://github.com** → botón **+** (arriba a la derecha) → **New repository**.
2. Nombre: `gmao-planta`.
3. Visibilidad: **Private** si no quieres que nadie más lo vea (GitHub Pages en repos privados requiere plan de pago; si vas a usar Pages gratis, elige **Public** — recuerda que las reglas de Firebase son las que protegen los datos, no el repositorio).
4. **Create repository**.

### 3.2 Subir los archivos (sin usar comandos)

1. En el repositorio recién creado, clic en **uploading an existing file**.
2. Arrastra **todo el contenido** de la carpeta `Gestion del mantenimiento`:
   `index.html`, la carpeta `css`, la carpeta `js`, `firestore.rules`, `storage.rules` y los `.md`.
3. Abajo escribe un mensaje: `Módulo 1 · Inventario de equipos`.
4. **Commit changes**.

---

## Parte 4 · Publicar la aplicación (GitHub Pages)

1. En el repositorio → pestaña **Settings** → menú izquierdo **Pages**.
2. En *Source* elige **Deploy from a branch**.
3. Branch: **`main`** · carpeta: **`/ (root)`** → **Save**.
4. Espera 1 o 2 minutos y recarga. Aparecerá la dirección:

```
https://TU-USUARIO.github.io/gmao-planta/
```

Esa es la dirección que compartes con los técnicos y con Producción. Se abre igual en celular y en PC.

### 4.1 Autorizar el dominio en Firebase

Para que el login funcione desde esa dirección:

1. Firebase → **Authentication** → pestaña **Settings** → **Dominios autorizados**.
2. **Agregar dominio** → escribe `TU-USUARIO.github.io` → Agregar.

### 4.2 Acceso rápido desde el celular

Abre la dirección en el navegador del celular → menú **⋮** → **Agregar a pantalla de inicio**. Queda como una app.

---

## Parte 5 · Crear al resto del personal

Ya dentro del sistema, con tu usuario admin:

1. Menú lateral → **Usuarios y accesos** → **Nuevo usuario**.
2. Escribe nombre, correo, rol y una contraseña inicial.
3. Entrega esos datos a la persona.

Roles disponibles:

| Rol | Para quién | Qué puede hacer |
|---|---|---|
| 👑 Jefe de Mantenimiento | Tú | Todo, incluida la gestión de usuarios |
| 📋 Planificador / Supervisor | Supervisores | Equipos, planes, órdenes, almacén, reportes |
| 🔧 Técnico | Personal propio | Sus órdenes, formatos, lecturas, consumo de materiales |
| 🏭 Solicitante | Producción, Calidad | Crear y seguir solicitudes de trabajo |
| 🚚 Proveedor externo | Contratistas | Solo las órdenes que le asignaron |

---

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| Sigue diciendo «Modo demo» | Quedó algún `PEGAR_AQUI` en `js/config.js`, o no guardaste el archivo. |
| `auth/unauthorized-domain` al entrar | Falta agregar el dominio en Authentication → Settings → Dominios autorizados (paso 4.1). |
| `Missing or insufficient permissions` | No publicaste las reglas de `firestore.rules`, o tu usuario tiene `activo: false`. |
| No suben las fotos | Storage no está activado, o no publicaste `storage.rules`. |
| Página en blanco al abrir `index.html` | Ábrela desde GitHub Pages, o usa una extensión tipo *Live Server*. |

---

## Copia de seguridad

Desde **Inventario de equipos → Exportar** obtienes un CSV con todo el inventario. Conviene guardarlo una vez al mes.
Firebase también permite exportar la base completa desde la consola (Firestore → Importar/Exportar).

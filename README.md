# GMAO · Sistema de Gestión del Mantenimiento

Aplicación web para el control del mantenimiento de una planta de procesamiento pesquero:
inventario de equipos, plan de mantenimiento, órdenes de trabajo, formatos de campo,
monitoreo de equipos críticos, procesos especiales y almacén de materiales.

**Estado actual: Módulo 1 completo.**

---

## Empezar en 30 segundos

Haz doble clic en `index.html` y entra con cualquiera de los usuarios de prueba.
Arranca en **modo demo**: los datos se guardan en tu navegador, sin necesidad de configurar nada.

Para pasarlo a la nube y que lo use todo el personal, sigue **[GUIA-FIREBASE.md](GUIA-FIREBASE.md)**.

---

## Qué incluye el Módulo 1

| Función | Detalle |
|---|---|
| **Acceso y roles** | 5 perfiles con permisos diferenciados: admin, planificador, técnico, solicitante y proveedor |
| **Áreas de planta** | Las 49 áreas reales, agrupadas en 10 zonas. Editables |
| **Inventario de equipos** | Ficha técnica completa, foto, horómetro, equipo padre y datos de gestión |
| **Codificación automática** | Formato `ÁREA-TIPO-###` (ej. `SM1-COM-001`), correlativo por área y tipo |
| **Matriz de criticidad** | 4 factores ponderados → clase A / B / C |
| **Importar y exportar** | Carga masiva desde Excel (CSV) con validación fila por fila |
| **Tablero** | Indicadores de inventario, criticidad, disponibilidad y avance |
| **Diseño** | Tema claro y oscuro. Optimizado para celular en planta |

### Matriz de criticidad

| Factor | Peso |
|---|---|
| 🏭 Impacto en producción | 35 % |
| ⛑️ Riesgo de seguridad | 25 % |
| 🧪 Impacto en inocuidad | 25 % |
| 🔩 Disponibilidad de repuesto | 15 % |

Cada factor se califica de 1 a 4. El puntaje ponderado clasifica el equipo:

- **≥ 3.00 → Clase A · Crítico** — plan preventivo, monitoreo y repuesto asegurado
- **2.00 – 2.99 → Clase B · Importante** — plan preventivo estándar
- **< 2.00 → Clase C · General** — correctivo o inspección periódica

---

## Estructura del proyecto

```
├── index.html              Página única de la aplicación
├── css/styles.css          Estilos, tema claro/oscuro y responsive
├── js/
│   ├── config.js           ⚙️ ÚNICO archivo a editar (credenciales Firebase, roles, menú)
│   ├── catalogos.js        Áreas, tipos de equipo y matriz de criticidad
│   ├── datos.js            Capa de datos: Firebase o modo demo
│   ├── auth.js             Sesión, roles y permisos
│   ├── ui.js               Modales, avisos, CSV, tema, utilidades
│   ├── main.js             Arranque y navegación
│   └── vista-*.js          Una vista por módulo
├── firestore.rules         Reglas de seguridad de la base de datos
├── storage.rules           Reglas de seguridad de los archivos
└── GUIA-FIREBASE.md        Guía de instalación paso a paso
```

---

## Modelo de datos

| Colección | Contenido | Estado |
|---|---|---|
| `usuarios` | Perfil, rol y estado de cada persona | ✅ |
| `ubicaciones` | Áreas de planta agrupadas por zona | ✅ |
| `tipos_equipo` | Catálogo de tipos por familia | ✅ |
| `equipos` | Inventario con ficha técnica y criticidad | ✅ |
| `planes` / `tareas_plan` | Plan de mantenimiento | Módulo 2 |
| `ordenes_trabajo` | Órdenes preventivas y correctivas | Módulo 3 |
| `solicitudes` | Pedidos de otras áreas | Módulo 3 |
| `formatos` / `registros_formato` | Formatos del técnico | Módulo 4 |
| `lecturas` | Parámetros de equipos críticos | Módulo 4 |
| `materiales` / `movimientos_material` | Almacén | Módulo 5 |
| `procesos` | Congelamiento y otros | Módulo 6 |

Las reglas de seguridad de todas las colecciones ya están escritas en `firestore.rules`.

---

## Hoja de ruta

- [x] **Módulo 1** · Base, accesos, áreas e inventario de equipos
- [ ] **Módulo 2** · Plan de mantenimiento (calendario, horómetro, condición)
- [ ] **Módulo 3** · Órdenes de trabajo y solicitudes de otras áreas
- [ ] **Módulo 4** · Formatos del técnico y monitoreo de equipos críticos
- [ ] **Módulo 5** · Almacén, materiales y alarmas de stock
- [ ] **Módulo 6** · Procesos especiales (congelamiento)

---

## Tecnología

HTML, CSS y JavaScript sin compilación · Firebase (Authentication, Firestore, Storage) · GitHub Pages.
Sin dependencias que instalar: se edita con el Bloc de notas y se publica arrastrando archivos.

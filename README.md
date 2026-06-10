# BigQuery Release Notes Tracker

Una aplicación web moderna y de alta fidelidad construida con Python Flask (backend) y HTML, JavaScript y CSS vanilla (frontend) que descarga, analiza, almacena en caché y visualiza el feed oficial de notas de lanzamiento de BigQuery.

## 🚀 Características Principales

- **Consumo y Parseo de Feeds Dinámico:** Recupera automáticamente el feed Atom XML oficial, extrae metadatos y divide las estructuras HTML crudas para agrupar los cambios por fecha y categoría.
- **Categorización Granular:** Separación de las entradas diarias en actualizaciones individuales con etiquetas de colores:
  - **Feature** (Verde)
  - **Deprecation** (Rojo/Rosa)
  - **Changed** (Naranja/Ámbar)
  - **Notice** (Azul)
  - **General** (Morado)
- **Centro de Control Interactivo:**
  - **Búsqueda Instantánea:** Búsqueda en tiempo real desde el navegador por palabras clave dentro del contenido de las notas y las fechas.
  - **Filtros por Categoría:** Alterna rápidamente entre diferentes tipos de actualizaciones (por ejemplo, ver solo *Features* o *Deprecations*).
  - **Ordenamiento Temporal:** Cambia entre mostrar las notas más recientes primero (Newest First) o las más antiguas primero (Oldest First) instáneamente.
- **Dashboard de Estadísticas:** Tarjetas métricas superiores que muestran el número total de fechas de actualización, así como conteos detallados de características, depreciaciones y otros cambios en el feed.
- **Botón de Actualización con Spinner:** Sincronización en vivo con el feed de Google mediante una petición AJAX a `/api/notes?refresh=true` con indicadores de carga visual y alertas toast de éxito o error.
- **Compartición en X (Twitter):**
  - **Individual:** Comparte cualquier actualización específica haciendo clic en su botón de compartir individual.
  - **Selección Múltiple:** Haz clic en varias tarjetas de notas para seleccionarlas (se iluminarán y activarán su casilla de verificación). Una barra flotante se deslizará desde la parte inferior permitiéndote tuitear un resumen formateado de todas las notas seleccionadas, acortando fechas y texto automáticamente para ajustarse al límite estricto de 280 caracteres de Twitter.
- **Copiar al Portapapeles:** Botón individual en cada tarjeta que extrae el contenido de la nota limpio de etiquetas HTML y la copia al portapapeles con animación de éxito.
- **Exportar a CSV:** Botón en el centro de control que genera y descarga un archivo CSV con las notas de lanzamiento visibles actualmente, respetando tus búsquedas y filtros activos.
- **Interruptor de Tema Claro/Oscuro:** Botón en el encabezado que alterna fluidamente entre modo claro y oscuro, anulando las variables CSS raíz con persistencia local (`localStorage`).
- **Diseño Premium Glassmorphic:** Fondos degradados oscuros con orbes decorativos difuminados (`backdrop-filter`), transiciones animadas fluidas y fechas pegajosas (`sticky`) que se mantienen visibles en el lateral de la pantalla mientras navegas por los cambios del día.

---

## 📂 Arquitectura del Proyecto

El proyecto sigue una estructura limpia y estándar de Flask:

```text
prueba_agy/
├── .venv/                 # Entorno virtual de Python (contiene Flask, requests, bs4)
├── .gitignore             # Reglas de exclusión para Git
├── app.py                 # Servidor Flask (API, descarga de XML, parseo de HTML y caché)
├── README.md              # Documentación del proyecto (este archivo)
├── templates/
│   └── index.html         # Diseño y maquetación principal
└── static/
    ├── style.css          # Hojas de estilo (diseño oscuro, paneles glass, responsividad y animaciones)
    └── script.js          # Lógica del cliente (AJAX, motor de búsqueda/filtrado y compartición)
```

---

## 💻 Detalles Técnicos

### Backend
El backend de Flask utiliza `xml.etree.ElementTree` estándar para leer el feed XML Atom con namespaces, y `BeautifulSoup` (`html.parser`) para procesar el HTML embebido. Almacena los registros estructurados en un diccionario global en memoria (`cache`) para garantizar accesos veloces, y expone dos rutas:
1. `GET /`: Sirve la interfaz web.
2. `GET /api/notes`: Devuelve el JSON parseado. Permite `?refresh=true` para forzar descargas en vivo de los servidores de Google.

### Frontend
- **HTML:** Estructurado con etiquetas semánticas de HTML5 e iconos SVG limpios. Integra fuentes estilizadas de Google Fonts (Inter y Outfit).
- **CSS:** Una hoja de estilos detallada con temática oscura, orbes dinámicos de fondo y diseño adaptativo mediante Media Queries para una visualización excelente en computadoras, tabletas y celulares.
- **JavaScript:** Un motor de control de estado en JS Vanilla que administra las selecciones, filtros, re-ordenamientos de la línea de tiempo y llamadas a la API de forma reactiva y rápida.

---

## ⚙️ Ejecución de la Aplicación

Si necesitas levantar o reiniciar el servidor de manera local:

1. **Activa el Entorno Virtual:**
   ```powershell
   .venv\Scripts\activate
   ```
2. **Ejecuta el Servidor Flask:**
   ```powershell
   python app.py
   ```
3. **Abre el Navegador:**
   Ingresa a [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## 🌐 Repositorio en GitHub

El proyecto está disponible en:
🔗 [YamilVLR1104/agy-apps-event-talks-app](https://github.com/YamilVLR1104/agy-apps-event-talks-app)

# Test vocacional — EPG USIL

Cuestionario para colaboradores de USIL que, según sus respuestas (y opcionalmente su CV),
recomienda si su siguiente paso ideal es una **Maestría**, **Doctorado**, **Segunda Especialidad**,
**Programa Especializado** o **Curso de Especialización**, y sugiere hasta 3 programas concretos
del portafolio vigente.

Es un sitio 100% estático (HTML + CSS + JavaScript puro). No usa ningún modelo de IA, API paga,
ni backend propio — es gratis para siempre y no consume tokens ni créditos de ningún tipo.
Lo único externo son dos librerías públicas y gratuitas que se cargan desde un CDN para leer
CVs en PDF/Word directamente en el navegador (pdf.js y mammoth.js).

## ¿Cómo funciona?

1. El colaborador ingresa sus datos (nombre, teléfono, correo).
2. Responde 7 preguntas de opción múltiple. Cada opción suma puntos a 5 categorías.
3. Elige el área temática que más le interesa (derecho, salud, negocios, etc.).
4. Opcionalmente sube su CV (PDF, Word o TXT). El navegador extrae el texto y busca
   palabras clave relacionadas a cada categoría (sin IA, por coincidencia de texto) para
   afinar el puntaje.
5. Se calcula la categoría con más puntos y se muestra un gráfico de afinidad a las 5.
6. Se recomiendan hasta 3 programas de esa categoría (priorizando el área elegida).
7. Todo el resultado (datos, respuestas, resultado, top 3, y el CV si lo subió) se envía
   a una Google Sheet mediante un Google Apps Script — gratis y bajo tu propia cuenta de Google.

## Estructura del proyecto

```
index.html              punto de entrada
css/styles.css           estilos (colores de marca USIL)
js/config.js              URL de tu Google Apps Script (debes completarla)
js/data.js                 portafolio de programas (79 programas, desde el Excel)
js/questions.js             preguntas y puntajes por opción
js/scoring.js                 cálculo de resultado + selección de programas
js/cv-parser.js                 lectura de PDF/Word en el navegador
js/submit.js                     envío a Google Sheets
js/app.js                         lógica de navegación e interfaz
apps-script/Code.gs                código para pegar en Google Apps Script
```

## Paso 1 — Configurar dónde se guardan las respuestas (Google Sheets)

1. Crea una **Google Sheet** nueva (sheets.new), o usa una existente. Este será tu
   panel de respuestas del evento.
2. En el menú, ve a **Extensiones > Apps Script**.
3. Borra el contenido que aparece por defecto y pega **todo** el contenido del archivo
   [`apps-script/Code.gs`](apps-script/Code.gs) de este proyecto.
4. (Opcional) Si además quieres que los CVs subidos se guarden como archivos en Drive:
   - Crea una carpeta en tu Google Drive.
   - Abre la carpeta y copia el ID que aparece en la URL
     (`https://drive.google.com/drive/folders/`**`ESTE_ES_EL_ID`**).
   - Pégalo en la constante `DRIVE_FOLDER_ID` al inicio de `Code.gs`.
   - Si dejas `DRIVE_FOLDER_ID` vacío, igual se guardan todos los datos y respuestas en la
     hoja, solo que no se guarda el archivo del CV.
5. Guarda el proyecto de Apps Script (ícono de disquete).
6. Click en **Implementar > Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Descripción: la que quieras (ej. "Test vocacional evento EPG").
   - Ejecutar como: **Yo** (tu cuenta).
   - Quién tiene acceso: **Cualquier usuario**.
7. Autoriza los permisos que te pida Google (es tu propio script, es seguro).
8. Copia la **URL de la aplicación web** que te entrega al final (termina en `/exec`).

## Paso 2 — Conectar el sitio con tu Google Sheet

1. Abre [`js/config.js`](js/config.js).
2. Reemplaza `PEGA_AQUI_TU_URL_DE_APPS_SCRIPT` con la URL que copiaste en el paso anterior.
3. Guarda el archivo.

```js
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycb.../exec",
  EVENT_NAME: "Evento EPG USIL 2026",
};
```

> Nota: cada vez que hagas un cambio en `Code.gs` dentro de Apps Script, tienes que volver a
> **Implementar > Administrar implementaciones > editar (ícono de lápiz) > Nueva versión > Implementar**
> para que los cambios se reflejen en la URL ya publicada.

## Paso 3 — Actualizar la lista de programas (cuando cambien las fechas/portafolio)

La lista vive en [`js/data.js`](js/data.js) como un arreglo de objetos:

```js
{ "tipo": "PROGRAMA ESPECIALIZADO", "nombre": "CORPORATE COMPLIANCE", "eje": "DERECHO Y GOBIERNO CORPORATIVO" }
```

- `tipo` debe ser exactamente uno de: `MAESTRÍA`, `DOCTORADO`, `SEGUNDA ESPECIALIDAD`,
  `PROGRAMA ESPECIALIZADO`, `CURSO DE ESPECIALIZACIÓN`.
- `eje` debe ser exactamente uno de los 7 valores definidos en `EJES` dentro de `js/questions.js`.
- No se muestra la fecha de inicio ni el eje al usuario final — solo se usan internamente
  para elegir y ordenar las recomendaciones.

## Paso 4 — Publicar el sitio gratis en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser público o privado con GitHub Pro/Team).
2. Sube todos los archivos de esta carpeta al repositorio.
3. Ve a **Settings > Pages**.
4. En "Source", elige la rama `main` y la carpeta `/ (root)`.
5. Guarda. En unos minutos tu sitio estará disponible en
   `https://tu-usuario.github.io/nombre-del-repo/`.

También puedes abrir `index.html` directamente en tu navegador para probar localmente,
aunque para que la lectura de PDF/Word funcione sin errores de seguridad del navegador es
mejor servirlo con un servidor local simple, por ejemplo:

```bash
npx serve .
# o
python3 -m http.server 8080
```

## Personalización

- **Colores de marca**: definidos como variables CSS al inicio de `css/styles.css`
  (`--navy: #000d34`, `--blue: #00228e`).
- **Preguntas y puntajes**: `js/questions.js`.
- **Textos del resultado**: objeto `RESULT_COPY` al final de `js/app.js`.
- **Palabras clave del CV**: objeto `CV_KEYWORDS` en `js/scoring.js`.

## Privacidad

Los datos personales y el CV se envían directamente desde el navegador del colaborador hacia
tu propia Google Sheet — no pasan por ningún servidor de terceros ni se usan para entrenar
ningún modelo de IA. Recuerda informar a los colaboradores para qué se usarán sus datos,
conforme a la política de datos personales de USIL.

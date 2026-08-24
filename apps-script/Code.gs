/**
 * Test vocacional EPG USIL — receptor de respuestas.
 *
 * Cómo usar (ver README.md para el paso a paso con capturas):
 * 1. Crea una Hoja de cálculo de Google nueva (o usa una existente).
 * 2. Extensiones > Apps Script.
 * 3. Borra el contenido de Code.gs y pega este archivo completo.
 * 4. (Opcional) Si quieres guardar los CVs en Drive, crea una carpeta,
 *    copia su ID desde la URL y pégalo en DRIVE_FOLDER_ID abajo.
 * 5. Implementar > Nueva implementación > tipo "Aplicación web".
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquier usuario
 * 6. Copia la URL de la Web App y pégala en js/config.js (APPS_SCRIPT_URL).
 */

// Pega aquí el ID de una carpeta de Drive si quieres guardar los CVs.
// Déjalo vacío ("") si no quieres guardar los archivos, solo los datos.
const DRIVE_FOLDER_ID = "";

const SHEET_NAME = "Respuestas";

const HEADERS = [
  "Fecha",
  "Evento",
  "Nombre",
  "Teléfono",
  "Correo",
  "Área de interés",
  "Resultado (tipo)",
  "Afinidad Maestría %",
  "Afinidad Doctorado %",
  "Afinidad Segunda Especialidad %",
  "Afinidad Programa Especializado %",
  "Afinidad Curso Especializado %",
  "Programa sugerido 1",
  "Programa sugerido 2",
  "Programa sugerido 3",
  "Respuestas del test",
  "CV (link)",
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveCvToDrive_(payload) {
  if (!DRIVE_FOLDER_ID || !payload.cvBase64 || !payload.cvNombreArchivo) return "";
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const bytes = Utilities.base64Decode(payload.cvBase64);
    const safeName =
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss") +
      "_" +
      (payload.nombre || "sin_nombre").replace(/[^a-zA-Z0-9_ -]/g, "") +
      "_" +
      payload.cvNombreArchivo;
    const blob = Utilities.newBlob(bytes, MimeType.PLAIN_TEXT, safeName)
      .setContentType(guessMimeType_(payload.cvNombreArchivo));
    const file = folder.createFile(blob);
    return file.getUrl();
  } catch (err) {
    console.error("Error guardando CV en Drive: " + err);
    return "";
  }
}

function guessMimeType_(filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "text/plain";
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    const cvLink = saveCvToDrive_(payload);

    const respuestasTexto = (payload.respuestas || [])
      .map((r) => `${r.pregunta}: ${r.respuesta}`)
      .join(" | ");

    const afinidad = payload.afinidad || {};

    sheet.appendRow([
      new Date(),
      payload.evento || "",
      payload.nombre || "",
      payload.telefono || "",
      payload.correo || "",
      payload.eje || "",
      payload.resultadoTipo || "",
      afinidad.M != null ? afinidad.M : "",
      afinidad.D != null ? afinidad.D : "",
      afinidad.S != null ? afinidad.S : "",
      afinidad.P != null ? afinidad.P : "",
      afinidad.C != null ? afinidad.C : "",
      payload.programaSugerido1 || "",
      payload.programaSugerido2 || "",
      payload.programaSugerido3 || "",
      respuestasTexto,
      cvLink,
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Útil para probar que el despliegue funciona: abre la URL de la Web App
// en el navegador (GET) y deberías ver este mensaje.
function doGet(e) {
  return ContentService.createTextOutput(
    "El endpoint del test vocacional EPG USIL está activo. Usa POST para enviar datos."
  );
}

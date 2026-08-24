// Envío del resultado a Google Sheets vía Google Apps Script Web App.
// Se usa POST con text/plain (para evitar el preflight CORS que Apps Script
// no siempre maneja bien) y no se lee la respuesta con detalle: si el fetch
// no lanza error, se asume que Apps Script recibió la solicitud.

async function submitResult(payload) {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("PEGA_AQUI")) {
    console.warn(
      "CONFIG.APPS_SCRIPT_URL no está configurado todavía. El resultado NO se guardó en la hoja de cálculo. Revisa el README."
    );
    return { ok: false, reason: "no-config" };
  }

  try {
    await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Apps Script Web Apps no siempre exponen CORS; no-cors evita el bloqueo
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    // con mode:"no-cors" no podemos leer el body de la respuesta,
    // así que asumimos éxito si no hubo excepción de red.
    return { ok: true };
  } catch (err) {
    console.error("Error enviando resultado a Google Sheets:", err);
    return { ok: false, reason: "network-error", error: err };
  }
}

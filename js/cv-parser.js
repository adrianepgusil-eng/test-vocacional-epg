// Extracción de texto de CV (PDF o Word) 100% en el navegador.
// No usa IA ni servicios externos de pago: pdf.js y mammoth.js corren
// localmente y solo se usan para obtener texto plano que luego se
// compara contra palabras clave (ver scoring.js).

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith(".pdf")) {
      return await extractTextFromPdf(file);
    }
    if (name.endsWith(".docx")) {
      return await extractTextFromDocx(file);
    }
    if (name.endsWith(".txt")) {
      return await file.text();
    }
    // Word antiguo (.doc) u otros formatos no soportados en el navegador:
    // no se puede leer sin backend/IA, se omite el análisis de texto.
    return "";
  } catch (err) {
    console.warn("No se pudo leer el CV, se continúa sin ese análisis:", err);
    return "";
  }
}

async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = "";
  const maxPages = Math.min(pdf.numPages, 10); // suficiente para un CV
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return text;
}

async function extractTextFromDocx(file) {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value || "";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result = "data:<mime>;base64,XXXX" — nos quedamos solo con XXXX
      const base64 = reader.result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

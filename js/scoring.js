// Motor de puntaje: combina respuestas del test + señales del CV (si lo hay)
// y produce el tipo de programa ganador + un ranking de programas sugeridos.

const CV_KEYWORDS = {
  M: ["mba", "maestria", "gerente", "gerencia", "gestion estrategica", "director", "jefatura", "jefe de", "subgerente"],
  D: ["doctorado", "phd", "ph.d", "investigador", "investigacion cientifica", "publicaciones", "paper", "articulo cientifico", "docente universitario", "tesis doctoral", "scopus", "scielo", "postdoctoral"],
  S: ["segunda especialidad", "residentado", "especialidad medica", "titulo profesional", "especialista en"],
  P: ["diplomado", "programa especializado", "certificacion profesional", "gestion de proyectos", "transformacion digital", "certificado internacional"],
  C: ["curso", "taller", "workshop", "capacitacion", "webinar", "bootcamp"],
};

// Tope de puntos que el CV puede aportar por categoría, para que "afine"
// el resultado del cuestionario sin dominarlo.
const CV_MAX_POINTS_PER_CATEGORY = 6;

function normalizeText(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // quita tildes
}

function scoreCvText(text) {
  const norm = normalizeText(text);
  const points = { M: 0, D: 0, S: 0, P: 0, C: 0 };
  const matched = { M: [], D: [], S: [], P: [], C: [] };

  Object.keys(CV_KEYWORDS).forEach((tipo) => {
    CV_KEYWORDS[tipo].forEach((kw) => {
      const kwNorm = normalizeText(kw);
      if (norm.includes(kwNorm)) {
        points[tipo] = Math.min(points[tipo] + 2, CV_MAX_POINTS_PER_CATEGORY);
        matched[tipo].push(kw);
      }
    });
  });

  return { points, matched };
}

// answers: array alineado a las preguntas "scored" de STEPS, cada una es el
// índice de la opción elegida (o null si se saltó).
function computeScores(answers, cvPoints) {
  const totals = { M: 0, D: 0, S: 0, P: 0, C: 0 };

  const scoredSteps = STEPS.filter((s) => s.type === "scored");
  scoredSteps.forEach((step, i) => {
    const chosenIndex = answers[step.id];
    if (chosenIndex === null || chosenIndex === undefined) return;
    const opt = step.options[chosenIndex];
    if (!opt) return;
    Object.keys(opt.points).forEach((k) => {
      totals[k] += opt.points[k];
    });
  });

  if (cvPoints) {
    Object.keys(cvPoints).forEach((k) => {
      totals[k] += cvPoints[k];
    });
  }

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  const pct = {};
  Object.keys(totals).forEach((k) => {
    pct[k] = Math.round((totals[k] / grandTotal) * 100);
  });

  const ranked = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
  const winnerKey = ranked[0];

  return { totals, pct, ranked, winnerKey };
}

// Elige hasta 3 programas del tipo ganador, priorizando los del eje elegido.
function pickTopPrograms(winnerKey, ejeElegido, max) {
  max = max || 3;
  const dataTipo = TIPOS[winnerKey].dataTipo;
  const delTipo = PROGRAMAS.filter((p) => p.tipo === dataTipo);

  const delEje = delTipo.filter((p) => p.eje === ejeElegido);
  const otros = delTipo.filter((p) => p.eje !== ejeElegido);

  // pequeño barajado determinístico por nombre para variar el orden dentro
  // de un mismo eje sin depender de Math.random (más estable de depurar)
  const ordered = delEje.concat(otros);
  return ordered.slice(0, max);
}

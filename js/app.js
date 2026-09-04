// Controlador principal: navegación entre pasos, validación, y orquestación
// del cálculo de resultado + envío a Google Sheets.

const stage = document.getElementById("stage");
const progressFill = document.getElementById("progressFill");
const stepCountEl = document.getElementById("stepCount");

const state = {
  index: 0,
  datos: { nombre: "", telefono: "", correo: "" },
  answers: {}, // { [stepId]: optionIndex }
  eje: null,
  cvFile: null,
  cvText: "",
};

function totalSteps() {
  return STEPS.length;
}

function updateChrome() {
  const pct = Math.round(((state.index) / (totalSteps())) * 100);
  progressFill.style.width = pct + "%";
  stepCountEl.textContent = `${Math.min(state.index + 1, totalSteps())} / ${totalSteps()}`;
}

function goTo(index) {
  state.index = Math.max(0, Math.min(index, STEPS.length - 1));
  render();
}

function next() {
  if (state.index === STEPS.length - 1) {
    finishAndSubmit();
    return;
  }
  goTo(state.index + 1);
}

function back() {
  goTo(state.index - 1);
}

function isStepAnswered(step) {
  if (step.type === "datos") {
    const d = state.datos;
    return (
      d.nombre.trim().length > 1 &&
      d.telefono.trim().length >= 6 &&
      /\S+@\S+\.\S+/.test(d.correo.trim())
    );
  }
  if (step.type === "scored") {
    return state.answers[step.id] !== undefined && state.answers[step.id] !== null;
  }
  if (step.type === "eje") {
    return !!state.eje;
  }
  if (step.type === "cv") {
    return true; // siempre opcional
  }
  return true;
}

function render() {
  const step = STEPS[state.index];
  updateChrome();

  const wrap = document.createElement("div");
  wrap.className = "card step-enter";

  if (step.type === "datos") {
    wrap.appendChild(renderDatosStep(step));
  } else if (step.type === "scored") {
    wrap.appendChild(renderScoredStep(step));
  } else if (step.type === "eje") {
    wrap.appendChild(renderEjeStep(step));
  } else if (step.type === "cv") {
    wrap.appendChild(renderCvStep(step));
  }

  wrap.appendChild(renderNav(step));

  stage.innerHTML = "";
  stage.appendChild(wrap);
}

function renderHeading(step) {
  const frag = document.createDocumentFragment();
  const title = document.createElement("h1");
  title.className = "question-title";
  title.textContent = step.title;
  frag.appendChild(title);
  if (step.subtitle) {
    const sub = document.createElement("p");
    sub.className = "question-subtitle";
    sub.textContent = step.subtitle;
    frag.appendChild(sub);
  }
  return frag;
}

// ---------- Paso: datos personales ----------

function renderDatosStep(step) {
  const container = document.createElement("div");
  container.appendChild(renderHeading(step));

  const group = document.createElement("div");
  group.className = "field-group";

  const fields = [
    {
      key: "nombre",
      label: "Nombres y apellidos",
      type: "text",
      placeholder: "Ej. María Fernández",
      validate: (v) => (v.trim().length > 1 ? "" : "Ingresa tu nombre completo."),
    },
    {
      key: "telefono",
      label: "Celular / WhatsApp",
      type: "tel",
      placeholder: "Ej. 987 654 321",
      validate: (v) => (v.trim().length >= 6 ? "" : "Ingresa un número de celular válido."),
    },
    {
      key: "correo",
      label: "Correo institucional",
      type: "email",
      placeholder: "Ej. nombre@usil.edu.pe",
      validate: (v) => (/\S+@\S+\.\S+/.test(v.trim()) ? "" : "Ingresa un correo válido."),
    },
  ];

  fields.forEach((f) => {
    const fieldEl = document.createElement("div");
    fieldEl.className = "field";

    const label = document.createElement("label");
    label.setAttribute("for", `field-${f.key}`);
    label.innerHTML = `${f.label} <span class="req-mark">*</span>`;

    const input = document.createElement("input");
    input.type = f.type;
    input.id = `field-${f.key}`;
    input.placeholder = f.placeholder;
    input.value = state.datos[f.key];
    input.autocomplete = "off";
    input.required = true;

    const error = document.createElement("div");
    error.className = "field-error";
    error.id = `error-${f.key}`;

    input.addEventListener("input", (e) => {
      state.datos[f.key] = e.target.value;
      if (input.classList.contains("invalid")) {
        const msg = f.validate(e.target.value);
        input.classList.toggle("invalid", !!msg);
        error.textContent = msg;
      }
      refreshNavState();
    });

    input.addEventListener("blur", (e) => {
      const msg = f.validate(e.target.value);
      input.classList.toggle("invalid", !!msg);
      error.textContent = msg;
    });

    fieldEl.appendChild(label);
    fieldEl.appendChild(input);
    fieldEl.appendChild(error);
    group.appendChild(fieldEl);
  });

  container.appendChild(group);
  return container;
}

// ---------- Paso: pregunta con opciones (scored) ----------

const LETTERS = ["A", "B", "C", "D", "E"];

function renderScoredStep(step) {
  const container = document.createElement("div");
  container.appendChild(renderHeading(step));

  const opts = document.createElement("div");
  opts.className = "options";

  step.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    if (state.answers[step.id] === i) btn.classList.add("selected");

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = LETTERS[i] || "";

    const dot = document.createElement("span");
    dot.className = "option-dot";

    const text = document.createElement("span");
    text.textContent = opt.text;

    btn.appendChild(letter);
    btn.appendChild(dot);
    btn.appendChild(text);

    btn.addEventListener("click", () => {
      state.answers[step.id] = i;
      render();
    });

    opts.appendChild(btn);
  });

  container.appendChild(opts);
  return container;
}

// ---------- Paso: área temática (eje) ----------

function renderEjeStep(step) {
  const container = document.createElement("div");
  container.appendChild(renderHeading(step));

  const opts = document.createElement("div");
  opts.className = "options";

  EJES.forEach((eje) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    if (state.eje === eje) btn.classList.add("selected");

    const dot = document.createElement("span");
    dot.className = "option-dot";

    const text = document.createElement("span");
    text.textContent = EJE_LABELS[eje] || eje;

    btn.appendChild(dot);
    btn.appendChild(text);

    btn.addEventListener("click", () => {
      state.eje = eje;
      render();
    });

    opts.appendChild(btn);
  });

  container.appendChild(opts);
  return container;
}

// ---------- Paso: CV (opcional) ----------

function renderCvStep(step) {
  const container = document.createElement("div");
  container.appendChild(renderHeading(step));

  const dz = document.createElement("label");
  dz.className = "dropzone";
  dz.innerHTML = `
    <svg class="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
      <path d="M12 15V4M12 4l-4 4M12 4l4 4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <div class="dropzone-title">Sube tu CV</div>
    <div class="dropzone-sub">PDF, Word (.docx) o TXT — máx. 8 MB</div>
    <input type="file" accept=".pdf,.docx,.txt" id="cvInput" />
  `;

  const status = document.createElement("div");
  status.className = "cv-status";
  status.id = "cvStatus";

  const input = dz.querySelector("#cvInput");
  input.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      status.textContent = "El archivo pesa más de 8 MB, intenta con uno más liviano.";
      return;
    }
    state.cvFile = file;
    status.textContent = `Leyendo ${file.name}…`;
    renderFileChip(container, file, dz);
    try {
      state.cvText = await extractTextFromFile(file);
      status.textContent = state.cvText
        ? "CV leído correctamente. Se usará para afinar tu resultado."
        : "No pudimos leer el contenido de este archivo, pero igual continuaremos con tus respuestas.";
    } catch (err) {
      status.textContent = "No pudimos leer este archivo, pero puedes continuar sin problema.";
    }
  });

  container.appendChild(dz);
  container.appendChild(status);
  return container;
}

function renderFileChip(container, file, dz) {
  const existing = container.querySelector(".file-chip");
  if (existing) existing.remove();

  const chip = document.createElement("div");
  chip.className = "file-chip";
  chip.innerHTML = `<span>📄 ${file.name}</span>`;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Quitar";
  removeBtn.addEventListener("click", () => {
    state.cvFile = null;
    state.cvText = "";
    chip.remove();
    const status = document.getElementById("cvStatus");
    if (status) status.textContent = "";
  });

  chip.appendChild(removeBtn);
  container.insertBefore(chip, container.querySelector(".cv-status"));
}

// ---------- Navegación ----------

function renderNav(step) {
  const nav = document.createElement("div");
  nav.className = "nav-row";

  const left = document.createElement("div");
  if (state.index > 0) {
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "btn btn-ghost";
    backBtn.textContent = "← Atrás";
    backBtn.addEventListener("click", back);
    left.appendChild(backBtn);
  }

  const right = document.createElement("div");
  right.style.display = "flex";
  right.style.gap = "16px";
  right.style.alignItems = "center";

  if (step.type === "cv" && !state.cvFile) {
    const skipBtn = document.createElement("button");
    skipBtn.type = "button";
    skipBtn.className = "btn btn-skip";
    skipBtn.textContent = "Continuar sin CV";
    skipBtn.addEventListener("click", next);
    right.appendChild(skipBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "btn btn-primary";
  nextBtn.id = "nextBtn";
  nextBtn.textContent = state.index === STEPS.length - 1 ? "Ver mi resultado" : "Continuar";
  nextBtn.disabled = !isStepAnswered(step);
  nextBtn.addEventListener("click", next);
  right.appendChild(nextBtn);

  nav.appendChild(left);
  nav.appendChild(right);
  return nav;
}

function refreshNavState() {
  const step = STEPS[state.index];
  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) nextBtn.disabled = !isStepAnswered(step);
}

// ---------- Finalizar: calcular, mostrar loading, enviar, mostrar resultado ----------

async function finishAndSubmit() {
  renderLoading();

  let cvPoints = null;
  let cvMatched = null;
  if (state.cvFile && state.cvText) {
    const cvScore = scoreCvText(state.cvText);
    cvPoints = cvScore.points;
    cvMatched = cvScore.matched;
  }

  const result = computeScores(state.answers, cvPoints);
  const topPrograms = pickTopPrograms(result.winnerKey, state.eje, 3);

  let cvBase64 = null;
  if (state.cvFile) {
    try {
      cvBase64 = await fileToBase64(state.cvFile);
    } catch (e) {
      cvBase64 = null;
    }
  }

  const payload = {
    evento: (typeof CONFIG !== "undefined" && CONFIG.EVENT_NAME) || "",
    nombre: state.datos.nombre.trim(),
    telefono: state.datos.telefono.trim(),
    correo: state.datos.correo.trim(),
    eje: EJE_LABELS[state.eje] || state.eje,
    respuestas: STEPS.filter((s) => s.type === "scored").map((s) => ({
      pregunta: s.title,
      respuesta:
        state.answers[s.id] !== undefined
          ? s.options[state.answers[s.id]].text
          : null,
    })),
    resultadoTipo: TIPOS[result.winnerKey].label,
    afinidad: result.pct,
    programaSugerido1: topPrograms[0] ? topPrograms[0].nombre : "",
    programaSugerido2: topPrograms[1] ? topPrograms[1].nombre : "",
    programaSugerido3: topPrograms[2] ? topPrograms[2].nombre : "",
    tieneCv: !!state.cvFile,
    cvNombreArchivo: state.cvFile ? state.cvFile.name : "",
    cvBase64: cvBase64,
    fechaEnvio: new Date().toISOString(),
  };

  const submission = await submitResult(payload);

  renderResult(result, topPrograms, submission);
}

function renderLoading() {
  stage.innerHTML = "";
  const view = document.createElement("div");
  view.className = "loading-view step-enter";
  view.innerHTML = `
    <div class="spinner"></div>
    <div class="question-subtitle" style="margin:0;">Calculando tu resultado…</div>
  `;
  stage.appendChild(view);
  progressFill.style.width = "100%";
}

// ---------- Resultado ----------

function renderResult(result, topPrograms, submission) {
  const view = document.createElement("div");
  view.className = "result-view step-enter";

  const confirm = document.createElement("div");
  confirm.className = "confirm-badge";
  confirm.textContent = submission.ok
    ? "✓ Tus respuestas fueron registradas"
    : "Tu resultado está listo";
  view.appendChild(confirm);

  const kicker = document.createElement("div");
  kicker.className = "result-kicker";
  kicker.textContent = `${state.datos.nombre.split(" ")[0] || ""}, tu perfil se inclina hacia:`;
  view.appendChild(kicker);

  const headline = document.createElement("h1");
  headline.className = "result-headline";
  headline.textContent = TIPOS[result.winnerKey].label;
  view.appendChild(headline);

  const lede = document.createElement("p");
  lede.className = "result-lede";
  lede.textContent = RESULT_COPY[result.winnerKey];
  view.appendChild(lede);

  const chart = document.createElement("div");
  chart.className = "affinity-chart";
  result.ranked.forEach((key) => {
    const row = document.createElement("div");
    row.className = "affinity-row" + (key === result.winnerKey ? " is-winner" : "");

    const label = document.createElement("div");
    label.className = "affinity-label";
    label.textContent = TIPOS[key].label;

    const track = document.createElement("div");
    track.className = "affinity-track";
    const fill = document.createElement("div");
    fill.className = "affinity-fill";
    track.appendChild(fill);

    const pct = document.createElement("div");
    pct.className = "affinity-pct";
    pct.textContent = `${result.pct[key]}%`;

    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(pct);
    chart.appendChild(row);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.width = `${result.pct[key]}%`;
      });
    });
  });
  view.appendChild(chart);

  if (topPrograms.length) {
    const heading = document.createElement("div");
    heading.className = "programs-heading";
    heading.textContent = "Programas recomendados para ti";
    view.appendChild(heading);

    const cards = document.createElement("div");
    cards.className = "program-cards";
    topPrograms.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "program-card";
      card.innerHTML = `
        <span class="program-rank">${i + 1}</span>
        <span class="program-info">
          <span class="program-name">${p.nombre}</span>
          <span class="program-type">${TIPO_LABEL_BY_DATA[p.tipo] || p.tipo}</span>
        </span>
      `;
      cards.appendChild(card);
    });
    view.appendChild(cards);
  }

  const footer = document.createElement("div");
  footer.className = "result-footer";
  footer.textContent =
    "Un asesor de la Escuela de Posgrado se pondrá en contacto contigo para contarte más sobre estos programas y sus próximas fechas de inicio.";
  view.appendChild(footer);

  const waTargets = getWhatsappTargets(topPrograms);
  if (waTargets.length) {
    const waSection = document.createElement("div");
    waSection.className = "whatsapp-section";

    const waIntro = document.createElement("div");
    waIntro.className = "whatsapp-intro";
    waIntro.textContent = "¿Prefieres escribir tú mismo/a? Contáctanos por WhatsApp:";
    waSection.appendChild(waIntro);

    const waButtons = document.createElement("div");
    waButtons.className = "whatsapp-buttons";

    waTargets.forEach((wa) => {
      const waItem = document.createElement("div");
      waItem.className = "whatsapp-item";

      const waCaption = document.createElement("div");
      waCaption.className = "whatsapp-caption";
      waCaption.textContent = wa.label;

      const waLink = document.createElement("a");
      waLink.className = "btn btn-whatsapp";
      waLink.href = buildWhatsappUrl(wa.number, state.datos.nombre, TIPOS[result.winnerKey].label, topPrograms[0]);
      waLink.target = "_blank";
      waLink.rel = "noopener";
      waLink.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.15c-.24.68-1.4 1.3-1.93 1.36-.5.06-1.02.27-3.4-.71-2.87-1.19-4.72-4.1-4.86-4.29-.14-.19-1.16-1.55-1.16-2.95 0-1.4.73-2.09.99-2.38.26-.28.57-.35.76-.35h.55c.18 0 .42-.03.65.5.24.55.81 1.9.88 2.04.07.14.12.3.02.49-.1.19-.15.3-.29.46-.14.16-.3.36-.43.48-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.63-.14.26.1 1.63.77 1.91.91.28.14.47.21.53.33.07.12.07.68-.17 1.36z"/>
        </svg>
        <span>Escríbenos por WhatsApp</span>
      `;

      waItem.appendChild(waCaption);
      waItem.appendChild(waLink);
      waButtons.appendChild(waItem);
    });

    waSection.appendChild(waButtons);
    view.appendChild(waSection);
  }

  stage.innerHTML = "";
  stage.appendChild(view);
  stepCountEl.textContent = "";
}

// Decide a qué número(s) de WhatsApp mandar al colaborador, revisando
// los 3 programas recomendados (no solo el #1), porque aunque los 3
// comparten el mismo tipo, pueden pertenecer a ejes distintos si no
// había suficientes programas de esa categoría dentro del área elegida.
//   - Programa/Curso/Maestría/Doctorado del eje Educación -> Facultad de Educación
//   - Programa Especializado o Curso de Especialización (cualquier otro eje) -> Programas y Cursos
//   - Maestría, Doctorado o Segunda Especialidad (cualquier otro eje) -> Posgrados
// Devuelve una lista sin duplicados, en el orden en que aparecen entre
// los 3 programas recomendados.
function targetForPrograma(programa) {
  const numbers = (typeof CONFIG !== "undefined" && CONFIG.WHATSAPP) || {};
  const esEducacion = programa.eje === "EDUCACIÓN" && programa.tipo !== "SEGUNDA ESPECIALIDAD";

  if (esEducacion && numbers.FACULTAD_EDUCACION) {
    return { number: numbers.FACULTAD_EDUCACION, label: "Facultad de Educación" };
  }
  if (
    (programa.tipo === "PROGRAMA ESPECIALIZADO" || programa.tipo === "CURSO DE ESPECIALIZACIÓN") &&
    numbers.PROGRAMAS_Y_CURSOS
  ) {
    return { number: numbers.PROGRAMAS_Y_CURSOS, label: "Programas y Cursos" };
  }
  if (numbers.POSGRADOS) {
    return { number: numbers.POSGRADOS, label: "Maestrías, Doctorados y Segunda Especialidad" };
  }
  return null;
}

function getWhatsappTargets(topPrograms) {
  const seen = new Set();
  const targets = [];
  (topPrograms || []).forEach((p) => {
    const t = targetForPrograma(p);
    if (t && !seen.has(t.number)) {
      seen.add(t.number);
      targets.push(t);
    }
  });
  return targets;
}

function buildWhatsappUrl(number, nombre, tipoLabel, topProgram) {
  const primerNombre = (nombre || "").trim().split(" ")[0] || "";
  let mensaje = `Hola, soy ${primerNombre || "un colaborador de USIL"}. Hice el test vocacional de EPG y mi resultado fue: ${tipoLabel}`;
  if (topProgram) {
    mensaje += ` (${topProgram.nombre})`;
  }
  mensaje += ". Quisiera más información.";
  return `https://wa.me/51${number}?text=${encodeURIComponent(mensaje)}`;
}

const TIPO_LABEL_BY_DATA = Object.values(TIPOS).reduce((acc, t) => {
  acc[t.dataTipo] = t.label;
  return acc;
}, {});

const RESULT_COPY = {
  M: "Buscas dar un salto en tu carrera con un grado académico que combine visión estratégica y gestión. Una maestría te da el marco y la red para llegar a posiciones de mayor liderazgo.",
  D: "Tu motor es generar conocimiento nuevo: investigar, publicar y enseñar al más alto nivel. Un doctorado es el camino natural para profundizar en tu campo.",
  S: "Ya tienes una formación profesional sólida y buscas profundizar y certificar oficialmente tu expertise dentro de tu propia carrera. Una segunda especialidad formaliza ese siguiente nivel.",
  P: "Quieres actualizarte de forma rigurosa en un tema concreto de gestión, liderazgo o tecnología, sin necesariamente buscar un grado académico. Un programa especializado te da profundidad práctica en poco tiempo.",
  C: "Necesitas una herramienta o habilidad puntual, aplicable de inmediato en tu trabajo. Un curso de especialización es la forma más rápida de lograrlo.",
};

// ---------- Arranque ----------

render();

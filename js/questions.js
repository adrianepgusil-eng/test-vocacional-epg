// Preguntas del test vocacional EPG USIL
// Cada opción de las preguntas "scored" trae un objeto de puntos para las 5
// categorías: M = Maestría, D = Doctorado, S = Segunda Especialidad,
// P = Programa Especializado, C = Curso de Especialización.

const TIPOS = {
  M: { key: "M", label: "Maestría", dataTipo: "MAESTRÍA" },
  D: { key: "D", label: "Doctorado", dataTipo: "DOCTORADO" },
  S: { key: "S", label: "Segunda Especialidad", dataTipo: "SEGUNDA ESPECIALIDAD" },
  P: { key: "P", label: "Programa Especializado", dataTipo: "PROGRAMA ESPECIALIZADO" },
  C: { key: "C", label: "Curso de Especialización", dataTipo: "CURSO DE ESPECIALIZACIÓN" },
};

const EJES = [
  "DERECHO Y GOBIERNO CORPORATIVO",
  "EDUCACIÓN",
  "ESCUELA DE GOBIERNO Y GESTIÓN PÚBLICA",
  "INNOVACIÓN Y TI",
  "LIDERAZGO Y GESTIÓN DE PERSONAS",
  "NEGOCIOS Y ESG",
  "SALUD",
];

const EJE_LABELS = {
  "DERECHO Y GOBIERNO CORPORATIVO": "Derecho y Gobierno Corporativo",
  "EDUCACIÓN": "Educación",
  "ESCUELA DE GOBIERNO Y GESTIÓN PÚBLICA": "Gobierno y Gestión Pública",
  "INNOVACIÓN Y TI": "Innovación y Tecnología",
  "LIDERAZGO Y GESTIÓN DE PERSONAS": "Liderazgo y Gestión de Personas",
  "NEGOCIOS Y ESG": "Negocios y ESG",
  "SALUD": "Salud",
};

// Pasos del flujo. type: "datos" | "scored" | "eje" | "cv"
const STEPS = [
  {
    id: "datos",
    type: "datos",
    title: "Antes de empezar",
    subtitle: "Cuéntanos quién eres para poder mostrarte tu resultado.",
  },
  {
    id: "objetivo",
    type: "scored",
    title: "¿Cuál es tu objetivo principal al capacitarte ahora?",
    options: [
      { text: "Obtener un grado académico que impulse mi carrera a nivel gerencial", points: { M: 3, D: 0, S: 0, P: 1, C: 0 } },
      { text: "Dedicarme a la investigación y/o docencia universitaria de alto nivel", points: { M: 0, D: 3, S: 0, P: 0, C: 0 } },
      { text: "Certificarme oficialmente como especialista en mi profesión (colegiatura)", points: { M: 0, D: 0, S: 3, P: 1, C: 0 } },
      { text: "Actualizarme en un área de gestión, liderazgo o tecnología específica", points: { M: 0, D: 0, S: 0, P: 3, C: 1 } },
      { text: "Aprender una herramienta o habilidad puntual lo más rápido posible", points: { M: 0, D: 0, S: 0, P: 1, C: 3 } },
    ],
  },
  {
    id: "tiempo",
    type: "scored",
    title: "¿Cuánto tiempo puedes dedicarle a estudiar en los próximos meses?",
    options: [
      { text: "Puedo comprometerme por varios años", points: { M: 1, D: 3, S: 0, P: 0, C: 0 } },
      { text: "Entre 1 y 2 años", points: { M: 3, D: 0, S: 1, P: 0, C: 0 } },
      { text: "Entre 3 y 6 meses", points: { M: 0, D: 0, S: 1, P: 3, C: 0 } },
      { text: "Solo cuento con algunas semanas", points: { M: 0, D: 0, S: 0, P: 0, C: 3 } },
    ],
  },
  {
    id: "titulo_regulado",
    type: "scored",
    title: "¿Tienes un título profesional en un campo regulado (derecho, salud, psicología, educación, etc.)?",
    options: [
      { text: "Sí, y me interesa una certificación oficial de especialidad (colegiatura)", points: { M: 0, D: 0, S: 3, P: 0, C: 0 } },
      { text: "Sí, pero prefiero explorar otras opciones de formación", points: { M: 1, D: 0, S: 1, P: 1, C: 0 } },
      { text: "No tengo un título en un campo con segunda especialidad formal", points: { M: 1, D: 0, S: 0, P: 1, C: 1 } },
    ],
  },
  {
    id: "investigacion",
    type: "scored",
    title: "¿Qué tanto te interesa la investigación académica (leer papers, escribir artículos, generar conocimiento nuevo)?",
    options: [
      { text: "Mucho, es lo que más me apasiona", points: { M: 1, D: 3, S: 0, P: 0, C: 0 } },
      { text: "Algo, pero prefiero balancearlo con la práctica", points: { M: 2, D: 1, S: 1, P: 0, C: 0 } },
      { text: "Prefiero aplicar conocimiento práctico directo en mi trabajo", points: { M: 0, D: 0, S: 0, P: 2, C: 2 } },
    ],
  },
  {
    id: "etapa_carrera",
    type: "scored",
    title: "¿En qué etapa de tu carrera te encuentras?",
    options: [
      { text: "Busco dar el salto a posiciones directivas o gerenciales", points: { M: 3, D: 0, S: 0, P: 1, C: 0 } },
      { text: "Ya soy especialista y quiero consolidar o certificar mi expertise", points: { M: 0, D: 0, S: 2, P: 1, C: 0 } },
      { text: "Quiero mantenerme actualizado con herramientas y tendencias nuevas", points: { M: 0, D: 0, S: 0, P: 1, C: 3 } },
      { text: "Busco alcanzar el máximo nivel académico posible", points: { M: 0, D: 3, S: 0, P: 0, C: 0 } },
    ],
  },
  {
    id: "formato",
    type: "scored",
    title: "¿Qué formato de aprendizaje prefieres?",
    options: [
      { text: "Un programa largo, con tesis o proyecto de investigación final", points: { M: 2, D: 2, S: 0, P: 0, C: 0 } },
      { text: "Un programa de certificación con módulos prácticos aplicados", points: { M: 0, D: 0, S: 0, P: 3, C: 0 } },
      { text: "Un taller o curso corto con aplicación inmediata", points: { M: 0, D: 0, S: 0, P: 0, C: 3 } },
      { text: "Un programa clínico o práctico supervisado de especialidad", points: { M: 0, D: 0, S: 3, P: 0, C: 0 } },
    ],
  },
  {
    id: "grado_vs_certificacion",
    type: "scored",
    title: "¿Qué tan importante es para ti obtener un grado académico reconocido por SUNEDU?",
    options: [
      { text: "Es fundamental, necesito un grado académico (maestro o doctor)", points: { M: 2, D: 2, S: 0, P: 0, C: 0 } },
      { text: "Me interesa más una certificación oficial de especialidad profesional", points: { M: 0, D: 0, S: 3, P: 0, C: 0 } },
      { text: "No es prioritario, prefiero una constancia de participación", points: { M: 0, D: 0, S: 0, P: 2, C: 2 } },
    ],
  },
  {
    id: "eje",
    type: "eje",
    title: "¿Qué área temática te interesa más en este momento?",
    subtitle: "Usamos esto solo para recomendarte programas del área correcta.",
  },
  {
    id: "cv",
    type: "cv",
    title: "Un último paso (opcional)",
    subtitle:
      "Si subes tu CV, afinamos tu resultado según tu experiencia. Es completamente opcional — puedes continuar sin hacerlo.",
  },
];

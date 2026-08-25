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
    title: "¿Cuál es tu objetivo principal ahora?",
    options: [
      { text: "Prepararme para asumir más responsabilidad, liderazgo o un puesto directivo", points: { M: 3, D: 0, S: 0, P: 1, C: 0 } },
      { text: "Dedicarme a investigar y enseñar a nivel universitario", points: { M: 0, D: 3, S: 0, P: 0, C: 0 } },
      { text: "Profundizar y especializarme más a fondo en mi propia profesión", points: { M: 0, D: 0, S: 3, P: 1, C: 0 } },
      { text: "Fortalecer una habilidad de gestión, liderazgo o tecnología que ya uso en mi trabajo", points: { M: 0, D: 0, S: 0, P: 3, C: 1 } },
      { text: "Aprender algo puntual que pueda aplicar de inmediato", points: { M: 0, D: 0, S: 0, P: 1, C: 3 } },
    ],
  },
  {
    id: "tiempo",
    type: "scored",
    title: "¿Cuánto tiempo puedes comprometer a estudiar?",
    options: [
      { text: "Algunas semanas, busco algo bien puntual (~2 meses)", points: { M: 0, D: 0, S: 0, P: 0, C: 3 } },
      { text: "Entre 4 y 8 meses", points: { M: 0, D: 0, S: 0, P: 3, C: 0 } },
      { text: "Cerca de 1 año", points: { M: 0, D: 0, S: 3, P: 1, C: 0 } },
      { text: "Entre 1.5 y 2 años", points: { M: 3, D: 0, S: 0, P: 0, C: 0 } },
      { text: "2 años o más, priorizando investigación", points: { M: 0, D: 3, S: 0, P: 0, C: 0 } },
    ],
  },
  {
    id: "titulo_regulado",
    type: "scored",
    title: "¿Cuentas con título profesional (no solo bachiller, sino el título sustentado) en un campo como derecho, salud, psicología o educación?",
    options: [
      { text: "Sí, tengo título profesional en uno de esos campos", points: { M: 0, D: 0, S: 3, P: 0, C: 0 } },
      { text: "Tengo el bachiller, pero aún no el título profesional", points: { M: 1, D: 0, S: 0, P: 1, C: 1 } },
      { text: "No, mi campo profesional es otro", points: { M: 1, D: 0, S: 0, P: 1, C: 1 } },
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
    title: "Cuando imaginas terminar este programa, ¿qué tipo de cierre te representa mejor?",
    options: [
      { text: "Una investigación rigurosa que aporte evidencia nueva a mi campo, con miras a publicarla", points: { M: 0, D: 3, S: 0, P: 0, C: 0 } },
      { text: "Un proyecto o plan aplicado a un caso real de mi organización, que sustento al final", points: { M: 3, D: 0, S: 0, P: 0, C: 0 } },
      { text: "Un trabajo de grado ligado a la práctica de mi propia profesión", points: { M: 0, D: 0, S: 3, P: 0, C: 0 } },
      { text: "Módulos prácticos con evaluación, sin un trabajo de cierre extenso", points: { M: 0, D: 0, S: 0, P: 3, C: 0 } },
      { text: "Sesiones cortas 100% aplicadas, sin ningún trabajo final", points: { M: 0, D: 0, S: 0, P: 0, C: 3 } },
    ],
  },
  {
    id: "grado_vs_certificacion",
    type: "scored",
    title: "¿Qué tan importante es para ti terminar con un grado o título oficial registrado ante SUNEDU (como el de maestro, doctor o segunda especialidad)?",
    subtitle: "A diferencia de un certificado o constancia de participación, este queda inscrito oficialmente a tu nombre.",
    options: [
      { text: "Es fundamental, necesito un grado de maestro o doctor", points: { M: 2, D: 2, S: 0, P: 0, C: 0 } },
      { text: "Me interesa más el título oficial de especialista en mi profesión", points: { M: 0, D: 0, S: 3, P: 0, C: 0 } },
      { text: "No es prioritario, con un certificado o constancia me es suficiente", points: { M: 0, D: 0, S: 0, P: 2, C: 2 } },
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

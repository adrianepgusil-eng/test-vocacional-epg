// Configuración del proyecto.
// Reemplaza APPS_SCRIPT_URL con la URL de tu Web App de Google Apps Script
// (ver apps-script/Code.gs y el README para el paso a paso de despliegue).
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby7L8OM3m8IQFtbvkGLYmaXAVYLou8dFlqOrGGlZzZOZMZ0k2dpApy_uUEcyWymkNHTvg/exec",
  EVENT_NAME: "Evento EPG USIL", // opcional, se guarda en la hoja de cálculo

  // Números de WhatsApp para que el colaborador escriba directamente,
  // según a qué área corresponda su resultado. Formato: solo dígitos,
  // sin +51 (se agrega automáticamente al armar el link de wa.me).
  WHATSAPP: {
    PROGRAMAS_Y_CURSOS: "981458741", // Programa Especializado y Curso de Especialización
    POSGRADOS: "980020047", // Maestría, Doctorado y Segunda Especialidad
    FACULTAD_EDUCACION: "975377752", // Programa/Curso/Maestría/Doctorado del eje Educación
  },
};

// src/notifications/utils.js
// SRP: este archivo tiene una sola responsabilidad → utilidades de fecha/hora
// compartidas por las estrategias de notificación.

/**
 * Convierte un string de hora ("08:00", "08:00 am", "08:00 PM") en { hours, minutes }.
 * Retorna null si el formato no es reconocido.
 */
export function parsearHora(str) {
  if (!str || typeof str !== 'string') return null;

  // Formato "HH:MM am/pm"
  const conAmPm = str.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (conAmPm) {
    let h = parseInt(conAmPm[1], 10);
    const m = parseInt(conAmPm[2], 10);
    const periodo = conAmPm[3].toLowerCase();
    if (periodo === 'pm' && h !== 12) h += 12;
    if (periodo === 'am' && h === 12) h = 0;
    return { hours: h, minutes: m };
  }

  // Formato "HH:MM"
  const solo = str.match(/(\d{1,2}):(\d{2})/);
  if (solo) return { hours: parseInt(solo[1], 10), minutes: parseInt(solo[2], 10) };

  return null;
}

/**
 * Devuelve el ISO string de hoy a la hora indicada (horas, minutos).
 */
export function hoyA(hours, minutes) {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/**
 * Devuelve la fecha de hoy como string "YYYY-MM-DD".
 */
export function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Formatea un ISO string a texto legible en español peruano.
 */
export function formatearFecha(str) {
  if (!str) return 'Sin fecha';
  try {
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(str));
  } catch {
    return str;
  }
}

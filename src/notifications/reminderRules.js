export const DEFAULT_REMINDER_PREFERENCES = Object.freeze({
  enabled: true,
  medicineLeadMinutes: 10,
  appointmentLeadMinutes: 30,
  exerciseLeadMinutes: 10,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
});

const MIN_LEAD_MINUTES = 0;
const MAX_LEAD_MINUTES = 1440;
const MINIMUM_DELIVERY_WINDOW_MINUTES = 10;

const isValidTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? "");

const normalizeLeadMinutes = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
};

export function validateReminderPreferences(input = {}) {
  const value = {
    enabled: Boolean(input.enabled),
    medicineLeadMinutes: normalizeLeadMinutes(
      input.medicineLeadMinutes,
      DEFAULT_REMINDER_PREFERENCES.medicineLeadMinutes,
    ),
    appointmentLeadMinutes: normalizeLeadMinutes(
      input.appointmentLeadMinutes,
      DEFAULT_REMINDER_PREFERENCES.appointmentLeadMinutes,
    ),
    exerciseLeadMinutes: normalizeLeadMinutes(
      input.exerciseLeadMinutes,
      DEFAULT_REMINDER_PREFERENCES.exerciseLeadMinutes,
    ),
    quietHoursStart: input.quietHoursStart ?? DEFAULT_REMINDER_PREFERENCES.quietHoursStart,
    quietHoursEnd: input.quietHoursEnd ?? DEFAULT_REMINDER_PREFERENCES.quietHoursEnd,
  };

  const errors = {};
  for (const field of [
    "medicineLeadMinutes",
    "appointmentLeadMinutes",
    "exerciseLeadMinutes",
  ]) {
    if (value[field] < MIN_LEAD_MINUTES || value[field] > MAX_LEAD_MINUTES) {
      errors[field] = "Debe estar entre 0 y 1440 minutos.";
    }
  }

  if (!isValidTime(value.quietHoursStart)) {
    errors.quietHoursStart = "Ingresa una hora válida.";
  }
  if (!isValidTime(value.quietHoursEnd)) {
    errors.quietHoursEnd = "Ingresa una hora válida.";
  }

  return { valid: Object.keys(errors).length === 0, errors, value };
}

export function getReminderPreferences(user) {
  const stored = user?.user_metadata?.reminder_preferences ?? {};
  return validateReminderPreferences({
    ...DEFAULT_REMINDER_PREFERENCES,
    ...stored,
  }).value;
}

const timeToMinutes = (value) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export function isWithinQuietHours(date, start, end) {
  if (!isValidTime(start) || !isValidTime(end) || start === end) return false;

  const current = date.getHours() * 60 + date.getMinutes();
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  return startMinutes < endMinutes
    ? current >= startMinutes && current < endMinutes
    : current >= startMinutes || current < endMinutes;
}

/**
 * Regla de Caja Blanca (complejidad ciclomática > 4).
 * Decisiones independientes: preferencias, estado, lectura, fecha válida,
 * horario silencioso, anticipación y expiración de ventana.
 */
export function evaluateReminder(recordatorio, preferences, now = new Date()) {
  if (!preferences?.enabled) return { status: "disabled", shouldNotify: false };
  if (!recordatorio?.activo) return { status: "inactive", shouldNotify: false };
  if (recordatorio.is_read) return { status: "confirmed", shouldNotify: false };

  const scheduled = new Date(recordatorio.scheduled_for);
  if (Number.isNaN(scheduled.getTime())) {
    return { status: "invalid-date", shouldNotify: false };
  }

  if (isWithinQuietHours(now, preferences.quietHoursStart, preferences.quietHoursEnd)) {
    return { status: "quiet-hours", shouldNotify: false };
  }

  const elapsedMs = now.getTime() - scheduled.getTime();
  if (elapsedMs < 0) return { status: "upcoming", shouldNotify: false };

  const leadMinutesByType = {
    medicamento: preferences.medicineLeadMinutes,
    cita: preferences.appointmentLeadMinutes,
    ejercicio: preferences.exerciseLeadMinutes,
  };
  const deliveryWindowMinutes = Math.max(
    MINIMUM_DELIVERY_WINDOW_MINUTES,
    leadMinutesByType[recordatorio.tipo] ?? MINIMUM_DELIVERY_WINDOW_MINUTES,
  );
  if (elapsedMs > deliveryWindowMinutes * 60 * 1000) {
    return { status: "expired", shouldNotify: false };
  }

  return { status: "due", shouldNotify: true };
}

const frequencyToHours = (frequency) => {
  const normalized = String(frequency ?? "").trim().toLowerCase();
  const match = normalized.match(/cada\s+(\d+)\s+hora/);
  if (match) return Number(match[1]);
  if (["diaria", "diario", "cada día", "una vez al día"].includes(normalized)) return 24;
  return null;
};

export function calculateNextMedicineTake(startValue, frequency, now = new Date()) {
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return null;
  if (start >= now) return start;

  const intervalHours = frequencyToHours(frequency);
  if (!intervalHours || intervalHours <= 0) return null;

  const intervalMs = intervalHours * 60 * 60 * 1000;
  const intervalsElapsed = Math.ceil((now.getTime() - start.getTime()) / intervalMs);
  return new Date(start.getTime() + intervalsElapsed * intervalMs);
}

export function subtractLeadMinutes(dateValue, minutes) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() - Number(minutes || 0) * 60 * 1000);
}

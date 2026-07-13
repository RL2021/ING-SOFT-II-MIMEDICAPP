import { describe, expect, it } from "vitest";
import {
  DEFAULT_REMINDER_PREFERENCES,
  evaluateReminder,
} from "../../src/notifications/reminderRules";

const now = new Date("2026-07-12T15:00:00.000Z");
const dueReminder = {
  id: 50,
  activo: true,
  is_read: false,
  scheduled_for: "2026-07-12T14:55:00.000Z",
};

describe("Caja Blanca - evaluateReminder (US-052)", () => {
  it("P1: descarta cuando las alertas están desactivadas", () => {
    expect(evaluateReminder(dueReminder, { ...DEFAULT_REMINDER_PREFERENCES, enabled: false }, now).status).toBe("disabled");
  });

  it("P2: descarta un recordatorio inactivo", () => {
    expect(evaluateReminder({ ...dueReminder, activo: false }, DEFAULT_REMINDER_PREFERENCES, now).status).toBe("inactive");
  });

  it("P3: descarta un recordatorio confirmado", () => {
    expect(evaluateReminder({ ...dueReminder, is_read: true }, DEFAULT_REMINDER_PREFERENCES, now).status).toBe("confirmed");
  });

  it("P4: controla una fecha programada inválida", () => {
    expect(evaluateReminder({ ...dueReminder, scheduled_for: "fecha-invalida" }, DEFAULT_REMINDER_PREFERENCES, now).status).toBe("invalid-date");
  });

  it("P5: no interrumpe durante el horario silencioso", () => {
    const preferences = { ...DEFAULT_REMINDER_PREFERENCES, quietHoursStart: "00:00", quietHoursEnd: "23:59" };
    expect(evaluateReminder(dueReminder, preferences, now).status).toBe("quiet-hours");
  });

  it("P6: espera si aún no llegó la hora de alerta", () => {
    const upcoming = { ...dueReminder, scheduled_for: "2026-07-12T15:01:00.000Z" };
    expect(evaluateReminder(upcoming, DEFAULT_REMINDER_PREFERENCES, now).status).toBe("upcoming");
  });

  it("P7: descarta una alerta cuya ventana de diez minutos expiró", () => {
    const expired = { ...dueReminder, scheduled_for: "2026-07-12T14:49:59.000Z" };
    expect(evaluateReminder(expired, DEFAULT_REMINDER_PREFERENCES, now).status).toBe("expired");
  });

  it("P8: notifica durante la ventana válida", () => {
    expect(evaluateReminder(dueReminder, DEFAULT_REMINDER_PREFERENCES, now)).toEqual({
      status: "due",
      shouldNotify: true,
    });
  });
});

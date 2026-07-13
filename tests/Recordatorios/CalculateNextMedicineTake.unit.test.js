import { describe, expect, it } from "vitest";
import { calculateNextMedicineTake } from "../../src/notifications/reminderRules";

describe("Prueba unitaria - calculateNextMedicineTake (US-052)", () => {
  const now = new Date("2026-07-12T12:00:00.000Z");

  it("mantiene una primera toma futura", () => {
    expect(calculateNextMedicineTake("2026-07-12T13:00:00.000Z", "Cada 8 horas", now)?.toISOString()).toBe("2026-07-12T13:00:00.000Z");
  });

  it("calcula la siguiente toma cada 8 horas", () => {
    expect(calculateNextMedicineTake("2026-07-12T05:00:00.000Z", "Cada 8 horas", now)?.toISOString()).toBe("2026-07-12T13:00:00.000Z");
  });

  it("calcula la siguiente toma cada 12 horas", () => {
    expect(calculateNextMedicineTake("2026-07-11T18:00:00.000Z", "Cada 12 horas", now)?.toISOString()).toBe("2026-07-12T18:00:00.000Z");
  });

  it("interpreta una frecuencia diaria como 24 horas", () => {
    expect(calculateNextMedicineTake("2026-07-11T09:00:00.000Z", "Diario", now)?.toISOString()).toBe("2026-07-13T09:00:00.000Z");
  });

  it("retorna null para una fecha inválida", () => {
    expect(calculateNextMedicineTake("sin-fecha", "Cada 8 horas", now)).toBeNull();
  });

  it("retorna null para una frecuencia desconocida cuando la toma ya pasó", () => {
    expect(calculateNextMedicineTake("2026-07-12T09:00:00.000Z", "Cuando sea necesario", now)).toBeNull();
  });
});

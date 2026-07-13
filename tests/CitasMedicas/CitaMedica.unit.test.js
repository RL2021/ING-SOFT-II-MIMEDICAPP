import { describe, expect, test, vi } from "vitest";
import CitaMedica from "../../src/models/CitasMedicas";

const datosBase = {
  id: "cita-1",
  usuario_id: "usuario-1",
  doctor: "Dra. Ana Torres",
  especialidad: "Cardiologia",
  ubicacion: "Clinica Ulima",
  fecha_hora_cita: "2099-08-20T15:30",
  notas: "Llevar examenes",
  tiene_recordatorio: false,
  asistida: false,
  fecha_creacion: "2026-07-12T10:00:00.000Z",
  fecha_actualizacion: "2026-07-12T10:00:00.000Z",
};

describe("PRUEBA UNITARIA - CitaMedica.editarCita()", () => {
  test("Caso 1: actualiza doctor, especialidad y ubicacion", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T16:00:00.000Z"));

    const cita = new CitaMedica(datosBase);
    const resultado = cita.editarCita({
      doctor: "Dr. Luis Perez",
      especialidad: "Neurologia",
      ubicacion: "Hospital Central",
    });

    expect(resultado).toBe(cita);
    expect(cita.doctor).toBe("Dr. Luis Perez");
    expect(cita.especialidad).toBe("Neurologia");
    expect(cita.ubicacion).toBe("Hospital Central");
    expect(cita.fecha_actualizacion).toBe("2026-07-12T16:00:00.000Z");

    vi.useRealTimers();
  });

  test("Caso 2: actualiza fecha_hora_cita y notas", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-13T09:15:00.000Z"));

    const cita = new CitaMedica(datosBase);
    cita.editarCita({
      fecha_hora_cita: "2099-09-10T18:45",
      notas: "Llevar resultados actualizados",
    });

    expect(cita.fecha_hora_cita).toBe("2099-09-10T18:45");
    expect(cita.notas).toBe("Llevar resultados actualizados");
    expect(cita.fecha_actualizacion).toBe("2026-07-13T09:15:00.000Z");

    vi.useRealTimers();
  });

  test("Caso 3: actualiza el estado asistida cuando se envia en los datos", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-14T12:30:00.000Z"));

    const cita = new CitaMedica(datosBase);
    cita.editarCita({ asistida: true });

    expect(cita.asistida).toBe(true);
    expect(cita.fecha_actualizacion).toBe("2026-07-14T12:30:00.000Z");

    vi.useRealTimers();
  });

  test("Caso 4: conserva los campos no incluidos en la edicion", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T08:00:00.000Z"));

    const cita = new CitaMedica(datosBase);
    cita.editarCita({ doctor: "Dra. Carmen Lopez" });

    expect(cita.doctor).toBe("Dra. Carmen Lopez");
    expect(cita.especialidad).toBe(datosBase.especialidad);
    expect(cita.ubicacion).toBe(datosBase.ubicacion);
    expect(cita.fecha_hora_cita).toBe(datosBase.fecha_hora_cita);
    expect(cita.fecha_actualizacion).toBe("2026-07-15T08:00:00.000Z");

    vi.useRealTimers();
  });
});

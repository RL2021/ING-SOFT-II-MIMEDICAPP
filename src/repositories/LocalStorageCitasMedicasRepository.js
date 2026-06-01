import CitaMedica from "../models/CitasMedicas";
import CitasMedicasRepository from "./CitasMedicasRepository";

const STORAGE_KEY = "mimedicapp_citas_medicas";
const LEGACY_STORAGE_KEY = "mimedicapp_appointments_v2";
const LEGACY_SAMPLE_IDS = ["apt-001", "apt-002", "apt-003"];

export default class LocalStorageCitasMedicasRepository extends CitasMedicasRepository {
  listarCitas() {
    const citasGuardadas =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!citasGuardadas) {
      return [];
    }

    try {
      const citas = JSON.parse(citasGuardadas);

      if (!Array.isArray(citas)) {
        return [];
      }

      return citas
        .filter((cita) => !LEGACY_SAMPLE_IDS.includes(cita.id))
        .map((cita) => this.crearCitaMedica(cita));
    } catch {
      return [];
    }
  }

  guardarCitas(citas) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
  }

  crearCitaMedica(cita) {
    return new CitaMedica({
      id: cita.id,
      usuario_id: cita.usuario_id ?? cita.user_id ?? null,
      doctor: cita.doctor ?? cita.doctor_name ?? "",
      especialidad: cita.especialidad ?? cita.specialty ?? "",
      ubicacion: cita.ubicacion ?? cita.location ?? "",
      fecha_hora_cita: cita.fecha_hora_cita ?? cita.appointment_date ?? "",
      notas: cita.notas ?? cita.notes ?? "",
      tiene_recordatorio: cita.tiene_recordatorio ?? cita.has_reminder ?? false,
      asistida: Boolean(cita.asistida ?? cita.is_completed),
      fecha_creacion: cita.fecha_creacion ?? cita.created_at,
      fecha_actualizacion: cita.fecha_actualizacion ?? cita.updated_at,
    });
  }
}

// src/notifications/RecordatorioCitaMedicaStrategy.js
//
// ══════════════════════════════════════════════════════════════════════════════
//  PATRÓN STRATEGY  ·  ConcreteStrategy B
//  Historia de usuario: US-020 (recordatorio web antes de cita médica)
//                       US-021 (alerta visible hasta confirmar asistencia)
// ══════════════════════════════════════════════════════════════════════════════
//
//  SRP: esta clase tiene una sola razón para cambiar → la lógica de recordatorio
//       de citas médicas.
//  LSP: puede reemplazar a IRecordatorioStrategy en cualquier contexto.

import { IRecordatorioStrategy } from './IRecordatorioStrategy';

export class RecordatorioCitaMedicaStrategy extends IRecordatorioStrategy {

  // ── generarNotificacionPersistente ────────────────────────────────────────
  /**
   * Por cada cita con recordatorio activo y no asistida, genera un
   * RecordatorioCitaMedica que se dispara 1 hora antes de la cita.
   *
   * Campos del objeto (respetan el diagrama de clases):
   *   idRecordatorioCitaMedica, idCitaMedica, activo, fechaHoraEnvio
   */
  generarNotificacionPersistente(appointments) {
    return appointments
      .filter((apt) => apt.has_reminder && !apt.is_completed && apt.appointment_date)
      .map((apt) => {
        const fechaCita = new Date(apt.appointment_date);
        // enviarNotificacion 1 hora antes de la cita (US-020)
        const horaDeEnvio = new Date(fechaCita.getTime() - 60 * 60 * 1000);

        return {
          // ── Campos del diagrama de clases ──
          idRecordatorioCitaMedica: `rc-${apt.id}`,
          idCitaMedica: apt.id,
          activo: true,
          fechaHoraEnvio: horaDeEnvio.toISOString(),
          // ── Datos de presentación ──
          tipo: 'cita',
          nombreDoctor: apt.doctor_name,
          especialidad: apt.specialty,
          fechaCita: apt.appointment_date,
          ubicacion: apt.location,
          is_read: false,
          notificado: false,
        };
      });
  }

  // ── IRecordatorioStrategy contract ────────────────────────────────────────

  obtenerIdentificador(recordatorio) {
    return recordatorio.idRecordatorioCitaMedica;
  }

  obtenerFechaProgramada(recordatorio) {
    return recordatorio.fechaHoraEnvio;
  }

  generarMensajeToast(recordatorio) {
    return `🏥 Cita en 1 hora: Dr. ${recordatorio.nombreDoctor}`;
  }

  obtenerEstiloToast() {
    return { background: '#e8f0fd', color: '#1a3a8b', fontWeight: 700 };
  }

  obtenerTextoBoton() {
    return 'Confirmar asistencia';
  }

  obtenerClaseBoton() {
    return 'bg-skysoft-500 hover:bg-skysoft-500/80 text-white';
  }

  obtenerTituloHistorial(recordatorio) {
    return recordatorio.nombreDoctor ? `Dr. ${recordatorio.nombreDoctor}` : 'Cita médica';
  }

  // ── Método específico del diagrama de clases ──────────────────────────────

  /**
   * marcarAsistencia(): confirma que el usuario asistió a la cita.
   * Delega en marcarCompletado() heredado de IRecordatorioStrategy.
   */
  marcarAsistencia(recordatorio) {
    return this.marcarCompletado(recordatorio);
  }
}

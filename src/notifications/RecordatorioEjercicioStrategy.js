// src/notifications/RecordatorioEjercicioStrategy.js
//
// ══════════════════════════════════════════════════════════════════════════════
//  PATRÓN STRATEGY  ·  ConcreteStrategy C
//  Historia de usuario: US-030 (recordatorio web para realizar ejercicio)
// ══════════════════════════════════════════════════════════════════════════════
//
//  SRP: esta clase tiene una sola razón para cambiar → la lógica de recordatorio
//       de ejercicios.
//  LSP: puede reemplazar a IRecordatorioStrategy en cualquier contexto.

import { IRecordatorioStrategy } from './IRecordatorioStrategy';
import { parsearHora, fechaHoy, hoyA } from './utils';

export class RecordatorioEjercicioStrategy extends IRecordatorioStrategy {

  // ── generarNotificacionPersistente ────────────────────────────────────────
  /**
   * Por cada ejercicio no completado y con horario definido, genera un
   * RecordatorioEjercicio para el horario programado de hoy.
   *
   * Campos del objeto (respetan el diagrama de clases):
   *   idNotificacion, idEjercicio, activo, fechaEnvio
   */
  generarNotificacionPersistente(exercises) {
    const hoy = fechaHoy();

    return exercises
      .filter((ex) => ex.nombre && ex.horario && !ex.completado)
      .map((ex) => {
        const hora = parsearHora(ex.horario);
        if (!hora) return null;

        return {
          // ── Campos del diagrama de clases ──
          idNotificacion: `re-${ex.nombre}-${hoy}`,
          idEjercicio: ex.nombre,
          activo: true,
          fechaEnvio: hoyA(hora.hours, hora.minutes),
          // ── Datos de presentación ──
          tipo: 'ejercicio',
          nombreEjercicio: ex.nombre,
          horario: ex.horario,
          descripcion: ex.descripcion,
          is_read: false,
          notificado: false,
        };
      })
      .filter(Boolean);
  }

  // ── IRecordatorioStrategy contract ────────────────────────────────────────

  obtenerIdentificador(recordatorio) {
    return recordatorio.idNotificacion;
  }

  obtenerFechaProgramada(recordatorio) {
    return recordatorio.fechaEnvio;
  }

  generarMensajeToast(recordatorio) {
    return `🏋️ Hora de ejercitar: ${recordatorio.nombreEjercicio}`;
  }

  obtenerEstiloToast() {
    return { background: '#e8fdf0', color: '#1a5a2a', fontWeight: 700 };
  }

  obtenerTextoBoton() {
    return 'Marcar realizado';
  }

  obtenerClaseBoton() {
    return 'bg-mint-500 hover:bg-mint-500/80 text-white';
  }

  obtenerTituloHistorial(recordatorio) {
    return recordatorio.nombreEjercicio ?? 'Ejercicio';
  }

  // ── Método específico del diagrama de clases ──────────────────────────────

  /**
   * marcarRealizado(): confirma que el usuario realizó el ejercicio.
   * Delega en marcarCompletado() heredado de IRecordatorioStrategy.
   */
  marcarRealizado(recordatorio) {
    return this.marcarCompletado(recordatorio);
  }
}

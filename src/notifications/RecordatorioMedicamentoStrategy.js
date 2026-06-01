// src/notifications/RecordatorioMedicamentoStrategy.js
//
// ══════════════════════════════════════════════════════════════════════════════
//  PATRÓN STRATEGY  ·  ConcreteStrategy A
//  Historia de usuario: US-011 (programar recordatorio de medicamento)
//                       US-012 (notificación persistente hasta confirmar toma)
// ══════════════════════════════════════════════════════════════════════════════
//
//  SRP: esta clase tiene una sola razón para cambiar → la lógica de recordatorio
//       de medicamentos.
//  LSP: puede reemplazar a IRecordatorioStrategy en cualquier contexto.

import { IRecordatorioStrategy } from './IRecordatorioStrategy';
import { parsearHora, fechaHoy } from './utils';

export class RecordatorioMedicamentoStrategy extends IRecordatorioStrategy {

  // ── generarNotificacionPersistente ────────────────────────────────────────
  /**
   * Por cada medicamento activo, calcula todas las tomas del día según su
   * frecuencia y genera un RecordatorioMedicamento por cada una.
   *
   * Campos del objeto (respetan el diagrama de clases):
   *   idRecordatorioMedicamento, idMedicamento, activo, fechaHoraEnvio
   */
  generarNotificacionPersistente(medicines) {
    const hoy = fechaHoy();
    const recordatorios = [];

    medicines.forEach((med) => {
      if (!med.nombre || !med.toma) return;

      const hora = parsearHora(med.toma);
      if (!hora) return;

      // Calcular intervalo en horas según frecuencia
      let intervaloHoras = 24;
      if (med.frecuencia === 'Cada 8 horas')  intervaloHoras = 8;
      if (med.frecuencia === 'Cada 12 horas') intervaloHoras = 12;

      // Primera toma del día
      const primera = new Date();
      primera.setHours(hora.hours, hora.minutes, 0, 0);

      // Acumular tomas restantes dentro del mismo día calendario
      const tomas = [new Date(primera)];
      let siguiente = new Date(primera);
      while (true) {
        siguiente = new Date(siguiente.getTime() + intervaloHoras * 3600 * 1000);
        if (siguiente.getDate() !== primera.getDate()) break;
        tomas.push(new Date(siguiente));
      }

      tomas.forEach((toma) => {
        const hh = String(toma.getHours()).padStart(2, '0');
        const mm = String(toma.getMinutes()).padStart(2, '0');

        recordatorios.push({
          // ── Campos del diagrama de clases ──
          idRecordatorioMedicamento: `rm-${med.nombre}-${hoy}-${hh}${mm}`,
          idMedicamento: med.nombre,
          activo: !med.completado,          // si ya fue tomado hoy → inactivo
          fechaHoraEnvio: toma.toISOString(),
          // ── Datos de presentación ──
          tipo: 'medicamento',
          nombreMedicamento: med.nombre,
          dosis: med.dosis,
          frecuencia: med.frecuencia,
          is_read: false,
          notificado: false,
        });
      });
    });

    return recordatorios;
  }

  // ── IRecordatorioStrategy contract ────────────────────────────────────────

  obtenerIdentificador(recordatorio) {
    return recordatorio.idRecordatorioMedicamento;
  }

  obtenerFechaProgramada(recordatorio) {
    return recordatorio.fechaHoraEnvio;
  }

  generarMensajeToast(recordatorio) {
    return `💊 Tomar: ${recordatorio.nombreMedicamento} · ${recordatorio.dosis}`;
  }

  obtenerEstiloToast() {
    return { background: '#fde8f0', color: '#8b1a4a', fontWeight: 700 };
  }

  obtenerTextoBoton() {
    return 'Marcar tomado';
  }

  obtenerClaseBoton() {
    return 'bg-lotus-500 hover:bg-lotus-400 text-white';
  }

  obtenerTituloHistorial(recordatorio) {
    return recordatorio.nombreMedicamento ?? 'Medicamento';
  }

  // ── Método específico del diagrama de clases ──────────────────────────────

  /**
   * marcarTomado(): confirma que el usuario tomó el medicamento.
   * Delega en marcarCompletado() heredado de IRecordatorioStrategy.
   */
  marcarTomado(recordatorio) {
    return this.marcarCompletado(recordatorio);
  }
}

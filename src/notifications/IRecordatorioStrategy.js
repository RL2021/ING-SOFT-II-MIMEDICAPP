// src/notifications/IRecordatorioStrategy.js
//
// ══════════════════════════════════════════════════════════════════════════════
//  PATRÓN STRATEGY  ·  Interfaz base
// ══════════════════════════════════════════════════════════════════════════════
//
//  Defines the contract (interface) that all concrete reminder strategies must
//  fulfill.  In JavaScript there are no real interfaces, so each method throws
//  an error if a subclass forgets to implement it.
//
//  SOLID principles applied here:
//  ─ ISP (Interface Segregation): only the methods that every strategy truly
//    needs are declared here.  Type-specific helpers live in the concrete class.
//  ─ DIP (Dependency Inversion): NotificationEngine depends on this abstraction,
//    not on RecordatorioMedicamento/Cita/Ejercicio directly.
//  ─ OCP (Open/Closed): adding a new reminder type means creating a new concrete
//    class — this file never changes.

export class IRecordatorioStrategy {

  // ── Generación ────────────────────────────────────────────────────────────

  /**
   * Reads raw data from localStorage and produces an array of recordatorio
   * objects ready to be stored in 'mimedicapp_notificaciones'.
   * @param {Array} datos  Array of raw items (medicines | appointments | exercises)
   * @returns {Array}
   */
  generarNotificacionPersistente(datos) {
    throw new Error(`${this.constructor.name} debe implementar generarNotificacionPersistente()`);
  }

  // ── Identificación ────────────────────────────────────────────────────────

  /**
   * Returns the unique ID field of a recordatorio object.
   * (idRecordatorioMedicamento | idRecordatorioCitaMedica | idNotificacion)
   * @param {Object} recordatorio
   * @returns {string|undefined}
   */
  obtenerIdentificador(recordatorio) {
    throw new Error(`${this.constructor.name} debe implementar obtenerIdentificador()`);
  }

  /**
   * Returns the ISO datetime when the notification must fire.
   * (fechaHoraEnvio | fechaEnvio)
   * @param {Object} recordatorio
   * @returns {string}
   */
  obtenerFechaProgramada(recordatorio) {
    throw new Error(`${this.constructor.name} debe implementar obtenerFechaProgramada()`);
  }

  // ── Envío (toast) ─────────────────────────────────────────────────────────

  /**
   * Returns the text to show in the toast alert when the reminder fires.
   * @param {Object} recordatorio
   * @returns {string}
   */
  generarMensajeToast(recordatorio) {
    throw new Error(`${this.constructor.name} debe implementar generarMensajeToast()`);
  }

  /**
   * Returns the CSS-in-JS style object for the toast.
   * @returns {Object}
   */
  obtenerEstiloToast() {
    throw new Error(`${this.constructor.name} debe implementar obtenerEstiloToast()`);
  }

  // ── Presentación (UI) ─────────────────────────────────────────────────────

  /**
   * Returns the label for the confirmation button shown in Notifications.jsx.
   * ("Marcar tomado" | "Confirmar asistencia" | "Marcar realizado")
   * @returns {string}
   */
  obtenerTextoBoton() {
    throw new Error(`${this.constructor.name} debe implementar obtenerTextoBoton()`);
  }

  /**
   * Returns the Tailwind CSS classes for the confirmation button.
   * @returns {string}
   */
  obtenerClaseBoton() {
    throw new Error(`${this.constructor.name} debe implementar obtenerClaseBoton()`);
  }

  /**
   * Returns a summary string for the history card (used in the historial section).
   * @param {Object} recordatorio
   * @returns {string}
   */
  obtenerTituloHistorial(recordatorio) {
    throw new Error(`${this.constructor.name} debe implementar obtenerTituloHistorial()`);
  }

  // ── Confirmación (base compartida) ────────────────────────────────────────

  /**
   * LSP: all concrete strategies inherit this shared implementation.
   * Returns a new recordatorio object marked as confirmed.
   * @param {Object} recordatorio
   * @returns {Object}
   */
  marcarCompletado(recordatorio) {
    return { ...recordatorio, activo: false, is_read: true };
  }
}

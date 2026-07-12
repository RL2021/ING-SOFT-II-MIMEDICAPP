// src/notifications/NotificationEngine.js
//
// ══════════════════════════════════════════════════════════════════════════════
//  PATRÓN STRATEGY  ·  Context
// ══════════════════════════════════════════════════════════════════════════════
//
//  NotificationEngine is the *context* in the Strategy pattern.
//  It holds a registry of IRecordatorioStrategy instances and delegates all
//  reminder operations to them.
//
//  SOLID principles applied:
//  ─ SRP: one responsibility → orchestrate strategies and manage localStorage.
//  ─ OCP: to support a new reminder type, add one entry to `this.registro`.
//         No existing code in this file changes.
//  ─ DIP: depends on IRecordatorioStrategy (abstraction), never on concrete
//         classes directly.
//
//  Exported as a Singleton so the entire app shares one engine instance.

import { RecordatorioMedicamentoStrategy } from './RecordatorioMedicamentoStrategy';
import { RecordatorioEjercicioStrategy }   from './RecordatorioEjercicioStrategy';

// ─── Claves de localStorage ───────────────────────────────────────────────────
const NOTIFS_KEY       = 'mimedicapp_notificaciones';
const MEDS_KEY         = 'misMedicinas';
const EXERCISES_KEY    = 'misEjercicios';

// ─── Helpers de acceso a localStorage ────────────────────────────────────────
const leer   = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const escribir = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ─── Clase NotificationEngine ─────────────────────────────────────────────────
class NotificationEngine {
  constructor() {
    /**
     * Registro de estrategias: cada entrada asocia un 'tipo' con:
     *   - strategy: instancia de IRecordatorioStrategy
     *   - cargarDatos: función que obtiene los datos de localStorage
     *
     * OCP: para agregar "dieta" como nuevo tipo de recordatorio, solo se agrega
     * una nueva entrada aquí. Ningún otro archivo del engine cambia.
     */
    this.registro = {
      medicamento: {
        strategy:    new RecordatorioMedicamentoStrategy(),
        cargarDatos: () => leer(MEDS_KEY),
      },
      ejercicio: {
        strategy:    new RecordatorioEjercicioStrategy(),
        cargarDatos: () => leer(EXERCISES_KEY),
      },
    };
  }

  // ── Acceso a estrategia por tipo ──────────────────────────────────────────

  /**
   * DIP: los consumidores del engine reciben la abstracción IRecordatorioStrategy,
   * no la clase concreta.
   * @param {'medicamento'|'cita'|'ejercicio'} tipo
   * @returns {IRecordatorioStrategy|undefined}
   */
  obtenerEstrategia(tipo) {
    return this.registro[tipo]?.strategy;
  }

  // ── sync(): generar y fusionar notificaciones ─────────────────────────────

  /**
   * Reads all data sources, generates fresh recordatorio objects via each
   * strategy, and merges them with existing ones in localStorage — preserving
   * user-confirmed state (is_read, notificado, activo).
   *
   * @returns {Array} merged list of all recordatorios
   */
  sync() {
    // 1. Construir mapa de recordatorios anteriores para preservar su estado
    const anteriores = leer(NOTIFS_KEY);
    const mapaAnterior = {};
    anteriores.forEach((n) => {
      const s = this.obtenerEstrategia(n.tipo);
      if (!s) return;
      const id = s.obtenerIdentificador(n);
      if (id) mapaAnterior[id] = n;
    });

    // 2. Generar nuevos recordatorios desde todas las estrategias (OCP: itera el registro)
    const generadas = Object.values(this.registro).flatMap(({ strategy, cargarDatos }) =>
      strategy.generarNotificacionPersistente(cargarDatos()),
    );

    // 3. Fusionar: si ya existía, preservar is_read / notificado / activo
    const fusionadas = generadas.map((nueva) => {
      const s = this.obtenerEstrategia(nueva.tipo);
      if (!s) return nueva;

      const id = s.obtenerIdentificador(nueva);
      const previa = mapaAnterior[id];
      if (!previa) return nueva;

      return {
        ...nueva,
        is_read:    previa.is_read,
        notificado: previa.notificado,
        // Si la fuente pasó a "completado" (ej. medicamento tomado en Medicines.jsx),
        // el recordatorio se desactiva automáticamente
        activo: previa.activo && nueva.activo,
      };
    });

    escribir(NOTIFS_KEY, fusionadas);
    return fusionadas;
  }

  // ── enviarPendientes(): disparar toasts ───────────────────────────────────

  /**
   * Iterates active recordatorios and, for those whose scheduled time has
   * arrived (within a 10-minute window), fires a toast via the strategy's
   * generarMensajeToast() and obtenerEstiloToast().
   *
   * @param {Array}    notifs   current list from localStorage
   * @param {Function} toastFn  toast function from react-hot-toast
   */
  enviarPendientes(notifs, toastFn) {
    const ahora = new Date();
    let cambios = false;

    const actualizadas = notifs.map((n) => {
      if (!n.activo || n.is_read || n.notificado) return n;

      const s = this.obtenerEstrategia(n.tipo);
      if (!s) return n;

      const programado = new Date(s.obtenerFechaProgramada(n));
      const diffMs = ahora - programado;

      // Ventana de disparo: 0 → 10 min después del horario programado
      if (diffMs >= 0 && diffMs <= 10 * 60 * 1000) {
        toastFn(s.generarMensajeToast(n), {
          duration: 8000,
          style: s.obtenerEstiloToast(),
        });
        cambios = true;
        return { ...n, notificado: true };
      }
      return n;
    });

    if (cambios) escribir(NOTIFS_KEY, actualizadas);
  }

  // ── confirmar(): marcar un recordatorio como completado ───────────────────

  /**
   * Delegates to the correct strategy's marcarCompletado(), updates the list,
   * saves it, and returns the updated array sorted for the UI.
   *
   * @param {Object} recordatorio  the notification to confirm
   * @param {Array}  listaActual   full current list
   * @returns {Array} updated and sorted list
   */
  confirmar(recordatorio, listaActual) {
    const s = this.obtenerEstrategia(recordatorio.tipo);
    if (!s) return listaActual;

    const idObjetivo = s.obtenerIdentificador(recordatorio);
    const actualizadas = listaActual.map((n) => {
      const sN = this.obtenerEstrategia(n.tipo);
      if (!sN) return n;
      return sN.obtenerIdentificador(n) === idObjetivo
        ? s.marcarCompletado(n)
        : n;
    });

    escribir(NOTIFS_KEY, actualizadas);
    return this._ordenar(actualizadas);
  }

  // ── cargar / guardar ──────────────────────────────────────────────────────

  /** Loads and sorts the current notification list from localStorage. */
  cargar() {
    return this._ordenar(leer(NOTIFS_KEY));
  }

  // ── Privado ───────────────────────────────────────────────────────────────

  /** Sorts: active/pending first, then by scheduled time ascending. */
  _ordenar(lista) {
    return [...lista].sort((a, b) => {
      if (a.activo && !b.activo) return -1;
      if (!a.activo && b.activo) return 1;
      const sA = this.obtenerEstrategia(a.tipo);
      const sB = this.obtenerEstrategia(b.tipo);
      const ta = sA ? new Date(sA.obtenerFechaProgramada(a)) : 0;
      const tb = sB ? new Date(sB.obtenerFechaProgramada(b)) : 0;
      return ta - tb;
    });
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
// Una sola instancia compartida por toda la aplicación.
export const notificationEngine = new NotificationEngine();

import { RecordatorioCitaMedicaStrategy } from "./RecordatorioCitaMedicaStrategy";
import { RecordatorioEjercicioStrategy } from "./RecordatorioEjercicioStrategy";
import { RecordatorioMedicamentoStrategy } from "./RecordatorioMedicamentoStrategy";
import { evaluateReminder } from "./reminderRules";
import SupabaseNotificationRepository from "../repositories/SupabaseNotificationRepository";

export class NotificationEngine {
  constructor(repository = new SupabaseNotificationRepository()) {
    this.repository = repository;
    this.notifiedDuringSession = new Set();
    this.registro = {
      medicamento: new RecordatorioMedicamentoStrategy(),
      cita: new RecordatorioCitaMedicaStrategy(),
      ejercicio: new RecordatorioEjercicioStrategy(),
    };
  }

  obtenerEstrategia(tipo) {
    return this.registro[tipo];
  }

  async sync(userId, preferences, now = new Date()) {
    return this.repository.sincronizar(userId, this.registro, preferences, now);
  }

  async cargar(userId) {
    const notifications = await this.repository.listar(userId);
    return this.ordenar(notifications);
  }

  enviarPendientes(notifications, toastFn, preferences, now = new Date()) {
    const delivered = [];

    for (const notification of notifications) {
      if (this.notifiedDuringSession.has(notification.id)) continue;

      const evaluation = evaluateReminder(notification, preferences, now);
      if (!evaluation.shouldNotify) continue;

      const strategy = this.obtenerEstrategia(notification.tipo);
      if (!strategy) continue;

      toastFn(strategy.generarMensajeToast(notification), {
        duration: 8000,
        style: strategy.obtenerEstiloToast(),
      });
      this.notifiedDuringSession.add(notification.id);
      delivered.push(notification.id);
    }

    return delivered;
  }

  async confirmar(notification, userId) {
    await this.repository.confirmar(userId, notification);
    return this.cargar(userId);
  }

  suscribir(userId, callback) {
    return this.repository.suscribir(userId, callback);
  }

  ordenar(list) {
    return [...list].sort((first, second) => {
      if (first.activo && !second.activo) return -1;
      if (!first.activo && second.activo) return 1;
      return new Date(first.scheduled_for) - new Date(second.scheduled_for);
    });
  }
}

export const notificationEngine = new NotificationEngine();

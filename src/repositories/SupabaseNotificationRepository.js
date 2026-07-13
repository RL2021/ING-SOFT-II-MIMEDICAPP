import { supabase } from "../lib/supabase";

const TYPE_TO_UI = {
  medicine: "medicamento",
  appointment: "cita",
  exercise: "ejercicio",
};

const SOURCE_CONFIG = {
  medicine: {
    table: "medicines",
    idField: "medicine_id",
    completedValues: { is_taken: true },
  },
  appointment: {
    table: "appointments",
    idField: "appointment_id",
    completedValues: { is_completed: true },
  },
  exercise: {
    table: "exercises",
    idField: "exercise_id",
    completedValues: { is_completed: true },
  },
};

let realtimeSubscriptionSequence = 0;

const notificationKey = (notification) => {
  const source = SOURCE_CONFIG[notification.type];
  return `${notification.type}:${notification[source.idField]}:${notification.scheduled_for}`;
};

const mapNotification = (notification) => ({
  ...notification,
  tipo: TYPE_TO_UI[notification.type],
  activo: !notification.is_read,
});

export default class SupabaseNotificationRepository {
  async listar(userId) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("scheduled_for", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapNotification);
  }

  async sincronizar(userId, strategies, preferences, now = new Date()) {
    if (!userId) return [];

    const [notificationsResult, medicinesResult, appointmentsResult, exercisesResult] =
      await Promise.all([
        supabase.from("notifications").select("*").eq("user_id", userId),
        supabase.from("medicines").select("*").eq("user_id", userId),
        supabase.from("appointments").select("*").eq("user_id", userId),
        supabase.from("exercises").select("*").eq("user_id", userId),
      ]);

    for (const result of [
      notificationsResult,
      medicinesResult,
      appointmentsResult,
      exercisesResult,
    ]) {
      if (result.error) throw result.error;
    }

    const context = { userId, preferences, now };
    const generated = [
      ...strategies.medicamento.generarNotificacionPersistente(
        medicinesResult.data ?? [],
        context,
      ),
      ...strategies.cita.generarNotificacionPersistente(
        appointmentsResult.data ?? [],
        context,
      ),
      ...strategies.ejercicio.generarNotificacionPersistente(
        exercisesResult.data ?? [],
        context,
      ),
    ];

    const existingKeys = new Set((notificationsResult.data ?? []).map(notificationKey));
    const missing = generated.filter((notification) => !existingKeys.has(notificationKey(notification)));

    if (missing.length > 0) {
      const { error } = await supabase.from("notifications").insert(missing);
      if (error && error.code !== "23505") throw error;
    }

    return this.listar(userId);
  }

  async confirmar(userId, notification) {
    const { error: rpcError } = await supabase.rpc("confirm_reminder", {
      p_notification_id: notification.id,
    });

    if (!rpcError) return;

    // Compatibilidad mientras se aplica el script SQL del módulo.
    if (!["42883", "PGRST202"].includes(rpcError.code)) throw rpcError;

    const source = SOURCE_CONFIG[notification.type];
    const sourceId = source && notification[source.idField];

    if (source && sourceId) {
      const { error: sourceError } = await supabase
        .from(source.table)
        .update(source.completedValues)
        .eq("id", sourceId)
        .eq("user_id", userId);
      if (sourceError) throw sourceError;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notification.id)
      .eq("user_id", userId);
    if (error) throw error;
  }

  suscribir(userId, callback) {
    realtimeSubscriptionSequence += 1;
    const channel = supabase
      .channel(`notifications:${userId}:${realtimeSubscriptionSequence}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        callback,
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
}

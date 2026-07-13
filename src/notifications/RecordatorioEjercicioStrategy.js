import { IRecordatorioStrategy } from "./IRecordatorioStrategy";
import { subtractLeadMinutes } from "./reminderRules";

export class RecordatorioEjercicioStrategy extends IRecordatorioStrategy {
  generarNotificacionPersistente(exercises, context) {
    return exercises.flatMap((exercise) => {
      if (!exercise.is_active || exercise.is_completed || !exercise.scheduled_at) return [];

      const exerciseDate = new Date(exercise.scheduled_at);
      if (Number.isNaN(exerciseDate.getTime()) || exerciseDate <= context.now) return [];

      const scheduled = subtractLeadMinutes(
        exercise.scheduled_at,
        context.preferences.exerciseLeadMinutes,
      );
      if (!scheduled) return [];

      return [{
        user_id: context.userId,
        title: `Realizar ${exercise.name}`,
        message: exercise.description || "Rutina de ejercicio programada",
        type: "exercise",
        scheduled_for: scheduled.toISOString(),
        is_read: false,
        exercise_id: exercise.id,
      }];
    });
  }

  obtenerEstiloToast() {
    return { background: "#e8fdf0", color: "#1a5a2a", fontWeight: 700 };
  }

  obtenerTextoBoton() {
    return "Marcar realizado";
  }

  obtenerClaseBoton() {
    return "bg-mint-500 hover:bg-mint-500/80 text-white";
  }
}

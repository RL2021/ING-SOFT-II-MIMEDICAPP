import { IRecordatorioStrategy } from "./IRecordatorioStrategy";
import { subtractLeadMinutes } from "./reminderRules";

export class RecordatorioCitaMedicaStrategy extends IRecordatorioStrategy {
  generarNotificacionPersistente(appointments, context) {
    return appointments.flatMap((appointment) => {
      if (!appointment.has_reminder || appointment.is_completed || !appointment.appointment_date) {
        return [];
      }

      const appointmentDate = new Date(appointment.appointment_date);
      if (Number.isNaN(appointmentDate.getTime()) || appointmentDate <= context.now) return [];

      const scheduled = subtractLeadMinutes(
        appointmentDate,
        context.preferences.appointmentLeadMinutes,
      );
      if (!scheduled) return [];

      return [{
        user_id: context.userId,
        title: `Cita con ${appointment.doctor_name}`,
        message: [appointment.specialty, appointment.location].filter(Boolean).join(" · "),
        type: "appointment",
        scheduled_for: scheduled.toISOString(),
        is_read: false,
        appointment_id: appointment.id,
      }];
    });
  }

  obtenerEstiloToast() {
    return { background: "#eaf6ff", color: "#155e75", fontWeight: 700 };
  }

  obtenerTextoBoton() {
    return "Marcar asistida";
  }

  obtenerClaseBoton() {
    return "bg-skysoft-500 hover:bg-skysoft-500/80 text-white";
  }
}

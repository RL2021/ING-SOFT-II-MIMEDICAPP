import { IRecordatorioStrategy } from "./IRecordatorioStrategy";
import { calculateNextMedicineTake, subtractLeadMinutes } from "./reminderRules";

export class RecordatorioMedicamentoStrategy extends IRecordatorioStrategy {
  generarNotificacionPersistente(medicines, context) {
    // Compatibilidad con el contrato usado por las pruebas y el modulo de
    // Medicamentos del equipo antes de persistir los registros en Supabase.
    if (!context) {
      return medicines.flatMap((medicine) => {
        if (!medicine.nombre || !medicine.toma) return [];
        const [hours, minutes] = medicine.toma.split(":").map(Number);
        if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return [];

        const interval = medicine.frecuencia === "Cada 8 horas"
          ? 8
          : medicine.frecuencia === "Cada 12 horas" ? 12 : 24;
        const first = new Date();
        first.setHours(hours, minutes, 0, 0);
        const reminders = [];

        for (let take = first; take.getDate() === first.getDate(); take = new Date(take.getTime() + interval * 3600000)) {
          reminders.push({
            id: `medicine-${medicine.nombre}-${take.toISOString()}`,
            idRecordatorioMedicamento: `medicine-${medicine.nombre}-${take.toISOString()}`,
            tipo: "medicamento",
            activo: !medicine.completado,
            is_read: Boolean(medicine.completado),
            scheduled_for: take.toISOString(),
            title: `Tomar ${medicine.nombre}`,
            message: medicine.dosis || "Dosis indicada",
          });
        }
        return reminders;
      });
    }

    return medicines.flatMap((medicine) => {
      if (!medicine.is_active || medicine.is_taken) return [];

      const nextTake = calculateNextMedicineTake(
        medicine.next_take ?? medicine.first_take,
        medicine.frequency,
        context.now,
      );
      if (!nextTake) return [];

      const scheduled = subtractLeadMinutes(
        nextTake,
        context.preferences.medicineLeadMinutes,
      );
      if (!scheduled) return [];

      return [{
        user_id: context.userId,
        title: `Tomar ${medicine.name}`,
        message: `${medicine.dosage || "Dosis indicada"} · ${medicine.frequency || "Según indicación"}`,
        type: "medicine",
        scheduled_for: scheduled.toISOString(),
        is_read: false,
        medicine_id: medicine.id,
      }];
    });
  }

  obtenerEstiloToast() {
    return { background: "#fde8f0", color: "#8b1a4a", fontWeight: 700 };
  }

  obtenerTextoBoton() {
    return "Marcar tomado";
  }

  obtenerClaseBoton() {
    return "bg-lotus-500 hover:bg-lotus-400 text-white";
  }
}

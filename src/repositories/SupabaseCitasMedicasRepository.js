import { supabase } from "../lib/supabase";
import CitaMedica from "../models/CitasMedicas";
import CitasMedicasRepository from "./CitasMedicasRepository";

const TABLE_NAME = "appointments";

export default class SupabaseCitasMedicasRepository extends CitasMedicasRepository {
  async listarCitas(userId) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .order("appointment_date", { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map((cita) => this.crearCitaMedica(cita));
  }

  async crearCita(userId, cita) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(this.crearRegistroSupabase(cita, userId))
      .select()
      .single();

    if (error) {
      throw error;
    }

    return this.crearCitaMedica(data);
  }

  async actualizarCita(userId, cita) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(this.crearRegistroSupabase(cita, userId))
      .eq("id", cita.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return this.crearCitaMedica(data);
  }

  async eliminarCita(userId, citaId) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", citaId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  }

  crearRegistroSupabase(cita, userId) {
    return {
      user_id: userId,
      doctor_name: cita.doctor,
      specialty: cita.especialidad,
      location: cita.ubicacion,
      appointment_date: new Date(cita.fecha_hora_cita).toISOString(),
      notes: cita.notas || null,
      has_reminder: Boolean(cita.tiene_recordatorio),
      is_completed: Boolean(cita.asistida),
      updated_at: new Date().toISOString(),
    };
  }

  crearCitaMedica(cita) {
    return new CitaMedica({
      id: cita.id,
      usuario_id: cita.user_id,
      doctor: cita.doctor_name ?? "",
      especialidad: cita.specialty ?? "",
      ubicacion: cita.location ?? "",
      fecha_hora_cita: cita.appointment_date ?? "",
      notas: cita.notes ?? "",
      tiene_recordatorio: Boolean(cita.has_reminder),
      asistida: Boolean(cita.is_completed),
      fecha_creacion: cita.created_at,
      fecha_actualizacion: cita.updated_at,
    });
  }
}

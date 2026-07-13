import { supabase } from "../lib/supabase";

const toIso = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
const toLocalDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const mapExercise = (exercise) => ({
  id: exercise.id,
  nombre: exercise.name,
  horario: toLocalDateTime(exercise.scheduled_at),
  descripcion: exercise.description ?? "",
  activo: exercise.is_active,
  completado: exercise.is_completed,
});

const toRecord = (userId, exercise) => ({
  user_id: userId,
  name: exercise.nombre.trim(),
  description: exercise.descripcion.trim() || null,
  scheduled_at: toIso(exercise.horario),
  is_active: exercise.activo !== false,
  is_completed: Boolean(exercise.completado),
  updated_at: new Date().toISOString(),
});

export default class SupabaseExerciseRepository {
  async listar(userId) {
    const { data, error } = await supabase.from("exercises").select("*").eq("user_id", userId).order("id");
    if (error) throw error;
    return (data ?? []).map(mapExercise);
  }

  async crear(userId, exercise) {
    const { data, error } = await supabase.from("exercises").insert(toRecord(userId, exercise)).select().single();
    if (error) throw error;
    return mapExercise(data);
  }

  async actualizar(userId, exercise) {
    const { data, error } = await supabase.from("exercises").update(toRecord(userId, exercise)).eq("id", exercise.id).eq("user_id", userId).select().single();
    if (error) throw error;
    return mapExercise(data);
  }

  async eliminar(userId, ids) {
    if (ids.length === 0) return;
    const { error } = await supabase.from("exercises").delete().eq("user_id", userId).in("id", ids);
    if (error) throw error;
  }
}

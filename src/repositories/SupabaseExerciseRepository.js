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
  name: exercise.nombre?.trim() || "",
  description: exercise.descripcion?.trim() || null,
  scheduled_at: toIso(exercise.horario),
  is_active: exercise.activo !== false,
  is_completed: Boolean(exercise.completado),
  updated_at: new Date().toISOString(),
});

class SupabaseExerciseRepositoryClass {
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

  // =========================================================================
  // MÉTODOS PUENTE: Compatibilidad absoluta con Componentes y Tests antiguos
  // =========================================================================
  async listarEjercicios(userId) {
    return this.listar(userId);
  }

  async agregarEjercicio(userId, exercise) {
    return this.crear(userId, exercise);
  }

  async toggleComplete(userId, id, state) {
    const { data, error } = await supabase
      .from("exercises")
      .update({ is_completed: state, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return mapExercise(data);
  }

  async eliminarEjercicios(userId, ids) {
    return this.eliminar(userId, ids);
  }
}

// Creamos una instancia única compartida
const repositoryInstance = new SupabaseExerciseRepositoryClass();

// EXPORTACIÓN DUAL EXTRA SEGURA: Resuelve los problemas de sintaxis tanto para {} como por default
export { repositoryInstance as SupabaseExerciseRepository };
export default repositoryInstance;
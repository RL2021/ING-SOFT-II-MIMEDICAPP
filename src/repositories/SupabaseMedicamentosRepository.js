import { supabase } from "../lib/supabase";

export const SupabaseMedicamentosRepository = {

  mapearMedicamento(med) {
    const fecha = med.first_take ? new Date(med.first_take) : null;
    const primeraToma = fecha && !Number.isNaN(fecha.getTime())
      ? `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`
      : "";

    return {
      id: med.id,
      nombre: med.name,
      dosis: med.dosage,
      frecuencia: med.frequency,
      primera_toma: primeraToma,
      activo: med.is_active,
      tomado: med.is_taken,
    };
  },
  
  // Traer todos los medicamentos y mapearlos a español para el componente
  async listarMedicamentos() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return [];

    const { data, error } = await supabase
      .from("medicines") // Nombre de tu tabla en Supabase
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error en listarMedicamentos:", error.message);
      throw new Error(error.message);
    }

    // Convertimos lo que viene de la BD al formato que usa Medicines.jsx 
    return (data || []).map((med) => this.mapearMedicamento(med));
  },

  // Insertar mapeando los datos de forma compatible con la BD
  async agregarMedicamento(nuevoMedicamento) {
    // Obtener el ID del usuario autenticado automáticamente de la sesión activa
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || null;

    // Convertir el formato de hora "HH:MM" a un Timestamptz válido para hoy
    let timestampEnvio = null;
    if (nuevoMedicamento.primera_toma) {
      const hoy = new Date();
      const [horas, minutos] = nuevoMedicamento.primera_toma.split(":");
      hoy.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0, 0);
      timestampEnvio = hoy.toISOString(); // Formato ISO compatible con timestamptz
    }

    const payload = {
      user_id: currentUserId,
      name: nuevoMedicamento.nombre,
      dosage: nuevoMedicamento.dosis,
      frequency: nuevoMedicamento.frecuencia,
      first_take: timestampEnvio,
      next_take: timestampEnvio,
      is_active: nuevoMedicamento.activo,
      is_taken: nuevoMedicamento.tomado
    };

    const { data, error } = await supabase
      .from("medicines")
      .insert([payload])
      .select();

    if (error) {
      console.error("Error detallado en agregarMedicamento:", error.message);
      throw new Error(error.message);
    }

    const creado = data[0];
    return this.mapearMedicamento(creado);
  },

  // Actualizar mapeando los datos de forma compatible
  async editarMedicamento(id, medicamentoEditado) {
    const payload = {};
    if (medicamentoEditado.nombre !== undefined) payload.name = medicamentoEditado.nombre;
    if (medicamentoEditado.dosis !== undefined) payload.dosage = medicamentoEditado.dosis;
    if (medicamentoEditado.frecuencia !== undefined) payload.frequency = medicamentoEditado.frecuencia;
    
    if (medicamentoEditado.primera_toma !== undefined) {
      if (medicamentoEditado.primera_toma) {
        const hoy = new Date();
        const [horas, minutos] = medicamentoEditado.primera_toma.split(":");
        hoy.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0, 0);
        payload.first_take = hoy.toISOString();
        payload.next_take = payload.first_take;
      } else {
        payload.first_take = null;
      }
    }
    
    if (medicamentoEditado.activo !== undefined) payload.is_active = medicamentoEditado.activo;
    if (medicamentoEditado.tomado !== undefined) payload.is_taken = medicamentoEditado.tomado;

    const { data, error } = await supabase
      .from("medicines")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error en editarMedicamento:", error.message);
      throw new Error(error.message);
    }

    const editado = data[0];
    return this.mapearMedicamento(editado);
  },

  // Eliminar múltiples registros
  async eliminarMedicamentos(idsAEliminar) {
    const { error } = await supabase
      .from("medicines")
      .delete()
      .in("id", idsAEliminar);

    if (error) {
      console.error("Error en eliminarMedicamentos:", error.message);
      throw new Error(error.message);
    }
    return true;
  }
};

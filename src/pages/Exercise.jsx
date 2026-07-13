import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Dumbbell, Plus, Trash2, Edit3, CheckCircle2, X } from "lucide-react";
import DashboardMenu from "../components/DashboardMenu";
import { useAuth } from "../context/AuthContext"; // Extrae la sesión global[cite: 3]
import { SupabaseExerciseRepository } from "../repositories/SupabaseExerciseRepository"; // Abstracción de datos[cite: 3]

export default function Exercise() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Sesión activa[cite: 3]

  // Estados de datos
  const [exercises, setExercises] = useState([]);
  const [selectedEx, setSelectedEx] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // Estados para búsqueda y filtrado por pestañas
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Estados de flujo
  const [currentView, setCurrentView] = useState("list");
  const [deleteMode, setDeleteMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState([]); 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    horario: "",
    descripcion: "",
    completado: false
  });

  // 1. listarEjercicios(): Recuperación asíncrona mediante el patrón Repository (US-035)[cite: 1, 3]
  const listarEjercicios = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await SupabaseExerciseRepository.listarEjercicios(user.id);
      setExercises(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error al conectar con el servidor de salud.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      listarEjercicios();
    }
  }, [user]);

  // 2. agregarEjercicio(): Envío estructurado a la base de datos remota (US-034)[cite: 3]
  const agregarEjercicio = async () => {
    try {
      setErrorMessage("");
      const newRecord = await SupabaseExerciseRepository.agregarEjercicio(user.id, formData);
      setExercises([...exercises, newRecord]);
      setCurrentView("list");
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo guardar la rutina: " + error.message);
    }
  };

  // 3. editarEjercicio(): Actualización selectiva por ID único
  const editarEjercicio = async () => {
    try {
      setErrorMessage("");
      const updatedRecord = await SupabaseExerciseRepository.editarEjercicio(user.id, editingId, formData);
      setExercises(exercises.map((ex) => (ex.id === editingId ? updatedRecord : ex)));
      setEditingId(null);
      setCurrentView("list");
    } catch (error) {
      console.error(error);
      setErrorMessage("Error al actualizar la rutina.");
    }
  };

  // 4. eliminarEjercicio(): Remoción masiva controlada
  const eliminarEjercicio = async () => {
    try {
      setErrorMessage("");
      await SupabaseExerciseRepository.eliminarEjercicios(user.id, checkedIds);
      setExercises(exercises.filter((ex) => !checkedIds.includes(ex.id)));
      setCheckedIds([]);
      setDeleteMode(false);
      setShowDeleteModal(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error al eliminar los ejercicios seleccionados.");
    }
  };

  // 5. verDetalle(): Inspección visual
  const verDetalle = (ex) => {
    setSelectedEx(ex);
    setCurrentView("detail");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      window.alert("Por favor, ingresa al menos el nombre del ejercicio.");
      return;
    }

    if (editingId !== null) {
      editarEjercicio();
    } else {
      agregarEjercicio();
    }
  };

  const handleOpenForm = (ex = null) => {
    if (ex !== null) {
      setFormData({
        nombre: ex.nombre,
        horario: ex.horario || "",
        descripcion: ex.descripcion || "",
        completado: ex.completado
      });
      setEditingId(ex.id);
    } else {
      setFormData({ nombre: "", horario: "", descripcion: "", completado: false });
      setEditingId(null);
    }
    setCurrentView("form");
  };

  const toggleCheck = (id) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((item) => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const toggleComplete = async (ex, e) => {
    e.stopPropagation();
    try {
      const updated = await SupabaseExerciseRepository.toggleComplete(user.id, ex.id, !ex.completado);
      setExercises(exercises.map((item) => (item.id === ex.id ? updated : item)));
    } catch (error) {
      console.error(error);
    }
  };

  // US-036: Algoritmo de filtrado reactivo (Búsqueda + Pestaña)[cite: 3]
  const filteredExercises = exercises.filter((ex) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      ex.nombre.toLowerCase().includes(term) ||
      (ex.descripcion && ex.descripcion.toLowerCase().includes(term));
    
    if (statusFilter === "pending") return matchesSearch && !ex.completado;
    if (statusFilter === "completed") return matchesSearch && ex.completado;
    return matchesSearch;
  });

  // US-037: Métricas de progreso dinámicas[cite: 3]
  const totalCount = exercises.length;
  const completedCount = exercises.filter((e) => e.completado).length;
  const pendingCount = totalCount - completedCount;

  if (loading && user) {
    return (
    <div data-testid="loading-container" class="min-h-screen flex items-center justify-center bg-plum-50 text-plum-800 font-bold">
      Cargando rutinas en la nube...
    </div>
  );
}

  return (
    <div className="min-h-screen bg-plum-50 text-plum-800 font-sans">
      <DashboardMenu />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        
        {errorMessage && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 p-4 text-red-700 rounded-xl shadow-sm">
            <p className="text-sm font-bold">{errorMessage}</p>
          </div>
        )}
        
        {currentView === "list" && (
          <section>
            <div className="mb-6 flex flex-wrap gap-3 justify-between items-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500 hover:shadow-soft"
              >
                <ChevronLeft className="h-5 w-5" />
                Volver al panel
              </button>

              <div className="flex gap-2">
                {exercises.length > 0 && (
                  <button
                    onClick={() => { setDeleteMode(!deleteMode); setCheckedIds([]); }}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-black transition ${
                      deleteMode ? "bg-plum-200 text-plum-800" : "bg-white text-lotus-500 shadow-sm ring-1 ring-plum-100 hover:bg-plum-50"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteMode ? "Cancelar" : "Eliminar"}
                  </button>
                )}
                
                {!deleteMode && (
                  <button
                    onClick={() => handleOpenForm()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-plum-700 px-5 text-sm font-black text-white shadow-md hover:bg-plum-800"
                  >
                    <Plus className="h-4 w-4" /> Agregar
                  </button>
                )}
              </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
                  <Dumbbell className="h-7 w-7" strokeWidth={2.4} />
                </span>
                <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Ejercicio</h1>
              </div>

              {totalCount > 0 && (
                <div className="text-right">
                  <p className="text-sm font-bold text-plum-500">
                    Progreso: <span className="text-plum-800 font-black">{completedCount}/{totalCount}</span> completados
                  </p>
                  <div className="mt-1 h-2 w-36 overflow-hidden rounded-full bg-plum-100 inline-block">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(completedCount / totalCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Buscar ejercicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-white pl-5 pr-12 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-plum-400 hover:bg-plum-50 hover:text-plum-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {totalCount > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 text-sm font-black rounded-xl transition ${
                    statusFilter === "all" ? "bg-plum-700 text-white shadow-md" : "bg-white text-plum-600 border border-plum-100 hover:bg-plum-50"
                  }`}
                >
                  Todas ({totalCount})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-4 py-2 text-sm font-black rounded-xl transition ${
                    statusFilter === "pending" ? "bg-plum-700 text-white shadow-md" : "bg-white text-plum-600 border border-plum-100 hover:bg-plum-50"
                  }`}
                >
                  Pendientes ({pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`px-4 py-2 text-sm font-black rounded-xl transition ${
                    statusFilter === "completed" ? "bg-plum-700 text-white shadow-md" : "bg-white text-plum-600 border border-plum-100 hover:bg-plum-50"
                  }`}
                >
                  Completadas ({completedCount})
                </button>
              </div>
            )}

            <div className="grid gap-4">
              {totalCount === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-plum-200 bg-white/50 p-8 text-center ring-1 ring-plum-100">
                  <p className="text-lg font-medium text-plum-500 italic">No hay ejercicios registrados todavía.</p>
                </div>
              ) : filteredExercises.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-plum-200 bg-white/50 p-8 text-center ring-1 ring-plum-100">
                  <p className="text-lg font-medium text-plum-500 italic">No se encontraron ejercicios con los filtros actuales.</p>
                </div>
              ) : (
                filteredExercises.map((ex) => {
                  return (
                    <div
                      key={ex.id}
                      onClick={() => {
                        if (!deleteMode) {
                          verDetalle(ex);
                        }
                      }}
                      className={`group flex items-center justify-between rounded-3xl border-2 bg-white p-5 text-left shadow-sm transition ${
                        deleteMode ? "border-plum-200 cursor-pointer" : "border-plum-100 hover:-translate-y-0.5 hover:border-lotus-400 hover:shadow-soft cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {deleteMode && (
                          <input
                            type="checkbox"
                            checked={checkedIds.includes(ex.id)}
                            onChange={() => toggleCheck(ex.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 rounded accent-lotus-500"
                          />
                        )}
                        
                        {!deleteMode && (
                          <button
                            onClick={(e) => toggleComplete(ex, e)}
                            className={`mr-2 rounded-full transition p-1 ${
                              ex.completado ? "text-emerald-500" : "text-plum-300 hover:text-emerald-500"
                            }`}
                          >
                            <CheckCircle2 className="h-7 w-7" strokeWidth={ex.completado ? 2.8 : 1.8} />
                          </button>
                        )}

                        <div>
                          <h3 className={`text-xl font-black leading-tight text-plum-800 ${ex.completado ? "line-through opacity-50" : ""}`}>
                            {ex.nombre}
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-plum-500">
                            {ex.horario || "Sin horario"} — {ex.descripcion || "Sin descripción"}
                          </p>
                        </div>
                      </div>

                      {!deleteMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenForm(ex); }}
                          className="p-2 rounded-full text-plum-400 hover:bg-plum-50 hover:text-lotus-500 transition"
                        >
                          <Edit3 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {deleteMode && checkedIds.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-lotus-500 px-8 text-base font-black text-white shadow-lg transition hover:bg-lotus-400"
                >
                  Eliminar seleccionados ({checkedIds.length})
                </button>
              </div>
            )}
          </section>
        )}

        {/* Vista de Detalle */}
        {currentView === "detail" && selectedEx && (
          <section className="mx-auto max-w-xl">
            <button
              onClick={() => { setCurrentView("list"); setSelectedEx(null); }}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500"
            >
              <ChevronLeft className="h-5 w-5" /> Volver
            </button>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8 text-center">
              <h2 className="text-2xl font-black text-plum-800 mb-6 border-b border-plum-100 pb-4">
                {selectedEx.nombre}
              </h2>

              <div className="grid gap-4 text-lg text-left">
                <div className="flex justify-between py-2 border-b border-plum-50">
                  <span className="font-bold text-plum-700">Horario</span>
                  <span className="font-medium text-plum-600">{selectedEx.horario || "Sin horario"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-plum-50">
                  <span className="font-bold text-plum-700">Descripción</span>
                  <span className="font-medium text-plum-600">{selectedEx.descripcion || "Sin descripción"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-plum-50">
                  <span className="font-bold text-plum-700">Estado</span>
                  <span className={`font-bold ${selectedEx.completado ? "text-emerald-500" : "text-amber-500"}`}>
                    {selectedEx.completado ? "Completado" : "Pendiente"}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => handleOpenForm(selectedEx)}
                  className="flex-1 min-h-12 rounded-full border-2 border-plum-700 bg-white text-plum-700 font-extrabold transition hover:bg-plum-50"
                >
                  Editar Información
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Vista de Formulario */}
        {currentView === "form" && (
          <section className="mx-auto max-w-xl">
            <button
              onClick={() => setCurrentView("list")}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500"
            >
              <ChevronLeft className="h-5 w-5" /> Cancelar
            </button>

            <form className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8" onSubmit={handleFormSubmit}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-lotus-500">
                    {editingId !== null ? "Modificar" : "Nuevo"} ejercicio
                  </p>
                  <h1 className="mt-1 text-2xl font-black text-plum-800">
                    {editingId !== null ? "Editar rutina" : "Registrar ejercicio"}
                  </h1>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Nombre
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
                    placeholder="Ej. Estiramientos"
                    required
                  />
                </label>

                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Horario
                  <input
                    type="text"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
                    placeholder="Ej. 08:00 am"
                  />
                </label>

                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Descripción
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="h-32 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 p-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
                    placeholder="Ej. Estiramientos por 10 minutos"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-4 flex min-h-14 w-full items-center justify-center rounded-full bg-plum-700 px-6 py-3 text-lg font-extrabold text-white shadow-lg transition hover:bg-plum-800"
                >
                  {editingId !== null ? "Actualizar" : "Agregar"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* Modal de confirmación de borrado */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-soft ring-1 ring-plum-100 lg:p-8">
            <h3 className="text-xl font-black text-plum-800 mb-6">
              ¿Está seguro que desea eliminar?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={eliminarEjercicio}
                className="flex-1 min-h-12 rounded-full bg-plum-700 font-extrabold text-white transition hover:bg-plum-800"
              >
                SÍ
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 min-h-12 rounded-full border-2 border-plum-700 bg-white font-extrabold text-plum-700 transition hover:bg-plum-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Dumbbell, Plus, Trash2, Edit3, CheckCircle2 } from "lucide-react";
import DashboardMenu from "../components/DashboardMenu";

export default function Exercise() {
  const navigate = useNavigate();

  // Estados de datos
  const [exercises, setExercises] = useState([]);
  const [selectedEx, setSelectedEx] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Estados de flujo
  const [currentView, setCurrentView] = useState("list");
  const [deleteMode, setDeleteMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estado del formulario (basado en tus mockups)
  const [formData, setFormData] = useState({
    nombre: "",
    horario: "",
    descripcion: "",
    completado: false
  });

  // Cargar localStorage al iniciar
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("misEjercicios")) || [];
    setExercises(stored);
  }, []);

  const saveToStorage = (newList) => {
    setExercises(newList);
    localStorage.setItem("misEjercicios", JSON.stringify(newList));
  };

  // Abrir formulario
  const handleOpenForm = (index = null) => {
    if (index !== null) {
      setFormData(exercises[index]);
      setEditingIndex(index);
    } else {
      setFormData({ nombre: "", horario: "", descripcion: "", completado: false });
      setEditingIndex(null);
    }
    setCurrentView("form");
  };

  // Submit del formulario
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre) {
      window.alert("Por favor, ingresa al menos el nombre del ejercicio.");
      return;
    }

    let updatedList = [...exercises];
    if (editingIndex !== null) {
      updatedList[editingIndex] = formData;
    } else {
      updatedList.push(formData);
    }

    saveToStorage(updatedList);
    setCurrentView("list");
  };

  // Selección para borrar
  const toggleCheck = (index) => {
    if (checkedIds.includes(index)) {
      setCheckedIds(checkedIds.filter(id => id !== index));
    } else {
      setCheckedIds([...checkedIds, index]);
    }
  };

  // Confirmar eliminación
  const executeDelete = () => {
    const updatedList = exercises.filter((_, index) => !checkedIds.includes(index));
    saveToStorage(updatedList);
    setCheckedIds([]);
    setDeleteMode(false);
    setShowDeleteModal(false);
  };

  // Marcar como realizado
  const toggleComplete = (index, e) => {
    e.stopPropagation();
    const updatedList = [...exercises];
    updatedList[index].completado = !updatedList[index].completado;
    saveToStorage(updatedList);
  };

  return (
    <div className="min-h-screen bg-plum-50 text-plum-800 font-sans">
      <DashboardMenu />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        
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

            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
                <Dumbbell className="h-7 w-7" strokeWidth={2.4} />
              </span>
              <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Ejercicio</h1>
            </div>

            {/* Lista de ejercicios */}
            <div className="grid gap-4">
              {exercises.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-plum-200 bg-white/50 p-8 text-center ring-1 ring-plum-100">
                  <p className="text-lg font-medium text-plum-500 italic">No hay ejercicios registrados todavía.</p>
                </div>
              ) : (
                exercises.map((ex, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (!deleteMode) {
                        setSelectedEx({ ...ex, index });
                        setCurrentView("detail");
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
                          checked={checkedIds.includes(index)}
                          onChange={() => toggleCheck(index)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-5 w-5 rounded accent-lotus-500"
                        />
                      )}
                      
                      {!deleteMode && (
                        <button
                          onClick={(e) => toggleComplete(index, e)}
                          className={`mr-2 rounded-full transition p-1 ${
                            ex.completado ? "text-mint-500" : "text-plum-300 hover:text-mint-500"
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
                          {ex.horario || "Sin horario"} — {ex.descripcion}
                        </p>
                      </div>
                    </div>

                    {!deleteMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenForm(index); }}
                        className="p-2 rounded-full text-plum-400 hover:bg-plum-50 hover:text-lotus-500 transition"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))
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

        {/* Detalle */}
        {currentView === "detail" && selectedEx && (
          <section className="mx-auto max-w-xl">
            <button
              onClick={() => setCurrentView("list")}
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
                  <span className="font-medium text-plum-600">{selectedEx.horario || "08:00 am"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-plum-50">
                  <span className="font-bold text-plum-700">Descripción</span>
                  <span className="font-medium text-plum-600">{selectedEx.descripcion || "Sin descripción"}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => handleOpenForm(selectedEx.index)}
                  className="flex-1 min-h-12 rounded-full border-2 border-plum-700 bg-white text-plum-700 font-extrabold transition hover:bg-plum-50"
                >
                  Editar Información
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Formulario */}
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
                    {editingIndex !== null ? "Modificar" : "Nuevo"} ejercicio
                  </p>
                  <h1 className="mt-1 text-2xl font-black text-plum-800">
                    {editingIndex !== null ? "Editar rutina" : "Registrar ejercicio"}
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
                  {editingIndex !== null ? "Actualizar" : "Agregar"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-soft ring-1 ring-plum-100 lg:p-8">
            <h3 className="text-xl font-black text-plum-800 mb-6">
              ¿Está seguro que desea eliminar?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={executeDelete}
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
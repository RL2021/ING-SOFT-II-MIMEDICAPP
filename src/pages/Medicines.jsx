import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Pill, Plus, Trash2, Edit3, CheckCircle2 } from "lucide-react";
import DashboardMenu from "../components/DashboardMenu";
import { SupabaseMedicamentosRepository } from "../repositories/SupabaseMedicamentosRepository";

export default function Medicines() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null); 
  const [editingIndex, setEditingIndex] = useState(null); 
  
  const [currentView, setCurrentView] = useState("list");
  const [deleteMode, setDeleteMode] = useState(false); 
  const [checkedIds, setCheckedIds] = useState([]); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 

  const [formData, setFormData] = useState({
    nombre: "",
    dosis: "",
    frecuencia: "Cada 8 horas",
    primera_toma: "",      
    activo: true,          
    tomado: false          
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datos = await SupabaseMedicamentosRepository.listarMedicamentos();
        setMedicines(datos);
      } catch (err) {
        window.alert("No se pudieron cargar los medicamentos de la base de datos.");
      }
    };
    cargarDatos();
  }, []);

  const handleOpenForm = (index = null) => {
    if (index !== null) {
      setFormData(medicines[index]);
      setEditingIndex(index);
    } else {
      setFormData({ nombre: "", dosis: "", frecuencia: "Cada 8 horas", primera_toma: "", activo: true, tomado: false });
      setEditingIndex(null);
    }
    setCurrentView("form");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.dosis) {
      window.alert("Por favor, completa los campos principales (Nombre y Dosis).");
      return;
    }

    try {
      if (editingIndex !== null) {
        const medAEditar = medicines[editingIndex];
        const resultado = await SupabaseMedicamentosRepository.editarMedicamento(medAEditar.id, formData);
        
        const updatedList = [...medicines];
        updatedList[editingIndex] = resultado;
        setMedicines(updatedList);
      } else {
        const nuevoMed = await SupabaseMedicamentosRepository.agregarMedicamento(formData);
        setMedicines([...medicines, nuevoMed]);
      }
      setCurrentView("list");
    } catch (err) {
      window.alert("Error al intentar guardar el medicamento.");
    }
  };

  const toggleCheck = (id) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter(item => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const eliminarMedicamento = async () => {
    try {
      await SupabaseMedicamentosRepository.eliminarMedicamentos(checkedIds);
      const updatedList = medicines.filter((med) => !checkedIds.includes(med.id));
      setMedicines(updatedList);
      setCheckedIds([]);
      setDeleteMode(false);
      setShowDeleteModal(false);
    } catch (err) {
      window.alert("No se pudieron eliminar los elementos seleccionados.");
    }
  };

  const marcarComoTomado = async (index, e) => {
    e.stopPropagation(); 
    const med = medicines[index];
    const nuevoEstadoTomado = !med.tomado;

    try {
      const resultado = await SupabaseMedicamentosRepository.editarMedicamento(med.id, {
        tomado: nuevoEstadoTomado
      });
      
      const updatedList = [...medicines];
      updatedList[index] = resultado;
      setMedicines(updatedList);
    } catch (err) {
      window.alert("No se pudo actualizar el estado de la toma.");
    }
  };

  return (
    <div className="min-h-screen bg-plum-50 text-plum-800 font-sans">
      <DashboardMenu />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        
        {currentView === "list" && (
          <section>
            <div className="mb-6 flex flex-wrap gap-3 justify-between items-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500 hover:shadow-soft"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                Volver al panel
              </button>

              <div className="flex gap-2">
                {medicines.length > 0 && (
                  <button
                    type="button"
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
                    type="button"
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
                <Pill className="h-7 w-7" strokeWidth={2.4} />
              </span>
              <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Medicación</h1>
            </div>

            {medicines.length > 0 && (
              <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100">
                <div className="mb-3 flex justify-between items-center text-sm font-black text-plum-700">
                  <span>Progreso de tomas de hoy</span>
                  <span className="text-lotus-500">
                    {medicines.filter(m => m?.tomado).length} de {medicines.length} ({Math.round((medicines.filter(m => m?.tomado).length / medicines.length) * 100)}%)
                  </span>
                </div>
                
                <div className="h-6 w-full rounded-full bg-[#e1e4df] p-1 overflow-hidden flex items-center">
                  <div 
                    className="h-full rounded-full bg-[#ee2c70] transition-all duration-500 ease-out"
                    style={{ width: `${(medicines.filter(m => m?.tomado).length / medicines.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {medicines.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-plum-200 bg-white/50 p-8 text-center ring-1 ring-plum-100">
                  <p className="text-lg font-medium text-plum-500 italic">No hay medicamentos registrados todavía.</p>
                </div>
              ) : (
                <> 
                  {medicines.map((med, index) => (
                    <div
                      key={med.id || index}
                      onClick={() => {
                        if (!deleteMode) {
                          setSelectedMed({ ...med, index });
                          setCurrentView("detail"); 
                        }
                      }}
                      className={`group flex items-center justify-between rounded-3xl border-2 bg-white p-5 text-left shadow-sm transition mb-4 ${
                        deleteMode ? "border-plum-200 cursor-pointer" : "border-plum-100 hover:-translate-y-0.5 hover:border-lotus-400 hover:shadow-soft cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {deleteMode && (
                          <input
                            type="checkbox"
                            checked={checkedIds.includes(med.id)}
                            onChange={() => toggleCheck(med.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 rounded accent-lotus-500"
                          />
                        )}
                        
                        {!deleteMode && (
                          <button
                            type="button"
                            onClick={(e) => marcarComoTomado(index, e)}
                            className={`mr-2 rounded-full transition p-1 ${
                              med?.tomado ? "text-mint-500" : "text-plum-300 hover:text-mint-500"
                            }`}
                          >
                            <CheckCircle2 className="h-7 w-7" strokeWidth={med?.tomado ? 2.8 : 1.8} />
                          </button>
                        )}

                        <div>
                          <h3 className={`text-xl font-black leading-tight text-plum-800 ${med?.tomado ? "line-through opacity-50" : ""}`}>
                            {med.nombre}
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-plum-500">
                            {med.dosis} cada {med.frecuencia ? med.frecuencia.toLowerCase().replace("cada ", "") : ""}
                          </p>
                        </div>
                      </div>

                      {!deleteMode && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleOpenForm(index); }}
                          className="p-2 rounded-full text-plum-400 hover:bg-plum-50 hover:text-lotus-500 transition"
                          aria-label="Editar"
                        >
                          <Edit3 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </> 
              )}
            </div>

            {deleteMode && checkedIds.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-lotus-500 px-8 text-base font-black text-white shadow-lg shadow-lotus-500/20 transition hover:bg-lotus-400"
                >
                  Eliminar seleccionados ({checkedIds.length})
                </button>
              </div>
            )}
          </section>
        )}

        {currentView === "detail" && selectedMed && (
          <section className="mx-auto max-w-xl">
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Volver
            </button>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
              <h2 className="text-2xl font-black text-center text-plum-800 mb-6 border-b border-plum-100 pb-4">
                {selectedMed.nombre}
              </h2>

              <div className="grid gap-4 text-lg">
                <div className="flex justify-between py-2 border-b border-plum-50">
                  <span className="font-bold text-plum-700">Dosis</span>
                  <span className="font-medium text-plum-600">{selectedMed.dosis}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-plum-50">
                  <span className="font-bold text-plum-700">Primera toma</span>
                  <span className="font-medium text-plum-600">
                    {selectedMed.primera_toma ? new Date(selectedMed.primera_toma).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "No especificada"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-plum-50">
                  <span className="font-bold text-plum-700">Repetición</span>
                  <span className="font-medium text-plum-600">{selectedMed.frecuencia}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-bold text-plum-700">Estado</span>
                  <span className={`font-black uppercase tracking-wide text-sm rounded-xl px-3 py-1 ${
                    selectedMed?.tomado ? "bg-mint-100 text-mint-500" : "bg-lotus-100 text-lotus-500"
                  }`}>
                    {selectedMed?.tomado ? "Tomado" : "Pendiente"}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenForm(selectedMed.index)}
                  className="flex-1 min-h-12 rounded-full border-2 border-plum-700 bg-white text-plum-700 font-extrabold transition hover:bg-plum-50"
                >
                  Editar Información
                </button>
              </div>
            </div>
          </section>
        )}

        {currentView === "form" && (
          <section className="mx-auto max-w-xl">
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Cancelar
            </button>

            <form className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8" onSubmit={handleFormSubmit}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-lotus-500">
                    {editingIndex !== null ? "Modificar" : "Nuevo"} medicamento
                  </p>
                  <h1 className="mt-1 text-2xl font-black text-plum-800">
                    {editingIndex !== null ? "Editar información" : "Registrar tratamiento"}
                  </h1>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lotus-100 text-lotus-500">
                  <Pill className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>

              <div className="grid gap-4">
                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Nombre
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
                    placeholder="Escribe el nombre del medicamento"
                  />
                </label>

                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Dosis
                  <input
                    type="text"
                    value={formData.dosis}
                    onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                    className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
                    placeholder="Ej. 1 pastilla"
                  />
                </label>

                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Frecuencia
                  <select
                    value={formData.frecuencia}
                    onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
                    className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 transition hover:border-plum-200 focus:border-lotus-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Cada 8 horas">Cada 8 horas</option>
                    <option value="Cada 12 horas">Cada 12 horas</option>
                    <option value="Una vez al día">Una vez al día</option>
                  </select>
                </label>

                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Primera toma
                  <input
                    type="time"
                    value={formData.primera_toma}
                    onChange={(e) => setFormData({ ...formData, primera_toma: e.target.value })}
                    className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 transition hover:border-plum-200 focus:border-lotus-500 focus:bg-white focus:outline-none"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-4 flex min-h-14 w-full items-center justify-center rounded-full bg-plum-700 px-6 py-3 text-lg font-extrabold text-white shadow-lg shadow-plum-700/20 transition hover:bg-plum-800 active:scale-[0.98]"
                >
                  Confirmar datos
                </button>
              </div>
            </form>
          </section>
        )}

      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-soft ring-1 ring-plum-100 lg:p-8 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black text-plum-800 mb-6">
              ¿Está seguro que desea eliminar?
            </h3>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={eliminarMedicamento}
                className="flex-1 min-h-12 rounded-full bg-plum-700 font-extrabold text-white transition hover:bg-plum-800"
              >
                SÍ
              </button>
              <button
                type="button"
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

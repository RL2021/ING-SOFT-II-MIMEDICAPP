import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Utensils, Plus, Trash2, Edit3 } from "lucide-react";
import DashboardMenu from "../components/DashboardMenu";

export default function Foods() {
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentView, setCurrentView] = useState("list");
  const [deleteMode, setDeleteMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    detalles: "",
    esRecomendable: true,
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("misComidas")) || [];
    setFoods(stored);
  }, []);

  const saveToStorage = (newList) => {
    setFoods(newList);
    localStorage.setItem("misComidas", JSON.stringify(newList));
  };

  const handleOpenForm = (index = null) => {
    if (index !== null) {
      setFormData(foods[index]);
      setEditingIndex(index);
    } else {
      setFormData({ nombre: "", detalles: "", esRecomendable: true });
      setEditingIndex(null);
    }
    setCurrentView("form");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      window.alert("Por favor, ingresa el nombre del alimento.");
      return;
    }
    const updatedList = [...foods];
    if (editingIndex !== null) {
      updatedList[editingIndex] = formData;
    } else {
      updatedList.push(formData);
    }
    saveToStorage(updatedList);
    setCurrentView("list");
  };

  const toggleCheck = (index) => {
    if (checkedIds.includes(index)) {
      setCheckedIds(checkedIds.filter((id) => id !== index));
    } else {
      setCheckedIds([...checkedIds, index]);
    }
  };

  const executeDelete = () => {
    const updatedList = foods.filter((_, index) => !checkedIds.includes(index));
    saveToStorage(updatedList);
    setCheckedIds([]);
    setDeleteMode(false);
    setShowDeleteModal(false);
  };

  const recommended = foods
    .map((f, i) => ({ ...f, originalIndex: i }))
    .filter((f) => f.esRecomendable);

  const toAvoid = foods
    .map((f, i) => ({ ...f, originalIndex: i }))
    .filter((f) => !f.esRecomendable);

  const FoodCard = ({ food, originalIndex }) => (
    <div
      onClick={() => {
        if (!deleteMode) {
          setSelectedFood({ ...food, index: originalIndex });
          setCurrentView("detail");
        }
      }}
      className={`group flex items-center justify-between rounded-3xl border-2 bg-white p-5 text-left shadow-sm transition ${
        deleteMode
          ? "border-plum-200 cursor-pointer"
          : "border-plum-100 hover:-translate-y-0.5 hover:border-mint-400 hover:shadow-soft cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {deleteMode && (
          <input
            type="checkbox"
            checked={checkedIds.includes(originalIndex)}
            onChange={() => toggleCheck(originalIndex)}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 shrink-0 rounded accent-mint-500"
          />
        )}
        <div className="min-w-0">
          <h3 className="text-xl font-black leading-tight text-plum-800 truncate">
            {food.nombre}
          </h3>
          {food.detalles && (
            <p className="mt-1 text-sm font-medium text-plum-500 truncate max-w-xs">
              {food.detalles}
            </p>
          )}
        </div>
      </div>

      {!deleteMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenForm(originalIndex);
          }}
          className="shrink-0 p-2 rounded-full text-plum-400 hover:bg-plum-50 hover:text-mint-500 transition"
          aria-label="Editar"
        >
          <Edit3 className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-plum-50 text-plum-800 font-sans">
      <DashboardMenu />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── VISTA LISTA ── */}
        {currentView === "list" && (
          <section>
            <div className="mb-6 flex flex-wrap gap-3 justify-between items-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-mint-500 hover:shadow-soft"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                Volver al panel
              </button>

              <div className="flex gap-2">
                {foods.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteMode(!deleteMode);
                      setCheckedIds([]);
                    }}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-black transition ${
                      deleteMode
                        ? "bg-plum-200 text-plum-800"
                        : "bg-white text-lotus-500 shadow-sm ring-1 ring-plum-100 hover:bg-plum-50"
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
                    <Plus className="h-4 w-4" /> Añadir comida
                  </button>
                )}
              </div>
            </div>

            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-100 text-mint-500">
                <Utensils className="h-7 w-7" strokeWidth={2.4} />
              </span>
              <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Comidas</h1>
            </div>

            {foods.length === 0 ? (
              <div className="rounded-[2rem] border-2 border-dashed border-plum-200 bg-white/50 p-8 text-center ring-1 ring-plum-100">
                <p className="text-lg font-medium text-plum-500 italic">
                  Aquí encontrarás tu plan de alimentación. Añade tu primera comida.
                </p>
              </div>
            ) : (
              <>
                {recommended.length > 0 && (
                  <div className="mb-8">
                    <div className="grid gap-4">
                      {recommended.map((food) => (
                        <FoodCard
                          key={food.originalIndex}
                          food={food}
                          originalIndex={food.originalIndex}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {toAvoid.length > 0 && (
                  <div>
                    <h2 className="mb-4 text-xl font-black text-lotus-500">
                      Comidas a evitar
                    </h2>
                    <div className="grid gap-4">
                      {toAvoid.map((food) => (
                        <FoodCard
                          key={food.originalIndex}
                          food={food}
                          originalIndex={food.originalIndex}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

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

        {/* ── VISTA DETALLE ── */}
        {currentView === "detail" && selectedFood && (
          <section className="mx-auto max-w-xl">
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-mint-500"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Volver
            </button>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
              <h2 className="text-2xl font-black text-center text-plum-800 mb-6 border-b border-plum-100 pb-4">
                {selectedFood.nombre}
              </h2>

              <div className="grid gap-5 text-lg">
                {selectedFood.detalles && (
                  <div>
                    <p className="font-bold text-plum-700 mb-2">Detalles</p>
                    <ul className="space-y-1">
                      <li className="flex gap-2 text-plum-600 font-medium">
                        <span className="text-mint-500 shrink-0">•</span>
                        {selectedFood.detalles}
                      </li>
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-t border-plum-50">
                  <span className="font-bold text-plum-700">¿Es recomendable?</span>
                  <span
                    className={`font-black uppercase tracking-wide text-sm rounded-full px-4 py-1 ${
                      selectedFood.esRecomendable
                        ? "bg-mint-100 text-mint-500"
                        : "bg-lotus-100 text-lotus-500"
                    }`}
                  >
                    {selectedFood.esRecomendable ? "SÍ" : "NO"}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => handleOpenForm(selectedFood.index)}
                  className="w-full min-h-12 rounded-full border-2 border-plum-700 bg-white text-plum-700 font-extrabold transition hover:bg-plum-50"
                >
                  Editar información
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── VISTA FORMULARIO ── */}
        {currentView === "form" && (
          <section className="mx-auto max-w-xl">
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-mint-500"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Cancelar
            </button>

            <form
              className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8"
              onSubmit={handleFormSubmit}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-mint-500">
                    {editingIndex !== null ? "Modificar" : "Nueva"} comida
                  </p>
                  <h1 className="mt-1 text-2xl font-black text-plum-800">
                    {editingIndex !== null ? "Editar comida" : "Añadir comida"}
                  </h1>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-mint-100 text-mint-500">
                  <Utensils className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>

              <div className="grid gap-5">
                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Nombre
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-mint-500 focus:bg-white"
                    placeholder="Ej. Sopas, Ensalada César..."
                  />
                </label>

                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Detalles
                  <textarea
                    value={formData.detalles}
                    onChange={(e) =>
                      setFormData({ ...formData, detalles: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 py-3 text-base font-medium text-plum-800 outline-none transition focus:border-mint-500 focus:bg-white resize-none"
                    placeholder="Escribe los detalles o ingredientes..."
                  />
                </label>

                <div className="grid gap-3">
                  <p className="text-lg font-bold text-plum-800">¿Es recomendable?</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, esRecomendable: true })
                      }
                      className={`flex-1 min-h-12 rounded-full text-base font-extrabold border-2 transition ${
                        formData.esRecomendable
                          ? "bg-plum-700 border-plum-700 text-white"
                          : "bg-white border-plum-200 text-plum-600 hover:border-plum-400"
                      }`}
                    >
                      SÍ
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, esRecomendable: false })
                      }
                      className={`flex-1 min-h-12 rounded-full text-base font-extrabold border-2 transition ${
                        !formData.esRecomendable
                          ? "bg-lotus-500 border-lotus-500 text-white"
                          : "bg-white border-plum-200 text-plum-600 hover:border-plum-400"
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 flex min-h-14 w-full items-center justify-center rounded-full bg-plum-700 px-6 py-3 text-lg font-extrabold text-white shadow-lg shadow-plum-700/20 transition hover:bg-plum-800 active:scale-[0.98]"
                >
                  {editingIndex !== null ? "Actualizar" : "Añadir"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* ── MODAL CONFIRMACIÓN ELIMINAR ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-soft ring-1 ring-plum-100 lg:p-8 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black text-plum-800 mb-6">
              ¿Está seguro que desea eliminar?
            </h3>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={executeDelete}
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

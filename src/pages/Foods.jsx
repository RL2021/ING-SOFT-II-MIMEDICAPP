import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Apple,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
} from "lucide-react";

import DashboardMenu from "../components/DashboardMenu";

export default function Foods() {
  const navigate = useNavigate();

  // Estados
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // Flujo
  const [currentView, setCurrentView] = useState("list");
  const [deleteMode, setDeleteMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    name: "",
    detail: "",
    recommended: true,
  });

  // LocalStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("foods")) || [];
    setFoods(stored);
  }, []);

  const saveToStorage = (newList) => {
    setFoods(newList);
    localStorage.setItem("foods", JSON.stringify(newList));
  };

  // Abrir formulario
  const handleOpenForm = (index = null) => {
    if (index !== null) {
      setFormData(foods[index]);
      setEditingIndex(index);
    } else {
      setFormData({
        name: "",
        detail: "",
        recommended: true,
      });

      setEditingIndex(null);
    }

    setCurrentView("form");
  };

  // Guardar
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      window.alert("Ingresa el nombre de la comida.");
      return;
    }

    let updatedList = [...foods];

    if (editingIndex !== null) {
      updatedList[editingIndex] = formData;
    } else {
      updatedList.push(formData);
    }

    saveToStorage(updatedList);
    setCurrentView("list");
  };

  // Checkbox eliminar
  const toggleCheck = (index) => {
    if (checkedIds.includes(index)) {
      setCheckedIds(checkedIds.filter((id) => id !== index));
    } else {
      setCheckedIds([...checkedIds, index]);
    }
  };

  // Eliminar
  const executeDelete = () => {
    const updatedList = foods.filter(
      (_, index) => !checkedIds.includes(index)
    );

    saveToStorage(updatedList);

    setCheckedIds([]);
    setDeleteMode(false);
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-plum-50 text-plum-800 font-sans">
      <DashboardMenu />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* LISTA */}
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
                {foods.length > 0 && (
                  <button
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
                    onClick={() => handleOpenForm()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-plum-700 px-5 text-sm font-black text-white shadow-md hover:bg-plum-800"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </button>
                )}
              </div>
            </div>

            {/* TITULO */}
            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
                <Apple className="h-7 w-7" strokeWidth={2.4} />
              </span>

              <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">
                Alimentación
              </h1>
            </div>

            {/* LISTA */}
            <div className="grid gap-4">
              {foods.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-plum-200 bg-white/50 p-8 text-center ring-1 ring-plum-100">
                  <p className="text-lg font-medium text-plum-500 italic">
                    No hay comidas registradas todavía.
                  </p>
                </div>
              ) : (
                foods.map((food, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (!deleteMode) {
                        setSelectedFood({ ...food, index });
                        setCurrentView("detail");
                      }
                    }}
                    className={`group flex items-center justify-between rounded-3xl border-2 bg-white p-5 text-left shadow-sm transition ${
                      deleteMode
                        ? "border-plum-200 cursor-pointer"
                        : "border-plum-100 hover:-translate-y-0.5 hover:border-lotus-400 hover:shadow-soft cursor-pointer"
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
                          className={`mr-2 rounded-full transition p-1 ${
                            food.recommended
                              ? "text-mint-500"
                              : "text-lotus-500"
                          }`}
                        >
                          <CheckCircle2 className="h-7 w-7" />
                        </button>
                      )}

                      <div>
                        <h3 className="text-xl font-black leading-tight text-plum-800">
                          {food.name}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-plum-500">
                          {food.detail}
                        </p>
                      </div>
                    </div>

                    {!deleteMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenForm(index);
                        }}
                        className="p-2 rounded-full text-plum-400 hover:bg-plum-50 hover:text-lotus-500 transition"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* BOTON ELIMINAR */}
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

        {/* DETALLE */}
        {currentView === "detail" && selectedFood && (
          <section className="mx-auto max-w-xl">
            <button
              onClick={() => setCurrentView("list")}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500"
            >
              <ChevronLeft className="h-5 w-5" />
              Volver
            </button>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8 text-center">
              <h2 className="text-2xl font-black text-plum-800 mb-6 border-b border-plum-100 pb-4">
                {selectedFood.name}
              </h2>

              <div className="grid gap-4 text-lg text-left">
                <div className="flex justify-between py-2 border-b border-plum-50">
                  <span className="font-bold text-plum-700">Detalles</span>

                  <span className="font-medium text-plum-600">
                    {selectedFood.detail}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-plum-50">
                  <span className="font-bold text-plum-700">
                    Recomendable
                  </span>

                  <span className="font-medium text-plum-600">
                    {selectedFood.recommended ? "Sí" : "No"}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => handleOpenForm(selectedFood.index)}
                  className="flex-1 min-h-12 rounded-full border-2 border-plum-700 bg-white text-plum-700 font-extrabold transition hover:bg-plum-50"
                >
                  Editar Información
                </button>
              </div>
            </div>
          </section>
        )}

        {/* FORMULARIO */}
        {currentView === "form" && (
          <section className="mx-auto max-w-xl">
            <button
              onClick={() => setCurrentView("list")}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500"
            >
              <ChevronLeft className="h-5 w-5" />
              Cancelar
            </button>

            <form
              className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8"
              onSubmit={handleFormSubmit}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-lotus-500">
                    {editingIndex !== null ? "Modificar" : "Nueva"} comida
                  </p>

                  <h1 className="mt-1 text-2xl font-black text-plum-800">
                    {editingIndex !== null
                      ? "Editar comida"
                      : "Registrar comida"}
                  </h1>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Nombre
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
                    placeholder="Ej. Ensalada César"
                  />
                </label>

                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Detalles
                  <textarea
                    value={formData.detail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        detail: e.target.value,
                      })
                    }
                    className="h-32 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 p-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
                    placeholder="Ej. Ensalada saludable con verduras."
                  />
                </label>

                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  ¿Es recomendable?
                  <select
                    value={formData.recommended ? "si" : "no"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recommended: e.target.value === "si",
                      })
                    }
                    className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
                  >
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
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

      {/* MODAL */}
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
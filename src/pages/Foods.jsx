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
import { supabase } from "../lib/supabase";

export default function Foods() {
  const navigate = useNavigate();

  // Estados
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Cargar usuario y alimentos desde Supabase
  useEffect(() => {
    const loadFoods = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          navigate("/login");
          return;
        }

        setUserId(user.id);

        const { data, error } = await supabase
          .from("foods")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setFoods(data || []);
      } catch (error) {
        console.error("Error al cargar alimentos:", error);
        window.alert("No se pudieron cargar los alimentos.");
      } finally {
        setLoading(false);
      }
    };

    loadFoods();
  }, [navigate]);

  // Filtro de búsqueda
  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all"
        ? true
        : filterType === "recommended"
        ? food.recommended
        : !food.recommended;

    return matchesSearch && matchesFilter;
  });

  // Abrir formulario
  const handleOpenForm = (food = null) => {
    if (food) {
      setFormData({
        name: food.name,
        detail: food.detail || "",
        recommended: food.recommended,
      });

      setEditingFoodId(food.id);
    } else {
      setFormData({
        name: "",
        detail: "",
        recommended: true,
      });

      setEditingFoodId(null);
    }

    setCurrentView("form");
  };

  // Guardar alimento
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      window.alert("Ingresa el nombre de la comida.");
      return;
    }

    try {
      if (editingFoodId !== null) {
        const { data, error } = await supabase
          .from("foods")
          .update({
            name: formData.name,
            detail: formData.detail,
            recommended: formData.recommended,
          })
          .eq("id", editingFoodId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;

        setFoods((previousFoods) =>
          previousFoods.map((food) =>
            food.id === editingFoodId ? data : food
          )
        );
      } else {
        const { data, error } = await supabase
          .from("foods")
          .insert({
            user_id: userId,
            name: formData.name,
            detail: formData.detail,
            recommended: formData.recommended,
          })
          .select()
          .single();

        if (error) throw error;

        setFoods((previousFoods) => [data, ...previousFoods]);
      }

      setCurrentView("list");
    } catch (error) {
      console.error("Error al guardar alimento:", error);
      window.alert("No se pudo guardar el alimento.");
    }
  };

  // Checkbox eliminar
  const toggleCheck = (id) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((foodId) => foodId !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  // Eliminar alimentos
  const executeDelete = async () => {
    try {
      const { error } = await supabase
        .from("foods")
        .delete()
        .in("id", checkedIds)
        .eq("user_id", userId);

      if (error) throw error;

      setFoods((previousFoods) =>
        previousFoods.filter(
          (food) => !checkedIds.includes(food.id)
        )
      );

      setCheckedIds([]);
      setDeleteMode(false);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error al eliminar alimentos:", error);
      window.alert("No se pudieron eliminar los alimentos.");
    }
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

            {/* BUSCADOR */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar alimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 rounded-2xl border-2 border-plum-100 bg-white px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
              />
            </div>

            {/* FILTRO */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`rounded-full px-4 py-2 font-bold transition ${
                  filterType === "all"
                    ? "bg-plum-700 text-white"
                    : "bg-white text-plum-700 border border-plum-200"
                }`}
              >
                Todos
              </button>

              <button
                onClick={() => setFilterType("recommended")}
                className={`rounded-full px-4 py-2 font-bold transition ${
                  filterType === "recommended"
                    ? "bg-green-600 text-white"
                    : "bg-white text-plum-700 border border-plum-200"
                }`}
              >
                Recomendados
              </button>

              <button
                onClick={() => setFilterType("notRecommended")}
                className={`rounded-full px-4 py-2 font-bold transition ${
                  filterType === "notRecommended"
                    ? "bg-red-500 text-white"
                    : "bg-white text-plum-700 border border-plum-200"
                }`}
              >
                No recomendados
              </button>
            </div>

            <p className="mb-4 text-sm font-semibold text-plum-500">
              Mostrando {filteredFoods.length} alimentos
            </p>

            {/* LISTA */}
            <div className="grid gap-4">
              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-lg font-medium text-plum-500">
                    Cargando alimentos...
                  </p>
                </div>
              ) : filteredFoods.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-plum-200 bg-white/50 p-8 text-center ring-1 ring-plum-100">
                  <p className="text-lg font-medium text-plum-500 italic">
                    {searchTerm
                      ? "No se encontraron alimentos."
                      : "No hay comidas registradas todavía."}
                  </p>
                </div>
              ) : (
                filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => {
                      if (!deleteMode) {
                        setSelectedFood(food);
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
                          checked={checkedIds.includes(food.id)}
                          onChange={() => toggleCheck(food.id)}
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
                          handleOpenForm(food);
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
                  onClick={() => handleOpenForm(selectedFood)}
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
              <div className="mb-6">
                <h1 className="text-2xl font-black text-plum-800">
                  {editingFoodId !== null
                    ? "Editar comida"
                    : "Registrar comida"}
                </h1>
              </div>

              <div className="grid gap-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="h-14 w-full rounded-2xl border-2 border-plum-100 px-4"
                  placeholder="Nombre"
                />

                <textarea
                  value={formData.detail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detail: e.target.value,
                    })
                  }
                  className="h-32 w-full rounded-2xl border-2 border-plum-100 p-4"
                  placeholder="Detalles"
                />

                <select
                  value={formData.recommended ? "si" : "no"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recommended: e.target.value === "si",
                    })
                  }
                  className="h-14 w-full rounded-2xl border-2 border-plum-100 px-4"
                >
                  <option value="si">Recomendable</option>
                  <option value="no">No recomendable</option>
                </select>

                <button
                  type="submit"
                  className="mt-4 min-h-14 rounded-full bg-plum-700 text-white font-extrabold"
                >
                  {editingFoodId !== null ? "Actualizar" : "Agregar"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/40">
          <div className="bg-white p-8 rounded-3xl">
            <h3>¿Está seguro que desea eliminar?</h3>

            <div className="flex gap-4 mt-4">
              <button onClick={executeDelete}>Sí</button>

              <button onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
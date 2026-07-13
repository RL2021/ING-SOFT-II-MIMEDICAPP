import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Edit3,
  Eye,
  MapPin,
  NotebookText,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardMenu from "../components/DashboardMenu";
import { useAuth } from "../context/AuthContext";
import CitaMedica from "../models/CitasMedicas";
import SupabaseCitasMedicasRepository from "../repositories/SupabaseCitasMedicasRepository";

const citasMedicasRepository = new SupabaseCitasMedicasRepository();

const createEmptyForm = () => ({
  doctor: "",
  especialidad: "",
  ubicacion: "",
  fecha_hora_cita: "",
  notas: "",
  tiene_recordatorio: true,
});

const formatAppointmentDate = (value) => {
  if (!value) {
    return "Fecha pendiente";
  }

  return new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const isPastAppointment = (value) => {
  if (!value) {
    return false;
  }

  return new Date(value) < new Date();
};

const toDatetimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const getErrorMessage = (error, fallback) => {
  return error?.message || fallback;
};

export default function CitasMedicas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [formData, setFormData] = useState(createEmptyForm);
  const [editingCita, setEditingCita] = useState(null);
  const [editFormData, setEditFormData] = useState(createEmptyForm);
  const [feedback, setFeedback] = useState(null);
  const [formError, setFormError] = useState("");
  const [editFormError, setEditFormError] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [citaToDelete, setCitaToDelete] = useState(null);
  const [selectedCita, setSelectedCita] = useState(null);
  const [isLoadingCitas, setIsLoadingCitas] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const cargarCitas = async () => {
      if (!user?.id) {
        setCitas([]);
        setIsLoadingCitas(false);
        return;
      }

      try {
        setIsLoadingCitas(true);
        const citasRecuperadas = await citasMedicasRepository.listarCitas(user.id);
        setCitas(CitaMedica.listarCitas(citasRecuperadas));
      } catch (error) {
        setFeedback({
          type: "error",
          message: getErrorMessage(error, "No se pudieron cargar tus citas medicas."),
        });
      } finally {
        setIsLoadingCitas(false);
      }
    };

    cargarCitas();
  }, [user?.id]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 3200);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const citasPendientes = citas.filter((cita) => !cita.asistida);
  const cantidadCitasAsistidas = citas.filter((cita) => cita.asistida).length;
  const proximaCita = CitaMedica.listarCitas(
    citasPendientes.filter((cita) => !isPastAppointment(cita.fecha_hora_cita)),
  )[0];
  const citasOrdenadas = useMemo(() => CitaMedica.listarCitas(citas), [citas]);
  const citasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return citasOrdenadas.filter((cita) => {
      const matchesStatus =
        statusFilter === "todas" ||
        (statusFilter === "pendientes" && !cita.asistida) ||
        (statusFilter === "asistidas" && cita.asistida);

      const matchesSearch =
        !term ||
        cita.doctor.toLowerCase().includes(term) ||
        cita.especialidad.toLowerCase().includes(term) ||
        cita.ubicacion.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [citasOrdenadas, searchTerm, statusFilter]);
  const citasProximas = citasFiltradas.filter((cita) => !isPastAppointment(cita.fecha_hora_cita));
  const citasPasadas = citasFiltradas.filter((cita) => isPastAppointment(cita.fecha_hora_cita));
  const selectedCitaDetalle = selectedCita ? new CitaMedica(selectedCita).verDetalle() : null;

  const agendarCita = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!user?.id) {
      setFormError("Debes iniciar sesion para registrar una cita.");
      return;
    }

    const datosCita = {
      doctor: formData.doctor.trim(),
      especialidad: formData.especialidad.trim(),
      ubicacion: formData.ubicacion.trim(),
      fecha_hora_cita: formData.fecha_hora_cita,
      notas: formData.notas.trim(),
      tiene_recordatorio: formData.tiene_recordatorio,
    };

    if (!datosCita.doctor || !datosCita.especialidad || !datosCita.ubicacion || !datosCita.fecha_hora_cita) {
      setFormError("Completa doctor, especialidad, ubicacion y fecha para guardar la cita.");
      return;
    }

    if (isPastAppointment(datosCita.fecha_hora_cita)) {
      setFormError("La fecha y hora de la cita no puede ser anterior al momento actual.");
      return;
    }

    const nuevaCita = new CitaMedica(datosCita).agendarCita();

    try {
      setIsSaving(true);
      const citaGuardada = await citasMedicasRepository.crearCita(user.id, nuevaCita);
      setCitas((citasActuales) => CitaMedica.listarCitas([...citasActuales, citaGuardada]));
      setFormData(createEmptyForm());
      setFeedback({ type: "success", message: "Cita registrada correctamente en Supabase." });
    } catch (error) {
      setFormError(getErrorMessage(error, "No se pudo registrar la cita medica."));
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  };

  const updateEditField = (field, value) => {
    setEditFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  };

  const editarCita = (cita) => {
    const detalleCita = new CitaMedica(cita).verDetalle();
    setFormError("");
    setEditFormError("");
    setEditingCita(cita);
    setEditFormData({
      doctor: detalleCita.doctor,
      especialidad: detalleCita.especialidad,
      ubicacion: detalleCita.ubicacion,
      fecha_hora_cita: toDatetimeLocalValue(detalleCita.fecha_hora_cita),
      notas: detalleCita.notas,
      tiene_recordatorio: detalleCita.tiene_recordatorio,
    });
  };

  const cancelEdit = () => {
    setEditingCita(null);
    setEditFormData(createEmptyForm());
    setEditFormError("");
  };

  const actualizarCita = async (event) => {
    event.preventDefault();
    setEditFormError("");

    if (!editingCita) {
      return;
    }

    if (!user?.id) {
      setEditFormError("Debes iniciar sesion para actualizar una cita.");
      return;
    }

    const datosCita = {
      doctor: editFormData.doctor.trim(),
      especialidad: editFormData.especialidad.trim(),
      ubicacion: editFormData.ubicacion.trim(),
      fecha_hora_cita: editFormData.fecha_hora_cita,
      notas: editFormData.notas.trim(),
      tiene_recordatorio: editFormData.tiene_recordatorio,
    };

    if (!datosCita.doctor || !datosCita.especialidad || !datosCita.ubicacion || !datosCita.fecha_hora_cita) {
      setEditFormError("Completa doctor, especialidad, ubicacion y fecha para actualizar la cita.");
      return;
    }

    if (isPastAppointment(datosCita.fecha_hora_cita)) {
      setEditFormError("La fecha y hora de la cita no puede ser anterior al momento actual.");
      return;
    }

    try {
      setIsSaving(true);
      const citaActualizada = new CitaMedica(editingCita).editarCita(datosCita);
      const citaGuardada = await citasMedicasRepository.actualizarCita(user.id, citaActualizada);

      setCitas((citasActuales) =>
        CitaMedica.listarCitas(
          citasActuales.map((cita) => (cita.id === citaGuardada.id ? citaGuardada : cita)),
        ),
      );

      if (selectedCita?.id === citaGuardada.id) {
        setSelectedCita(citaGuardada);
      }

      setFeedback({ type: "success", message: "Cita actualizada correctamente en Supabase." });
      cancelEdit();
    } catch (error) {
      setEditFormError(getErrorMessage(error, "No se pudo actualizar la cita medica."));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!citaToDelete) {
      return;
    }

    if (!user?.id) {
      setFeedback({ type: "error", message: "Debes iniciar sesion para eliminar una cita." });
      setCitaToDelete(null);
      return;
    }

    try {
      setIsSaving(true);
      await citasMedicasRepository.eliminarCita(user.id, citaToDelete.id);

      setCitas((citasActuales) => new CitaMedica(citaToDelete).eliminarCita(citasActuales));

      if (editingCita?.id === citaToDelete.id) {
        cancelEdit();
      }

      if (selectedCita?.id === citaToDelete.id) {
        setSelectedCita(null);
      }

      setFeedback({ type: "success", message: "Cita eliminada correctamente de Supabase." });
      setCitaToDelete(null);
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "No se pudo eliminar la cita medica.") });
    } finally {
      setIsSaving(false);
    }
  };

  const cambiarAsistenciaCita = async (citaSeleccionada) => {
    if (!user?.id) {
      setFeedback({ type: "error", message: "Debes iniciar sesion para cambiar el estado de una cita." });
      return;
    }

    const citaActualizada =
      citaSeleccionada.asistida
        ? new CitaMedica(citaSeleccionada).reabrirCita()
        : new CitaMedica(citaSeleccionada).marcarComoAsistida();

    try {
      setIsSaving(true);
      const citaGuardada = await citasMedicasRepository.actualizarCita(user.id, citaActualizada);

      setCitas((citasActuales) =>
        CitaMedica.listarCitas(
          citasActuales.map((cita) => (cita.id === citaGuardada.id ? citaGuardada : cita)),
        ),
      );

      if (selectedCita?.id === citaGuardada.id) {
        setSelectedCita(citaGuardada);
      }

      setFeedback({
        type: "success",
        message: citaGuardada.asistida ? "Cita marcada como asistida." : "Cita reabierta correctamente.",
      });
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "No se pudo actualizar el estado de la cita.") });
    } finally {
      setIsSaving(false);
    }
  };

  const renderCitaCard = (cita) => (
    <article
      key={cita.id}
      className={`flex min-h-72 flex-col rounded-3xl border-2 p-5 shadow-sm transition hover:shadow-soft ${
        cita.asistida
          ? "border-mint-100 bg-mint-100/50 hover:border-mint-500"
          : "border-plum-100 bg-white hover:border-skysoft-500"
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-skysoft-100 text-skysoft-500">
          <Stethoscope className="h-8 w-8" aria-hidden="true" />
        </span>
        <div className="flex flex-wrap justify-end gap-2">
          {cita.asistida && (
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-100 px-3 py-2 text-xs font-black text-mint-500">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Asistida
            </span>
          )}
          {isPastAppointment(cita.fecha_hora_cita) && (
            <span className="inline-flex items-center gap-2 rounded-full bg-plum-100 px-3 py-2 text-xs font-black text-plum-500">
              Pasada
            </span>
          )}
        </div>
      </div>

      <h3 className="text-xl font-black leading-tight text-plum-800">{cita.doctor}</h3>
      <p className="mt-2 flex items-center gap-2 text-sm font-bold text-plum-600">
        <UserRound className="h-4 w-4 text-skysoft-500" aria-hidden="true" />
        {cita.especialidad}
      </p>

      <div className="mt-5 grid gap-3 text-sm font-semibold text-plum-600">
        <p className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-lotus-500" aria-hidden="true" />
          {formatAppointmentDate(cita.fecha_hora_cita)}
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lotus-500" aria-hidden="true" />
          {cita.ubicacion}
        </p>
        {cita.notas && (
          <p className="flex items-start gap-2">
            <NotebookText className="mt-0.5 h-4 w-4 shrink-0 text-lotus-500" aria-hidden="true" />
            {cita.notas}
          </p>
        )}
      </div>

      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setSelectedCita(cita)}
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-skysoft-100 px-3 text-sm font-black text-skysoft-500 transition hover:bg-skysoft-500 hover:text-white"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Detalle
        </button>
        <button
          type="button"
          onClick={() => editarCita(cita)}
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-plum-50 px-3 text-sm font-black text-plum-700 transition hover:bg-plum-100"
        >
          <Edit3 className="h-4 w-4" aria-hidden="true" />
          Editar
        </button>
        <button
          type="button"
          onClick={() => cambiarAsistenciaCita(cita)}
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-mint-100 px-3 text-sm font-black text-mint-500 transition hover:bg-mint-500 hover:text-white"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {cita.asistida ? "Reabrir" : "Asistida"}
        </button>
        <button
          type="button"
          onClick={() => setCitaToDelete(cita)}
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-lotus-100 px-3 text-sm font-black text-lotus-500 transition hover:bg-lotus-500 hover:text-white"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Eliminar
        </button>
      </div>
    </article>
  );

  return (
    <main className="min-h-screen bg-plum-50 text-plum-800">
      <DashboardMenu />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500 hover:shadow-soft"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          Volver al panel
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-skysoft-100 px-4 py-2 text-sm font-black text-skysoft-500">
                  <CalendarClock className="h-5 w-5" aria-hidden="true" />
                  Citas medicas
                </p>
                <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Agenda de consultas</h1>
                <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-plum-600 sm:text-lg">
                  Organiza tus doctores, horarios, ubicaciones y notas importantes.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:min-w-80">
                <div className="rounded-3xl bg-skysoft-100 p-4">
                  <p className="text-3xl font-black text-skysoft-500">{citas.length}</p>
                  <p className="text-sm font-bold text-plum-600">Total</p>
                </div>
                <div className="rounded-3xl bg-plum-50 p-4 ring-1 ring-plum-100">
                  <p className="text-3xl font-black text-plum-800">{citasPendientes.length}</p>
                  <p className="text-sm font-bold text-plum-500">Pendientes</p>
                </div>
                <div className="rounded-3xl bg-lotus-100 p-4">
                  <p className="text-3xl font-black text-lotus-500">{cantidadCitasAsistidas}</p>
                  <p className="text-sm font-bold text-plum-600">Asistidas</p>
                </div>
              </div>
            </div>

            {proximaCita && (
              <div className="mt-7 rounded-3xl bg-plum-600 p-5 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-plum-100">Proxima cita</p>
                  <h2 className="mt-1 text-2xl font-black">{proximaCita.doctor}</h2>
                  <p className="mt-2 font-semibold text-plum-100">{proximaCita.especialidad}</p>
                </div>
                <div className="rounded-3xl bg-white/12 px-4 py-3">
                  <p className="flex items-center gap-2 text-lg font-black">
                    <Clock3 className="h-5 w-5 text-lotus-400" aria-hidden="true" />
                    {formatAppointmentDate(proximaCita.fecha_hora_cita)}
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-plum-100">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lotus-400" aria-hidden="true" />
                    {proximaCita.ubicacion}
                  </p>
                </div>
              </div>
            </div>
            )}
          </section>

          <form className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8" onSubmit={agendarCita}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-lotus-500">
                  Nueva cita
                </p>
                <h2 className="mt-1 text-2xl font-black text-plum-800">
                  Registrar atencion
                </h2>
              </div>
            </div>

            {formError && (
              <div className="mb-5 rounded-2xl bg-lotus-100 px-4 py-3 text-sm font-black text-lotus-500">
                {formError}
              </div>
            )}

            {feedback && (
              <div
                className={`mb-5 rounded-2xl px-4 py-3 text-sm font-black ${
                  feedback.type === "error"
                    ? "bg-lotus-100 text-lotus-500"
                    : "bg-mint-100 text-mint-500"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-black text-plum-700">
                Doctor
                <input
                  required
                  value={formData.doctor}
                  onChange={(event) => updateField("doctor", event.target.value)}
                  className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  placeholder="Nombre del doctor"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-plum-700">
                  Especialidad
                  <input
                    required
                    value={formData.especialidad}
                    onChange={(event) => updateField("especialidad", event.target.value)}
                    className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                    placeholder="Cardiologia"
                  />
                </label>

                <label className="grid gap-2 text-sm font-black text-plum-700">
                  Fecha y hora
                  <input
                    required
                    type="datetime-local"
                    value={formData.fecha_hora_cita}
                    onChange={(event) => updateField("fecha_hora_cita", event.target.value)}
                    className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-black text-plum-700">
                Ubicacion
                <input
                  required
                  value={formData.ubicacion}
                  onChange={(event) => updateField("ubicacion", event.target.value)}
                  className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  placeholder="Clinica, hospital o enlace virtual"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-plum-700">
                Notas
                <textarea
                  value={formData.notas}
                  onChange={(event) => updateField("notas", event.target.value)}
                  className="min-h-28 resize-none rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 py-3 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  placeholder="Indicaciones, documentos o sintomas importantes"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border-2 border-plum-100 bg-plum-50 p-4 text-sm font-black text-plum-700">
                <input
                  type="checkbox"
                  checked={formData.tiene_recordatorio}
                  onChange={(event) => updateField("tiene_recordatorio", event.target.checked)}
                  className="h-5 w-5 accent-lotus-500"
                />
                Crear recordatorio para esta cita
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lotus-500 px-5 text-base font-black text-white transition hover:bg-lotus-400"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                {isSaving ? "Guardando..." : "Guardar cita"}
              </button>
            </div>
          </form>
        </div>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-skysoft-500">Listado</p>
              <h2 className="mt-1 text-2xl font-black text-plum-800">Tus citas programadas</h2>
            </div>
            <div className="grid gap-3 lg:min-w-[34rem]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-plum-400" aria-hidden="true" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="min-h-12 w-full rounded-2xl border-2 border-plum-100 bg-plum-50 py-2 pl-12 pr-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  placeholder="Buscar por doctor, especialidad o ubicacion"
                />
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["todas", "Todas"],
                  ["pendientes", "Pendientes"],
                  ["asistidas", "Asistidas"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`min-h-10 rounded-full px-3 text-sm font-black transition ${
                      statusFilter === value
                        ? "bg-plum-700 text-white shadow-md"
                        : "bg-plum-50 text-plum-600 hover:bg-plum-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoadingCitas && (
            <div className="mt-6 rounded-3xl bg-plum-50 p-8 text-center">
              <p className="text-lg font-black text-plum-800">Cargando tus citas medicas...</p>
              <p className="mt-2 font-semibold text-plum-600">Estamos consultando la base de datos.</p>
            </div>
          )}

          {!isLoadingCitas && citasFiltradas.length > 0 && (
            <div className="mt-6 grid gap-7">
              <div>
                <h3 className="mb-4 text-lg font-black text-plum-800">Proximas citas</h3>
                {citasProximas.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-3">
                    {citasProximas.map((cita) => renderCitaCard(cita))}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-plum-50 p-4 text-sm font-bold text-plum-500">
                    No hay citas proximas.
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-4 text-lg font-black text-plum-800">Citas pasadas</h3>
                {citasPasadas.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-3">
                    {citasPasadas.map((cita) => renderCitaCard(cita))}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-plum-50 p-4 text-sm font-bold text-plum-500">
                    No hay citas pasadas.
                  </p>
                )}
              </div>
            </div>
          )}

          {!isLoadingCitas && citas.length === 0 && (
            <div className="mt-6 rounded-3xl border-2 border-dashed border-plum-100 bg-plum-50 p-8 text-center">
              <p className="text-lg font-black text-plum-800">No hay citas para mostrar</p>
              <p className="mt-2 font-semibold text-plum-600">Registra una nueva cita para verla en tu agenda.</p>
            </div>
          )}

          {!isLoadingCitas && citas.length > 0 && citasFiltradas.length === 0 && (
            <div className="mt-6 rounded-3xl border-2 border-dashed border-plum-100 bg-plum-50 p-8 text-center">
              <p className="text-lg font-black text-plum-800">No se encontraron citas</p>
              <p className="mt-2 font-semibold text-plum-600">Seleccione otra opción o cambie el texto de busqueda.</p>
            </div>
          )}
        </section>
      </section>

      {selectedCitaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/45 p-4 backdrop-blur-sm">
          <section className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-skysoft-500">Detalle de cita</p>
                <h2 className="mt-1 text-2xl font-black text-plum-800">{selectedCitaDetalle.doctor}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCita(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-plum-50 text-plum-700 transition hover:bg-plum-100"
                aria-label="Cerrar detalle"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-3 text-base font-semibold text-plum-600">
              <p><span className="font-black text-plum-800">Especialidad:</span> {selectedCitaDetalle.especialidad}</p>
              <p><span className="font-black text-plum-800">Fecha y hora:</span> {formatAppointmentDate(selectedCitaDetalle.fecha_hora_cita)}</p>
              <p><span className="font-black text-plum-800">Ubicacion:</span> {selectedCitaDetalle.ubicacion}</p>
              <p><span className="font-black text-plum-800">Estado:</span> {selectedCitaDetalle.asistida ? "Asistida" : "Pendiente"}</p>
              <p><span className="font-black text-plum-800">Notas:</span> {selectedCitaDetalle.notas || "Sin notas registradas"}</p>
            </div>
          </section>
        </div>
      )}

      {editingCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/45 p-4 backdrop-blur-sm">
          <form
            onSubmit={actualizarCita}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-lotus-500">Editar cita</p>
                <h2 className="mt-1 text-2xl font-black text-plum-800">Actualizar atencion</h2>
                <p className="mt-2 text-sm font-semibold text-plum-500">
                  Modifica los datos necesarios y guarda los cambios.
                </p>
              </div>
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-plum-50 text-plum-700 transition hover:bg-plum-100"
                aria-label="Cerrar edicion"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {editFormError && (
              <div className="mb-5 rounded-2xl bg-lotus-100 px-4 py-3 text-sm font-black text-lotus-500">
                {editFormError}
              </div>
            )}

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-black text-plum-700">
                Doctor
                <input
                  required
                  value={editFormData.doctor}
                  onChange={(event) => updateEditField("doctor", event.target.value)}
                  className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  placeholder="Nombre del doctor"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-plum-700">
                  Especialidad
                  <input
                    required
                    value={editFormData.especialidad}
                    onChange={(event) => updateEditField("especialidad", event.target.value)}
                    className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                    placeholder="Cardiologia"
                  />
                </label>

                <label className="grid gap-2 text-sm font-black text-plum-700">
                  Fecha y hora
                  <input
                    required
                    type="datetime-local"
                    value={editFormData.fecha_hora_cita}
                    onChange={(event) => updateEditField("fecha_hora_cita", event.target.value)}
                    className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-black text-plum-700">
                Ubicacion
                <input
                  required
                  value={editFormData.ubicacion}
                  onChange={(event) => updateEditField("ubicacion", event.target.value)}
                  className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  placeholder="Clinica, hospital o enlace virtual"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-plum-700">
                Notas
                <textarea
                  value={editFormData.notas}
                  onChange={(event) => updateEditField("notas", event.target.value)}
                  className="min-h-28 resize-none rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 py-3 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  placeholder="Indicaciones, documentos o sintomas importantes"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border-2 border-plum-100 bg-plum-50 p-4 text-sm font-black text-plum-700">
                <input
                  type="checkbox"
                  checked={editFormData.tiene_recordatorio}
                  onChange={(event) => updateEditField("tiene_recordatorio", event.target.checked)}
                  className="h-5 w-5 accent-lotus-500"
                />
                Mantener recordatorio para esta cita
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={isSaving}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-plum-200 bg-white px-5 text-base font-black text-plum-700 transition hover:bg-plum-50"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lotus-500 px-5 text-base font-black text-white transition hover:bg-lotus-400"
                >
                  <Edit3 className="h-5 w-5" aria-hidden="true" />
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {citaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/45 p-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-soft ring-1 ring-plum-100">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
              <Trash2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-black text-plum-800">Eliminar cita</h2>
            <p className="mt-3 font-semibold text-plum-600">
              Estas seguro de eliminar la cita con {citaToDelete.doctor}? Esta accion no se puede deshacer.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCitaToDelete(null)}
                disabled={isSaving}
                className="min-h-12 rounded-full border-2 border-plum-200 bg-white px-5 text-base font-black text-plum-700 transition hover:bg-plum-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={isSaving}
                className="min-h-12 rounded-full bg-lotus-500 px-5 text-base font-black text-white transition hover:bg-lotus-400"
              >
                {isSaving ? "Eliminando..." : "Si, eliminar"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

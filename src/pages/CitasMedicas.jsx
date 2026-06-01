import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Edit3,
  MapPin,
  NotebookText,
  Plus,
  Stethoscope,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardMenu from "../components/DashboardMenu";
import CitaMedica from "../models/CitasMedicas";
import LocalStorageCitasMedicasRepository from "../repositories/LocalStorageCitasMedicasRepository";

const citasMedicasRepository = new LocalStorageCitasMedicasRepository();

const createEmptyForm = () => ({
  doctor: "",
  especialidad: "",
  ubicacion: "",
  fecha_hora_cita: "",
  notas: "",
  tiene_recordatorio: false,
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

export default function CitasMedicas() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState(() => citasMedicasRepository.listarCitas());
  const [formData, setFormData] = useState(createEmptyForm);
  const [editingCitaId, setEditingCitaId] = useState(null);

  useEffect(() => {
    citasMedicasRepository.guardarCitas(citas);
  }, [citas]);

  const citasPendientes = citas.filter((cita) => !cita.asistida);
  const cantidadCitasAsistidas = citas.filter((cita) => cita.asistida).length;
  const proximaCita = CitaMedica.listarCitas(citasPendientes)[0];
  const citasOrdenadas = useMemo(() => CitaMedica.listarCitas(citas), [citas]);

  const agendarCita = (event) => {
    event.preventDefault();

    const datosCita = {
      doctor: formData.doctor.trim(),
      especialidad: formData.especialidad.trim(),
      ubicacion: formData.ubicacion.trim(),
      fecha_hora_cita: formData.fecha_hora_cita,
      notas: formData.notas.trim(),
      tiene_recordatorio: false,
    };

    if (editingCitaId) {
      setCitas((citasActuales) =>
        CitaMedica.listarCitas(
          citasActuales.map((cita) =>
            cita.id === editingCitaId
              ? new CitaMedica(cita).editarCita(datosCita)
              : cita,
          ),
        ),
      );
      setEditingCitaId(null);
      setFormData(createEmptyForm());
      return;
    }

    const nuevaCita = new CitaMedica(datosCita).agendarCita();

    setCitas((citasActuales) => CitaMedica.listarCitas([...citasActuales, nuevaCita]));
    setFormData(createEmptyForm());
  };

  const updateField = (field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  };

  const editarCita = (cita) => {
    const detalleCita = new CitaMedica(cita).verDetalle();
    setEditingCitaId(cita.id);
    setFormData({
      doctor: detalleCita.doctor,
      especialidad: detalleCita.especialidad,
      ubicacion: detalleCita.ubicacion,
      fecha_hora_cita: detalleCita.fecha_hora_cita,
      notas: detalleCita.notas,
      tiene_recordatorio: false,
    });
  };

  const cancelEdit = () => {
    setEditingCitaId(null);
    setFormData(createEmptyForm());
  };

  const eliminarCita = (cita) => {
    setCitas((citasActuales) => new CitaMedica(cita).eliminarCita(citasActuales));

    if (editingCitaId === cita.id) {
      cancelEdit();
    }
  };

  const cambiarAsistenciaCita = (citaSeleccionada) => {
    setCitas((citasActuales) =>
      CitaMedica.listarCitas(
        citasActuales.map((cita) =>
          cita.id === citaSeleccionada.id
            ? citaSeleccionada.asistida
              ? new CitaMedica(cita).reabrirCita()
              : new CitaMedica(cita).marcarComoAsistida()
            : cita,
        ),
      ),
    );
  };

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
                  Organiza tus doctores, horarios, ubicaciones y recordatorios.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-64">
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
                  {editingCitaId ? "Editar cita" : "Nueva cita"}
                </p>
                <h2 className="mt-1 text-2xl font-black text-plum-800">
                  {editingCitaId ? "Actualizar atencion" : "Registrar atencion"}
                </h2>
              </div>
              {editingCitaId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  aria-label="Cancelar edicion"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-plum-100 text-plum-700 transition hover:bg-plum-200"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              )}
            </div>

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

              <button
                type="submit"
                className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lotus-500 px-5 text-base font-black text-white transition hover:bg-lotus-400"
              >
                {editingCitaId ? (
                  <Edit3 className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Plus className="h-5 w-5" aria-hidden="true" />
                )}
                {editingCitaId ? "Actualizar cita" : "Guardar cita"}
              </button>
            </div>
          </form>
        </div>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
          <div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-skysoft-500">Listado</p>
              <h2 className="mt-1 text-2xl font-black text-plum-800">Tus citas programadas</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {citasOrdenadas.map((cita) => (
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

                <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => editarCita(cita)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-plum-50 px-3 text-sm font-black text-plum-700 transition hover:bg-plum-100"
                  >
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarAsistenciaCita(cita)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-mint-100 px-3 text-sm font-black text-mint-500 transition hover:bg-mint-500 hover:text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {cita.asistida ? "Reabrir" : "Asistida"}
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarCita(cita)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-lotus-100 px-3 text-sm font-black text-lotus-500 transition hover:bg-lotus-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>

          {citasOrdenadas.length === 0 && (
            <div className="mt-6 rounded-3xl border-2 border-dashed border-plum-100 bg-plum-50 p-8 text-center">
              <p className="text-lg font-black text-plum-800">No hay citas para mostrar</p>
              <p className="mt-2 font-semibold text-plum-600">Registra una nueva cita para verla en tu agenda.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

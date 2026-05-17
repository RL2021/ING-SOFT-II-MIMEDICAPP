import {
  Bell,
  CalendarClock,
  ChevronLeft,
  Clock3,
  MapPin,
  NotebookText,
  Plus,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardMenu from "../components/DashboardMenu";

const appointmentSamples = [
  {
    id: "apt-001",
    doctor_name: "Dra. Valeria Campos",
    specialty: "Cardiologia",
    location: "Clinica San Gabriel, consultorio 304",
    appointment_date: "2026-05-20T09:30:00",
    notes: "Llevar ultimos analisis y control de presion.",
    has_reminder: true,
  },
  {
    id: "apt-002",
    doctor_name: "Dr. Miguel Torres",
    specialty: "Medicina general",
    location: "Centro Medico Miraflores",
    appointment_date: "2026-05-24T16:00:00",
    notes: "Revision de resultados y ajustes de tratamiento.",
    has_reminder: false,
  },
  {
    id: "apt-003",
    doctor_name: "Dra. Ana Salazar",
    specialty: "Nutricion",
    location: "Consulta virtual",
    appointment_date: "2026-06-02T11:15:00",
    notes: "Seguimiento del plan alimenticio semanal.",
    has_reminder: true,
  },
];

const formatAppointmentDate = (value) =>
  new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default function Appointments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    doctor_name: "",
    specialty: "",
    location: "",
    appointment_date: "",
    notes: "",
    has_reminder: true,
  });

  const filteredAppointments = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return appointmentSamples;
    }

    return appointmentSamples.filter((appointment) =>
      [appointment.doctor_name, appointment.specialty, appointment.location]
        .join(" ")
        .toLowerCase()
        .includes(normalizedTerm),
    );
  }, [searchTerm]);

  const nextAppointment = appointmentSamples[0];
  const remindersCount = appointmentSamples.filter((appointment) => appointment.has_reminder).length;

  const handleSubmit = (event) => {
    event.preventDefault();
    window.alert("Formulario listo para conectar al backend de citas medicas");
  };

  const updateField = (field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
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
                  Organiza tus doctores, horarios, ubicaciones y recordatorios desde una sola vista.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-64">
                <div className="rounded-3xl bg-plum-50 p-4 ring-1 ring-plum-100">
                  <p className="text-3xl font-black text-plum-800">{appointmentSamples.length}</p>
                  <p className="text-sm font-bold text-plum-500">Citas activas</p>
                </div>
                <div className="rounded-3xl bg-lotus-100 p-4">
                  <p className="text-3xl font-black text-lotus-500">{remindersCount}</p>
                  <p className="text-sm font-bold text-plum-600">Recordatorios</p>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-3xl bg-plum-600 p-5 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-plum-100">Proxima cita</p>
                  <h2 className="mt-1 text-2xl font-black">{nextAppointment.doctor_name}</h2>
                  <p className="mt-2 font-semibold text-plum-100">{nextAppointment.specialty}</p>
                </div>
                <div className="rounded-3xl bg-white/12 px-4 py-3">
                  <p className="flex items-center gap-2 text-lg font-black">
                    <Clock3 className="h-5 w-5 text-lotus-400" aria-hidden="true" />
                    {formatAppointmentDate(nextAppointment.appointment_date)}
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-plum-100">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lotus-400" aria-hidden="true" />
                    {nextAppointment.location}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <form className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8" onSubmit={handleSubmit}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-lotus-500">Nueva cita</p>
                <h2 className="mt-1 text-2xl font-black text-plum-800">Registrar atencion</h2>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lotus-100 text-lotus-500">
                <Plus className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-black text-plum-700">
                Doctor
                <input
                  value={formData.doctor_name}
                  onChange={(event) => updateField("doctor_name", event.target.value)}
                  className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  placeholder="Nombre del doctor"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-plum-700">
                  Especialidad
                  <input
                    value={formData.specialty}
                    onChange={(event) => updateField("specialty", event.target.value)}
                    className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                    placeholder="Cardiologia"
                  />
                </label>

                <label className="grid gap-2 text-sm font-black text-plum-700">
                  Fecha y hora
                  <input
                    type="datetime-local"
                    value={formData.appointment_date}
                    onChange={(event) => updateField("appointment_date", event.target.value)}
                    className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-black text-plum-700">
                Ubicacion
                <input
                  value={formData.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  className="min-h-12 rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  placeholder="Clinica, hospital o enlace virtual"
                />
              </label>

              <label className="grid gap-2 text-sm font-black text-plum-700">
                Notas
                <textarea
                  value={formData.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  className="min-h-28 resize-none rounded-2xl border-2 border-plum-100 bg-plum-50 px-4 py-3 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                  placeholder="Indicaciones, documentos o sintomas importantes"
                />
              </label>

              <label className="flex min-h-14 items-center justify-between gap-4 rounded-2xl bg-plum-50 px-4 ring-1 ring-plum-100">
                <span className="flex items-center gap-3 text-sm font-black text-plum-700">
                  <Bell className="h-5 w-5 text-lotus-500" aria-hidden="true" />
                  Activar recordatorio
                </span>
                <input
                  type="checkbox"
                  checked={formData.has_reminder}
                  onChange={(event) => updateField("has_reminder", event.target.checked)}
                  className="h-5 w-5 accent-lotus-500"
                />
              </label>

              <button
                type="submit"
                className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lotus-500 px-5 text-base font-black text-white transition hover:bg-lotus-400"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                Guardar cita
              </button>
            </div>
          </form>
        </div>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-skysoft-500">Listado</p>
              <h2 className="mt-1 text-2xl font-black text-plum-800">Tus citas programadas</h2>
            </div>

            <label className="relative block lg:w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-plum-500" aria-hidden="true" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="min-h-12 w-full rounded-full border-2 border-plum-100 bg-plum-50 py-2 pl-12 pr-4 text-base font-semibold text-plum-800 outline-none transition focus:border-lotus-400 focus:bg-white"
                placeholder="Buscar cita"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {filteredAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="flex min-h-72 flex-col rounded-3xl border-2 border-plum-100 bg-white p-5 shadow-sm transition hover:border-skysoft-500 hover:shadow-soft"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-skysoft-100 text-skysoft-500">
                    <Stethoscope className="h-8 w-8" aria-hidden="true" />
                  </span>
                  {appointment.has_reminder && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-lotus-100 px-3 py-2 text-xs font-black text-lotus-500">
                      <Bell className="h-4 w-4" aria-hidden="true" />
                      Aviso
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black leading-tight text-plum-800">{appointment.doctor_name}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-plum-600">
                  <UserRound className="h-4 w-4 text-skysoft-500" aria-hidden="true" />
                  {appointment.specialty}
                </p>

                <div className="mt-5 grid gap-3 text-sm font-semibold text-plum-600">
                  <p className="flex items-start gap-2">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-lotus-500" aria-hidden="true" />
                    {formatAppointmentDate(appointment.appointment_date)}
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lotus-500" aria-hidden="true" />
                    {appointment.location}
                  </p>
                  <p className="flex items-start gap-2">
                    <NotebookText className="mt-0.5 h-4 w-4 shrink-0 text-lotus-500" aria-hidden="true" />
                    {appointment.notes}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pill,
  CalendarDays,
  Dumbbell,
  Apple,
  TrendingUp,
  Download,
} from "lucide-react";
import DashboardMenu from "../components/DashboardMenu";

function getLocalData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function ProgressBar({ value, color }) {
  return (
    <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-plum-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function StatCard({ icon: Icon, accent, title, items }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${accent}`}
        >
          <Icon className="h-8 w-8" strokeWidth={2.4} />
        </span>
        <h2 className="text-xl font-black text-plum-800 sm:text-2xl">
          {title}
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-end justify-between">
            <span className="text-base font-medium text-plum-600">
              {item.label}
            </span>
            <span className="text-3xl font-black text-plum-800 sm:text-4xl">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {item.bar !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm font-bold text-plum-600">
            <span>Cumplimiento</span>
            <span>{Math.round(item.bar)}%</span>
          </div>
          <ProgressBar value={item.bar} color={item.barColor} />
        </div>
      )}
    </div>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const medicinas = getLocalData("misMedicinas");
    const citas = getLocalData("mimedicapp_citas_medicas");
    const ejercicios = getLocalData("misEjercicios");
    const alimentos = getLocalData("foods");

    const medTotal = medicinas.length;
    const medTomados = medicinas.filter((m) => m.tomado).length;
    const medPendientes = medTotal - medTomados;

    const now = new Date();
    const citaTotal = citas.length;
    const citaAsistidas = citas.filter((c) => c.asistida).length;
    const citaProximas = citas.filter(
      (c) => !c.asistida && new Date(c.fecha_hora_cita) >= now
    ).length;
    const citaPendientes = citaTotal - citaAsistidas;

    const ejTotal = ejercicios.length;
    const ejCompletados = ejercicios.filter((e) => e.completado).length;
    const ejPendientes = ejTotal - ejCompletados;

    const alTotal = alimentos.length;
    const alRecomendados = alimentos.filter((a) => a.recommended).length;

    const tareasTotal = medTotal + citaTotal + ejTotal;
    const tareasCompletadas = medTomados + citaAsistidas + ejCompletados;
    const cumplimiento = tareasTotal > 0 ? (tareasCompletadas / tareasTotal) * 100 : 0;

    setStats({
      medicinas: { total: medTotal, tomados: medTomados, pendientes: medPendientes },
      citas: { total: citaTotal, asistidas: citaAsistidas, proximas: citaProximas, pendientes: citaPendientes },
      ejercicios: { total: ejTotal, completados: ejCompletados, pendientes: ejPendientes },
      alimentos: { total: alTotal, recomendados: alRecomendados },
      cumplimiento,
      tareasTotal,
      tareasCompletadas,
    });
  }, []);

  return (
    <div className="min-h-screen bg-plum-50 text-plum-800 font-sans">
      <DashboardMenu />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 hover:text-lotus-500"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
          Volver al panel
        </button>

        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-skysoft-100 px-4 py-2 text-base font-black text-plum-700">
                Resumen de salud
              </p>
              <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">
                Reportes
              </h1>
              <p className="mt-3 max-w-2xl text-lg font-medium leading-relaxed text-plum-600">
                Un vistazo general a tu progreso en salud y bienestar.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-full bg-plum-200 px-5 py-3 text-base font-black text-plum-400 cursor-not-allowed"
              title="Proximamente"
            >
              <Download className="h-5 w-5" strokeWidth={2.4} />
              Descargar PDF
            </button>
          </div>
        </div>

        {!stats ? (
          <p className="text-center text-lg font-bold text-plum-500">
            Cargando datos...
          </p>
        ) : (
          <>
            {/* Indicador general */}
            <div className="mb-6 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-100 text-mint-500">
                  <TrendingUp className="h-8 w-8" strokeWidth={2.4} />
                </span>
                <div>
                  <h2 className="text-xl font-black text-plum-800 sm:text-2xl">
                    Cumplimiento general
                  </h2>
                  <p className="text-sm font-medium text-plum-600">
                    {stats.tareasCompletadas} de {stats.tareasTotal} tareas de
                    salud completadas
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-plum-600">
                <span>Progreso</span>
                <span>{Math.round(stats.cumplimiento)}%</span>
              </div>
              <ProgressBar value={stats.cumplimiento} color="bg-mint-500" />
            </div>

            {/* Tarjetas por módulo */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Medicamentos */}
              <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
                    <Pill className="h-8 w-8" strokeWidth={2.4} />
                  </span>
                  <h2 className="text-xl font-black text-plum-800 sm:text-2xl">
                    Medicamentos
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Registrados</span>
                    <span className="text-3xl font-black text-plum-800 sm:text-4xl">{stats.medicinas.total}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Tomados</span>
                    <span className="text-3xl font-black text-mint-500 sm:text-4xl">{stats.medicinas.tomados}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Pendientes</span>
                    <span className="text-3xl font-black text-lotus-500 sm:text-4xl">{stats.medicinas.pendientes}</span>
                  </div>
                </div>
                {stats.medicinas.total > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm font-bold text-plum-600">
                      <span>Cumplimiento</span>
                      <span>{Math.round((stats.medicinas.tomados / stats.medicinas.total) * 100)}%</span>
                    </div>
                    <ProgressBar value={(stats.medicinas.tomados / stats.medicinas.total) * 100} color="bg-lotus-500" />
                  </div>
                )}
              </div>

              {/* Citas Médicas */}
              <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-skysoft-100 text-skysoft-500">
                    <CalendarDays className="h-8 w-8" strokeWidth={2.4} />
                  </span>
                  <h2 className="text-xl font-black text-plum-800 sm:text-2xl">
                    Citas medicas
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Total</span>
                    <span className="text-3xl font-black text-plum-800 sm:text-4xl">{stats.citas.total}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Proximas</span>
                    <span className="text-3xl font-black text-skysoft-500 sm:text-4xl">{stats.citas.proximas}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Asistidas</span>
                    <span className="text-3xl font-black text-mint-500 sm:text-4xl">{stats.citas.asistidas}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Pendientes</span>
                    <span className="text-3xl font-black text-lotus-500 sm:text-4xl">{stats.citas.pendientes}</span>
                  </div>
                </div>
                {stats.citas.total > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm font-bold text-plum-600">
                      <span>Asistencia</span>
                      <span>{Math.round((stats.citas.asistidas / stats.citas.total) * 100)}%</span>
                    </div>
                    <ProgressBar value={(stats.citas.asistidas / stats.citas.total) * 100} color="bg-skysoft-500" />
                  </div>
                )}
              </div>

              {/* Ejercicios */}
              <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-plum-100 text-plum-700">
                    <Dumbbell className="h-8 w-8" strokeWidth={2.4} />
                  </span>
                  <h2 className="text-xl font-black text-plum-800 sm:text-2xl">
                    Ejercicios
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Total</span>
                    <span className="text-3xl font-black text-plum-800 sm:text-4xl">{stats.ejercicios.total}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Completados</span>
                    <span className="text-3xl font-black text-mint-500 sm:text-4xl">{stats.ejercicios.completados}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Pendientes</span>
                    <span className="text-3xl font-black text-lotus-500 sm:text-4xl">{stats.ejercicios.pendientes}</span>
                  </div>
                </div>
                {stats.ejercicios.total > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm font-bold text-plum-600">
                      <span>Cumplimiento</span>
                      <span>{Math.round((stats.ejercicios.completados / stats.ejercicios.total) * 100)}%</span>
                    </div>
                    <ProgressBar value={(stats.ejercicios.completados / stats.ejercicios.total) * 100} color="bg-plum-700" />
                  </div>
                )}
              </div>

              {/* Alimentacion */}
              <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-100 text-mint-500">
                    <Apple className="h-8 w-8" strokeWidth={2.4} />
                  </span>
                  <h2 className="text-xl font-black text-plum-800 sm:text-2xl">
                    Alimentacion
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Registrados</span>
                    <span className="text-3xl font-black text-plum-800 sm:text-4xl">{stats.alimentos.total}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-base font-medium text-plum-600">Recomendados</span>
                    <span className="text-3xl font-black text-mint-500 sm:text-4xl">{stats.alimentos.recomendados}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado vacío */}
            {stats.tareasTotal === 0 && (
              <div className="mt-8 rounded-[2rem] border-2 border-dashed border-plum-200 bg-white/50 p-8 text-center ring-1 ring-plum-100">
                <p className="text-lg font-bold text-plum-500">
                  Aun no tienes datos registrados. Agrega medicamentos, citas o ejercicios para ver tu reporte.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
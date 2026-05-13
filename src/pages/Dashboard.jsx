import {
  Apple,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  LogOut,
  Pill,
  Settings,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import DashboardCard from "../components/DashboardCard";

const modules = [
  {
    title: "Medicamentos",
    description: "Registra tus medicinas y controla tus tomas.",
    icon: Pill,
    accent: "bg-lotus-100 text-lotus-500",
  },
  {
    title: "Citas medicas",
    description: "Organiza tus proximas consultas y atenciones.",
    icon: CalendarDays,
    accent: "bg-skysoft-100 text-skysoft-500",
  },
  {
    title: "Alimentacion",
    description: "Guarda dietas y alimentos recomendados.",
    icon: Apple,
    accent: "bg-mint-100 text-mint-500",
  },
  {
    title: "Ejercicios",
    description: "Registra rutinas y actividades fisicas.",
    icon: Dumbbell,
    accent: "bg-plum-100 text-plum-700",
  },
  {
    title: "Reportes",
    description: "Consulta un resumen basico de tu salud.",
    icon: ClipboardList,
    accent: "bg-skysoft-100 text-plum-700",
  },
  {
    title: "Configuracion",
    description: "Administra tus preferencias y cuenta.",
    icon: Settings,
    accent: "bg-lotus-100 text-plum-700",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-plum-50 text-plum-800">
      <header className="sticky top-0 z-10 border-b border-plum-200 bg-plum-600 text-white shadow-sm">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:flex lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="relative flex items-center justify-start">
            <BrandMark compact light />
            <button
              type="button"
              onClick={() => navigate("/login")}
              aria-label="Cerrar sesion"
              className="absolute right-0 inline-flex h-12 w-12 items-center justify-center rounded-full bg-lotus-500 text-white transition hover:bg-lotus-400 lg:hidden"
            >
              <LogOut className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/12 px-4 py-3 text-center sm:text-left">
              <UserRound className="h-7 w-7 text-lotus-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-plum-100">Bienvenido(a)</p>
                <p className="text-lg font-black">Usuario MIMEDICAPP</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="hidden min-h-12 items-center justify-center gap-2 rounded-full bg-lotus-500 px-5 text-base font-black text-white transition hover:bg-lotus-400 lg:inline-flex"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-lotus-100 px-4 py-2 text-base font-black text-lotus-500">
              Salud y bienestar
            </p>
            <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Panel principal</h1>
            <p className="mt-3 max-w-2xl text-lg font-medium leading-relaxed text-plum-600">
              Selecciona una opcion para gestionar tu salud
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {modules.map((module) => (
            <DashboardCard key={module.title} {...module} />
          ))}
        </div>
      </section>
    </main>
  );
}

import {
  Apple,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Pill,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import DashboardMenu from "../components/DashboardMenu";

const modules = [
  {
    title: "Medicamentos",
    description: "Registra tus medicinas y controla tus tomas.",
    icon: Pill,
    accent: "bg-lotus-100 text-lotus-500",
    path: "/dashboard/medicamentos",
  },
  {
    title: "Citas medicas",
    description: "Organiza tus proximas consultas y atenciones.",
    icon: CalendarDays,
    accent: "bg-skysoft-100 text-skysoft-500",
    path: "/dashboard/citas-medicas",
  },
  {
    title: "Alimentacion",
    description: "Guarda dietas y alimentos recomendados.",
    icon: Apple,
    accent: "bg-mint-100 text-mint-500",
    path: "/dashboard/comidas",
  },
  {
    title: "Ejercicios",
    description: "Registra rutinas y actividades fisicas.",
    icon: Dumbbell,
    accent: "bg-plum-100 text-plum-700",
    path: "/exercise",
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
    path: "/dashboard/configuracion",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-plum-50 text-plum-800">
      <DashboardMenu />

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
            <DashboardCard
              key={module.title}
              {...module}
              // Forzamos el onClick para que salte directo si encuentra la ruta 'path'
              onClick={module.path ? () => navigate(module.path) : undefined}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
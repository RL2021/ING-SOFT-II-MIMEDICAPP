import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Home, UserRound, Save } from "lucide-react";
import DashboardMenu from "../components/DashboardMenu";

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    fechaNacimiento: "",
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("userProfile", JSON.stringify(profile));
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-plum-50 text-plum-800 font-sans">
      <DashboardMenu userName={profile.nombre || "Usuario MIMEDICAPP"} />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-plum-700 px-5 text-sm font-black text-white shadow-md transition hover:bg-plum-800"
          >
            <Home className="h-4 w-4" />
            Inicio
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500 hover:shadow-soft"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            Volver al panel
          </button>
        </div>

        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
            <UserRound className="h-7 w-7" strokeWidth={2.4} />
          </span>
          <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Mi perfil</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8"
        >
          <div className="grid gap-5">
            <label className="grid gap-2 text-lg font-bold text-plum-800">
              Nombre completo
              <input
                type="text"
                value={profile.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Ej. Jorge Perez"
                className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
              />
            </label>

            <label className="grid gap-2 text-lg font-bold text-plum-800">
              Correo
              <input
                type="email"
                value={profile.correo}
                onChange={(e) => handleChange("correo", e.target.value)}
                placeholder="ejemplo@correo.com"
                className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
              />
            </label>

            <label className="grid gap-2 text-lg font-bold text-plum-800">
              Telefono
              <input
                type="tel"
                value={profile.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                placeholder="999 999 999"
                className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
              />
            </label>

            <label className="grid gap-2 text-lg font-bold text-plum-800">
              Fecha de nacimiento
              <input
                type="date"
                value={profile.fechaNacimiento}
                onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
                className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
              />
            </label>

            {saved && (
              <div className="rounded-2xl bg-mint-100 px-4 py-3 text-base font-bold text-mint-500">
                ¡Datos guardados correctamente!
              </div>
            )}

            <button
              type="submit"
              className="mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-plum-700 px-6 py-3 text-lg font-extrabold text-white shadow-lg shadow-plum-700/20 transition hover:bg-plum-800 active:scale-[0.98]"
            >
              <Save className="h-5 w-5" />
              Guardar cambios
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
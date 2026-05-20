import { useState, useEffect } from "react";
import { Bell, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandMark from "./BrandMark";

export default function DashboardMenu({ onLogout }) {
  const navigate = useNavigate();
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const [userName, setUserName] = useState("Usuario MIMEDICAPP");

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      const profile = JSON.parse(stored);
      if (profile.nombre) setUserName(profile.nombre);
    }
  }, []);

  const notificationsEnabled =
    localStorage.getItem("notificationsEnabled") === "true";
  const medicines = notificationsEnabled
    ? JSON.parse(localStorage.getItem("misMedicinas") || "[]")
    : [];
  const pendientes = medicines.filter((m) => !m.completado);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-plum-200 bg-plum-600 text-white shadow-sm">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:flex lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="relative flex items-center justify-start">
          <BrandMark compact light />
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesion"
            className="absolute right-0 inline-flex h-12 w-12 items-center justify-center rounded-full bg-lotus-500 text-white transition hover:bg-lotus-400 lg:hidden"
          >
            <LogOut className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Campana de notificaciones */}
          <div className="relative self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              aria-label="Notificaciones"
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Bell className="h-6 w-6" aria-hidden="true" />
              {notificationsEnabled && pendientes.length > 0 && (
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-lotus-400 ring-2 ring-plum-600" />
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute right-0 top-14 z-50 w-80 rounded-[1.5rem] bg-white p-4 shadow-soft ring-1 ring-plum-100 text-plum-800">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black uppercase tracking-wide text-plum-500">
                    Notificaciones
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNotifPanel(false)}
                    className="text-xs font-black text-plum-400 hover:text-plum-700"
                  >
                    Cerrar
                  </button>
                </div>

                {!notificationsEnabled ? (
                  <p className="rounded-xl bg-plum-50 p-3 text-sm font-medium text-plum-400 text-center">
                    Las notificaciones están desactivadas.{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifPanel(false);
                        navigate("/dashboard/configuracion");
                      }}
                      className="font-black text-plum-700 underline"
                    >
                      Activar
                    </button>
                  </p>
                ) : pendientes.length === 0 ? (
                  <p className="rounded-xl bg-plum-50 p-3 text-sm font-medium text-plum-400 text-center">
                    No hay recordatorios pendientes
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {pendientes.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-plum-100 bg-plum-50 p-3"
                      >
                        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-lotus-500" />
                        <div>
                          <p className="text-sm font-black text-plum-800">
                            Tomar {m.nombre}
                          </p>
                          <p className="text-xs font-medium text-plum-500">
                            {m.dosis} · {m.frecuencia}
                            {m.toma ? ` · ${m.toma}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/perfil")}
            className="flex items-center justify-center gap-3 rounded-2xl bg-white/12 px-4 py-3 text-center sm:text-left transition hover:bg-white/20 cursor-pointer"
            aria-label="Ir a mi perfil"
          >
            <UserRound className="h-7 w-7 text-lotus-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-plum-100">
                Bienvenido(a)
              </p>
              <p className="text-lg font-black">{userName}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden min-h-12 items-center justify-center gap-2 rounded-full bg-lotus-500 px-5 text-base font-black text-white transition hover:bg-lotus-400 lg:inline-flex"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  );
}

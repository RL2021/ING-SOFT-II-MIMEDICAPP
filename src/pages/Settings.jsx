import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Settings as SettingsIcon, Bell, Lock, HelpCircle, LogOut, UserX } from "lucide-react";
import DashboardMenu from "../components/DashboardMenu";

export default function Settings() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-plum-50 text-plum-800 font-sans">
      <DashboardMenu />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Botón para volver al panel */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500 hover:shadow-soft"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          Volver al panel
        </button>

        {/* Encabezado del módulo */}
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
            <SettingsIcon className="h-7 w-7" strokeWidth={2.4} />
          </span>
          <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Configuración</h1>
        </div>

        {/* Panel contenedor principal */}
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8 flex flex-col gap-4">
          
          {/* Opción 1: Notificaciones */}
          <button
            type="button"
            onClick={() => window.alert("Módulo de notificaciones en desarrollo")}
            className="flex min-h-14 w-full items-center justify-center rounded-full border-2 border-plum-700 bg-white px-6 py-3 text-lg font-black uppercase tracking-wider text-plum-800 transition hover:bg-plum-50 hover:border-lotus-400 active:scale-[0.99]"
          >
            <Bell className="mr-3 h-5 w-5 text-plum-500 shrink-0" />
            Notificaciones
          </button>

          {/* Opción 2: Cambiar Contraseña */}
          <button
            type="button"
            onClick={() => window.alert("Módulo de seguridad en desarrollo")}
            className="flex min-h-14 w-full items-center justify-center rounded-full border-2 border-plum-700 bg-white px-6 py-3 text-lg font-black uppercase tracking-wider text-plum-800 transition hover:bg-plum-50 hover:border-lotus-400 active:scale-[0.99]"
          >
            <Lock className="mr-3 h-5 w-5 text-plum-500 shrink-0" />
            Cambiar Contraseña
          </button>

          {/* Opción 3: Ayuda */}
          <button
            type="button"
            onClick={() => window.alert("Centro de ayuda en desarrollo")}
            className="flex min-h-14 w-full items-center justify-center rounded-full border-2 border-plum-700 bg-white px-6 py-3 text-lg font-black uppercase tracking-wider text-plum-800 transition hover:bg-plum-50 hover:border-lotus-400 active:scale-[0.99]"
          >
            <HelpCircle className="mr-3 h-5 w-5 text-plum-500 shrink-0" />
            Ayuda
          </button>

          <hr className="my-2 border-plum-100" />

          {/* Opción 4: Cerrar Sesión */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex min-h-14 w-full items-center justify-center rounded-full bg-plum-800 px-6 py-3 text-lg font-black text-white shadow-md transition hover:bg-plum-700 active:scale-[0.99]"
          >
            <LogOut className="mr-3 h-5 w-5 text-lotus-400 shrink-0" />
            Cerrar Sesión
          </button>

          {/* Opción 5: Eliminar Cuenta */}
          <button
            type="button"
            onClick={() => window.alert("Por seguridad, contacte al administrador para eliminar su cuenta")}
            className="flex min-h-14 w-full items-center justify-center rounded-full bg-lotus-400 px-6 py-3 text-lg font-black text-plum-900 transition hover:bg-lotus-500 active:scale-[0.99]"
          >
            <UserX className="mr-3 h-5 w-5 text-plum-900 shrink-0" />
            Eliminar Cuenta
          </button>
        </div>
      </main>

      {/* Confirmación de cierre de sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="w-full text-center mb-8 pt-4">
              <p className="text-2xl font-medium text-plum-800">
                ¿Está seguro que desea cerrar sesión?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="w-full sm:w-40 min-h-12 rounded-full bg-plum-800 font-extrabold text-xl text-white transition hover:bg-plum-700 active:scale-95"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full sm:w-40 min-h-12 rounded-full border-2 border-black bg-white font-extrabold text-xl text-black transition hover:bg-plum-50 active:scale-95"
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
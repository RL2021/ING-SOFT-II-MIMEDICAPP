import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Settings as SettingsIcon,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  UserX,
  Eye,
  EyeOff,
  Home,
} from "lucide-react";
import DashboardMenu from "../components/DashboardMenu";

export default function Settings() {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("menu");

  // Notificaciones
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notificationsEnabled") === "true"
  );

  // Cambiar contraseña
  const [passwordForm, setPasswordForm] = useState({ nueva: "", repetir: "" });
  const [showNueva, setShowNueva] = useState(false);
  const [showRepetir, setShowRepetir] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Modales
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem("notificationsEnabled", String(next));
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!passwordForm.nueva.trim()) {
      setPasswordError("Ingresa tu nueva contraseña.");
      return;
    }
    if (passwordForm.nueva.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passwordForm.nueva !== passwordForm.repetir) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    localStorage.setItem("userPassword", passwordForm.nueva);
    setPasswordForm({ nueva: "", repetir: "" });
    setPasswordSuccess(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleDeleteConfirm = () => {
    localStorage.clear();
    setShowDeleteModal(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-plum-50 text-plum-800 font-sans">
      <DashboardMenu />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">

        {/* ── VISTA MENÚ PRINCIPAL ── */}
        {currentView === "menu" && (
          <>
            {/* Botones de navegación */}
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
                <SettingsIcon className="h-7 w-7" strokeWidth={2.4} />
              </span>
              <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Configuración</h1>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8 flex flex-col gap-4">

              <button
                type="button"
                onClick={() => setCurrentView("notifications")}
                className="flex min-h-14 w-full items-center justify-between rounded-full border-2 border-plum-200 bg-white px-6 py-3 text-lg font-black text-plum-800 transition hover:bg-plum-50 hover:border-plum-400"
              >
                <span className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-plum-500 shrink-0" />
                  Notificaciones
                </span>
                <span className={`text-sm font-black rounded-full px-3 py-1 ${
                  notificationsEnabled ? "bg-mint-100 text-mint-500" : "bg-plum-100 text-plum-400"
                }`}>
                  {notificationsEnabled ? "Activadas" : "Desactivadas"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPasswordSuccess(false);
                  setPasswordError("");
                  setPasswordForm({ nueva: "", repetir: "" });
                  setCurrentView("changePassword");
                }}
                className="flex min-h-14 w-full items-center justify-center rounded-full border-2 border-plum-200 bg-white px-6 py-3 text-lg font-black text-plum-800 transition hover:bg-plum-50 hover:border-plum-400"
              >
                <Lock className="mr-3 h-5 w-5 text-plum-500 shrink-0" />
                Cambiar Contraseña
              </button>

              <button
                type="button"
                onClick={() => setCurrentView("help")}
                className="flex min-h-14 w-full items-center justify-center rounded-full border-2 border-plum-200 bg-white px-6 py-3 text-lg font-black text-plum-800 transition hover:bg-plum-50 hover:border-plum-400"
              >
                <HelpCircle className="mr-3 h-5 w-5 text-plum-500 shrink-0" />
                Ayuda
              </button>

              <hr className="my-2 border-plum-100" />

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="flex min-h-14 w-full items-center justify-center rounded-full border-2 border-plum-700 bg-white px-6 py-3 text-lg font-black text-plum-800 transition hover:bg-plum-50"
              >
                <LogOut className="mr-3 h-5 w-5 text-plum-500 shrink-0" />
                Cerrar Sesión
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex min-h-14 w-full items-center justify-center rounded-full bg-lotus-500 px-6 py-3 text-lg font-black text-white transition hover:bg-lotus-400"
              >
                <UserX className="mr-3 h-5 w-5 shrink-0" />
                Eliminar Cuenta
              </button>
            </div>
          </>
        )}

        {/* ── VISTA NOTIFICACIONES ── */}
        {currentView === "notifications" && (
          <>
            <button
              type="button"
              onClick={() => setCurrentView("menu")}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500"
            >
              <ChevronLeft className="h-5 w-5" /> Volver
            </button>

            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
                <Bell className="h-7 w-7" strokeWidth={2.4} />
              </span>
              <h1 className="text-3xl font-black text-plum-800">Notificaciones</h1>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8 flex flex-col gap-6">

              {/* Toggle */}
              <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-plum-100 p-5">
                <div>
                  <p className="text-lg font-black text-plum-800">Activar notificaciones</p>
                  <p className="mt-1 text-sm font-medium text-plum-500">
                    Recibe avisos de medicamentos y citas en la app
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  aria-pressed={notificationsEnabled}
                  className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    notificationsEnabled ? "bg-plum-700" : "bg-plum-200"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                      notificationsEnabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Estado actual */}
              <div className={`rounded-2xl p-4 text-center font-black text-base ${
                notificationsEnabled
                  ? "bg-mint-100 text-mint-500"
                  : "bg-plum-100 text-plum-400"
              }`}>
                {notificationsEnabled
                  ? "Las notificaciones están ACTIVADAS"
                  : "Las notificaciones están DESACTIVADAS"}
              </div>

              {/* Preview notificaciones activas */}
              {notificationsEnabled && (() => {
                const medicines = JSON.parse(localStorage.getItem("misMedicinas")) || [];
                const pendientes = medicines.filter((m) => !m.completado);
                if (pendientes.length === 0) return null;
                return (
                  <div>
                    <p className="mb-3 text-sm font-black uppercase tracking-wide text-plum-500">
                      Recordatorios pendientes
                    </p>
                    <div className="flex flex-col gap-3">
                      {pendientes.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-2xl border border-plum-100 bg-plum-50 p-4"
                        >
                          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-lotus-500" />
                          <div>
                            <p className="font-black text-plum-800">
                              Tomar {m.nombre}
                            </p>
                            <p className="text-sm font-medium text-plum-500">
                              {m.dosis} · {m.frecuencia}
                              {m.toma ? ` · Primera toma: ${m.toma}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </>
        )}

        {/* ── VISTA CAMBIAR CONTRASEÑA ── */}
        {currentView === "changePassword" && (
          <>
            <button
              type="button"
              onClick={() => setCurrentView("menu")}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500"
            >
              <ChevronLeft className="h-5 w-5" /> Volver
            </button>

            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
                <Lock className="h-7 w-7" strokeWidth={2.4} />
              </span>
              <h1 className="text-3xl font-black text-plum-800">Cambiar contraseña</h1>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8"
            >
              <div className="grid gap-5">
                {/* Contraseña nueva */}
                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Contraseña nueva
                  <div className="relative">
                    <input
                      type={showNueva ? "text" : "password"}
                      value={passwordForm.nueva}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, nueva: e.target.value })
                      }
                      className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 pr-12 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNueva(!showNueva)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-plum-400 hover:text-plum-700"
                    >
                      {showNueva ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>

                {/* Repetir contraseña */}
                <label className="grid gap-2 text-lg font-bold text-plum-800">
                  Repetir contraseña
                  <div className="relative">
                    <input
                      type={showRepetir ? "text" : "password"}
                      value={passwordForm.repetir}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, repetir: e.target.value })
                      }
                      className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 pr-12 text-lg font-medium text-plum-800 outline-none transition focus:border-lotus-500 focus:bg-white"
                      placeholder="Repite tu nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepetir(!showRepetir)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-plum-400 hover:text-plum-700"
                    >
                      {showRepetir ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>

                {/* Error */}
                {passwordError && (
                  <div className="rounded-2xl bg-lotus-100 px-4 py-3 text-base font-bold text-lotus-500">
                    {passwordError}
                  </div>
                )}

                {/* Éxito */}
                {passwordSuccess && (
                  <div className="rounded-2xl bg-mint-100 px-4 py-3 text-base font-bold text-mint-500">
                    ¡Contraseña cambiada exitosamente!
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 flex min-h-14 w-full items-center justify-center rounded-full bg-plum-700 px-6 py-3 text-lg font-extrabold text-white shadow-lg shadow-plum-700/20 transition hover:bg-plum-800 active:scale-[0.98]"
                >
                  Cambiar
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── VISTA AYUDA ── */}
        {currentView === "help" && (
          <>
            <button
              type="button"
              onClick={() => setCurrentView("menu")}
              className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500"
            >
              <ChevronLeft className="h-5 w-5" /> Volver
            </button>

            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
                <HelpCircle className="h-7 w-7" strokeWidth={2.4} />
              </span>
              <h1 className="text-3xl font-black text-plum-800">Ayuda</h1>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8 flex flex-col gap-4">
              <div className="rounded-2xl border-2 border-plum-100 p-5">
                <p className="mb-3 text-lg font-black text-plum-800">Contáctate con nosotros:</p>
                <p className="font-semibold text-plum-600">Teléfono: <span className="font-black text-plum-800">9999999</span></p>
                <p className="font-semibold text-plum-600">Celular: <span className="font-black text-plum-800">999999999</span></p>
                <p className="font-semibold text-plum-600">Correo: <span className="font-black text-plum-800">miappsoporte@gmail.com</span></p>
              </div>
            </div>
          </>
        )}

      </main>

      {/* ── MODAL CERRAR SESIÓN ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-soft ring-1 ring-plum-100 lg:p-8 animate-in fade-in zoom-in-95 duration-150">
            <p className="text-xl font-black text-plum-800 mb-6">
              ¿Está seguro que desea cerrar sesión?
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 min-h-12 rounded-full bg-plum-700 font-extrabold text-white transition hover:bg-plum-800"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 min-h-12 rounded-full border-2 border-plum-700 bg-white font-extrabold text-plum-700 transition hover:bg-plum-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ELIMINAR CUENTA ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-800/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-soft ring-1 ring-plum-100 lg:p-8 animate-in fade-in zoom-in-95 duration-150">
            <p className="text-xl font-black text-plum-800 mb-2">
              ¿Está seguro que desea eliminar la cuenta?
            </p>
            <p className="text-sm font-medium text-plum-500 mb-6">
              Esta acción borrará todos tus datos guardados.
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 min-h-12 rounded-full bg-lotus-500 font-extrabold text-white transition hover:bg-lotus-400"
              >
                Sí, eliminar
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 min-h-12 rounded-full border-2 border-plum-700 bg-white font-extrabold text-plum-700 transition hover:bg-plum-50"
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

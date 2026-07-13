import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandMark from "./BrandMark";
import { useAuth } from "../context/AuthContext";
import { notificationEngine } from "../notifications/NotificationEngine";
import { getReminderPreferences } from "../notifications/reminderRules";

export default function DashboardMenu({ onLogout }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [pending, setPending] = useState([]);
  const preferences = useMemo(() => getReminderPreferences(user), [user]);
  const userName = user?.user_metadata?.name || "Usuario MIMEDICAPP";

  const loadPending = useCallback(async () => {
    if (!user?.id || !preferences.enabled) {
      setPending([]);
      return;
    }
    try {
      const notifications = await notificationEngine.cargar(user.id);
      setPending(notifications.filter((notification) => notification.activo));
    } catch (error) {
      console.error("No se pudo actualizar el indicador de recordatorios:", error);
    }
  }, [preferences.enabled, user?.id]);

  useEffect(() => {
    loadPending();
    if (!user?.id) return undefined;
    try {
      return notificationEngine.suscribir(user.id, loadPending);
    } catch (error) {
      console.error("No se pudo iniciar Realtime para la campana:", error);
      return undefined;
    }
  }, [loadPending, user?.id]);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    await signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-plum-200 bg-plum-600 text-white shadow-sm">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-10">
        <div className="relative flex items-center">
          <button type="button" onClick={() => navigate("/dashboard")} aria-label="Ir al dashboard principal" className="rounded-2xl transition hover:opacity-90">
            <BrandMark compact light />
          </button>
          <button type="button" onClick={handleLogout} aria-label="Cerrar sesión" className="absolute right-0 inline-flex h-12 w-12 items-center justify-center rounded-full bg-lotus-500 lg:hidden">
            <LogOut className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative self-end sm:self-auto">
            <button type="button" onClick={() => setShowNotificationPanel((current) => !current)} aria-label={`Notificaciones: ${pending.length} pendientes`} className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
              <Bell className="h-6 w-6" />
              {preferences.enabled && pending.length > 0 && (
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-lotus-400 ring-2 ring-plum-600" />
              )}
            </button>

            {showNotificationPanel && (
              <div className="absolute right-0 top-14 z-50 w-80 rounded-[1.5rem] bg-white p-4 text-plum-800 shadow-soft ring-1 ring-plum-100">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black uppercase tracking-wide text-plum-500">Recordatorios</p>
                  <button type="button" onClick={() => setShowNotificationPanel(false)} className="text-xs font-black text-plum-400">Cerrar</button>
                </div>

                {!preferences.enabled ? (
                  <button type="button" onClick={() => navigate("/dashboard/configuracion")} className="w-full rounded-xl bg-plum-50 p-3 text-sm font-bold text-plum-600">
                    Las alertas están desactivadas. Configurar
                  </button>
                ) : pending.length === 0 ? (
                  <p className="rounded-xl bg-plum-50 p-3 text-center text-sm font-medium text-plum-400">No hay recordatorios pendientes</p>
                ) : (
                  <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                    {pending.slice(0, 5).map((notification) => (
                      <button key={notification.id} type="button" onClick={() => navigate("/dashboard/notificaciones")} className="flex items-start gap-3 rounded-xl border border-plum-100 bg-plum-50 p-3 text-left">
                        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-lotus-500" />
                        <span>
                          <span className="block text-sm font-black text-plum-800">{notification.title}</span>
                          <span className="text-xs font-medium text-plum-500">{notification.message}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/12 px-4 py-3 sm:text-left">
            <UserRound className="h-7 w-7 text-lotus-400" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-plum-100">Bienvenido(a)</p>
              <p className="text-lg font-black">{userName}</p>
            </div>
          </div>

          <button type="button" onClick={handleLogout} className="hidden min-h-12 items-center justify-center gap-2 rounded-full bg-lotus-500 px-5 text-base font-black transition hover:bg-lotus-400 lg:inline-flex">
            <LogOut className="h-5 w-5" /> Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}

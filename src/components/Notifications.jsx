import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Dumbbell,
  Pill,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardMenu from "./DashboardMenu";
import { useAuth } from "../context/AuthContext";
import { notificationEngine } from "../notifications/NotificationEngine";
import { formatearFecha } from "../notifications/utils";
import { getReminderPreferences } from "../notifications/reminderRules";

const ICON_CONFIG = {
  medicamento: { Icon: Pill, background: "bg-lotus-100", color: "text-lotus-500" },
  cita: { Icon: CalendarClock, background: "bg-skysoft-100", color: "text-skysoft-500" },
  ejercicio: { Icon: Dumbbell, background: "bg-mint-100", color: "text-mint-500" },
};

function PendingCard({ notification, onConfirm, disabled }) {
  const strategy = notificationEngine.obtenerEstrategia(notification.tipo);
  const config = ICON_CONFIG[notification.tipo];
  if (!strategy || !config) return null;

  const { Icon, background, color } = config;
  return (
    <article className="flex flex-col rounded-3xl border-2 border-lotus-300 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${background} ${color}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-lotus-100 px-3 py-1 text-xs font-black text-lotus-500">
          <Bell className="h-3 w-3" aria-hidden="true" /> Pendiente
        </span>
      </div>
      <h3 className="text-lg font-black text-plum-800">{notification.title}</h3>
      {notification.message && (
        <p className="mt-1 text-sm font-semibold text-plum-500">{notification.message}</p>
      )}
      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-plum-400">
        <Clock3 className="h-3 w-3" aria-hidden="true" />
        Alerta: {formatearFecha(notification.scheduled_for)}
      </p>
      <button
        type="button"
        onClick={() => onConfirm(notification)}
        disabled={disabled}
        className={`mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${strategy.obtenerClaseBoton()}`}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {disabled ? "Guardando..." : strategy.obtenerTextoBoton()}
      </button>
    </article>
  );
}

export default function Notifications({ asPage = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const preferences = useMemo(() => getReminderPreferences(user), [user]);

  const load = useCallback(async ({ synchronize = false } = {}) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = synchronize
        ? await notificationEngine.sync(user.id, preferences)
        : await notificationEngine.cargar(user.id);
      setNotifications(data);
    } catch (error) {
      toast.error(error?.message || "No se pudieron cargar los recordatorios.");
    } finally {
      setLoading(false);
    }
  }, [preferences, user?.id]);

  useEffect(() => {
    load({ synchronize: true });
    if (!user?.id) return undefined;
    try {
      return notificationEngine.suscribir(user.id, () => load());
    } catch (error) {
      console.error("No se pudo iniciar Realtime en la vista de recordatorios:", error);
      return undefined;
    }
  }, [load, user?.id]);

  const confirm = async (notification) => {
    try {
      setConfirmingId(notification.id);
      const updated = await notificationEngine.confirmar(notification, user.id);
      setNotifications(updated);
      toast.success("Recordatorio confirmado y actividad actualizada.");
    } catch (error) {
      toast.error(error?.message || "No se pudo confirmar el recordatorio.");
    } finally {
      setConfirmingId(null);
    }
  };

  const pending = notifications.filter((notification) => notification.activo);
  const history = notifications.filter((notification) => !notification.activo);

  const content = (
    <>
      {loading && notifications.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center font-bold text-plum-500">
          <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin" /> Cargando recordatorios...
        </div>
      )}

      {!loading && !preferences.enabled && (
        <div className="mb-6 rounded-3xl border-2 border-dashed border-plum-200 bg-white p-6 text-center text-plum-600">
          Las alertas están desactivadas. Puedes activarlas desde Configuración.
        </div>
      )}

      {pending.length > 0 && (
        <section className="mb-8" aria-labelledby="pending-reminders">
          <p id="pending-reminders" className="mb-4 text-sm font-black uppercase tracking-wide text-lotus-500">
            Pendientes · {pending.length}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((notification) => (
              <PendingCard
                key={notification.id}
                notification={notification}
                onConfirm={confirm}
                disabled={confirmingId === notification.id}
              />
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section aria-labelledby="reminder-history">
          <p id="reminder-history" className="mb-4 text-sm font-black uppercase tracking-wide text-plum-500">
            Historial · {history.length}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((notification) => (
              <article key={notification.id} className="flex items-start gap-3 rounded-2xl border border-plum-100 bg-plum-50/50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" />
                <div>
                  <p className="font-black text-plum-700">{notification.title}</p>
                  <p className="text-xs font-medium text-plum-400">{formatearFecha(notification.scheduled_for)}</p>
                  <span className="mt-1 inline-block text-xs font-black text-mint-500">Confirmado</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!loading && notifications.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-plum-200 bg-white/50 p-10 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-plum-300" />
          <p className="text-lg font-black text-plum-500">No hay recordatorios</p>
          <p className="mt-1 text-sm font-medium text-plum-400">
            Activa recordatorios al registrar medicamentos, citas o ejercicios.
          </p>
        </div>
      )}
    </>
  );

  if (!asPage) {
    return (
      <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
        <h2 className="mb-6 text-2xl font-black text-plum-800">Tus recordatorios</h2>
        {content}
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-plum-50 text-plum-800">
      <DashboardMenu />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
        <button type="button" onClick={() => navigate("/dashboard")} className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100">
          <ChevronLeft className="h-5 w-5" /> Volver al panel
        </button>
        <header className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-lotus-100 px-4 py-2 text-sm font-black text-lotus-500">
            <Bell className="h-4 w-4" /> US-050 · US-051 · US-052
          </p>
          <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Recordatorios</h1>
          <p className="mt-2 font-medium text-plum-600">Medicamentos, citas y ejercicios sincronizados con Supabase.</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {Object.entries(ICON_CONFIG).map(([type, { Icon, background, color }]) => (
              <div key={type} className={`rounded-2xl p-3 text-center ${background}`}>
                <Icon className={`mx-auto h-5 w-5 ${color}`} />
                <p className={`text-xl font-black ${color}`}>{pending.filter((item) => item.tipo === type).length}</p>
              </div>
            ))}
          </div>
        </header>
        {content}
      </main>
    </div>
  );
}

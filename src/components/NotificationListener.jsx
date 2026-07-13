import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { notificationEngine } from "../notifications/NotificationEngine";
import { getReminderPreferences } from "../notifications/reminderRules";

export default function NotificationListener() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return undefined;

    let active = true;
    let running = false;

    const execute = async () => {
      if (running) return;
      running = true;

      try {
        const preferences = getReminderPreferences(user);
        if (!preferences.enabled) return;

        const notifications = await notificationEngine.sync(user.id, preferences);
        if (active) {
          notificationEngine.enviarPendientes(notifications, toast, preferences);
        }
      } catch (error) {
        console.error("No se pudieron sincronizar los recordatorios:", error);
      } finally {
        running = false;
      }
    };

    execute();
    const interval = window.setInterval(execute, 60 * 1000);
    let unsubscribe = () => undefined;
    try {
      unsubscribe = notificationEngine.suscribir(user.id, execute);
    } catch (error) {
      console.error("No se pudo iniciar Realtime para recordatorios:", error);
    }

    return () => {
      active = false;
      window.clearInterval(interval);
      unsubscribe();
    };
  }, [user]);

  return null;
}

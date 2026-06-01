// src/components/NotificationListener.jsx
//
// ══════════════════════════════════════════════════════════════════════════════
//  SRP: este componente tiene una única responsabilidad → conectar el ciclo
//       de vida de React (auth, intervalo de tiempo) con NotificationEngine.
//  DIP: depende de notificationEngine (abstracción), no de las estrategias
//       concretas.
// ══════════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { notificationEngine } from '../notifications/NotificationEngine';

/**
 * Componente de fondo: no renderiza nada visible.
 * Se monta dentro de ProtectedRoute → corre mientras el usuario está autenticado.
 *
 * Cada 60 segundos:
 *   1. notificationEngine.sync()           → genera y fusiona recordatorios
 *   2. notificationEngine.enviarPendientes() → dispara toasts si ya es la hora
 */
export default function NotificationListener() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    // Respetar la preferencia del usuario (Configuración → Notificaciones)
    if (localStorage.getItem('notificationsEnabled') !== 'true') return;

    const ejecutar = () => {
      const fusionadas = notificationEngine.sync();
      notificationEngine.enviarPendientes(fusionadas, toast);
    };

    ejecutar();
    const intervalo = setInterval(ejecutar, 60 * 1000);
    return () => clearInterval(intervalo);
  }, [user]);

  return null;
}

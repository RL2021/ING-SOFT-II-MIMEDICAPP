// src/components/Notifications.jsx
//
// ══════════════════════════════════════════════════════════════════════════════
//  SRP: responsabilidad única → presentar la lista de recordatorios al usuario.
//       Toda la lógica de negocio vive en notificationEngine y las estrategias.
//  DIP: depende de notificationEngine (abstracción), no de estrategias concretas.
//  OCP: agregar un nuevo tipo de recordatorio NO requiere modificar este archivo;
//       la tarjeta se renderiza genéricamente con los datos que devuelve la
//       estrategia (obtenerTextoBoton, obtenerClaseBoton, obtenerTituloHistorial).
// ══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Dumbbell,
  MapPin,
  Pill,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardMenu from './DashboardMenu';
import { notificationEngine } from '../notifications/NotificationEngine';
import { formatearFecha } from '../notifications/utils';

// ─── Mapa visual por tipo (solo presentación, no lógica) ─────────────────────
// OCP: para un nuevo tipo, se agrega aquí una entrada y se crea su estrategia.
const ICONO_CONFIG = {
  medicamento: { Icono: Pill,          bg: 'bg-lotus-100',   color: 'text-lotus-500'   },
  cita:        { Icono: CalendarClock, bg: 'bg-skysoft-100', color: 'text-skysoft-500' },
  ejercicio:   { Icono: Dumbbell,      bg: 'bg-mint-100',    color: 'text-mint-500'    },
};

// ─── Tarjeta genérica de recordatorio pendiente ───────────────────────────────
// OCP: el contenido varía por tipo usando datos de la estrategia, no con if/else
function TarjetaPendiente({ n, onConfirmar }) {
  const s = notificationEngine.obtenerEstrategia(n.tipo);
  const config = ICONO_CONFIG[n.tipo];

  if (!s || !config) return null;

  const { Icono, bg, color } = config;
  const fechaStr = formatearFecha(s.obtenerFechaProgramada(n));

  // Campos descriptivos según tipo (los campos existen en el objeto generado por la estrategia)
  const titulo =
    n.nombreMedicamento ??
    (n.nombreDoctor ? `Dr. ${n.nombreDoctor}` : null) ??
    n.nombreEjercicio ??
    'Recordatorio';

  const subtitulo =
    n.tipo === 'medicamento' ? `${n.dosis} · ${n.frecuencia}`
    : n.tipo === 'cita'      ? n.especialidad
    : n.tipo === 'ejercicio' ? `${n.horario}${n.descripcion ? ` · ${n.descripcion}` : ''}`
    : '';

  return (
    <article className="flex flex-col rounded-3xl border-2 border-lotus-300 bg-white p-5 shadow-sm transition hover:shadow-soft">
      {/* Cabecera: ícono + badge */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${bg} ${color}`}>
          <Icono className="h-5 w-5" />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-lotus-100 px-3 py-1 text-xs font-black text-lotus-500">
          <Bell className="h-3 w-3" />
          Pendiente
        </span>
      </div>

      {/* Contenido */}
      <h3 className="text-lg font-black text-plum-800">{titulo}</h3>
      {subtitulo && (
        <p className="mt-1 text-sm font-semibold text-plum-500">{subtitulo}</p>
      )}

      {/* Fecha programada */}
      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-plum-400">
        <Clock3 className="h-3 w-3" />
        {n.tipo === 'cita'
          ? `Cita: ${formatearFecha(n.fechaCita)}`
          : fechaStr}
      </p>

      {/* Ubicación (solo citas) */}
      {n.tipo === 'cita' && n.ubicacion && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-plum-400">
          <MapPin className="h-3 w-3" />
          {n.ubicacion}
        </p>
      )}

      {/* Botón de confirmación → texto y color vienen de la estrategia */}
      <button
        type="button"
        onClick={() => onConfirmar(n)}
        className={`mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition ${s.obtenerClaseBoton()}`}
      >
        <CheckCircle2 className="h-4 w-4" />
        {s.obtenerTextoBoton()}
      </button>
    </article>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
// Props:
//   asPage={false}  → sección embebida en Settings
//   asPage={true}   → página completa con DashboardMenu
export default function Notifications({ asPage = false }) {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);

  const cargar = () => setNotifs(notificationEngine.cargar());

  useEffect(() => {
    cargar();
    // Refresca la vista cada 10 s para reflejar cambios del NotificationListener
    const intervalo = setInterval(cargar, 10000);
    return () => clearInterval(intervalo);
  }, []);

  /**
   * Confirmar un recordatorio (marcarTomado / marcarAsistencia / marcarRealizado).
   * DIP: delega en el engine → el engine delega en la estrategia correcta.
   * La UI no sabe qué método concreto se llama.
   */
  const handleConfirmar = (recordatorio) => {
    const actualizadas = notificationEngine.confirmar(recordatorio, notifs);
    setNotifs(actualizadas);
  };

  const pendientes = notifs.filter((n) => n.activo);
  const historial  = notifs.filter((n) => !n.activo);

  // ── Contenido compartido (modo embebido y página) ─────────────────────────
  const contenido = (
    <>
      {/* ── PENDIENTES (US-012 / US-021 / US-030) ── */}
      {pendientes.length > 0 && (
        <section className="mb-8">
          <p className="mb-4 text-sm font-black uppercase tracking-wide text-lotus-500">
            Pendientes · {pendientes.length}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendientes.map((n) => {
              const s = notificationEngine.obtenerEstrategia(n.tipo);
              const id = s?.obtenerIdentificador(n) ?? Math.random();
              return (
                <TarjetaPendiente key={id} n={n} onConfirmar={handleConfirmar} />
              );
            })}
          </div>
        </section>
      )}

      {/* ── HISTORIAL ── */}
      {historial.length > 0 && (
        <section>
          <p className="mb-4 text-sm font-black uppercase tracking-wide text-plum-500">
            Historial · {historial.length}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {historial.map((n) => {
              const s = notificationEngine.obtenerEstrategia(n.tipo);
              if (!s) return null;
              const id     = s.obtenerIdentificador(n);
              const titulo = s.obtenerTituloHistorial(n);
              const fecha  = formatearFecha(s.obtenerFechaProgramada(n));

              return (
                <div
                  key={id}
                  className="flex items-start gap-3 rounded-2xl border border-plum-100 bg-plum-50/50 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" />
                  <div>
                    <p className="font-black text-plum-700">{titulo}</p>
                    <p className="text-xs font-medium text-plum-400">{fecha}</p>
                    <span className="mt-1 inline-block text-xs font-black text-mint-500">
                      Confirmado
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── VACÍO ── */}
      {notifs.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-plum-200 bg-white/50 p-10 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-plum-300" />
          <p className="text-lg font-black text-plum-500">No hay recordatorios activos</p>
          <p className="mt-1 text-sm font-medium text-plum-400">
            Registra medicamentos, citas o ejercicios para recibir alertas.
          </p>
        </div>
      )}
    </>
  );

  // ── MODO PÁGINA COMPLETA (/dashboard/notificaciones) ─────────────────────
  if (asPage) {
    return (
      <div className="min-h-screen bg-plum-50 text-plum-800">
        <DashboardMenu />

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-plum-700 shadow-sm ring-1 ring-plum-100 transition hover:text-lotus-500 hover:shadow-soft"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            Volver al panel
          </button>

          {/* Encabezado con contadores */}
          <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-lotus-100 px-4 py-2 text-sm font-black text-lotus-500">
                  <Bell className="h-4 w-4" />
                  Alertas y avisos
                </p>
                <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">Recordatorios</h1>
                <p className="mt-2 text-base font-medium text-plum-600">
                  Tus medicamentos, citas y ejercicios programados.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:min-w-72">
                <div className="rounded-2xl bg-lotus-100 p-3 text-center">
                  <Pill className="mx-auto mb-1 h-5 w-5 text-lotus-500" />
                  <p className="text-xl font-black text-lotus-500">
                    {notifs.filter((n) => n.tipo === 'medicamento' && n.activo).length}
                  </p>
                  <p className="text-xs font-bold text-plum-600">Meds</p>
                </div>
                <div className="rounded-2xl bg-skysoft-100 p-3 text-center">
                  <CalendarClock className="mx-auto mb-1 h-5 w-5 text-skysoft-500" />
                  <p className="text-xl font-black text-skysoft-500">
                    {notifs.filter((n) => n.tipo === 'cita' && n.activo).length}
                  </p>
                  <p className="text-xs font-bold text-plum-600">Citas</p>
                </div>
                <div className="rounded-2xl bg-mint-100 p-3 text-center">
                  <Dumbbell className="mx-auto mb-1 h-5 w-5 text-mint-500" />
                  <p className="text-xl font-black text-mint-500">
                    {notifs.filter((n) => n.tipo === 'ejercicio' && n.activo).length}
                  </p>
                  <p className="text-xs font-bold text-plum-600">Ejercicios</p>
                </div>
              </div>
            </div>
          </div>

          {contenido}
        </main>
      </div>
    );
  }

  // ── MODO EMBEBIDO (Settings.jsx → <Notifications />) ─────────────────────
  return (
    <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-skysoft-500">Historial</p>
        <h2 className="mt-1 text-2xl font-black text-plum-800">Tus Notificaciones</h2>
      </div>
      {contenido}
    </section>
  );
}

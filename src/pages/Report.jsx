import { useEffect, useState } from "react";
import { ChevronLeft, FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";

import DashboardMenu from "../components/DashboardMenu";

import { ExportServiceFactory } from "../services/exports/ExporterFactory";
import { supabase } from "../lib/supabase"; 

export default function ReportPage() {
const supportedFormats = ["PDF", "Excel", "YAML", "JSON", "TXT"]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    medicines: [],
    foods: [],
    appointments: [],
    exercises: []
  });

  const mockReportData = {
    medicines: [
      { id: 1, user_id: "u1", name: "Metformina", dosage: "850mg", first_take: "2026-07-01T08:00:00Z", next_take: "2026-07-09T08:00:00Z", frequency: "Cada 24 horas", is_active: true, is_taken: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 2, user_id: "u1", name: "Atorvastatina", dosage: "20mg", first_take: "2026-07-01T21:00:00Z", next_take: "2026-07-08T21:00:00Z", frequency: "Cada 24 horas (Noche)", is_active: true, is_taken: true, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 3, user_id: "u1", name: "Losartán", dosage: "50mg", first_take: "2026-07-01T07:00:00Z", next_take: "2026-07-09T07:00:00Z", frequency: "Cada 12 horas", is_active: true, is_taken: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 4, user_id: "u1", name: "Omeprazol", dosage: "20mg", first_take: "2026-07-01T06:00:00Z", next_take: "2026-07-09T06:00:00Z", frequency: "Cada 24 horas (Ayunas)", is_active: false, is_taken: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 5, user_id: "u1", name: "Paracetamol", dosage: "1g", first_take: null, next_take: null, frequency: "Solo en caso de dolor", is_active: true, is_taken: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" }
    ],
    foods: [
      { id: 1, user_id: "u1", name: "Avena Integral", detail: "Con fresas y semillas de chía", recommended: true, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 2, user_id: "u1", name: "Pechuga de Pollo", detail: "A la plancha con brócoli al vapor", recommended: true, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 3, user_id: "u1", name: "Bebidas Gaseosas", detail: "Alto contenido de azúcares refinados", recommended: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 4, user_id: "u1", name: "Almendras Naturales", detail: "Snack de media tarde (máx 10 unidades)", recommended: true, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 5, user_id: "u1", name: "Frituras y Snacks Procesados", detail: "Grasas trans elevadas", recommended: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" }
    ],
    appointments: [
      { id: 1, user_id: "u1", doctor_name: "Dra. Eliana Gómez", specialty: "Endocrinología", location: "Consultorio 402 - Clínica Central", appointment_date: "2026-07-15T10:30:00Z", notes: "Llevar exámenes de perfil lipídico", has_reminder: true, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 2, user_id: "u1", doctor_name: "Dr. Carlos Torres", specialty: "Cardiología", location: "Piso 2 - Hospital General", appointment_date: "2026-07-22T08:00:00Z", notes: "Control periódico de presión arterial", has_reminder: true, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 3, user_id: "u1", doctor_name: "Lic. Vanessa Marín", specialty: "Nutrición", location: "Centro de Bienestar Lotus", appointment_date: "2026-07-10T16:00:00Z", notes: "Revisión de bitácora alimenticia semanal", has_reminder: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 4, user_id: "u1", doctor_name: "Dr. Marcos Sanz", specialty: "Oftalmología", location: "Centro Médico San Juan", appointment_date: "2026-08-05T11:15:00Z", notes: "Fondo de ojo por tamizaje de rutina", has_reminder: true, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 5, user_id: "u1", doctor_name: "Dra. Patricia Lima", specialty: "Odontología", location: "Av. Larco 456", appointment_date: "2026-09-12T09:30:00Z", notes: "Limpieza anual programada", has_reminder: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" }
    ],
    exercises: [
      { id: 1, user_id: "u1", name: "Caminata Ligera", description: "Mantener paso constante en parque", scheduled_at: "2026-07-08T07:00:00Z", is_active: true, is_completed: true, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 2, user_id: "u1", name: "Rutina Estiramientos", description: "Flexibilidad enfocado en tren inferior y espalda", scheduled_at: "2026-07-09T07:30:00Z", is_active: true, is_completed: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 3, user_id: "u1", name: "Bicicleta Estática", description: "Nivel moderado de resistencia - 30 mins", scheduled_at: "2026-07-10T18:00:00Z", is_active: true, is_completed: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 4, user_id: "u1", name: "Ejercicios de Fuerza Corporales", description: "Sentadillas libres y flexiones asistidas", scheduled_at: null, is_active: false, is_completed: false, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" },
      { id: 5, user_id: "u1", name: "Yoga Relajación", description: "Control de respiración antes de dormir", scheduled_at: "2026-07-08T21:30:00Z", is_active: true, is_completed: true, created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-08T00:00:00Z" }
    ]
  };

  useEffect(() => {
    async function fetchAllReportData() {
      try {
        setLoading(true);
        
        // Fetch data concurrently for performance
        const [medsRes, foodsRes, appointmentsRes, exercisesRes] = await Promise.all([
          supabase.from("medicines").select("*"),
          supabase.from("foods").select("*"),
          supabase.from("appointments").select("*").order("appointment_date", { ascending: true }),
          supabase.from("exercises").select("*")
        ]);

        if (medsRes.error) throw medsRes.error;
        if (foodsRes.error) throw foodsRes.error;
        if (appointmentsRes.error) throw appointmentsRes.error;
        if (exercisesRes.error) throw exercisesRes.error;

        setReportData({
          medicines: mockReportData.medicines || medsRes.data || [],
          foods: mockReportData.foods || foodsRes.data || [],
          appointments: mockReportData.appointments || appointmentsRes.data || [],
          exercises: mockReportData.exercises || exercisesRes.data || []
        });
      } catch (err) {
        console.error("Failed to load aggregate report data:", err);
        setError(err.message || "An unexpected error occurred while fetching reports.");
      } finally {
        setLoading(false);
      }
    }

    fetchAllReportData();
  }, []);

  const handleExport = (format) => {
    try {
      const exporter = ExportServiceFactory.createExporter(format);
      exporter.export(reportData);
    } catch (err) {
      alert(`Export Failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <DashboardMenu />
      
      <main className="flex-1 p-4 md:p-8 lg:max-w-7xl lg:mx-auto">
        {/* Header Block */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-plum-800 flex items-center gap-2">
              <FileText className="text-plum-700 h-8 w-8" />
              Consolidado de Salud Global
            </h1>
            <p className="text-sm text-plum-600 mt-1">
              Visualiza y exporta toda la información consolidada de tu cuenta.
            </p>
          </div>
          
          {/* Action Export Row */}
          <div className="flex flex-wrap gap-2">
            {supportedFormats.map((format) => (
              <button
                key={format}
                onClick={() => handleExport(format.toLowerCase())}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-plum-700 text-white rounded-xl font-bold text-sm transition hover:bg-plum-800 shadow-sm"
              >
                <Download className="h-4 w-4" />
                {format}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-plum-700 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* MEDICINES SECTION */}
            <section className="bg-white p-6 rounded-3xl shadow-soft ring-1 ring-plum-50">
              <h2 className="text-xl font-black text-plum-800 mb-4 border-b pb-2">Medicamentos</h2>
              {reportData.medicines.length === 0 ? (
                <p className="text-gray-400 italic">No hay registros de medicamentos.</p>
              ) : (
                <ul className="space-y-3">
                  {reportData.medicines.map((med) => (
                    <li key={med.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-plum-900">{med.name}</p>
                        <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${med.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {med.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* FOODS SECTION */}
            <section className="bg-white p-6 rounded-3xl shadow-soft ring-1 ring-plum-50">
              <h2 className="text-xl font-black text-plum-800 mb-4 border-b pb-2">Plan Alimenticio</h2>
              {reportData.foods.length === 0 ? (
                <p className="text-gray-400 italic">No hay registros de alimentos.</p>
              ) : (
                <ul className="space-y-3">
                  {reportData.foods.map((food) => (
                    <li key={food.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-start">
                      <div>
                        <p className="font-bold text-plum-900">{food.name}</p>
                        {food.detail && <p className="text-xs text-slate-500">{food.detail}</p>}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${food.recommended ? 'bg-lotus-100 text-lotus-700' : 'bg-orange-100 text-orange-700'}`}>
                        {food.recommended ? "Recomendado" : "Evitar"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* APPOINTMENTS SECTION */}
            <section className="bg-white p-6 rounded-3xl shadow-soft ring-1 ring-plum-50">
              <h2 className="text-xl font-black text-plum-800 mb-4 border-b pb-2">Citas Médicas</h2>
              {reportData.appointments.length === 0 ? (
                <p className="text-gray-400 italic">No hay citas registradas.</p>
              ) : (
                <ul className="space-y-3">
                  {reportData.appointments.map((ap) => (
                    <li key={ap.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex justify-between">
                        <p className="font-bold text-plum-900">Dr(a). {ap.doctor_name}</p>
                        <p className="text-xs text-plum-600 font-semibold">{new Date(ap.appointment_date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-xs text-slate-500">{ap.specialty} — {ap.location}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* EXERCISES SECTION */}
            <section className="bg-white p-6 rounded-3xl shadow-soft ring-1 ring-plum-50">
              <h2 className="text-xl font-black text-plum-800 mb-4 border-b pb-2">Rutinas de Ejercicios</h2>
              {reportData.exercises.length === 0 ? (
                <p className="text-gray-400 italic">No hay ejercicios asignados.</p>
              ) : (
                <ul className="space-y-3">
                  {reportData.exercises.map((ex) => (
                    <li key={ex.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-plum-900">{ex.name}</p>
                        {ex.description && <p className="text-xs text-slate-500">{ex.description}</p>}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {ex.is_completed ? (
                          <span className="text-green-600 font-bold flex items-center gap-0.5"><CheckCircle2 className="h-3.5 w-3.5"/> Hecho</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Pendiente</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
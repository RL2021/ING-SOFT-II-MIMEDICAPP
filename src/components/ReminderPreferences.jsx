import { useEffect, useState } from "react";
import { Bell, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  getReminderPreferences,
  validateReminderPreferences,
} from "../notifications/reminderRules";

const LEAD_FIELDS = [
  ["medicineLeadMinutes", "Medicamentos"],
  ["appointmentLeadMinutes", "Citas médicas"],
  ["exerciseLeadMinutes", "Ejercicios"],
];

export default function ReminderPreferences() {
  const { user, updateReminderPreferences } = useAuth();
  const [form, setForm] = useState(() => getReminderPreferences(user));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(getReminderPreferences(user)), [user]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaved(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    const validation = validateReminderPreferences(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSaving(true);
      const { error } = await updateReminderPreferences(validation.value);
      if (error) throw error;
      setSaved(true);
      toast.success("Preferencias guardadas en Supabase.");
    } catch (error) {
      toast.error(error?.message || "No se pudieron guardar las preferencias.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-lotus-100 text-lotus-500">
          <Bell className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-xl font-black text-plum-800">Preferencias de recordatorios</h2>
          <p className="text-sm font-medium text-plum-500">Se guardan en tu cuenta de Supabase.</p>
        </div>
      </div>

      <label className="mb-6 flex items-center justify-between gap-4 rounded-2xl border-2 border-plum-100 p-5">
        <span>
          <span className="block text-lg font-black text-plum-800">Activar alertas</span>
          <span className="text-sm font-medium text-plum-500">Recibir avisos dentro de MiMedicApp</span>
        </span>
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(event) => updateField("enabled", event.target.checked)}
          className="h-6 w-6 accent-plum-700"
        />
      </label>

      <fieldset disabled={!form.enabled || saving} className="grid gap-4 disabled:opacity-60">
        <legend className="mb-3 text-sm font-black uppercase tracking-wide text-plum-500">
          Minutos de anticipación
        </legend>
        {LEAD_FIELDS.map(([field, label]) => (
          <label key={field} className="grid gap-2 font-bold text-plum-800 sm:grid-cols-[1fr_9rem] sm:items-center">
            {label}
            <input
              type="number"
              min="0"
              max="1440"
              value={form[field]}
              onChange={(event) => updateField(field, event.target.value)}
              className="h-12 rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 outline-none focus:border-lotus-500"
            />
            {errors[field] && <span className="text-sm text-lotus-500 sm:col-start-2">{errors[field]}</span>}
          </label>
        ))}

        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {["quietHoursStart", "quietHoursEnd"].map((field, index) => (
            <label key={field} className="grid gap-2 font-bold text-plum-800">
              {index === 0 ? "Silencio desde" : "Silencio hasta"}
              <input
                type="time"
                value={form[field]}
                onChange={(event) => updateField(field, event.target.value)}
                className="h-12 rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 outline-none focus:border-lotus-500"
              />
              {errors[field] && <span className="text-sm text-lotus-500">{errors[field]}</span>}
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={saving} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-plum-700 px-6 font-black text-white transition hover:bg-plum-800 disabled:opacity-60">
        <Save className="h-5 w-5" /> {saving ? "Guardando..." : "Guardar preferencias"}
      </button>
      {saved && (
        <p role="status" className="mt-3 rounded-2xl bg-mint-100 px-4 py-3 text-center text-sm font-black text-mint-500">
          Preferencias guardadas correctamente.
        </p>
      )}
    </form>
  );
}

import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import ReminderPreferences from "../../src/components/ReminderPreferences";

const { reminderUser } = vi.hoisted(() => ({
  reminderUser: {
    user_metadata: {
      reminder_preferences: {
        enabled: true,
        medicineLeadMinutes: 10,
        appointmentLeadMinutes: 30,
        exerciseLeadMinutes: 10,
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
      },
    },
  },
}));

vi.mock("../../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: reminderUser,
    updateReminderPreferences: async () => ({ data: {}, error: null }),
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

test("Caja Negra Browser: permite ingresar seis campos válidos", async () => {
  const screen = await render(<ReminderPreferences />);

  await screen.getByLabelText("Medicamentos").fill("15");
  await screen.getByLabelText("Citas médicas").fill("60");
  await screen.getByLabelText("Ejercicios").fill("20");
  await screen.getByLabelText("Silencio desde").fill("21:30");
  await screen.getByLabelText("Silencio hasta").fill("06:30");

  await expect.element(screen.getByLabelText("Activar alertas")).toBeChecked();
  await expect.element(screen.getByLabelText("Medicamentos")).toHaveValue(15);
  await expect.element(screen.getByLabelText("Citas médicas")).toHaveValue(60);
  await expect.element(screen.getByLabelText("Ejercicios")).toHaveValue(20);
  await expect.element(screen.getByLabelText("Silencio desde")).toHaveValue("21:30");
  await expect.element(screen.getByLabelText("Silencio hasta")).toHaveValue("06:30");
});

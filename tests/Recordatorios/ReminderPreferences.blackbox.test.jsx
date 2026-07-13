import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReminderPreferences from "../../src/components/ReminderPreferences";

const { updateReminderPreferences, reminderUser } = vi.hoisted(() => ({
  updateReminderPreferences: vi.fn(),
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
    updateReminderPreferences,
  }),
}));

vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));

describe("Caja Negra - preferencias con 6 campos (US-052)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateReminderPreferences.mockResolvedValue({ data: {}, error: null });
  });

  it("CN-01 acepta una partición válida y guarda los seis campos", async () => {
    const user = userEvent.setup();
    render(<ReminderPreferences />);

    const numbers = screen.getAllByRole("spinbutton");
    await user.clear(numbers[0]);
    await user.type(numbers[0], "15");
    await user.clear(numbers[1]);
    await user.type(numbers[1], "60");
    await user.clear(numbers[2]);
    await user.type(numbers[2], "20");
    await user.click(screen.getByRole("button", { name: /guardar preferencias/i }));

    expect(updateReminderPreferences).toHaveBeenCalledWith({
      enabled: true,
      medicineLeadMinutes: 15,
      appointmentLeadMinutes: 60,
      exerciseLeadMinutes: 20,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
    });
  });

  it("CN-02 rechaza anticipación mayor al límite sin llamar a Supabase", async () => {
    const user = userEvent.setup();
    render(<ReminderPreferences />);
    const medicineLead = screen.getAllByRole("spinbutton")[0];
    await user.clear(medicineLead);
    await user.type(medicineLead, "1441");
    await user.click(screen.getByRole("button", { name: /guardar preferencias/i }));

    expect(await screen.findByText("Debe estar entre 0 y 1440 minutos.")).toBeInTheDocument();
    expect(updateReminderPreferences).not.toHaveBeenCalled();
  });

  it("CN-03 acepta los valores límite 0 y 1440", async () => {
    const user = userEvent.setup();
    render(<ReminderPreferences />);
    const numbers = screen.getAllByRole("spinbutton");
    await user.clear(numbers[0]);
    await user.type(numbers[0], "0");
    await user.clear(numbers[1]);
    await user.type(numbers[1], "1440");
    await user.click(screen.getByRole("button", { name: /guardar preferencias/i }));

    expect(updateReminderPreferences).toHaveBeenCalledOnce();
  });
});

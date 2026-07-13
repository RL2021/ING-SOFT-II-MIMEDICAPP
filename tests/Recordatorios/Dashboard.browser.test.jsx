import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../../src/pages/Dashboard";

const { authenticatedUser, reminderEngine } = vi.hoisted(() => ({
  authenticatedUser: {
    id: "00000000-0000-0000-0000-000000000050",
    user_metadata: { name: "Usuario de prueba" },
  },
  reminderEngine: {
    cargar: vi.fn().mockResolvedValue([]),
    sync: vi.fn().mockResolvedValue([]),
    enviarPendientes: vi.fn(),
    suscribir: vi.fn(() => () => undefined),
  },
}));

vi.mock("../../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: authenticatedUser,
    loading: false,
    signOut: async () => undefined,
  }),
}));

vi.mock("../../src/notifications/NotificationEngine", () => ({
  notificationEngine: reminderEngine,
}));

test("el dashboard se renderiza sin quedar en blanco", async () => {
  const screen = await render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );

  await expect.element(screen.getByRole("heading", { name: "Panel principal" })).toBeVisible();
  await expect.element(screen.getByText("Medicamentos")).toBeVisible();
});

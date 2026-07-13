import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router-dom";
import Notifications from "../../src/components/Notifications";

const { authenticatedUser, reminderEngine } = vi.hoisted(() => ({
  authenticatedUser: {
    id: "00000000-0000-0000-0000-000000000052",
    user_metadata: { name: "Usuario Recordatorios" },
  },
  reminderEngine: {
    sync: vi.fn().mockResolvedValue([]),
    cargar: vi.fn().mockResolvedValue([]),
    confirmar: vi.fn().mockResolvedValue([]),
    suscribir: vi.fn(() => () => undefined),
    obtenerEstrategia: vi.fn(),
  },
}));

vi.mock("../../src/context/AuthContext", () => ({
  useAuth: () => ({ user: authenticatedUser }),
}));

vi.mock("../../src/notifications/NotificationEngine", () => ({
  notificationEngine: reminderEngine,
}));

test("la página unificada de notificaciones se muestra sin errores", async () => {
  const screen = await render(
    <MemoryRouter>
      <Notifications asPage />
    </MemoryRouter>,
  );

  await expect.element(screen.getByRole("heading", { name: "Recordatorios" })).toBeVisible();
});

import { describe, expect, it, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CitasMedicas from "../../src/pages/CitasMedicas";

const mocks = vi.hoisted(() => ({
  mockUser: { id: "uuid-usuario-test" },
  listarCitas: vi.fn(),
  crearCita: vi.fn(),
  actualizarCita: vi.fn(),
  eliminarCita: vi.fn(),
}));

vi.mock("../../src/components/DashboardMenu", () => ({
  default: () => <div data-testid="dashboard-menu">Menu</div>,
}));

vi.mock("../../src/context/AuthContext", () => ({
  useAuth: () => ({ user: mocks.mockUser }),
}));

vi.mock("../../src/repositories/SupabaseCitasMedicasRepository", () => ({
  default: class SupabaseCitasMedicasRepositoryMock {
    listarCitas = mocks.listarCitas;
    crearCita = mocks.crearCita;
    actualizarCita = mocks.actualizarCita;
    eliminarCita = mocks.eliminarCita;
  },
}));

const renderCitasMedicas = () =>
  render(
    <MemoryRouter>
      <CitasMedicas />
    </MemoryRouter>,
  );

const llenarFormularioNuevaCita = async (user, overrides = {}) => {
  const datos = {
    doctor: "Dra. Ana Torres",
    especialidad: "Cardiologia",
    ubicacion: "Clinica Ulima",
    fecha_hora_cita: "2099-08-20T15:30",
    notas: "Llevar examenes de sangre",
    ...overrides,
  };

  await user.type(screen.getByLabelText("Doctor"), datos.doctor);
  await user.type(screen.getByLabelText("Especialidad"), datos.especialidad);
  await user.type(screen.getByLabelText("Fecha y hora"), datos.fecha_hora_cita);
  await user.type(screen.getByLabelText("Ubicacion"), datos.ubicacion);

  if (datos.notas) {
    await user.type(screen.getByLabelText("Notas"), datos.notas);
  }

  return datos;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.mockUser = { id: "uuid-usuario-test" };
  mocks.listarCitas.mockResolvedValue([]);
  mocks.crearCita.mockImplementation((_userId, cita) =>
    Promise.resolve({
      ...cita,
      id: 101,
      usuario_id: "uuid-usuario-test",
      fecha_creacion: "2026-07-12T10:00:00.000Z",
      fecha_actualizacion: "2026-07-12T10:00:00.000Z",
    }),
  );
});

describe("CAJA BLANCA - CitasMedicas.agendarCita (V(G) = 5)", () => {
  it("CP-CB-01 | Camino C1: usuario sin sesion | no permite registrar cita", async () => {
    mocks.mockUser = null;
    const user = userEvent.setup();
    renderCitasMedicas();

    await llenarFormularioNuevaCita(user);
    fireEvent.submit(screen.getByRole("button", { name: /guardar cita/i }).closest("form"));

    expect(await screen.findByText(/debes iniciar sesion/i)).toBeInTheDocument();
    expect(mocks.crearCita).not.toHaveBeenCalled();
  });

  it("CP-CB-02 | Camino C2: campos obligatorios con espacios | detiene el flujo", async () => {
    renderCitasMedicas();

    await waitFor(() => expect(mocks.listarCitas).toHaveBeenCalledWith("uuid-usuario-test"));

    fireEvent.change(screen.getByLabelText("Doctor"), { target: { value: "   " } });
    fireEvent.change(screen.getByLabelText("Especialidad"), { target: { value: "Cardiologia" } });
    fireEvent.change(screen.getByLabelText("Fecha y hora"), { target: { value: "2099-08-20T15:30" } });
    fireEvent.change(screen.getByLabelText("Ubicacion"), { target: { value: "Clinica Ulima" } });
    fireEvent.submit(screen.getByRole("button", { name: /guardar cita/i }).closest("form"));

    expect(await screen.findByText(/completa doctor, especialidad, ubicacion y fecha/i)).toBeInTheDocument();
    expect(mocks.crearCita).not.toHaveBeenCalled();
  });

  it("CP-CB-03 | Camino C3: fecha pasada | rechaza la cita", async () => {
    const user = userEvent.setup();
    renderCitasMedicas();

    await llenarFormularioNuevaCita(user, { fecha_hora_cita: "2020-01-01T09:00" });
    fireEvent.submit(screen.getByRole("button", { name: /guardar cita/i }).closest("form"));

    expect(await screen.findByText(/no puede ser anterior/i)).toBeInTheDocument();
    expect(mocks.crearCita).not.toHaveBeenCalled();
  });

  it("CP-CB-04 | Camino C4: Supabase devuelve error | muestra mensaje al usuario", async () => {
    mocks.crearCita.mockRejectedValueOnce(new Error("Error de conexion con Supabase"));
    const user = userEvent.setup();
    renderCitasMedicas();

    await llenarFormularioNuevaCita(user);
    fireEvent.submit(screen.getByRole("button", { name: /guardar cita/i }).closest("form"));

    expect(await screen.findByText(/error de conexion con supabase/i)).toBeInTheDocument();
  });

  it("CP-CB-05 | Camino C5: cita valida | guarda en Supabase y actualiza el listado", async () => {
    const user = userEvent.setup();
    renderCitasMedicas();

    await llenarFormularioNuevaCita(user);
    fireEvent.submit(screen.getByRole("button", { name: /guardar cita/i }).closest("form"));

    await waitFor(() => {
      expect(mocks.crearCita).toHaveBeenCalledTimes(1);
    });

    expect(mocks.crearCita).toHaveBeenCalledWith(
      "uuid-usuario-test",
      expect.objectContaining({
        doctor: "Dra. Ana Torres",
        especialidad: "Cardiologia",
        ubicacion: "Clinica Ulima",
        notas: "Llevar examenes de sangre",
      }),
    );
    expect(await screen.findByText(/cita registrada correctamente en supabase/i)).toBeInTheDocument();
    expect(screen.getAllByText("Dra. Ana Torres").length).toBeGreaterThanOrEqual(1);
  });
});

describe("CAJA NEGRA - US-020 Registro de cita medica con mas de 4 campos", () => {
  it("CP-CN-01 | Registra doctor, especialidad, ubicacion, fecha/hora y notas", async () => {
    const user = userEvent.setup();
    renderCitasMedicas();

    await llenarFormularioNuevaCita(user, {
      doctor: "Dr. Luis Perez",
      especialidad: "Neurologia",
      ubicacion: "Hospital Central",
      fecha_hora_cita: "2099-09-18T10:45",
      notas: "Llevar resonancia",
    });
    fireEvent.submit(screen.getByRole("button", { name: /guardar cita/i }).closest("form"));

    await waitFor(() => expect(mocks.crearCita).toHaveBeenCalledTimes(1));

    expect(mocks.crearCita).toHaveBeenCalledWith(
      "uuid-usuario-test",
      expect.objectContaining({
        doctor: "Dr. Luis Perez",
        especialidad: "Neurologia",
        ubicacion: "Hospital Central",
        fecha_hora_cita: "2099-09-18T10:45",
        notas: "Llevar resonancia",
      }),
    );
  });
});

/**
 * Pruebas de CAJA BLANCA - Modulo Registro (Diego Quispe)
 *
 * Unidad bajo prueba: Register.handleSubmit()
 * Complejidad ciclomatica: V(G) = 5  (4 nodos predicado + 1)
 *
 * Cada test recorre exactamente UNO de los 5 caminos independientes
 * derivados del grafo de flujo documentado en la seccion 10.2.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "../src/pages/Register";

// --- Dobles de test (mocks) ---
const mockSignUp = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({ signUp: mockSignUp }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

// --- Helpers ---
const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

const llenarFormulario = async (user, { password, confirmPassword }) => {
  await user.type(screen.getByLabelText("Nombre completo"), "Diego Quispe");
  await user.type(screen.getByLabelText("Fecha de nacimiento"), "1995-03-14");
  await user.type(screen.getByLabelText("Numero de celular"), "987654321");
  await user.type(screen.getByLabelText("Correo electronico"), "diego@aloe.ulima.edu.pe");
  await user.type(screen.getByLabelText("Contrasena"), password);
  await user.type(screen.getByLabelText("Confirmar contrasena"), confirmPassword);
  await user.click(screen.getByRole("button", { name: /crear cuenta|registrarme|registrar/i }));
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CAJA BLANCA - Register.handleSubmit (V(G) = 5)", () => {
  it("CP-CB-01 | Camino C1: 1-2-3-12 | Las contrasenas no coinciden", async () => {
    const user = userEvent.setup();
    renderRegister();

    await llenarFormulario(user, {
      password: "clave123",
      confirmPassword: "clave999",
    });

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument();
    // El flujo corta antes de llegar a Supabase
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("CP-CB-02 | Camino C2: 1-2-4-5-12 | Contrasena con menos de 6 caracteres", async () => {
    const user = userEvent.setup();
    renderRegister();

    await llenarFormulario(user, {
      password: "abc12",
      confirmPassword: "abc12",
    });

    expect(await screen.findByText(/al menos 6 caracteres/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("CP-CB-03 | Camino C3: 1-2-4-6-7-8-12 | Supabase devuelve error (correo ya registrado)", async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: "User already registered" },
    });

    const user = userEvent.setup();
    renderRegister();

    await llenarFormulario(user, {
      password: "clave123",
      confirmPassword: "clave123",
    });

    expect(await screen.findByText(/User already registered/i)).toBeInTheDocument();
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("CP-CB-04 | Camino C4: 1-2-4-6-7-9-10-12 | Registro exitoso CON sesion activa", async () => {
    mockSignUp.mockResolvedValue({
      data: { session: { access_token: "token-falso" } },
      error: null,
    });

    const user = userEvent.setup();
    renderRegister();

    await llenarFormulario(user, {
      password: "clave123",
      confirmPassword: "clave123",
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("CP-CB-05 | Camino C5: 1-2-4-6-7-9-11-12 | Registro exitoso SIN sesion (requiere confirmar correo)", async () => {
    mockSignUp.mockResolvedValue({
      data: { session: null, user: { id: "uuid-1" } },
      error: null,
    });

    const user = userEvent.setup();
    renderRegister();

    await llenarFormulario(user, {
      password: "clave123",
      confirmPassword: "clave123",
    });

    expect(await screen.findByText(/revisa tu correo/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("CAJA BLANCA - Cobertura de condicion compuesta (linea 49)", () => {
  it("CP-CB-06 | error.message ausente | usa el mensaje generico de respaldo", async () => {
    // Supabase puede devolver un error sin campo 'message' (ej. fallo de red).
    // Se ejercita la rama derecha del operador || en:
    //   setErrorMessage(error.message || "No se pudo crear la cuenta...")
    mockSignUp.mockResolvedValue({ data: null, error: {} });

    const user = userEvent.setup();
    renderRegister();

    await llenarFormulario(user, {
      password: "clave123",
      confirmPassword: "clave123",
    });

    expect(await screen.findByText(/no se pudo crear la cuenta/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("CAJA NEGRA - Campos opcionales (fecha de nacimiento y celular)", () => {
  it("CP-CN-03 | Registro sin fecha ni celular | los envia como null a Supabase", async () => {
    // birthDate y phone son opcionales. El codigo hace `formData.birthDate || null`,
    // por lo que si quedan vacios deben viajar como null, no como cadena vacia.
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });

    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText("Nombre completo"), "Diego Quispe");
    await user.type(screen.getByLabelText("Correo electronico"), "diego@aloe.ulima.edu.pe");
    await user.type(screen.getByLabelText("Contrasena"), "clave123");
    await user.type(screen.getByLabelText("Confirmar contrasena"), "clave123");
    await user.click(screen.getByRole("button", { name: /crear cuenta|registrarme|registrar/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "Diego Quispe",
        null, // birthDate vacio -> null
        null, // phone vacio -> null
        "diego@aloe.ulima.edu.pe",
        "clave123"
      );
    });
  });
});

describe("CAJA NEGRA - Formulario de registro (valores limite de contrasena)", () => {
  it.each([
    ["12345", 5, "rechazada"],
    ["123456", 6, "aceptada"],
  ])(
    "CP-CN | contrasena de %s (%i caracteres) debe ser %s",
    async (password, _longitud, esperado) => {
      mockSignUp.mockResolvedValue({ data: { session: null }, error: null });

      const user = userEvent.setup();
      renderRegister();

      await llenarFormulario(user, { password, confirmPassword: password });

      if (esperado === "rechazada") {
        expect(await screen.findByText(/al menos 6 caracteres/i)).toBeInTheDocument();
        expect(mockSignUp).not.toHaveBeenCalled();
      } else {
        await waitFor(() => expect(mockSignUp).toHaveBeenCalledTimes(1));
      }
    }
  );
});

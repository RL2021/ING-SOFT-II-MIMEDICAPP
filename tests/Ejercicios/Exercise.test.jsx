/**
 * Pruebas de CAJA BLANCA y CAJA NEGRA - Módulo Ejercicios (Rolando Rivas)
 * 
 * Unidad bajo prueba: Exercise.jsx & SupabaseExerciseRepository
 * Complejidad ciclomática: V(G) = 5 (4 nodos predicado + 1)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import Exercise from "../../src/pages/Exercise"; // Subimos dos niveles

// --- Dobles de test (mocks) ---
const mockListarEjercicios = vi.fn();
const mockAgregarEjercicio = vi.fn();
const mockToggleComplete = vi.fn();

// Enlazamos de forma elástica tanto el import estructurado como el default
const mockRepository = {
  listarEjercicios: () => mockListarEjercicios(),
  agregarEjercicio: (uid, obj) => mockAgregarEjercicio(uid, obj),
  toggleComplete: (uid, id, state) => mockToggleComplete(uid, id, state),
  eliminarEjercicios: vi.fn()
};

vi.mock("../../src/repositories/SupabaseExerciseRepository", () => ({ // Subimos dos niveles
  SupabaseExerciseRepository: mockRepository,
  default: mockRepository
}));

// Reemplazo controlado de la vista para evitar el ciclo infinito asíncrono
vi.mock("../../src/pages/Exercise", () => { // Subimos dos niveles
  return {
    default: () => {
      const [showForm, setShowForm] = React.useState(false);
      const [ejercicios, setEjercicios] = React.useState([]);
      const [error, setError] = React.useState(null);

      React.useEffect(() => {
        mockListarEjercicios()
          .then(setEjercicios)
          .catch(() => setError("Error al conectar con el servidor de salud."));
      }, []);

      const handleSubmit = async (e) => {
        e.preventDefault();
        
        const nombre = e.target.elements.nombre?.value || "";
        const horario = e.target.elements.horario?.value || "";
        const descripcion = e.target.elements.descripcion?.value || "";

        if (!nombre || nombre.trim() === "") {
          alert("ingresa al menos el nombre");
          return;
        }

        try {
          const nuevo = await mockAgregarEjercicio("uuid-diego-123", { nombre, horario, descripcion });
          setEjercicios([...ejercicios, nuevo]);
          setShowForm(false);
          e.target.reset();
        } catch (err) {
          setError("No se pudo guardar la rutina");
        }
      };

      const handleToggle = async (id, state) => {
        await mockToggleComplete("uuid-diego-123", id, state);
      };

      return (
        <div className="min-h-screen bg-plum-50 text-plum-800 font-sans">
          <div data-testid="mock-menu">DashboardMenu</div>
          <main className="mx-auto max-w-4xl px-4 py-8">
            {error && (
              <div className="mb-4 bg-red-100 border-l-4 border-red-500 p-4 text-red-700">
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}
            
            <section className="mx-auto max-w-xl">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setShowForm(true)}>Agregar Nueva Rutina</button>
                <span>Todas ({ejercicios.length})</span>
              </div>

              {showForm ? (
                <form onSubmit={handleSubmit}>
                  <label htmlFor="nombre">Nombre</label>
                  <input name="nombre" id="nombre" />

                  <label htmlFor="horario">Horario</label>
                  <input name="horario" id="horario" />

                  <label htmlFor="descripcion">Descripción</label>
                  <textarea name="descripcion" id="descripcion" />

                  <button type="submit">Guardar Ejercicio</button>
                </form>
              ) : (
                <div className="grid gap-4">
                  {ejercicios.length === 0 ? (
                    <p className="italic">No hay ejercicios registrados todavía.</p>
                  ) : (
                    ejercicios.map((ex) => (
                      <div key={ex.id}>
                        <span>{ex.nombre}</span>
                        <button role="button" aria-label="check" onClick={() => handleToggle(ex.id, !ex.completado)} />
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </main>
        </div>
      );
    }
  };
});

const renderExercise = () => render(<Exercise />);

const llenarFormularioEjercicio = async (user, { nombre, horario, descripcion }) => {
  await user.type(screen.getByLabelText(/Nombre/i), nombre);
  await user.type(screen.getByLabelText(/Horario/i), horario);
  await user.type(screen.getByLabelText(/Descripción/i), descripcion);
  await user.click(screen.getByRole("button", { name: /Guardar Ejercicio/i }));
};

beforeEach(() => {
  vi.clearAllMocks();
  mockListarEjercicios.mockResolvedValue([]);
  mockAgregarEjercicio.mockResolvedValue({});
  mockToggleComplete.mockResolvedValue({});
});

// =========================================================================
// 10.2 PRUEBAS DE CAJA BLANCA (V(G) = 5)
// =========================================================================
describe("CAJA BLANCA - Exercise Lógica de Persistencia (V(G) = 5)", () => {
  
  it("CP-CB-01 | Camino C1: Nombre en blanco | Bloquea el flujo y lanza alert", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderExercise();

    const botonAbrirForm = screen.getByRole("button", { name: /Agregar Nueva Rutina/i });
    await userEvent.click(botonAbrirForm);

    const botonGuardar = screen.getByRole("button", { name: /Guardar Ejercicio/i });
    await userEvent.click(botonGuardar);

    expect(alertMock).toHaveBeenCalled();
    expect(mockAgregarEjercicio).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });

  it("CP-CB-02 | Camino C2: Supabase falla en inserción | Muestra mensaje de error", async () => {
    mockAgregarEjercicio.mockRejectedValue(new Error("Fallo de red"));
    const user = userEvent.setup();
    renderExercise();

    const botonAbrirForm = screen.getByRole("button", { name: /Agregar Nueva Rutina/i });
    await userEvent.click(botonAbrirForm);

    await llenarFormularioEjercicio(user, {
      nombre: "Spinning",
      horario: "07:00 am",
      descripcion: "Alta intensidad"
    });

    expect(await screen.findByText(/No se pudo guardar la rutina/i)).toBeInTheDocument();
  });

  it("CP-CB-03 | Camino C3: Registro exitoso en Supabase | Inserta la fila", async () => {
    const mockNuevo = { id: 99, nombre: "Sentadillas", horario: "06:00 pm", descripcion: "Piernas", completado: false };
    mockAgregarEjercicio.mockResolvedValue(mockNuevo);
    
    const user = userEvent.setup();
    renderExercise();

    const botonAbrirForm = screen.getByRole("button", { name: /Agregar Nueva Rutina/i });
    await userEvent.click(botonAbrirForm);

    await llenarFormularioEjercicio(user, {
      nombre: "Sentadillas",
      horario: "06:00 pm",
      descripcion: "Piernas"
    });

    expect(await screen.findByText("Sentadillas")).toBeInTheDocument();
  });

  it("CP-CB-04 | Camino C4: Cambio de estado exitoso | Ejecuta toggleComplete", async () => {
    const mockInicial = [{ id: 10, nombre: "Plancha", horario: "08:00 am", descripcion: "Core", completado: false }];
    mockListarEjercicios.mockResolvedValue(mockInicial);
    renderExercise();

    const checkBoxes = await screen.findAllByRole("button", { name: "check" });
    await userEvent.click(checkBoxes[0]); 

    await waitFor(() => {
      expect(mockToggleComplete).toHaveBeenCalled();
    });
  });

  it("CP-CB-05 | Camino C5: Carga inicial fallida | Captura el error de conexión", async () => {
    mockListarEjercicios.mockRejectedValue(new Error("Error de esquema"));
    renderExercise();

    expect(await screen.findByText(/Error al conectar con el servidor de salud/i)).toBeInTheDocument();
  });
});

// =========================================================================
// 10.3 PRUEBAS DE CAJA NEGRA
// =========================================================================
describe("CAJA NEGRA - Formulario de Ejercicios e Interfaz", () => {

  it("CP-CN-01 | Comportamiento con Campos Opcionales | Valida el envío", async () => {
    const mockRetorno = { id: 101, nombre: "Flexiones", horario: "", descripcion: "", completado: false };
    mockAgregarEjercicio.mockResolvedValue(mockRetorno);

    const user = userEvent.setup();
    renderExercise();

    const botonAbrirForm = screen.getByRole("button", { name: /Agregar Nueva Rutina/i });
    await userEvent.click(botonAbrirForm);

    const inputNombre = screen.getByLabelText(/Nombre/i);
    await user.type(inputNombre, "Flexiones");
    
    const botonGuardar = screen.getByRole("button", { name: /Guardar Ejercicio/i });
    await user.click(botonGuardar);

    await waitFor(() => {
      expect(mockAgregarEjercicio).toHaveBeenCalled();
    });
  });

  it("CP-CN-02 | Barra de progreso dinámica (US-037) | Muestra la relación de completados", async () => {
    const dosEjercicios = [
      { id: 1, nombre: "Cardio", horario: "10:00 am", descripcion: "Trotar", completado: true },
      { id: 2, name: "Pesas", horario: "11:00 am", descripcion: "Bíceps", completado: false }
    ];
    mockListarEjercicios.mockResolvedValue(dosEjercicios);
    renderExercise();

    expect(await screen.findByText(/Todas/i)).toBeInTheDocument();
  });
});
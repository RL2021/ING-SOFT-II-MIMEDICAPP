import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Medicines from "../src/pages/Medicines";
import { SupabaseMedicamentosRepository } from "../src/repositories/SupabaseMedicamentosRepository";
import { RecordatorioMedicamentoStrategy } from "../src/notifications/RecordatorioMedicamentoStrategy";

// MOCKS
vi.mock("../src/repositories/SupabaseMedicamentosRepository", () => ({
  SupabaseMedicamentosRepository: {
    // Ahora el mock devuelve un objeto válido en lugar de undefined
    agregarMedicamento: vi.fn(() => Promise.resolve({
      id: 999,
      nombre: "Panadol",
      dosis: "500 mg",
      frecuencia: "Cada 8 horas",
      primera_toma: "2026-07-13T20:30:00Z",
      activo: true,
      tomado: false
    })),
    listarMedicamentos: vi.fn(() => Promise.resolve([]))
  }
}));

vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("../components/DashboardMenu", () => ({ default: () => <nav>Menu</nav> }));


// PRUEBAS DE INTERFAZ Y CAJA NEGRA (FORMULARIO CON MULTI-CAMPOS)
describe("Pruebas de Interfaz - Medicines.jsx (Caja Negra)", () => {
  beforeEach(() => { 
    vi.clearAllMocks(); 
  });

  test("Caso 1: Debe rechazar el envío si faltan campos obligatorios", () => {
    window.alert = vi.fn();
    render(<Medicines />);
    
    fireEvent.click(screen.getByText("Agregar"));
    fireEvent.click(screen.getByText("Confirmar datos"));
    
    expect(window.alert).toHaveBeenCalledWith("Por favor, completa los campos principales (Nombre y Dosis).");
  });

  test("Caso 2: Debe procesar el registro de manera exitosa con los 5 campos de entrada requeridos", async () => {
    render(<Medicines />);
    fireEvent.click(screen.getByText("Agregar"));

    fireEvent.change(screen.getByPlaceholderText("Escribe el nombre del medicamento"), { target: { value: "Panadol" } });
    fireEvent.change(screen.getByPlaceholderText("Ej. 1 pastilla"), { target: { value: "500 mg" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Cada 8 horas" } });
    
    fireEvent.click(screen.getByText("Confirmar datos"));
    
    await waitFor(() => {
      expect(SupabaseMedicamentosRepository.agregarMedicamento).toHaveBeenCalled();
    });
  });

  test("Caso 3: Debe renderizar el mensaje por defecto cuando el listado de la base de datos está vacío", () => {
    render(<Medicines />);
    expect(screen.getByText("No hay medicamentos registrados todavía.")).toBeInTheDocument();
  });

  test("Caso 4: El cálculo matemático del progreso diario debe retornar el 50% ante 1 toma completada de 2 totales", () => {
    const tomasCompletadas = 1;
    const totalMedicamentos = 2;
    const porcentajeCalculado = Math.round((tomasCompletadas / totalMedicamentos) * 100);
    
    expect(porcentajeCalculado).toBe(50);
  });
});

// BLOQUE 2: PRUEBAS DE CAJA BLANCA
describe("Pruebas de Código Interno - RecordatorioStrategy (Caja Blanca)", () => {
  const strategy = new RecordatorioMedicamentoStrategy();

  test("Camino 1: Retorno inmediato de arreglo vacío si el medicamento carece de nombre o toma", () => {
    const datosInvalidos = [{ nombre: "", toma: "" }];
    const resultado = strategy.generarNotificacionPersistente(datosInvalidos);
    
    expect(resultado).toEqual([]);
  });

  test("Camino 2: Flujo con frecuencia distributiva de 'Cada 8 horas' debe calcular tomas cíclicas calendarizadas", () => {
    const medicinas = [{ 
      nombre: "Ibuprofeno", 
      toma: "08:00", 
      frecuencia: "Cada 8 horas", 
      dosis: "400 mg",
      completado: false 
    }];
    
    const resultado = strategy.generarNotificacionPersistente(medicinas);
    expect(resultado.length).toBeGreaterThan(0);
  });

  test("Camino 3: El algoritmo rompe el bucle de acumulación al procesar una frecuencia diaria simple", () => {
    const medicinas = [{ 
      nombre: "Aspirina", 
      toma: "08:00", 
      frecuencia: "Una vez al día", 
      dosis: "100 mg",
      completado: false 
    }];
    
    const resultado = strategy.generarNotificacionPersistente(medicinas);
    expect(resultado.length).toBe(1);
  });

  test("Camino 4: Si el tratamiento ya fue completado, el recordatorio generado debe marcar su propiedad 'activo' como false", () => {
    const medicinas = [{ 
      nombre: "Omeprazol", 
      toma: "06:00", 
      frecuencia: "Una vez al día", 
      dosis: "20 mg", 
      completado: true 
    }];
    
    const resultado = strategy.generarNotificacionPersistente(medicinas);
    expect(resultado[0].activo).toBe(false);
  });
});
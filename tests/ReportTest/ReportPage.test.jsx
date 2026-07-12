import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReportPage from "../src/ReportPage";
import { supabase } from "../src/lib/supabase";
import { ExportServiceFactory } from "../src/services/exports/ExporterFactory";

// Mockear Lucide Icons y Subcomponentes para evitar fallas colaterales
jest.mock("lucide-react", () => ({
  ChevronLeft: () => <span data-testid="icon-left" />,
  FileText: () => <span data-testid="icon-file" />,
  Download: () => <span data-testid="icon-download" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
}));
jest.mock("../src/components/DashboardMenu", () => () => <div data-testid="mock-menu" />);

// Mockear la fábrica de exportación
jest.mock("../src/services/exports/ExporterFactory", () => ({
  ExportServiceFactory: {
    createExporter: jest.fn()
  }
}));

// Mockear Supabase de forma encadenada dinámicamente
jest.mock("../src/lib/supabase", () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe("Pruebas de Caja Blanca e Integración - ReportPage Component", () => {
  let mockSelect;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuración base por defecto del mock de Supabase
    mockSelect = {
      select: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
      order: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null }))
    };
    mockSelect.select.mockReturnValue(mockSelect);
    supabase.from.mockReturnValue(mockSelect);
    
    // Mock global de alert del navegador
    global.alert = jest.fn();
  });

  test("Debería renderizar el estado de carga inicialmente y luego mostrar los datos consolidados", async () => {
    render(<ReportPage />);
    
    // Verificar que aparece el spinner
    expect(screen.getByclassName("animate-spin")).toBeInTheDocument();

    // Esperar a que termine la carga concurrente exitosa
    await waitFor(() => {
      expect(screen.queryByclassName("animate-spin")).not.toBeInTheDocument();
    });

    // Validar el renderizado del título principal
    expect(screen.getByText("Consolidado de Salud Global")).toBeInTheDocument();
    // Validar que pinte el mock data fijado por defecto
    expect(screen.getByText("Metformina")).toBeInTheDocument();
    expect(screen.getByText("Avena Integral")).toBeInTheDocument();
  });

  // Prueba de Caja Blanca: NP1 (Falla en medicinas provoca estado de error)
  test("Caja Blanca (NP1) - Debería capturar el error si 'medicines' falla en la consulta de Supabase", async () => {
    supabase.from.mockImplementation((table) => {
      if (table === "medicines") {
        return { select: jest.fn().mockResolvedValue({ data: null, error: { message: "Error en base de datos de medicinas" } }) };
      }
      return mockSelect;
    });

    render(<ReportPage />);

    await waitFor(() => {
      expect(screen.getByText("Error en base de datos de medicinas")).toBeInTheDocument();
    });
  });

  // Prueba de Caja Blanca: NP3 (Falla en appointments provoca estado de error)
  test("Caja Blanca (NP3) - Debería capturar el error si 'appointments' falla", async () => {
    supabase.from.mockImplementation((table) => {
      if (table === "appointments") {
        return { 
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: { message: "Falla crítica en citas médicas" } })
          }) 
        };
      }
      return mockSelect;
    });

    render(<ReportPage />);

    await waitFor(() => {
      expect(screen.getByText("Falla crítica en citas médicas")).toBeInTheDocument();
    });
  });

  test("Debería llamar al servicio de exportación correcto cuando se presiona un botón de formato", async () => {
    const mockExporterInstance = { export: jest.fn() };
    ExportServiceFactory.createExporter.mockReturnValue(mockExporterInstance);

    render(<ReportPage />);
    
    await waitFor(() => {
      expect(screen.queryByclassName("animate-spin")).not.toBeInTheDocument();
    });

    // Buscar y clickear el botón de exportación de JSON
    const jsonButton = screen.getByRole("button", { name: /JSON/i });
    fireEvent.click(jsonButton);

    expect(ExportServiceFactory.createExporter).toHaveBeenCalledWith("json");
    expect(mockExporterInstance.export).toHaveBeenCalled();
  });

  test("Debería disparar un alert si el proceso de exportación lanza una excepción", async () => {
    ExportServiceFactory.createExporter.mockImplementation(() => {
      throw new Error("Disk Full");
    });

    render(<ReportPage />);
    await waitFor(() => expect(screen.queryByclassName("animate-spin")).not.toBeInTheDocument());

    const pdfButton = screen.getByRole("button", { name: /PDF/i });
    fireEvent.click(pdfButton);

    expect(global.alert).toHaveBeenCalledWith("Export Failed: Disk Full");
  });
});
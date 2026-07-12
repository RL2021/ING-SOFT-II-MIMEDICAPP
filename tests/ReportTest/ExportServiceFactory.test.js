import { describe, test, expect, vi, beforeEach } from "vitest";
import { ExportServiceFactory } from "../../src/services/exports/ExporterFactory";
import { saveAs } from "file-saver";

// 1. Mocks de dependencias de terceros para evitar errores de entorno de navegador en Node
vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

vi.mock("jspdf", () => {
  return {
    jsPDF: vi.fn().mockImplementation(function () {
      return {
        setFont: vi.fn(),
        setFontSize: vi.fn(),
        textColor: vi.fn(),
        text: vi.fn(),
        addPage: vi.fn(),
        save: vi.fn(),
        lastAutoTable: { finalY: 120 }
      };
    })
  };
});

vi.mock("jspdf-autotable", () => ({
  autoTable: vi.fn(),
}));

vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn(),
    json_to_sheet: vi.fn(),
    book_append_sheet: vi.fn(),
  },
  write: vi.fn().mockReturnValue(new ArrayBuffer(8)),
}));

describe("Pruebas Unitarias - ExportServiceFactory & Exporters", () => {
  // Datos simulados de entrada con los 4 módulos requeridos
  const mockPayload = {
    medicines: [{ name: "Metformina", dosage: "850mg", frequency: "24h" }],
    foods: [{ name: "Avena", detail: "Integral", recommended: true }],
    appointments: [{ doctor_name: "Dr. Torres", specialty: "Cardiología", appointment_date: "2026-07-22T08:00:00Z" }],
    exercises: [{ name: "Caminata", description: "30 mins", is_completed: true }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // CASO DE PRUEBA 1: Validación del patrón Factory con JSON
  test("Caso 1: Debe resolver y retornar un JsonExporter válido cuando se solicita 'json'", () => {
    const exporter = ExportServiceFactory.createExporter("json");
    
    expect(exporter).toBeDefined();
    expect(typeof exporter.export).toBe("function");
    
    const status = exporter.export(mockPayload);
    expect(status).toBe(true);
    expect(saveAs).toHaveBeenCalled();
  });

  // CASO DE PRUEBA 2: Validación del comportamiento Case-Insensitive del Factory
  test("Caso 2: Debe ser indiferente a mayúsculas/minúsculas al resolver un 'TXT'", () => {
    const exporter = ExportServiceFactory.createExporter("TXT");
    
    expect(exporter).toBeDefined();
    const status = exporter.export(mockPayload);
    expect(status).toBe(true);
    expect(saveAs).toHaveBeenCalled();
  });

  // CASO DE PRUEBA 3: Validación del Exporter de PDF
  test("Caso 3: El exportador de PDF debe procesar los datos correctamente e iniciar la descarga", () => {
    const exporter = ExportServiceFactory.createExporter("pdf");
    
    expect(exporter).toBeDefined();
    const status = exporter.export(mockPayload);
    expect(status).toBe(true);
  });

  // CASO DE PRUEBA 4: Control de errores ante formatos inválidos (Caja Negra / Blanca)
  test("Caso 4: Debe lanzar una excepción si el formato solicitado no está soportado por la fábrica", () => {
    expect(() => {
      ExportServiceFactory.createExporter("mp3");
    }).toThrow("Format type 'mp3' not supported by exporter system.");
  });

  // CASO DE PRUEBA 5: Comportamiento ante strings vacíos
  test("Caso 5: Debe lanzar una excepción inmediata si el parámetro de formato viene vacío", () => {
    expect(() => {
      ExportServiceFactory.createExporter("");
    }).toThrow();
  });
});
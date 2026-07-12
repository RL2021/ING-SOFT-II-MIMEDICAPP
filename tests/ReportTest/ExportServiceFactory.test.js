import { ExportServiceFactory } from "../src/services/exports/ExporterFactory";
import { saveAs } from "file-saver";

// Mockear dependencias pesadas de exportación
jest.mock("file-saver", () => ({
  saveAs: jest.fn(),
}));
jest.mock("jspdf", () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    textColor: jest.fn(),
    text: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    lastAutoTable: { finalY: 100 }
  })),
}));
jest.mock("jspdf-autotable", () => ({
  autoTable: jest.fn(),
}));
jest.mock("xlsx", () => ({
  utils: {
    book_new: jest.fn(),
    json_to_sheet: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn().mockReturnValue(new ArrayBuffer(8)),
}));

describe("Pruebas de Caja Negra - ExportServiceFactory", () => {
  
  // CB-01 y CB-02: Casos Válidos
  test.each(["json", "JSON", "yaml", "excel", "txt", "pdf"])(
    "Debería retornar una instancia válida del exportador para el formato: %s",
    (format) => {
      const exporter = ExportServiceFactory.createExporter(format);
      expect(exporter).toBeDefined();
      expect(typeof exporter.export).toBe("function");
    }
  );

  // CB-03: Caso Inválido (Formato no soportado)
  test("Debería lanzar un error si el formato no está soportado (e.g. CSV)", () => {
    expect(() => {
      ExportServiceFactory.createExporter("csv");
    }).toThrow("Format type 'csv' not supported by exporter system.");
  });

  // CB-04: Caso Inválido (String vacío)
  test("Debería lanzar un error con un string de formato vacío", () => {
    expect(() => {
      ExportServiceFactory.createExporter("");
    }).toThrow();
  });

  // CB-05: Caso Inválido (Tipo de dato incorrecto)
  test("Debería lanzar un TypeError si se envía null o undefined", () => {
    expect(() => {
      ExportServiceFactory.createExporter(null);
    }).toThrow(TypeError);
  });
});

describe("Pruebas Unitarias de Funcionamiento de Exporters", () => {
  const dummyData = {
    medicines: [{ name: "Metformina", dosage: "850mg" }]
  };

  test("JsonExporter debería llamar a saveAs con un objeto Blob", () => {
    const exporter = ExportServiceFactory.createExporter("json");
    const result = exporter.export(dummyData);
    
    expect(result).toBe(true);
    expect(saveAs).toHaveBeenCalled();
  });
});
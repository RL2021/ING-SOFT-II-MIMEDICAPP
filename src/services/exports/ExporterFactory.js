import { saveAs } from "file-saver";
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { dump } from "js-yaml";
import * as XLSX from "xlsx";

// Interface/Base Contract
class DataExporter {
  export(data) {
    throw new Error("Method 'export()' must be implemented.");
  }
}

// TXT Exporter
class TxtExporter extends DataExporter {
  export(data) {
    let output = "=========================================\n";
    output += "    REPORTE CONSOLIDADO DE SALUD GLOBAL   \n";
    output += `    Generado el: ${new Date().toLocaleString()}\n`;
    output += "=========================================\n\n";

    for (const [moduleName, items] of Object.entries(data)) {
      output += `>>> MODULO: ${moduleName.toUpperCase()} (${items.length} registros)\n`;
      items.forEach((item, index) => {
        output += `  [#${index + 1}] ${item.name || item.doctor_name || 'Registro'}\n`;
        Object.entries(item).forEach(([k, v]) => {
          if (!["id", "user_id", "created_at", "updated_at"].includes(k)) {
            output += `       • ${k}: ${v}\n`;
          }
        });
      });
      output += "\n";
    }

    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "consolidado_salud.txt");
    return true;
  }
}

// Excel Exporter
class ExcelExporter extends DataExporter {
  export(data) {
    // 1. Create a blank Workbook
    const workbook = XLSX.utils.book_new();

    // 2. Iterate through each module and create a separate Worksheet tab
    for (const [moduleName, items] of Object.entries(data)) {
      if (!items || items.length === 0) continue;

      // Filter out raw system IDs for a clean Excel presentation
      const cleanedItems = items.map(item => {
        const copy = { ...item };
        delete copy.id;
        delete copy.user_id;
        delete copy.created_at;
        delete copy.updated_at;
        return copy;
      });

      // Convert our JSON array of objects directly into a worksheet
      const worksheet = XLSX.utils.json_to_sheet(cleanedItems);

      // Optional: Give columns professional auto-fitted widths
      const maxProps = Object.keys(cleanedItems[0]);
      worksheet["!cols"] = maxProps.map(key => ({
        wch: Math.max(...cleanedItems.map(obj => String(obj[key] ?? "").length).concat([key.length])) + 3
      }));

      // Append worksheet to workbook with uppercase module name as tab title
      const tabTitle = moduleName.toUpperCase().substring(0, 31); // Excel limits tabs to 31 chars
      XLSX.utils.book_append_sheet(workbook, worksheet, tabTitle);
    }

    // 3. Write Excel file out to a binary string buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    
    // 4. Wrap buffer in a Blob and download natively using file-saver
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(blob, "consolidado_salud.xlsx");
    return true;
  }
}

// JSON Exporter
class JsonExporter extends DataExporter {
  export(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    saveAs(blob, "consolidado_salud.json");
    return true;
  }
}

// YAML Exporter
class YamlExporter extends DataExporter {
  export(data) {
    const yamlString = dump(data, { indent: 2, skipInvalid: true });
    const blob = new Blob([yamlString], { type: "text/yaml;charset=utf-8" });
    saveAs(blob, "consolidado_salud.yaml");
    return true;
  }
}

// PDF Exporter
class PdfExporter extends DataExporter {
  export(data) {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    
    // Set matching branding typography safely inside lower-case context map
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.textColor = "#4a154b"; // Plum Accent Core Color
    doc.text("Consolidado Global Clínico", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.textColor = "#666666";
    doc.text(`Reporte emitido el: ${new Date().toLocaleString()}`, 14, 26);
    
    let currentY = 35;

    for (const [moduleName, items] of Object.entries(data)) {
      if (!items || items.length === 0) continue;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.textColor = "#4a154b";
      doc.text(moduleName.toUpperCase(), 14, currentY);
      
      const columns = Object.keys(items[0]).filter(k => 
        !["id", "user_id", "created_at", "updated_at"].includes(k)
      );
      
      const rows = items.map(item => columns.map(col => String(item[col] ?? "")));

      // Directly invoke autoTable plugin function with target document context instantiation
      autoTable(doc, {
        startY: currentY + 3,
        head: [columns.map(c => c.replace("_", " ").toUpperCase())],
        body: rows,
        styles: { fontSize: 8, font: "helvetica" },
        headStyles: { fillColor: [74, 21, 75] }, // Core branding Plum HEX translated to RGB arrays internally
        margin: { left: 14, right: 14 },
        theme: "striped"
      });

      currentY = doc.lastAutoTable.finalY + 12;
      
      // Page handling checks
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    }

    doc.save("consolidado_salud.pdf");
    return true;
  }
}

// The factory method creator
export class ExportServiceFactory {
  static createExporter(type) {
    switch (type.toLowerCase()) {
      case "json": return new JsonExporter();
      case "yaml": return new YamlExporter();
      case "excel": return new ExcelExporter();
      case "txt": return new TxtExporter();
      case "pdf": return new PdfExporter();
      default:
        throw new Error(`Format type '${type}' not supported by exporter system.`);
    }
  }
}
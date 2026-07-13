export class IRecordatorioStrategy {
  generarNotificacionPersistente() {
    throw new Error(`${this.constructor.name} debe implementar generarNotificacionPersistente()`);
  }

  obtenerIdentificador(recordatorio) {
    return recordatorio?.id;
  }

  obtenerFechaProgramada(recordatorio) {
    return recordatorio?.scheduled_for;
  }

  generarMensajeToast(recordatorio) {
    return recordatorio?.message || recordatorio?.title || "Tienes un recordatorio pendiente";
  }

  obtenerEstiloToast() {
    return { background: "#ffffff", color: "#4a1942", fontWeight: 700 };
  }

  obtenerTextoBoton() {
    return "Confirmar";
  }

  obtenerClaseBoton() {
    return "bg-plum-700 hover:bg-plum-800 text-white";
  }

  obtenerTituloHistorial(recordatorio) {
    return recordatorio?.title || "Recordatorio";
  }
}

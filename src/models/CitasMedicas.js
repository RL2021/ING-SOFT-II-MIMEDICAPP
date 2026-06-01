export default class CitaMedica {
  constructor({
    id = `cita-${Date.now()}`,
    usuario_id = null,
    doctor = "",
    especialidad = "",
    ubicacion = "",
    fecha_hora_cita = "",
    notas = "",
    tiene_recordatorio = true,
    asistida = false,
    fecha_creacion = new Date().toISOString(),
    fecha_actualizacion = new Date().toISOString(),
  } = {}) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.doctor = doctor;
    this.especialidad = especialidad;
    this.ubicacion = ubicacion;
    this.fecha_hora_cita = fecha_hora_cita;
    this.notas = notas;
    this.tiene_recordatorio = tiene_recordatorio;
    this.asistida = asistida;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
  }

  agendarCita() {
    this.fecha_creacion = this.fecha_creacion || new Date().toISOString();
    this.fecha_actualizacion = new Date().toISOString();
    return this;
  }

  editarCita(datosActualizados) {
    Object.assign(this, datosActualizados);
    this.fecha_actualizacion = new Date().toISOString();
    return this;
  }

  eliminarCita(citas) {
    return citas.filter((cita) => cita.id !== this.id);
  }

  marcarComoAsistida() {
    this.asistida = true;
    this.fecha_actualizacion = new Date().toISOString();
    return this;
  }

  reabrirCita() {
    this.asistida = false;
    this.fecha_actualizacion = new Date().toISOString();
    return this;
  }

  verDetalle() {
    return { ...this };
  }

  static listarCitas(citas) {
    return [...citas].sort((primeraCita, segundaCita) => {
      return new Date(primeraCita.fecha_hora_cita) - new Date(segundaCita.fecha_hora_cita);
    });
  }
}

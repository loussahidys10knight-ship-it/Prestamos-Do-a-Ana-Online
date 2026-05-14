
class PrestamoManager {
  constructor(usuarioManager) {
    this.usuarioManager = usuarioManager;
    this.iniciarActualizacionAutomatica();
  }

  crearPrestamo(datos) {
    const ahora = new Date();
    const vencimiento = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
    const cargoServicio = datos.monto * 0.10;
    const totalPagar = datos.monto + cargoServicio;

    const prestamo = {
      id: Date.now(),
      ...datos,
      estado: 'pendiente',
      fechaSolicitud: ahora,
      fechaVencimiento: vencimiento,
      cargoServicio,
      totalPagar,
      cuotaMensual: totalPagar / datos.plazo,
      diasRestantes: 7
    };

    const usuario = this.usuarioManager.obtenerUsuarioActual();
    if (!usuario) return null;

    usuario.prestamosPendientes.push(prestamo);
    this.usuarioManager.guardarUsuarioActual(usuario);
    return prestamo;
  }

  calcularTiempoRestante(fechaVencimiento) {
    const ahora = new Date();
    const vencimiento = new Date(fechaVencimiento);
    if (Number.isNaN(vencimiento.getTime())) {
      return { dias: 0, horas: 0, vencido: false, sinFecha: true };
    }

    const diferencia = vencimiento - ahora;
    if (diferencia <= 0) return { dias: 0, horas: 0, vencido: true };

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { dias, horas, vencido: false };
  }

  async obtenerPrestamosPendientes() {
    const datos = await apiRequest('/prestamos/mis-prestamos');
    return datos.prestamos.filter(p => ['pendiente', 'aprobado'].includes(p.estado)).map(p => ({
      ...p,
      tiempoRestante: this.calcularTiempoRestante(p.fechaVencimiento)
    }));
  }

  async obtenerHistorial() {
    const datos = await apiRequest('/prestamos/mis-prestamos');
    return datos.prestamos.filter(p => p.estado !== 'pendiente');
  }

  async marcarComoPagado(prestamoId) {
    throw new Error('Primero registra los datos del pago.');
  }

  async registrarPago(prestamoId, datosPago) {
    await apiRequest(`/prestamos/${prestamoId}/pago`, {
      method: 'POST',
      body: JSON.stringify(datosPago)
    });
    return true;
  }

  async cancelarPrestamo(prestamoId) {
    await apiRequest(`/prestamos/${prestamoId}`, { method: 'DELETE' });
    return true;
  }

  actualizarTiemposRestantes() {
    // Los prestamos ahora vienen del backend. Esta funcion queda como no-op
    // para evitar errores al refrescar paginas con sesiones cargadas por cookie.
  }

  iniciarActualizacionAutomatica() {
    setInterval(() => this.actualizarTiemposRestantes(), 60000);
  }
}

const prestamoManager = new PrestamoManager(usuarioManager);
console.log('✓ loan-manager.js cargado');

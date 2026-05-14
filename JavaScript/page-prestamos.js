document.addEventListener('DOMContentLoaded', function() {
  const formPrestamo = document.getElementById('formPrestamo');
  const TASA_SERVICIO = 0.10;

  function formatoMoneda(valor) {
    return Number(valor || 0).toLocaleString('es-DO', {
      style: 'currency',
      currency: 'DOP'
    });
  }

  function actualizarResumenCuotas() {
    const monto = Number(document.getElementById('monto')?.value || 0);
    const plazo = Number(document.getElementById('plazo')?.value || 0);
    const cargo = monto > 0 ? monto * TASA_SERVICIO : 0;
    const total = monto + cargo;
    const cuota = monto > 0 && plazo > 0 ? total / plazo : 0;

    const resumenCargo = document.getElementById('resumenCargo');
    const resumenTotal = document.getElementById('resumenTotal');
    const resumenCuota = document.getElementById('resumenCuota');

    if (resumenCargo) resumenCargo.textContent = `${TASA_SERVICIO * 100}% (${formatoMoneda(cargo)})`;
    if (resumenTotal) resumenTotal.textContent = formatoMoneda(total);
    if (resumenCuota) resumenCuota.textContent = formatoMoneda(cuota);
  }

  usuarioManager.cargarSesion().then((usuario) => {
    if (!usuario) {
      alert('Debes iniciar sesion para solicitar un prestamo.');
      window.location.href = 'page2.html';
    }
  });

  if (formPrestamo) {
    formPrestamo.addEventListener('submit', async function(e) {
      e.preventDefault();

      const usuario = await usuarioManager.cargarSesion();
      if (!usuario) {
        alert('Debes iniciar sesion primero');
        window.location.href = 'page2.html';
        return;
      }

      const ocupacion = document.getElementById('ocupacion');
      const ingresos = document.getElementById('ingresos');
      const monto = document.getElementById('monto');
      const plazo = document.getElementById('plazo');
      const tipo = document.getElementById('tipo');
      const banco = document.getElementById('banco');
      const cuenta = document.getElementById('cuenta');

      if (!validarCampo(ocupacion, 'soloLetras')) return;
      if (!validarCampo(ingresos, 'monto')) return;
      if (!validarCampo(monto, 'monto')) return;
      if (!validarCampo(plazo, 'soloNumeros')) return;
      if (!validarCampo(banco, 'soloLetras')) return;
      if (!validarCampo(cuenta, 'numeroCuenta')) return;

      if (!tipo.value) {
        mostrarError(obtenerErrorElement(tipo), 'Selecciona un tipo de prestamo.');
        tipo.classList.add('input-error');
        return;
      }
      limpiarError(obtenerErrorElement(tipo));
      tipo.classList.remove('input-error');

      try {
        const datos = await apiRequest('/prestamos', {
          method: 'POST',
          body: JSON.stringify({
            ocupacion: ocupacion.value,
            ingresos: parseFloat(ingresos.value),
            monto: parseFloat(monto.value),
            plazo: parseInt(plazo.value),
            tipo: tipo.value,
            banco: banco.value,
            cuenta: cuenta.value
          })
        });

        alert(`Prestamo solicitado. Numero: #${datos.prestamo.id}\nCuota mensual: ${formatoMoneda(datos.prestamo.cuotaMensual)}\nTotal a pagar: ${formatoMoneda(datos.prestamo.totalPagar)}`);
        formPrestamo.reset();
        actualizarResumenCuotas();
        setTimeout(() => location.href = '../../index.html', 1500);
      } catch (error) {
        alert(error.message);
      }
    });

    ['monto', 'plazo'].forEach((id) => {
      const campo = document.getElementById(id);
      if (campo) campo.addEventListener('input', actualizarResumenCuotas);
    });
    actualizarResumenCuotas();
  }
});

console.log('page-prestamo.js cargado');

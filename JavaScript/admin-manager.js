const adminState = {
  prestamos: [],
cuentas: []
};

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2
  }).format(valor);
}

function obtenerClaseEstado(estado) {
  return `admin-estado admin-estado-${estado}`;
}

async function cargarAdmin() {
  try {
    const [prestamos, usuarios] = await Promise.all([
      apiRequest('/admin/prestamos'),
      apiRequest('/admin/usuarios')
    ]);

    adminState.prestamos = prestamos.prestamos;
    adminState.cuentas = usuarios.usuarios;
    renderAdmin();
  } catch (error) {
    alert(error.message);
    window.location.href = 'page2.html';
  }
}

function renderPrestamos() {
  const tabla = document.getElementById('tablaPrestamosPendientes');
  const prestamosPendientes = adminState.prestamos.filter(prestamo => prestamo.estado === 'pendiente');

  if (prestamosPendientes.length === 0) {
    tabla.innerHTML = '<tr><td colspan="7" class="admin-vacio">No hay prestamos pendientes para mostrar.</td></tr>';
    return;
  }

  tabla.innerHTML = prestamosPendientes.map(prestamo => `
    <tr>
      <td>#${prestamo.id}</td>
      <td>${prestamo.cliente}</td>
      <td>${formatoMoneda(prestamo.monto)}</td>
      <td>${prestamo.plazo} meses</td>
      <td>${prestamo.tipo}</td>
      <td><span class="${obtenerClaseEstado(prestamo.estado)}">${prestamo.estado}</span></td>
      <td>
        <div class="admin-acciones">
          <button type="button" class="btn-admin btn-admin-aprobar" onclick="aprobarPrestamo(${prestamo.id})">Aprobar</button>
          <button type="button" class="btn-admin btn-admin-reprobar" onclick="reprobarPrestamo(${prestamo.id})">Reprobar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderPrestamosRevisados() {
  const tabla = document.getElementById('tablaPrestamosRevisados');
  if (!tabla) return;

  const prestamosRevisados = adminState.prestamos.filter(prestamo => (
    ['aprobado', 'reprobado', 'pagado', 'vencido'].includes(prestamo.estado)
  ));

  if (prestamosRevisados.length === 0) {
    tabla.innerHTML = '<tr><td colspan="7" class="admin-vacio">No hay prestamos aprobados o reprobados para mostrar.</td></tr>';
    return;
  }

  tabla.innerHTML = prestamosRevisados.map(prestamo => `
    <tr>
      <td>#${prestamo.id}</td>
      <td>${prestamo.cliente}</td>
      <td>${formatoMoneda(prestamo.monto)}</td>
      <td>${prestamo.plazo} meses</td>
      <td>${prestamo.tipo}</td>
      <td><span class="${obtenerClaseEstado(prestamo.estado)}">${prestamo.estado}</span></td>
      <td>${new Date(prestamo.fechaSolicitud).toLocaleDateString('es-ES')}</td>
    </tr>
  `).join('');
}

function renderCuentas() {
  const tabla = document.getElementById('tablaCuentasRegistradas');

  if (adminState.cuentas.length === 0) {
    tabla.innerHTML = '<tr><td colspan="6" class="admin-vacio">No hay cuentas registradas para mostrar.</td></tr>';
    return;
  }

  tabla.innerHTML = adminState.cuentas.map(cuenta => `
    <tr>
      <td>#${cuenta.id}</td>
      <td>${cuenta.nombre}</td>
      <td>${cuenta.email}</td>
      <td>${cuenta.telefono}</td>
      <td><span class="${obtenerClaseEstado(cuenta.estado)}">${cuenta.estado}</span></td>
      <td>
        <div class="admin-acciones">
          <button type="button" class="btn-admin btn-admin-bloquear" onclick="alternarBloqueoCuenta(${cuenta.id})">
            ${cuenta.estado === 'bloqueada' ? 'Desbloquear' : 'Bloquear'}
          </button>
          <button type="button" class="btn-admin btn-admin-eliminar" onclick="eliminarCuenta(${cuenta.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderResumen() {
  const totalPendientes = adminState.prestamos.filter(prestamo => prestamo.estado === 'pendiente').length;
  document.getElementById('totalPendientes').textContent = totalPendientes;
  const badgePendientesPanel = document.getElementById('badgePendientesPanel');
  if (badgePendientesPanel) {
    badgePendientesPanel.textContent = totalPendientes;
    badgePendientesPanel.style.display = totalPendientes > 0 ? 'inline-flex' : 'none';
  }
  document.getElementById('totalAprobados').textContent = adminState.prestamos.filter(prestamo => prestamo.estado === 'aprobado').length;
  document.getElementById('totalReprobados').textContent = adminState.prestamos.filter(prestamo => prestamo.estado === 'reprobado').length;
  document.getElementById('totalCuentas').textContent = adminState.cuentas.length;
}

function renderAdmin() {
  renderResumen();
  renderPrestamos();
  renderPrestamosRevisados();
  renderCuentas();
}

async function actualizarEstadoPrestamo(idPrestamo, estado) {
  await apiRequest(`/admin/prestamos/${idPrestamo}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado })
  });
  await cargarAdmin();
}

function aprobarPrestamo(idPrestamo) {
  if (confirm('Aprobar este prestamo?')) {
    actualizarEstadoPrestamo(idPrestamo, 'aprobado').catch(error => alert(error.message));
  }
}

function reprobarPrestamo(idPrestamo) {
  if (confirm('Reprobar este prestamo?')) {
    actualizarEstadoPrestamo(idPrestamo, 'reprobado').catch(error => alert(error.message));
  }
}

async function alternarBloqueoCuenta(idCuenta) {
  const cuenta = adminState.cuentas.find(item => item.id === idCuenta);
  if (!cuenta) return;

  const estado = cuenta.estado === 'bloqueada' ? 'activa' : 'bloqueada';
  try {
    await apiRequest(`/admin/usuarios/${idCuenta}/bloqueo`, {
      method: 'PATCH',
      body: JSON.stringify({ estado })
    });
    await cargarAdmin();
  } catch (error) {
    alert(error.message);
  }
}

async function eliminarCuenta(idCuenta) {
  if (!confirm('Eliminar esta cuenta? Esta accion no se puede deshacer.')) return;

  try {
    await apiRequest(`/admin/usuarios/${idCuenta}`, { method: 'DELETE' });
    await cargarAdmin();
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', cargarAdmin);

console.log('admin-manager.js cargado');

function abrirPanelAjustes() {
  const usuario = usuarioManager.obtenerUsuarioActual();
  if (!usuario) {
    alert('Debes iniciar sesión');
    return;
  }

  const html = ModalRenderer.renderAjustes(usuario);
  document.body.insertAdjacentHTML('beforeend', html);
  inicializarValidacionesEnTiempoReal();

  document.getElementById('inputFoto').addEventListener('change', async (e) => {
    const exito = await usuarioManager.subirFotoPerfil(e.target.files[0]);
    if (exito) {
      const fotoPerfil = usuarioManager.obtenerUsuarioActual().fotoPerfil;
      document.getElementById('imgPerfil').src = fotoPerfil;
      document.querySelectorAll('.avatar-pequeño').forEach((avatar) => {
        avatar.src = fotoPerfil;
      });
      alert('Foto actualizada');
    } else {
      alert(usuarioManager.ultimoErrorFoto || 'Error: no se pudo subir la foto.');
    }
  });

  document.getElementById('formAjustes').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('ajNombre');
    const email = document.getElementById('ajEmail');
    const telefono = document.getElementById('ajTelefono');
    const ocupacion = document.getElementById('ajOcupacion');

    if (!validarCampo(nombre, 'soloLetras') || !validarCampo(email, 'email')) return;

    try {
      if (await usuarioManager.actualizarPerfil({
        nombre: nombre.value,
        email: email.value,
        telefono: telefono.value,
        ocupacion: ocupacion.value
      })) {
        alert('Perfil actualizado');
        cerrarModal('modalAjustes');
        actualizarUIAutenticacion();
      }
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById('formCambiarContraseña').addEventListener('submit', (e) => {
    e.preventDefault();
    const nueva = document.getElementById('contraseñaNueva');
    const confirmar = document.getElementById('confirmarContraseña');

    if (!validarCampo(nueva, 'contraseña')) return;
    if (nueva.value !== confirmar.value) {
      alert('Las contraseñas no coinciden');
      return;
    }

    alert('Contraseña cambiada');
    document.getElementById('formCambiarContraseña').reset();
  });
}

async function abrirPrestamosPendientes() {
  try {
    const prestamos = await prestamoManager.obtenerPrestamosPendientes();
    const html = ModalRenderer.renderPendientes(prestamos);
    document.body.insertAdjacentHTML('beforeend', html);
  } catch (error) {
    alert(error.message);
  }
}

async function abrirHistorial() {
  try {
    const prestamos = await prestamoManager.obtenerHistorial();
    const html = ModalRenderer.renderHistorial(prestamos);
    document.body.insertAdjacentHTML('beforeend', html);
  } catch (error) {
    alert(error.message);
  }
}

async function abrirPanelPago(idPrestamo) {
  try {
    const prestamos = await prestamoManager.obtenerPrestamosPendientes();
    const prestamo = prestamos.find(item => item.id === idPrestamo);

    if (!prestamo || prestamo.estado !== 'aprobado') {
      alert('Solo puedes pagar préstamos aprobados.');
      return;
    }

    const html = ModalRenderer.renderPagoPrestamo(prestamo);
    document.body.insertAdjacentHTML('beforeend', html);
    inicializarValidacionesEnTiempoReal();

    document.getElementById('formPagoPrestamo').addEventListener('submit', async (e) => {
      e.preventDefault();

      const monto = document.getElementById('pagoMonto');
      const metodo = document.getElementById('pagoMetodo');
      const referencia = document.getElementById('pagoReferencia');

      if (!validarCampo(monto, 'monto')) return;
      if (!metodo.value) {
        mostrarError(obtenerErrorElement(metodo), 'Selecciona un método de pago.');
        metodo.classList.add('input-error');
        return;
      }
      if (!referencia.value.trim()) {
        mostrarError(obtenerErrorElement(referencia), 'Ingresa la referencia del pago.');
        referencia.classList.add('input-error');
        return;
      }

      await prestamoManager.registrarPago(idPrestamo, {
        montoPagado: parseFloat(monto.value),
        metodoPago: metodo.value,
        referencia: referencia.value.trim()
      });

      alert('Pago registrado. Préstamo marcado como pagado.');
      cerrarModal('modalPagoPrestamo');
      cerrarModal('modalPendientes');
      abrirPrestamosPendientes();
    });
  } catch (error) {
    alert(error.message);
  }
}

function cerrarModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.remove();
}

async function marcarComoPagado(id) {
  abrirPanelPago(id);
}

async function cancelarPrestamo(id) {
  if (!confirm('¿Cancelar esta solicitud de préstamo?')) return;

  try {
    await prestamoManager.cancelarPrestamo(id);
    alert('Préstamo cancelado correctamente.');
    cerrarModal('modalPendientes');
    abrirPrestamosPendientes();
  } catch (error) {
    alert(error.message);
  }
}

async function actualizarUIAutenticacion() {
  await usuarioManager.cargarSesion();
  const botonLogin = document.getElementById('btnLogin');
  const botonPrestamo = document.getElementById('btnPrestamo');
  const botonPrestamoPrincipal = document.getElementById('btnPrestamoPrincipal');
  const botonPanelAdmin = document.getElementById('btnPanelAdmin');

  function limpiarContadorAdmin() {
    if (!botonPanelAdmin) return;
    botonPanelAdmin.classList.remove('nav-con-badge');
    botonPanelAdmin.removeAttribute('data-count');
  }

  async function actualizarContadorAdmin() {
    if (!botonPanelAdmin) return;

    try {
      const datos = await apiRequest('/admin/prestamos');
      const totalPendientes = (datos.prestamos || []).filter(prestamo => prestamo.estado === 'pendiente').length;

      if (totalPendientes > 0) {
        botonPanelAdmin.classList.add('nav-con-badge');
        botonPanelAdmin.setAttribute('data-count', String(totalPendientes));
      } else {
        limpiarContadorAdmin();
      }
    } catch (error) {
      limpiarContadorAdmin();
    }
  }
  
  if (usuarioManager.estaAutenticado()) {
    const usuario = usuarioManager.obtenerUsuarioActual();
    if (botonLogin) {
      // Cambiar el contenido por el menú del usuario
      botonLogin.innerHTML = ModalRenderer.renderMenuUsuario(usuario);
      botonLogin.classList.add('autenticado');
      botonLogin.href = '#'; // Eliminar el href
      
      // Mostrar botón de préstamo
      const esAdmin = usuario.rol === 'admin';

      if (botonPrestamo) {
        botonPrestamo.style.display = esAdmin ? 'none' : 'inline-block';
      }

      if (botonPrestamoPrincipal) {
        if (esAdmin) {
          botonPrestamoPrincipal.textContent = 'Panel admin';
          botonPrestamoPrincipal.href = 'html/admin.html';
        } else {
          botonPrestamoPrincipal.textContent = 'Solicitar préstamo';
          botonPrestamoPrincipal.href = 'html/page4.html';
        }

        botonPrestamoPrincipal.classList.remove('prestamo-bloqueado');
        botonPrestamoPrincipal.removeAttribute('aria-disabled');
      }

      if (botonPanelAdmin) {
        botonPanelAdmin.style.display = esAdmin ? 'inline-block' : 'none';
        if (esAdmin) {
          actualizarContadorAdmin();
        } else {
          limpiarContadorAdmin();
        }
      }
      
      // Agregar evento al menú del usuario para abrirlo/cerrarlo
      setTimeout(() => {
        const usuarioMenu = document.getElementById('usuarioMenu');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (usuarioMenu && dropdownMenu) {
          usuarioMenu.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle del menú
            usuarioMenu.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
          });

          // Cerrar menú al hacer clic fuera
          document.addEventListener('click', function(e) {
            if (!usuarioMenu.contains(e.target) && !dropdownMenu.contains(e.target)) {
              usuarioMenu.classList.remove('active');
              dropdownMenu.classList.remove('active');
            }
          });

          // Cerrar menú al hacer clic en un enlace
          const links = dropdownMenu.querySelectorAll('a');
          links.forEach(link => {
            link.addEventListener('click', function() {
              usuarioMenu.classList.remove('active');
              dropdownMenu.classList.remove('active');
            });
          });
        }
      }, 100);
    }
  } else {
    // Si NO está autenticado, mostrar el botón "Inicia sesión" normal
    if (botonLogin) {
      botonLogin.innerHTML = 'Inicia sesión';
      botonLogin.href = 'html/page2.html';
      botonLogin.classList.remove('autenticado');
    }
    
    // Ocultar botón de préstamo
    if (botonPrestamo) {
      botonPrestamo.style.display = 'none';
    }

    if (botonPrestamoPrincipal) {
      botonPrestamoPrincipal.textContent = 'Inicia sesión para solicitar';
      botonPrestamoPrincipal.href = 'html/page2.html';
      botonPrestamoPrincipal.classList.add('prestamo-bloqueado');
      botonPrestamoPrincipal.setAttribute('aria-disabled', 'true');
    }

    if (botonPanelAdmin) {
      botonPanelAdmin.style.display = 'none';
      limpiarContadorAdmin();
    }
  }
}

async function cerrarSesion() {
  if (confirm('¿Cerrar sesión?')) {
    try {
      await apiRequest('/usuarios/logout', { method: 'POST' });
      usuarioManager.logout();
      location.reload();
    } catch (error) {
      alert(error.message);
    }
  }
}

function inicializarFormularioContacto() {
  const formContacto = document.getElementById('formContacto');
  if (!formContacto) return;

  formContacto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('contactoNombre');
    const email = document.getElementById('contactoEmail');
    const mensaje = document.getElementById('contactoMensaje');
    const boton = formContacto.querySelector('button[type="submit"]');
    const textoOriginal = boton ? boton.textContent : '';

    if (!nombre.value.trim() || !email.value.trim() || !mensaje.value.trim()) {
      alert('Completa nombre, correo y mensaje.');
      return;
    }

    if (!validaciones.email(email.value)) {
      alert('Ingresa un correo valido.');
      return;
    }

    try {
      if (boton) {
        boton.disabled = true;
        boton.textContent = 'Enviando...';
      }

      await apiRequest('/contacto', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.value.trim(),
          email: email.value.trim(),
          mensaje: mensaje.value.trim()
        })
      });

      alert('Mensaje enviado correctamente.');
      formContacto.reset();
    } catch (error) {
      alert(error.message);
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.textContent = textoOriginal;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', inicializarFormularioContacto);
document.addEventListener('DOMContentLoaded', actualizarUIAutenticacion);
console.log(' events.js cargado');

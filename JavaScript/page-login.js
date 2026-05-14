document.addEventListener('DOMContentLoaded', function() {
  const formLogin = document.getElementById('formLogin');
  const formRecuperacion = document.getElementById('formRecuperacion');
  const abrirRecuperacion = document.getElementById('abrirRecuperacion');
  const cancelarRecuperacion = document.getElementById('cancelarRecuperacion');
  const grupoCodigoRecuperacion = document.getElementById('grupoCodigoRecuperacion');
  const emailRecuperacion = document.getElementById('recuperacion-email');
  const codigoRecuperacion = document.getElementById('recuperacion-codigo');
  const passwordRecuperacion = document.getElementById('recuperacion-password');
  const confirmPasswordRecuperacion = document.getElementById('recuperacion-confirm-password');
  const btnRecuperacion = document.getElementById('btnRecuperacion');
  const mensajeRecuperacion = document.getElementById('mensajeRecuperacion');
  let codigoRecuperacionEnviado = false;
  let emailRecuperacionConfirmado = '';

  function mostrarMensajeRecuperacion(texto) {
    if (!mensajeRecuperacion) return;
    mensajeRecuperacion.textContent = texto || '';
    mensajeRecuperacion.classList.toggle('visible', Boolean(texto));
  }

  function mostrarRecuperacion(mostrar) {
    if (!formRecuperacion) return;
    formRecuperacion.style.display = mostrar ? 'flex' : 'none';
    codigoRecuperacionEnviado = false;
    emailRecuperacionConfirmado = '';
    if (grupoCodigoRecuperacion) grupoCodigoRecuperacion.style.display = 'none';
    if (btnRecuperacion) btnRecuperacion.textContent = 'Enviar codigo';
    if (emailRecuperacion) {
      emailRecuperacion.disabled = false;
      emailRecuperacion.value = '';
    }
    if (codigoRecuperacion) codigoRecuperacion.value = '';
    if (passwordRecuperacion) passwordRecuperacion.value = '';
    if (confirmPasswordRecuperacion) confirmPasswordRecuperacion.value = '';
    mostrarMensajeRecuperacion('');
    if (mostrar) emailRecuperacion?.focus();
  }

  function validarRequerido(elemento, tipo) {
    if (!elemento.value.trim()) {
      mostrarError(obtenerErrorElement(elemento), 'Este campo es requerido.');
      elemento.classList.add('input-error');
      return false;
    }

    return validarCampo(elemento, tipo);
  }

  if (formLogin) {
    formLogin.addEventListener('submit', async function(e) {
      e.preventDefault();

      const email = document.getElementById('login-email');
      const password = document.getElementById('login-password');

      if (!validarCampo(email, 'email')) return;
      if (!validarCampo(password)) return;

      try {
        const datos = await apiRequest('/usuarios/login', {
          method: 'POST',
          body: JSON.stringify({
            email: email.value.trim().toLowerCase(),
            password: password.value
          })
        });

        usuarioManager.guardarUsuarioActual(datos.usuario);
        if (typeof notificarInicioSesion === 'function') {
          notificarInicioSesion(datos.usuario);
        }
        alert('Sesion iniciada');
        window.location.href = datos.usuario.rol === 'admin' ? 'admin.html' : '../Index.html';
      } catch (error) {
        alert(error.message);
      }
    });
  }

  abrirRecuperacion?.addEventListener('click', function(e) {
    e.preventDefault();
    mostrarRecuperacion(true);
  });

  cancelarRecuperacion?.addEventListener('click', function() {
    mostrarRecuperacion(false);
  });

  formRecuperacion?.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!codigoRecuperacionEnviado) {
      if (!validarRequerido(emailRecuperacion, 'email')) return;

      btnRecuperacion.disabled = true;
      try {
        const datos = await apiRequest('/usuarios/enviar-codigo-recuperacion', {
          method: 'POST',
          body: JSON.stringify({
            email: emailRecuperacion.value.trim().toLowerCase()
          })
        });

        emailRecuperacionConfirmado = emailRecuperacion.value.trim().toLowerCase();
        codigoRecuperacionEnviado = true;
        emailRecuperacion.disabled = true;
        grupoCodigoRecuperacion.style.display = 'block';
        btnRecuperacion.textContent = 'Cambiar contrasena';
        mostrarMensajeRecuperacion(datos.codigoDev
          ? `${datos.mensaje} Codigo: ${datos.codigoDev}`
          : (datos.mensaje || 'Revisa tu correo para continuar.'));
        codigoRecuperacion.focus();
      } catch (error) {
        alert(error.message);
      } finally {
        btnRecuperacion.disabled = false;
      }
      return;
    }

    if (!validarRequerido(codigoRecuperacion, 'soloNumeros')) return;
    if (codigoRecuperacion.value.trim().length !== 6) {
      mostrarError(obtenerErrorElement(codigoRecuperacion), 'El codigo debe tener 6 digitos.');
      codigoRecuperacion.classList.add('input-error');
      return;
    }
    if (!validarRequerido(passwordRecuperacion, 'contraseña')) return;
    if (!validarRequerido(confirmPasswordRecuperacion)) return;

    if (passwordRecuperacion.value !== confirmPasswordRecuperacion.value) {
      mostrarError(obtenerErrorElement(confirmPasswordRecuperacion), 'Las contrasenas no coinciden.');
      confirmPasswordRecuperacion.classList.add('input-error');
      return;
    }

    btnRecuperacion.disabled = true;
    try {
      const datos = await apiRequest('/usuarios/restablecer-password', {
        method: 'POST',
        body: JSON.stringify({
          email: emailRecuperacionConfirmado,
          codigo: codigoRecuperacion.value.trim(),
          password: passwordRecuperacion.value
        })
      });

      alert(datos.mensaje || 'Contrasena actualizada correctamente.');
      mostrarRecuperacion(false);
    } catch (error) {
      alert(error.message);
    } finally {
      btnRecuperacion.disabled = false;
    }
  });
});

console.log('page-login.js cargado');

document.addEventListener('DOMContentLoaded', function() {
  const formRegistro = document.getElementById('formRegistro');
  if (!formRegistro) return;

  const nombre = document.getElementById('nombre');
  const correo = document.getElementById('correo');
  const telefono = document.getElementById('telefono');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');
  const terminos = document.getElementById('terminos');
  const grupoCodigo = document.getElementById('grupoCodigoRegistro');
  const codigoRegistro = document.getElementById('codigoRegistro');
  const btnRegistro = document.getElementById('btnRegistro');
  const btnReenviarCodigo = document.getElementById('btnReenviarCodigo');
  const btnCorregirCorreo = document.getElementById('btnCorregirCorreo');
  const mensaje = document.getElementById('mensaje');

  let codigoEnviado = false;
  let emailVerificacion = '';

  function validarDatosCuenta() {
    if (!validarCampo(nombre, 'soloLetras')) return false;
    if (!validarCampo(correo, 'email')) return false;
    if (!validarCampo(telefono, 'telefono')) return false;
    if (!validarCampo(password, 'contrasena')) return false;
    if (!validarCampo(confirmPassword)) return false;

    if (password.value !== confirmPassword.value) {
      mostrarError(obtenerErrorElement(confirmPassword), 'Las contrasenas no coinciden.');
      confirmPassword.classList.add('input-error');
      return false;
    }

    return validarCampo(terminos);
  }

  function bloquearDatosCuenta(bloquear) {
    [nombre, correo, telefono, password, confirmPassword, terminos].forEach(campo => {
      campo.disabled = bloquear;
    });
  }

  function mostrarPasoCodigo(email) {
    codigoEnviado = true;
    emailVerificacion = email;
    grupoCodigo.style.display = 'block';
    codigoRegistro.required = true;
    btnRegistro.textContent = 'Crear cuenta';
    bloquearDatosCuenta(true);
    codigoRegistro.focus();
  }

  function volverAEditarCorreo() {
    codigoEnviado = false;
    emailVerificacion = '';
    grupoCodigo.style.display = 'none';
    codigoRegistro.required = false;
    codigoRegistro.value = '';
    btnRegistro.textContent = 'Enviar codigo';
    bloquearDatosCuenta(false);
    correo.focus();
  }

  async function enviarCodigo() {
    if (!validarDatosCuenta()) return;

    const emailNormalizado = correo.value.trim().toLowerCase();
    mensaje.textContent = '';
    btnRegistro.disabled = true;

    try {
      const datos = await apiRequest('/usuarios/enviar-codigo-registro', {
        method: 'POST',
        body: JSON.stringify({ email: emailNormalizado })
      });

      mensaje.textContent = datos.codigoDev
        ? `${datos.mensaje} Codigo: ${datos.codigoDev}`
        : (datos.mensaje || 'Codigo enviado. Revisa tu correo.');
      mostrarPasoCodigo(emailNormalizado);
    } catch (error) {
      alert(error.message);
    } finally {
      btnRegistro.disabled = false;
    }
  }

  async function crearCuenta() {
    if (!validarCampo(codigoRegistro, 'soloNumeros')) return;

    if (codigoRegistro.value.trim().length !== 6) {
      mostrarError(obtenerErrorElement(codigoRegistro), 'El codigo debe tener 6 digitos.');
      codigoRegistro.classList.add('input-error');
      return;
    }

    btnRegistro.disabled = true;

    try {
      const datos = await apiRequest('/usuarios/registro', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.value.trim(),
          email: emailVerificacion,
          telefono: telefono.value.trim(),
          password: password.value,
          codigo: codigoRegistro.value.trim()
        })
      });

      usuarioManager.guardarUsuarioActual(datos.usuario);
      if (typeof notificarRegistroUsuario === 'function') {
        notificarRegistroUsuario(datos.usuario);
      }

      alert('Cuenta creada');
      setTimeout(() => location.href = '../Index.html', 500);
    } catch (error) {
      alert(error.message);
    } finally {
      btnRegistro.disabled = false;
    }
  }

  formRegistro.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!codigoEnviado) {
      await enviarCodigo();
      return;
    }

    await crearCuenta();
  });

  btnReenviarCodigo.addEventListener('click', enviarCodigo);
  btnCorregirCorreo.addEventListener('click', volverAEditarCorreo);
});

console.log('page-registro.js cargado');

async function enviarNotificacionCorreo(ruta, datos) {
  try {
    if (typeof apiRequest === 'function') {
      await apiRequest(ruta.replace('/api', ''), {
        method: 'POST',
        body: JSON.stringify(datos)
      });
      return true;
    }

    const respuesta = await fetch(ruta, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    return respuesta.ok;
  } catch (error) {
    console.warn('No se pudo enviar la notificacion por correo:', error.message);
    return false;
  }
}

function notificarInicioSesion(usuario) {
  return enviarNotificacionCorreo('/api/notificaciones/login', usuario);
}

function notificarRegistroUsuario(usuario) {
  return enviarNotificacionCorreo('/api/notificaciones/registro', usuario);
}

console.log('email-notifications.js cargado');

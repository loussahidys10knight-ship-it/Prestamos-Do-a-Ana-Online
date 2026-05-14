const API_BASE_URL = window.API_BASE_URL ||
  (/^55\d\d$/.test(window.location.port)
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : (window.location.origin.startsWith('http') ? `${window.location.origin}/api` : 'http://localhost:3000/api'));

async function apiRequest(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(opciones.headers || {})
    },
    ...opciones
  });

  const contenido = await respuesta.text();
  const tipoContenido = respuesta.headers.get('content-type') || '';
  let datos = null;

  if (contenido) {
    if (!tipoContenido.includes('application/json')) {
      throw new Error('El servidor devolvio una pagina HTML en vez de JSON. Verifica que el backend este encendido y que la URL de la API sea correcta.');
    }

    try {
      datos = JSON.parse(contenido);
    } catch (error) {
      throw new Error('La respuesta del servidor no tiene formato JSON valido.');
    }
  }

  if (!respuesta.ok) {
    throw new Error(datos?.mensaje || datos?.error || 'No se pudo completar la solicitud.');
  }

  return datos;
}

const FOTO_PERFIL_PREDETERMINADA = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231941c1"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';
const MAX_FOTO_DIMENSION = 900;
const CALIDAD_FOTO_PERFIL = 0.82;

function comprimirImagenPerfil(archivo) {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    const urlTemporal = URL.createObjectURL(archivo);

    imagen.onload = () => {
      URL.revokeObjectURL(urlTemporal);

      const escala = Math.min(1, MAX_FOTO_DIMENSION / Math.max(imagen.width, imagen.height));
      const ancho = Math.max(1, Math.round(imagen.width * escala));
      const alto = Math.max(1, Math.round(imagen.height * escala));
      const canvas = document.createElement('canvas');
      const contexto = canvas.getContext('2d');

      canvas.width = ancho;
      canvas.height = alto;
      contexto.fillStyle = '#ffffff';
      contexto.fillRect(0, 0, ancho, alto);
      contexto.drawImage(imagen, 0, 0, ancho, alto);

      resolve(canvas.toDataURL('image/jpeg', CALIDAD_FOTO_PERFIL));
    };

    imagen.onerror = () => {
      URL.revokeObjectURL(urlTemporal);
      reject(new Error('No se pudo leer la imagen.'));
    };

    imagen.src = urlTemporal;
  });
}

function leerArchivoComoDataUrl(archivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(archivo);
  });
}

class UsuarioManager {
  constructor() {
    this.usuarioActual = null;
    this.sesionCargada = false;
    this.ultimoErrorFoto = '';
  }

  guardarUsuarioActual(usuario) {
    this.usuarioActual = usuario ? {
      ...usuario,
      fotoPerfil: usuario.fotoPerfil || FOTO_PERFIL_PREDETERMINADA
    } : null;
  }

  login(email, nombre = 'Usuario') {
    const usuario = {
      id: Date.now(),
      nombre: nombre,
      email: email,
      telefono: '',
      ocupacion: '',
      fotoPerfil: FOTO_PERFIL_PREDETERMINADA,
      fechaRegistro: new Date(),
      prestamos: [],
      prestamosPendientes: []
    };
    
    this.guardarUsuarioActual(usuario);
    return usuario;
  }

  logout() {
    this.usuarioActual = null;
    this.sesionCargada = false;
  }

  async cargarSesion() {
    try {
      const datos = await apiRequest('/usuarios/sesion');
      if (datos.cuentaBloqueada || datos.cuentaEliminada) {
        this.usuarioActual = null;
        alert(datos.mensaje || 'Tu cuenta ya no esta disponible.');
        this.sesionCargada = true;
        return this.usuarioActual;
      }

      this.guardarUsuarioActual(datos.usuario);
    } catch (error) {
      this.usuarioActual = null;
    }

    this.sesionCargada = true;
    return this.usuarioActual;
  }

  estaAutenticado() {
    return this.usuarioActual !== null;
  }

  obtenerUsuarioActual() {
    return this.usuarioActual;
  }

  async actualizarPerfil(datos) {
    if (!this.usuarioActual) return false;
    const respuesta = await apiRequest('/usuarios/perfil', {
      method: 'PATCH',
      body: JSON.stringify(datos)
    });
    this.guardarUsuarioActual({
      ...respuesta.usuario,
      ultimaActualizacion: new Date()
    });
    return true;
  }

  async subirFotoPerfil(archivo) {
    this.ultimoErrorFoto = '';
    if (!archivo) return false;
    const extensiones = ['jpg', 'jpeg', 'jfif', 'pjpeg', 'png', 'gif', 'webp', 'bmp'];
    const ext = (archivo.name.split('.').pop() || '').toLowerCase();
    const extensionValida = extensiones.includes(ext);
    const tipoValido = !archivo.type || archivo.type.toLowerCase().startsWith('image/');

    if (!extensionValida && !tipoValido) {
      this.ultimoErrorFoto = 'El archivo seleccionado no parece ser una imagen.';
      return false;
    }

    try {
      let fotoPerfil;

      try {
        fotoPerfil = await comprimirImagenPerfil(archivo);
      } catch (error) {
        fotoPerfil = await leerArchivoComoDataUrl(archivo);
      }

      await this.actualizarPerfil({ fotoPerfil });
      return true;
    } catch (error) {
      console.error(error);
      this.ultimoErrorFoto = error.message || 'No se pudo guardar la foto.';
      return false;
    }
  }
}

const usuarioManager = new UsuarioManager();
console.log('✓ user-manager.js cargado');

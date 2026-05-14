const letrasRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

const validaciones = {
  soloLetras: (valor) => letrasRegex.test(valor.trim()),
  soloNumeros: (valor) => /^\d+$/.test(valor.trim()),
  email: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()),
  telefono: (valor) => {
    const limpio = valor.replace(/[\s\-()+]/g, '');
    return /^\d{8,15}$/.test(limpio);
  },
  contrasena: (valor) => valor.length >= 8 && /[A-ZÁÉÍÓÚÜÑ]/.test(valor) && /\d/.test(valor),
  numeroCuenta: (valor) => /^\d{10,25}$/.test(valor.trim()),
  monto: (valor) => {
    const normalizado = valor.trim().replace(',', '.');
    return /^\d+(\.\d{1,2})?$/.test(normalizado) && Number(normalizado) > 0;
  }
};

validaciones['contraseña'] = validaciones.contrasena;

const mensajesValidacion = {
  soloLetras: 'Solo se aceptan letras.',
  soloNumeros: 'Solo se aceptan numeros.',
  email: 'Ingresa un correo valido.',
  telefono: 'Ingresa un telefono valido de 8 a 15 digitos.',
  contrasena: 'Minimo 8 caracteres, 1 mayuscula y 1 numero.',
  contraseña: 'Minimo 8 caracteres, 1 mayuscula y 1 numero.',
  numeroCuenta: 'El numero de cuenta debe tener de 10 a 25 digitos.',
  monto: 'Ingresa un monto positivo. Usa maximo 2 decimales.'
};

function obtenerErrorElement(elemento) {
  const siguiente = elemento.nextElementSibling;
  if (siguiente?.classList?.contains('error-msg')) return siguiente;

  const label = elemento.closest('label');
  if (label?.nextElementSibling?.classList?.contains('error-msg')) {
    return label.nextElementSibling;
  }

  const contenedor = elemento.closest('.campo, fieldset, form');
  return contenedor?.querySelector(`#${elemento.id}-error, .error-msg`) || null;
}

function validarCampo(elemento, tipo) {
  const errorElement = obtenerErrorElement(elemento);
  const valor = elemento.type === 'checkbox' ? elemento.checked : elemento.value.trim();

  if (elemento.required) {
    const estaVacio = elemento.type === 'checkbox' ? !elemento.checked : !valor;
    if (estaVacio) {
      mostrarError(errorElement, elemento.type === 'checkbox' ? 'Debes aceptar esta opcion.' : 'Este campo es requerido.');
      elemento.classList.add('input-error');
      return false;
    }
  }

  if (valor && tipo && validaciones[tipo] && !validaciones[tipo](String(valor))) {
    mostrarError(errorElement, mensajesValidacion[tipo] || 'Valor invalido.');
    elemento.classList.add('input-error');
    return false;
  }

  const minimo = elemento.min || elemento.dataset.min;
  const maximo = elemento.max || elemento.dataset.max;

  if ((minimo !== undefined && minimo !== '') || (maximo !== undefined && maximo !== '')) {
    const numero = Number(String(valor).replace(',', '.'));
    if (minimo !== undefined && minimo !== '' && numero < Number(minimo)) {
      mostrarError(errorElement, `El valor minimo permitido es ${minimo}.`);
      elemento.classList.add('input-error');
      return false;
    }

    if (maximo !== undefined && maximo !== '' && numero > Number(maximo)) {
      mostrarError(errorElement, `El valor maximo permitido es ${maximo}.`);
      elemento.classList.add('input-error');
      return false;
    }
  }

  limpiarError(errorElement);
  elemento.classList.remove('input-error');
  return true;
}

function mostrarError(elemento, mensaje) {
  if (elemento) {
    elemento.textContent = mensaje;
    elemento.style.display = 'block';
  }
}

function limpiarError(elemento) {
  if (elemento) {
    elemento.textContent = '';
    elemento.style.display = 'none';
  }
}

function filtrarLetras(campo) {
  campo.value = campo.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]/g, '');
}

function filtrarNumeros(campo) {
  campo.value = campo.value.replace(/\D/g, '');
}

function filtrarMonto(campo) {
  campo.value = campo.value
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
    .replace(/(\..*)\./g, '$1')
    .replace(/^(\d+)(\.\d{0,2}).*$/, '$1$2');
}

function inicializarValidacionesEnTiempoReal() {
  document.querySelectorAll('[data-validar]').forEach(campo => {
    campo.addEventListener('input', () => {
      const tipo = campo.getAttribute('data-validar');

      if (tipo === 'soloLetras') filtrarLetras(campo);
      if (tipo === 'soloNumeros' || tipo === 'numeroCuenta') filtrarNumeros(campo);
      if (tipo === 'monto') filtrarMonto(campo);

      validarCampo(campo, tipo);
    });

    campo.addEventListener('blur', () => {
      validarCampo(campo, campo.getAttribute('data-validar'));
    });
  });
}

document.addEventListener('DOMContentLoaded', inicializarValidacionesEnTiempoReal);
console.log('validation.js cargado');

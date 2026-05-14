/* ============================================================================
   ARCHIVO: modal-renderer.js
   DESCRIPCIÓN: Renderización de modales y menús
   ============================================================================ */

class ModalRenderer {
  static renderAjustes(usuario) {
    const html = `
      <div class="modal-overlay" id="modalAjustes">
        <div class="modal-contenido">
          <button class="cerrar-modal" onclick="cerrarModal('modalAjustes')">&times;</button>
          <h2>Configuración de perfil</h2>
          
          <div class="panel-ajustes">
            <div class="seccion-ajustes">
              <h3>Foto de Perfil</h3>
              <div class="foto-perfil-container">
                <img src="${usuario.fotoPerfil}" alt="Perfil" class="foto-perfil-grande" id="imgPerfil">
                <input type="file" id="inputFoto" accept=".jpg,.jpeg,.jfif,.pjpeg,.png,.gif,.webp,.bmp,image/jpeg,image/jpg,image/pjpeg,image/png,image/gif,image/webp,image/bmp" style="display:none;">
                <button onclick="document.getElementById('inputFoto').click()" class="btn-secundario" type="button">
                   Cambiar foto
                </button>
              </div>
            </div>

            <div class="seccion-ajustes">
              <h3>Información Personal</h3>
              <form id="formAjustes">
                <div class="grupo-campo">
                  <label>Nombre completo</label>
                  <input type="text" data-validar="soloLetras" value="${usuario.nombre}" id="ajNombre" required>
                  <span class="error-msg"></span>
                </div>

                <div class="grupo-campo">
                  <label>Correo electrónico</label>
                  <input type="email" value="${usuario.email}" id="ajEmail" required>
                  <span class="error-msg"></span>
                </div>

                <div class="grupo-campo">
                  <label>Teléfono</label>
                  <input type="tel" data-validar="telefono" value="${usuario.telefono}" id="ajTelefono">
                  <span class="error-msg"></span>
                </div>

                <div class="grupo-campo">
                  <label>Ocupación</label>
                  <input type="text" data-validar="soloLetras" value="${usuario.ocupacion}" id="ajOcupacion">
                  <span class="error-msg"></span>
                </div>

                <button type="submit" class="btn-primario" style="width: 100%; margin-top: 1rem;">
                   Guardar Cambios
                </button>
              </form>
            </div>

            <div class="seccion-ajustes">
              <h3>Cambiar Contraseña</h3>
              <form id="formCambiarContraseña">
                <div class="grupo-campo">
                  <label>Contraseña actual</label>
                  <input type="password" id="contraseñaActual" required placeholder="Ingresa tu contraseña">
                  <span class="error-msg"></span>
                </div>

                <div class="grupo-campo">
                  <label>Contraseña nueva</label>
                  <input type="password" data-validar="contraseña" id="contraseñaNueva" required placeholder="Mínimo 8 caracteres">
                  <span class="error-msg"></span>
                </div>

                <div class="grupo-campo">
                  <label>Confirmar Contraseña</label>
                  <input type="password" id="confirmarContraseña" required placeholder="Repite tu contraseña">
                  <span class="error-msg"></span>
                </div>

                <button type="submit" class="btn-primario" style="width: 100%; margin-top: 1rem;">
                  Cambiar contraseña
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
    return html;
  }

  static renderPendientes(prestamos) {
    let html = `
      <div class="modal-overlay" id="modalPendientes">
        <div class="modal-contenido">
          <button class="cerrar-modal" onclick="cerrarModal('modalPendientes')">&times;</button>
          <h2>Préstamos pendientes</h2>
    `;

    if (prestamos.length === 0) {
      html += '<p style="text-align:center; padding: 2rem; color: #666;">No tienes préstamos pendientes</p>';
    } else {
      html += '<div class="lista-prestamos">';
      prestamos.forEach(p => {
        const porcentaje = p.tiempoRestante.sinFecha ? 0 : Math.max(0, (p.tiempoRestante.dias / 7) * 100);
        const esVencido = p.tiempoRestante.vencido;
        const esAprobado = p.estado === 'aprobado';
        const estadoTexto = esAprobado ? 'APROBADO' : (esVencido ? 'VENCIDO' : 'PENDIENTE');
        const badgeClase = esAprobado ? 'badge-verde' : (esVencido ? 'badge-rojo' : 'badge-amarillo');
        const tiempoTexto = p.tiempoRestante.sinFecha
          ? 'Fecha no disponible'
          : (esVencido ? 'VENCIDO' : `${p.tiempoRestante.dias}d ${p.tiempoRestante.horas}h`);
        
        html += `
          <div class="tarjeta-prestamo ${esVencido ? 'vencido' : ''}">
            <div class="header-prestamo">
              <h4>#${p.id}</h4>
              <span class="badge ${badgeClase}">
                ${estadoTexto}
              </span>
            </div>
            <div class="info-prestamo">
              <p><strong>Monto:</strong> $${p.monto.toFixed(2)}</p>
              <p><strong>Cargo servicio:</strong> $${(p.cargoServicio || 0).toFixed(2)}</p>
              <p><strong>Total a pagar:</strong> $${(p.totalPagar || p.monto).toFixed(2)}</p>
              <p><strong>Plazo:</strong> ${p.plazo} meses</p>
              <p><strong>Cuota:</strong> $${p.cuotaMensual.toFixed(2)}/mes</p>
              <p><strong>Tipo:</strong> ${p.tipo}</p>
            </div>
            <div class="tiempo-restante">
              <p><strong>Tiempo para cancelar:</strong></p>
              <div class="barra-progreso">
                <div class="barra-relleno" style="width: ${porcentaje}%"></div>
              </div>
              <p style="text-align: center; color: ${esVencido ? 'red' : 'orange'}; font-weight: bold; margin-top: 0.5rem;">
                 ${tiempoTexto}
              </p>
            </div>
            ${p.estado === 'pendiente' ? `<button onclick="cancelarPrestamo(${p.id})" class="btn-secundario" style="width: 100%; margin-top: 0.7rem;">Cancelar préstamo</button>` : ''}
            ${esAprobado ? `<button onclick="abrirPanelPago(${p.id})" class="btn-exito" style="width: 100%; margin-top: 0.7rem;">Registrar pago</button>` : ''}
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  static renderPagoPrestamo(prestamo) {
    return `
      <div class="modal-overlay" id="modalPagoPrestamo">
        <div class="modal-contenido">
          <button class="cerrar-modal" onclick="cerrarModal('modalPagoPrestamo')">&times;</button>
          <h2>Registrar pago</h2>
          <p style="text-align:center; margin-bottom: 1rem;">Préstamo #${prestamo.id} - Total a pagar: $${(prestamo.totalPagar || prestamo.monto).toFixed(2)}</p>
          <form id="formPagoPrestamo">
            <div class="grupo-campo">
              <label for="pagoMonto">Monto pagado</label>
              <input type="text" id="pagoMonto" data-validar="monto" inputmode="decimal" value="${(prestamo.totalPagar || prestamo.monto).toFixed(2)}" required>
              <span class="error-msg"></span>
            </div>
            <div class="grupo-campo">
              <label for="pagoMetodo">Método de pago</label>
              <select id="pagoMetodo" required>
                <option value="">Selecciona una opción</option>
                <option value="transferencia">Transferencia</option>
                <option value="deposito">Depósito</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="paypal">PayPal</option>
                <option value="otro">Otro</option>
              </select>
              <span class="error-msg"></span>
            </div>
            <div class="grupo-campo">
              <label for="pagoReferencia">Referencia o comprobante</label>
              <input type="text" id="pagoReferencia" maxlength="100" required placeholder="Número de referencia">
              <span class="error-msg"></span>
            </div>
            <button type="submit" class="btn-exito" style="width: 100%; margin-top: 1rem;">Confirmar pago</button>
          </form>
        </div>
      </div>
    `;
  }

  static renderHistorial(prestamos) {
    let html = `
      <div class="modal-overlay" id="modalHistorial">
        <div class="modal-contenido">
          <button class="cerrar-modal" onclick="cerrarModal('modalHistorial')">&times;</button>
          <h2>Historial de préstamos</h2>
    `;

    if (prestamos.length === 0) {
      html += '<p style="text-align:center; padding: 2rem; color: #666;">No tienes préstamos completados</p>';
    } else {
      html += `
        <div class="tabla-historial">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Monto</th>
                <th>Total</th>
                <th>Plazo</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Solicitud</th>
                <th>Pagado</th>
              </tr>
            </thead>
            <tbody>
      `;

      prestamos.forEach(p => {
        const estado = p.estado === 'reprobado' ? 'Préstamo rechazado' : p.estado;
        const fechaPago = p.fechaPago ? new Date(p.fechaPago).toLocaleDateString('es-ES') : '-';
        html += `
          <tr>
            <td>#${p.id}</td>
            <td>$${p.monto.toFixed(2)}</td>
            <td>$${(p.totalPagar || p.monto).toFixed(2)}</td>
            <td>${p.plazo}m</td>
            <td>${p.tipo}</td>
            <td>${estado}</td>
            <td>${new Date(p.fechaSolicitud).toLocaleDateString('es-ES')}</td>
            <td>${fechaPago}</td>
          </tr>
        `;
      });

      html += '</tbody></table></div>';
    }

    html += '</div></div>';
    return html;
  }

  static renderMenuUsuario(usuario) {
    const esAdmin = usuario.rol === 'admin';
    const enlacesUsuario = esAdmin
      ? '<a href="html/admin.html"> Panel admin</a>'
      : `
          <a href="#" onclick="abrirPrestamosPendientes(); return false;"> Pendientes</a>
          <a href="#" onclick="abrirHistorial(); return false;"> Historial</a>
        `;

    return `
      <div class="usuario-menu-contenedor">
        <div class="usuario-menu" id="usuarioMenu">
          <img src="${usuario.fotoPerfil}" alt="Perfil" class="avatar-pequeño">
          <span class="nombre-usuario">${usuario.nombre}</span>
          <span class="chevron-icon">▼</span>
        </div>
        <div class="dropdown-menu" id="dropdownMenu">
          <a href="#" onclick="abrirPanelAjustes(); return false;"> Ajustes</a>
          ${enlacesUsuario}
          <a href="#" onclick="cerrarSesion(); return false;" style="color: red;">Cerrar sesión</a>
        </div>
      </div>
    `;
  }
}

console.log(' modal-renderer.js cargado');

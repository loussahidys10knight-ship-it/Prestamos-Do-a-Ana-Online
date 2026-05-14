document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menu-toggle');
  const navbar = document.getElementById('menu');
  const overlay = document.getElementById('overlay');
  const navLinks = document.querySelectorAll('.nav-link');
  const secciones = document.querySelectorAll('section[id]');

  if (!menuToggle || !navbar || !overlay) return;

  function cerrarMenu() {
    menuToggle.classList.remove('active');
    navbar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-abierto');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
  }

  function alternarMenu() {
    const estaAbierto = navbar.classList.toggle('active');
    menuToggle.classList.toggle('active', estaAbierto);
    overlay.classList.toggle('active', estaAbierto);
    document.body.classList.toggle('menu-abierto', estaAbierto);
    menuToggle.setAttribute('aria-expanded', String(estaAbierto));
    menuToggle.setAttribute('aria-label', estaAbierto ? 'Cerrar menu' : 'Abrir menu');
  }

  menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    alternarMenu();
  });

  overlay.addEventListener('click', cerrarMenu);

  navLinks.forEach((link) => {
    link.addEventListener('click', cerrarMenu);
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) cerrarMenu();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') cerrarMenu();
  });

  if ('IntersectionObserver' in window && secciones.length > 0) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entrada.target.id}`);
        });
      });
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0
    });

    secciones.forEach((seccion) => observador.observe(seccion));
  }

  console.log('menu.js cargado');
});

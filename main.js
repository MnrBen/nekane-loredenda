/* ==========================================================================
   Floristería Nekane Loreak — main.js
   Todo el JavaScript de la web, vanilla y sin librerías.

   Principio: la web funciona sin JS (enlaces, teléfono, galerías que abren
   la foto). El JS solo mejora la experiencia. Por eso no hay rutas de imagen
   escritas aquí: todo se lee del HTML, y el archivo sirve igual en /v2/.

   Índice
   1. Arranque
   2. Menú móvil
   ========================================================================== */


/* 1. Arranque
   ========================================================================== */

// Marca que hay JS disponible, para que el CSS pueda aplicar estados que
// solo tienen sentido con JS (por ejemplo, animaciones de entrada).
document.documentElement.classList.add('js');


/* 2. Menú móvil
   --------------------------------------------------------------------------
   Patrón "disclosure": un botón que muestra y oculta el menú. El JS solo
   cambia aria-expanded; el CSS muestra el panel según ese atributo, así el
   estado visual y el que anuncia el lector de pantalla no se separan nunca.
   Se cierra al elegir un enlace, con Escape y al tocar fuera.
   ========================================================================== */
(function iniciarMenu() {
  const boton = document.querySelector('.cabecera__menu');
  if (!boton) return;
  const menu = document.getElementById(boton.getAttribute('aria-controls'));
  if (!menu) return;

  const estaAbierto = () => boton.getAttribute('aria-expanded') === 'true';
  const abrir = () => boton.setAttribute('aria-expanded', 'true');
  const cerrar = () => boton.setAttribute('aria-expanded', 'false');

  boton.addEventListener('click', () => (estaAbierto() ? cerrar() : abrir()));

  // Al elegir una sección el panel se cierra para dejar ver el destino.
  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) cerrar();
  });

  // Escape cierra y devuelve el foco al botón, para no dejar a quien navega
  // con teclado "perdido" dentro de un panel que ya no se ve.
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && estaAbierto()) {
      cerrar();
      boton.focus();
    }
  });

  // Tocar fuera de la cabecera cierra el panel.
  document.addEventListener('click', (evento) => {
    if (estaAbierto() && !evento.target.closest('.cabecera')) cerrar();
  });

  // Si se pasa a escritorio con el panel abierto, se resetea el estado para
  // que al volver a móvil no aparezca abierto. 75em = el mismo corte del CSS.
  const escritorio = window.matchMedia('(min-width: 75em)');
  escritorio.addEventListener('change', (consulta) => {
    if (consulta.matches) cerrar();
  });
})();

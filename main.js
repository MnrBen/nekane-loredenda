/* ==========================================================================
   Floristería Nekane Loreak — main.js
   Todo el JavaScript de la web, vanilla y sin librerías.

   Principio: la web funciona sin JS (enlaces, teléfono, galerías que abren
   la foto). El JS solo mejora la experiencia. Por eso no hay rutas de imagen
   escritas aquí: todo se lee del HTML, y el archivo sirve igual en /v2/.

   Índice
   1. Arranque
   ========================================================================== */


/* 1. Arranque
   ========================================================================== */

// Marca que hay JS disponible. El CSS usa .js para aplicar estados que solo
// tienen sentido con JS (por ejemplo, el menú móvil plegado). Sin JS, el menú
// queda visible y usable.
document.documentElement.classList.add('js');

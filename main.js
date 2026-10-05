/* ==========================================================================
   Floristería Nekane Loreak — main.js
   Todo el JavaScript de la web, vanilla y sin librerías.

   Principio: la web funciona sin JS (enlaces, teléfono, galerías que abren
   la foto). El JS solo mejora la experiencia. Por eso no hay rutas de imagen
   escritas aquí: todo se lee del HTML, y el archivo sirve igual en /v2/.

   Índice
   1. Arranque
   2. Menú móvil
   3. Galería deslizable (flechas)
   4. Visor de fotos
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
  // que al volver a móvil no aparezca abierto. 64em = el mismo corte del CSS.
  const escritorio = window.matchMedia('(min-width: 64em)');
  escritorio.addEventListener('change', (consulta) => {
    if (consulta.matches) cerrar();
  });
})();


// Preferencia de movimiento reducido, compartida por las secciones de abajo.
const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');


/* 3. Galería deslizable (flechas)
   --------------------------------------------------------------------------
   El deslizamiento es CSS puro (scroll-snap): con el dedo funciona sin JS.
   Aquí solo se añaden las flechas para quien usa ratón o teclado. Cada
   flecha sabe qué galería mueve por su aria-controls.
   ========================================================================== */
document.querySelectorAll('.galeria__controles').forEach((controles) => {
  const flechas = controles.querySelectorAll('.galeria__flecha');
  const galeria = document.getElementById(flechas[0]?.getAttribute('aria-controls'));
  if (!galeria) return;

  controles.hidden = false;

  // Avanza exactamente una foto: ancho de una foto + el hueco entre fotos.
  const paso = () => {
    const foto = galeria.querySelector('li');
    const hueco = parseFloat(getComputedStyle(galeria).columnGap) || 0;
    return foto ? foto.getBoundingClientRect().width + hueco : galeria.clientWidth;
  };

  flechas.forEach((flecha) => {
    flecha.addEventListener('click', () => {
      galeria.scrollBy({
        left: paso() * Number(flecha.dataset.direccion),
        behavior: menosMovimiento.matches ? 'auto' : 'smooth',
      });
    });
  });

  // Desactiva la flecha que ya no lleva a ningún sitio (al principio o al
  // final). El margen de 2 px evita fallos por redondeo de decimales.
  const actualizar = () => {
    const final = galeria.scrollWidth - galeria.clientWidth;
    flechas[0].disabled = galeria.scrollLeft <= 2;
    flechas[1].disabled = galeria.scrollLeft >= final - 2;
  };

  galeria.addEventListener('scroll', actualizar, { passive: true });
  window.addEventListener('resize', actualizar);
  actualizar();
});


/* 4. Visor de fotos
   --------------------------------------------------------------------------
   Al pulsar una foto de una galería (.galeria__enlace) se abre en grande en
   un <dialog>. El <dialog> nativo ya mantiene el foco dentro, se cierra con
   Escape y deja inerte el resto de la página. Se pasa de foto deslizando con
   el dedo, con los botones de flecha o con las flechas del teclado, siempre
   dentro de la misma galería.

   La ruta, el texto alternativo y las medidas se leen del propio enlace y de
   su miniatura: aquí no hay ninguna ruta escrita.
   ========================================================================== */
(function iniciarVisor() {
  const enlaces = document.querySelectorAll('.galeria__enlace');
  if (!enlaces.length || typeof HTMLDialogElement !== 'function') return;

  // Estructura del visor, creada una sola vez.
  const visor = document.createElement('dialog');
  visor.className = 'visor';
  visor.setAttribute('aria-label', 'Visor de fotos');
  visor.innerHTML = `
    <div class="visor__barra">
      <span class="visor__contador"></span>
      <button type="button" class="visor__cerrar" aria-label="Cerrar">✕</button>
    </div>
    <figure class="visor__figura">
      <img class="visor__foto" alt="">
    </figure>
    <div class="visor__pie">
      <button type="button" class="visor__anterior" aria-label="Foto anterior">←</button>
      <button type="button" class="visor__siguiente" aria-label="Foto siguiente">→</button>
    </div>
    <p class="oculto" aria-live="polite"></p>`;
  document.body.append(visor);

  const foto = visor.querySelector('.visor__foto');
  // Sin texto visible bajo la foto; solo se anuncia "Foto 2 de 4" a quien
  // usa lector de pantalla (la descripción ya va en el alt de la imagen).
  const aviso = visor.querySelector('[aria-live]');
  const contador = visor.querySelector('.visor__contador');
  const botonAnterior = visor.querySelector('.visor__anterior');
  const botonSiguiente = visor.querySelector('.visor__siguiente');

  let grupo = [];        // enlaces de la galería abierta
  let indice = 0;        // foto que se está viendo
  let origen = null;     // enlace que abrió el visor, para devolverle el foco

  const mostrar = (nuevoIndice) => {
    // Circular: después de la última vuelve a la primera.
    indice = (nuevoIndice + grupo.length) % grupo.length;
    const enlace = grupo[indice];
    const miniatura = enlace.querySelector('img');
    foto.src = enlace.getAttribute('href');
    foto.alt = miniatura.alt;
    // Las medidas reales reservan el hueco y evitan saltos al cargar.
    foto.width = miniatura.getAttribute('width');
    foto.height = miniatura.getAttribute('height');
    aviso.textContent = `Foto ${indice + 1} de ${grupo.length}`;
    contador.textContent = `${indice + 1} / ${grupo.length}`;
    const variasFotos = grupo.length > 1;
    botonAnterior.hidden = !variasFotos;
    botonSiguiente.hidden = !variasFotos;
  };

  enlaces.forEach((enlace) => {
    enlace.addEventListener('click', (evento) => {
      // Sin visor (o con Ctrl/Cmd para abrir en otra pestaña) el enlace
      // funciona normal y abre la foto.
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
      evento.preventDefault();
      // El grupo es la lista (ul) en la que está la foto.
      grupo = [...enlace.closest('ul').querySelectorAll('.galeria__enlace')];
      origen = enlace;
      mostrar(grupo.indexOf(enlace));
      visor.showModal();
    });
  });

  botonAnterior.addEventListener('click', () => mostrar(indice - 1));
  botonSiguiente.addEventListener('click', () => mostrar(indice + 1));
  visor.querySelector('.visor__cerrar').addEventListener('click', () => visor.close());

  visor.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft') mostrar(indice - 1);
    if (evento.key === 'ArrowRight') mostrar(indice + 1);
  });

  // Deslizar con el dedo (o arrastrar con el ratón) sobre la foto: hacia la
  // izquierda, siguiente; hacia la derecha, anterior. Solo cuenta si el
  // movimiento es sobre todo horizontal y de al menos 50 px, para no
  // confundirlo con un toque.
  const figura = visor.querySelector('.visor__figura');
  foto.draggable = false;   // evita la "imagen fantasma" al arrastrar con ratón
  let inicioX = null;
  let inicioY = null;
  let acabaDeDeslizar = false;

  figura.addEventListener('pointerdown', (evento) => {
    acabaDeDeslizar = false;
    inicioX = evento.clientX;
    inicioY = evento.clientY;
  });

  figura.addEventListener('pointerup', (evento) => {
    if (inicioX === null) return;
    const dx = evento.clientX - inicioX;
    const dy = evento.clientY - inicioY;
    inicioX = null;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) && grupo.length > 1) {
      mostrar(indice + (dx < 0 ? 1 : -1));
      acabaDeDeslizar = true;   // que el "clic" que sigue no cierre el visor
    }
  });

  figura.addEventListener('pointercancel', () => { inicioX = null; });

  // Tocar el fondo oscuro (fuera de la foto y de los botones) cierra.
  visor.addEventListener('click', (evento) => {
    if (acabaDeDeslizar) {
      acabaDeDeslizar = false;
      return;
    }
    if (evento.target === visor || evento.target === figura) {
      visor.close();
    }
  });

  // Al cerrar, el foco vuelve a la foto que se pulsó, para seguir navegando
  // con el teclado desde donde se estaba.
  visor.addEventListener('close', () => {
    foto.removeAttribute('src');
    origen?.focus();
  });
})();

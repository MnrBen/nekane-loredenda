/* ==========================================================================
   Floristería Nekane Loreak — main.js (v2)
   Versión 2 (varias páginas): copia de la one-page (tag onepage-v1) que
   evoluciona por separado; la one-page no se toca.

   Todo el JavaScript de la web, vanilla y sin librerías.

   Principio: la web funciona sin JS (enlaces, teléfono, galerías que abren
   la foto). El JS solo mejora la experiencia. Por eso no hay rutas de imagen
   escritas aquí: todo se lee del HTML, y el archivo sirve igual en /v2/.

   Índice
   1. Arranque
   2. Menú móvil
   3. Galería deslizable (flechas superpuestas)
   4. Visor de fotos
   5. Animaciones de entrada
   6. Filtros de la galería
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


/* 3. Galería deslizable (flechas superpuestas)
   --------------------------------------------------------------------------
   El deslizamiento es CSS puro (scroll-snap): con el dedo funciona sin JS.
   Aquí se activan las flechas superpuestas, para quien usa ratón o teclado.
   Solo se ve la flecha que lleva a algún sitio: al principio, la derecha;
   al deslizar, las dos; al final, solo la izquierda.
   ========================================================================== */
document.querySelectorAll('.galeria__marco').forEach((marco) => {
  const galeria = marco.querySelector('.galeria');
  const [anterior, siguiente] = marco.querySelectorAll('.galeria__flecha');
  if (!galeria || !anterior || !siguiente) return;

  anterior.hidden = false;
  siguiente.hidden = false;

  // Avanza exactamente una foto: ancho de una foto + el hueco entre fotos.
  const paso = () => {
    const foto = galeria.querySelector('li');
    const hueco = parseFloat(getComputedStyle(galeria).columnGap) || 0;
    return foto ? foto.getBoundingClientRect().width + hueco : galeria.clientWidth;
  };

  [anterior, siguiente].forEach((flecha) => {
    flecha.addEventListener('click', () => {
      galeria.scrollBy({
        left: paso() * Number(flecha.dataset.direccion),
        behavior: menosMovimiento.matches ? 'auto' : 'smooth',
      });
    });
  });

  // Muestra u oculta cada flecha según la posición (margen de 2 px por
  // redondeos). Si la flecha que se oculta tenía el foco, el foco pasa a la
  // otra, para no dejar a quien usa teclado sin referencia.
  const actualizar = () => {
    const final = galeria.scrollWidth - galeria.clientWidth;
    const alPrincipio = galeria.scrollLeft <= 2;
    const alFinal = galeria.scrollLeft >= final - 2;
    [[anterior, alPrincipio, siguiente], [siguiente, alFinal, anterior]].forEach(([flecha, ocultar, otra]) => {
      if (ocultar && document.activeElement === flecha) otra.focus();
      flecha.classList.toggle('es-oculta', ocultar);
    });
  };

  galeria.addEventListener('scroll', actualizar, { passive: true });
  window.addEventListener('resize', actualizar);
  actualizar();
});


/* 4. Visor de fotos
   --------------------------------------------------------------------------
   Al pulsar una foto de una galería (.galeria__enlace) se abre en grande en
   un <dialog>. El <dialog> nativo ya mantiene el foco dentro, se cierra con
   Escape y deja inerte el resto de la página.

   Las fotos de la galería pulsada se colocan en una tira horizontal con
   scroll-snap (ver CSS): al deslizar con el dedo la foto le sigue y se
   asienta en la siguiente, con la inercia nativa del móvil. Las flechas
   (botones y teclado) mueven la misma tira.

   La ruta, el texto alternativo y las medidas se leen del propio enlace y de
   su miniatura: aquí no hay ninguna ruta escrita.
   ========================================================================== */
(function iniciarVisor() {
  const enlaces = document.querySelectorAll('.galeria__enlace');
  if (!enlaces.length || typeof HTMLDialogElement !== 'function') return;

  // Chevron curvo, el mismo que el de los botones de la galería de la página.
  const flecha = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5.5c2.6 2.6 4.6 4.6 6.5 6.5-1.9 1.9-3.9 3.9-6.5 6.5"/></svg>';

  // Estructura del visor, creada una sola vez.
  const visor = document.createElement('dialog');
  visor.className = 'visor';
  visor.setAttribute('aria-label', 'Visor de fotos');
  visor.innerHTML = `
    <div class="visor__barra">
      <button type="button" class="visor__cerrar" aria-label="Cerrar">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M2 2l16 16M18 2L2 18"/></svg>
      </button>
    </div>
    <ul class="visor__pista"></ul>
    <div class="visor__pie">
      <button type="button" class="flecha flecha--anterior" aria-label="Foto anterior">${flecha}</button>
      <span class="contador visor__contador" aria-hidden="true"></span>
      <button type="button" class="flecha" aria-label="Foto siguiente">${flecha}</button>
    </div>
    <p class="oculto" aria-live="polite"></p>`;
  document.body.append(visor);

  const pista = visor.querySelector('.visor__pista');
  const contador = visor.querySelector('.visor__contador');
  const aviso = visor.querySelector('[aria-live]');
  const [botonAnterior, botonSiguiente] = visor.querySelectorAll('.visor__pie .flecha');

  let total = 0;         // fotos de la galería abierta
  let indice = -1;       // foto que se está viendo
  let origen = null;     // enlace que abrió el visor, para devolverle el foco

  // Foto visible según la posición del scroll de la tira.
  const indiceActual = () => Math.round(pista.scrollLeft / pista.clientWidth);

  const actualizar = () => {
    const actual = indiceActual();
    if (actual === indice) return;
    indice = actual;
    contador.textContent = `${String(indice + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    // Sin texto visible bajo la foto; solo se anuncia "Foto 2 de 4" a quien
    // usa lector de pantalla (la descripción va en el alt de cada imagen).
    aviso.textContent = `Foto ${indice + 1} de ${total}`;
    botonAnterior.disabled = indice === 0;
    botonSiguiente.disabled = indice === total - 1;
  };

  const mover = (direccion) => {
    pista.scrollBy({
      left: pista.clientWidth * direccion,
      behavior: menosMovimiento.matches ? 'auto' : 'smooth',
    });
  };

  enlaces.forEach((enlace) => {
    enlace.addEventListener('click', (evento) => {
      // Con Ctrl/Cmd/Mayús el enlace funciona normal y abre la foto aparte.
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
      evento.preventDefault();

      // El grupo es la lista (ul) en la que está la foto pulsada, sin las
      // fotos ocultas por un filtro de la galería.
      const grupo = [...enlace.closest('ul').querySelectorAll('.galeria__enlace')]
        .filter((item) => !item.closest('[hidden]'));
      pista.innerHTML = '';
      grupo.forEach((item) => {
        const miniatura = item.querySelector('img');
        const diapositiva = document.createElement('li');
        diapositiva.className = 'visor__diapositiva';
        const foto = document.createElement('img');
        foto.src = item.getAttribute('href');
        foto.alt = miniatura.alt;
        // Las medidas reales reservan el hueco y evitan saltos al cargar.
        foto.width = miniatura.getAttribute('width');
        foto.height = miniatura.getAttribute('height');
        foto.draggable = false;
        diapositiva.append(foto);
        pista.append(diapositiva);
      });

      total = grupo.length;
      indice = -1;
      origen = enlace;
      visor.showModal();
      // Se abre directamente en la foto pulsada, sin animación.
      pista.scrollLeft = grupo.indexOf(enlace) * pista.clientWidth;
      actualizar();
    });
  });

  pista.addEventListener('scroll', actualizar, { passive: true });
  botonAnterior.addEventListener('click', () => mover(-1));
  botonSiguiente.addEventListener('click', () => mover(1));
  visor.querySelector('.visor__cerrar').addEventListener('click', () => visor.close());

  visor.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft' || evento.key === 'ArrowRight') {
      evento.preventDefault();   // evita el desplazamiento corto por defecto
      mover(evento.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  // Tocar el fondo oscuro (fuera de la foto y de los botones) cierra. Al
  // deslizar con el dedo el navegador no genera clic, así que deslizar no
  // cierra el visor.
  visor.addEventListener('click', (evento) => {
    if (evento.target === visor || evento.target.classList.contains('visor__diapositiva')) {
      visor.close();
    }
  });

  // Al cerrar, el foco vuelve a la foto que se pulsó, para seguir navegando
  // con el teclado desde donde se estaba.
  visor.addEventListener('close', () => {
    pista.innerHTML = '';
    origen?.focus();
  });
})();


/* 5. Animaciones de entrada
   --------------------------------------------------------------------------
   Los bloques de cada sección aparecen con un fundido suave al entrar en
   pantalla, escalonados dentro de su sección. Sin animación en la portada
   (ya está a la vista al cargar).
   Si la persona pide menos movimiento, o el navegador no tiene
   IntersectionObserver, no se marca nada y todo se ve desde el principio.
   ========================================================================== */
(function iniciarAnimaciones() {
  if (menosMovimiento.matches || !('IntersectionObserver' in window)) return;

  const bloques = document.querySelectorAll('main > .seccion:not(.inicio) > *');

  // Si se llega con un destino en la dirección (contacto.html#donde), el
  // bloque que lo contiene no se anima: el navegador salta al destino
  // mientras el bloque aún está desplazado y, al colocarse, el destino
  // quedaría bajo la cabecera.
  let destino = null;
  try {
    destino = location.hash ? document.querySelector(location.hash) : null;
  } catch {
    destino = null;   // un hash que no es un selector válido (#preservadas, etc.)
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('es-visible');
      observador.unobserve(entrada.target);   // solo la primera vez
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  bloques.forEach((bloque) => {
    if (destino && bloque.contains(destino)) return;
    // Retraso según su posición dentro de la sección (máximo 0,24 s).
    const posicion = [...bloque.parentElement.children].indexOf(bloque);
    bloque.style.setProperty('--retraso', `${Math.min(posicion, 3) * 0.08}s`);
    bloque.classList.add('revelar');
    observador.observe(bloque);
  });
})();


/* 6. Filtros de la galería
   --------------------------------------------------------------------------
   Botones que muestran solo las fotos de una categoría (data-categoria de
   cada foto). El filtro activo se marca con aria-pressed y se anuncia el
   número de fotos a los lectores de pantalla. Sin JS los botones no se ven
   y se muestran todas las fotos.

   El filtro también se refleja en la dirección (galeria.html#preservadas):
   así un enlace puede abrir la galería ya filtrada, como el de Flores
   preservadas del Inicio.
   ========================================================================== */
(function iniciarFiltros() {
  const grupo = document.querySelector('.filtros');
  const lista = document.querySelector('.mosaico-galeria');
  if (!grupo || !lista) return;

  const botones = [...grupo.querySelectorAll('.filtros__boton')];
  const fotos = [...lista.children];
  const aviso = document.querySelector('[data-filtros-aviso]');

  grupo.hidden = false;

  const aplicar = (filtro, anunciar = true) => {
    botones.forEach((boton) => {
      boton.setAttribute('aria-pressed', String(boton.dataset.filtro === filtro));
    });

    let visibles = 0;
    fotos.forEach((foto) => {
      const mostrar = filtro === 'todas' || foto.dataset.categoria === filtro;
      foto.hidden = !mostrar;
      if (mostrar) visibles++;
    });

    if (anunciar && aviso) aviso.textContent = `${visibles} fotos`;

    // Actualiza la dirección sin recargar ni añadir pasos al historial.
    history.replaceState(null, '', filtro === 'todas' ? location.pathname : `#${filtro}`);
  };

  botones.forEach((boton) => {
    boton.addEventListener('click', () => aplicar(boton.dataset.filtro));
  });

  // Si se llega con un filtro en la dirección, se aplica al cargar.
  const inicial = location.hash.slice(1);
  if (botones.some((boton) => boton.dataset.filtro === inicial)) aplicar(inicial, false);
})();

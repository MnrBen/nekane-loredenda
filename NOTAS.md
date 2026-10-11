# Notas del proyecto

Pendientes y decisiones a revisar antes de pasar de demo a web real.

## Privacidad y legal (revisar antes de producción)

- **Google Fonts**: las tipografías (Fraunces y Figtree) se cargan desde los
  servidores de Google (`fonts.googleapis.com` y `fonts.gstatic.com`). Cada
  visita envía a Google la IP del visitante. Alternativa: servir las fuentes
  desde el propio hosting.
- **Google Maps**: el mapa de "Dónde estamos" es un iframe de Google. Al
  cargarse (con `loading="lazy"`, cuando el visitante se acerca al mapa) el
  navegador se conecta a Google, que puede instalar cookies. Revisar si hace
  falta consentimiento previo.
- **Textos legales**: aviso legal, política de privacidad y política de cookies
  apuntan a `pendiente.html`. Los aporta el negocio.
- **Personas en fotos**: en `ramo-boda5`, `ramo-boda6` y `nekane` se reconoce a
  personas; en `ramo-boda8` aparecen viandantes al fondo. Confirmar los
  permisos para publicarlas.
- **Derechos de autor**: `ramo-boda6` parece de un fotógrafo profesional.
  Confirmar el permiso del autor.
- **Reseñas**: se citan literales, con el nombre del autor tal como aparece en
  Google. Confirmar que se pueden publicar en la web. La de Pedro (tanatorio)
  se quitó de la one-page para no dar protagonismo a ese servicio.
- **`<meta name="robots" content="noindex, nofollow">`**: está en todas las
  páginas mientras sea una demo. Quitarlo en la versión real.

## Contenido

- **Valoración 4,8/5 (38 reseñas)**: fuera de la web hasta tener la fuente y la
  fecha del dato. Es un dato que cambia con el tiempo.
- **Reseñas sin fecha**: la fuente solo da fechas relativas ("hace 1 año"), que
  se quedarían desfasadas en una web estática.
- **Euskera**: se decide cuando la demo esté terminada.
- **Logo**: sacado de la foto de perfil de Instagram y retocado; tiene fondo
  blanco (se integra con `mix-blend-mode: multiply`). Para producción, pedir el
  original o una versión vectorial.
- **Zona de reparto y WhatsApp**: sin confirmar. La web solo menciona entrega a
  domicilio y en otras localidades, sin concretar.

## Imágenes que no se usan en la fase 1

`flores-deco1–3`, `flores-deco6`, `flores-SV1`, `san-valentin1–3`,
`corona-floral1`, `corona-floral2`, `ramo-boda2` (fue la portada; candidata a
volver), `ramo-boda4` (repetía el ramo de `ramo-boda1`) y `ramo-deco1`. Esta última **no debe usarse**: muestra el rótulo de otra
floristería (probablemente del propietario anterior).

`corona-floral3` se ha eliminado de la carpeta: no aporta y no se va a usar.

## Accesibilidad y comportamiento (comprobado al cerrar la fase 1)

- El mapa de Google gestiona su propio foco de teclado: al tabular, el foco
  entra en sus controles ("Abrir en Maps", etc.) y Google los resalta. La web
  no puede detectar ese foco con CSS porque está dentro del iframe.
- Animaciones de entrada solo con JS y sin preferencia de movimiento
  reducido; sin JS o con movimiento reducido todo se ve desde el principio.
- Si se cambia la foto de portada, volver a medir el contraste del texto
  sobre la foto en móvil (se midió con `flores-deco5`).

## Fase 2: versión de varias páginas (`/v2/`, tag `v2`)

- Páginas: `index.html` (Inicio resumido), `bodas.html`, `galeria.html`,
  `contacto.html` y `pendiente.html`. La one-page (tag `onepage-v1`) no se
  toca.
- Las fotos se comparten desde la raíz con `../imagenes/`. El CSS y el JS se
  duplicaron dentro de `/v2/` y evolucionan por separado de la one-page.
- Si algún día `/v2/` se despliega sola, copiar `imagenes/` dentro y cambiar
  `../imagenes/` por `imagenes/`.
- La v2 no tiene sección de Ceremonias: solo una línea de tanatorios al final
  de Contacto. La reseña de Pedro tampoco se usa.
- Galería: los filtros se reflejan en la dirección (`galeria.html#bodas`,
  `#celebraciones`, `#preservadas`); los botones "Ver más en la galería" del
  Inicio abren la galería ya filtrada. Con 7 fotos o menos, el mosaico pasa
  a 3 columnas en escritorio para que no queden huecos.
- "Cómo llegar" lleva a `contacto.html#donde` (dirección y mapa).
- Portada de Bodas: `ramo-boda8` con un velo más suave que el del Inicio. Si
  se cambia la foto, volver a medir el contraste del texto en móvil.
- Fotos que la v2 usa y la one-page no: `flores-deco1`, `flores-deco2`,
  `flores-deco3` y `flores-SV1` (Galería) y `ramo-boda2` y `ramo-boda4`
  (galería de Bodas). Siguen sin usarse en ninguna: `flores-deco6`,
  `san-valentin1–3`, `corona-floral1`, `corona-floral2` y `ramo-deco1`
  (esta, no usar).

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
  personas. Confirmar que han dado su permiso para publicarlas.
- **Derechos de autor**: `ramo-boda6` parece de un fotógrafo profesional.
  Confirmar el permiso del autor.
- **Reseñas**: se citan literales, con el nombre del autor tal como aparece en
  Google. Confirmar que se pueden publicar en la web.
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

`flores-deco1–6`, `flores-SV1`, `san-valentin1–3`, `corona-floral1`,
`corona-floral2` y `ramo-deco1`. Esta última **no debe usarse**: muestra el
rótulo de otra floristería (probablemente del propietario anterior).

## Estructura de la fase 2

- Irá en `/v2/`, sin tocar la one-page (tag `onepage-v1`).
- Las fotos se comparten desde la raíz con `../imagenes/`. El CSS y el JS se
  duplican dentro de `/v2/` para que evolucionen sin afectar a la one-page.
- Si algún día `/v2/` se despliega sola, copiar `imagenes/` dentro y cambiar
  `../imagenes/` por `imagenes/`.

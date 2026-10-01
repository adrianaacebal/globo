---
name: globo-brand
description: Branding de la web GLOBO (colores, tipografía, cabecera, menú lateral, pie y componentes). Úsala siempre que se cree, añada, diseñe o maquete una página nueva de GLOBO, o se añada una sección, botón, tarjeta o estilo nuevo, para que salga con los colores y el formato de la marca. Also use when asked in English to create a new page or section for the GLOBO site.
---

# Marca GLOBO

Web estática HTML + un único `styles.css`, sin JavaScript salvo cuando hace falta (login, mapa).
Toda página nueva **parte de [template.html](template.html)** (está en esta misma carpeta) y
**solo usa clases que ya existen en `styles.css`**. No se inventan colores, fuentes ni estilos inline.

## Crear una página nueva (pasos)

1. Copia `.claude/skills/globo-brand/template.html` a la raíz del repo con un nombre en inglés y minúsculas (`offers.html`, `about.html`).
2. Sustituye `{{PAGE_TITLE}}` (en `<title>` y `<h1>`) e `{{INTRO_TEXT}}`. El `<title>` siempre es `GLOBO - <Nombre>`; no copies el título de otra página.
3. Rellena el contenido con los componentes de abajo. Borra el comentario `{{CONTENIDO...}}`.
4. Si la página debe aparecer en el menú, añade un `<li>` con icono emoji (`<span class="nav-icon">…</span>`) en la `<nav class="sidebar">` de **todas** las páginas `.html`, en el mismo orden.
5. Comprueba que se ve bien: `python .claude/skills/run-globo/driver.py shot <pagina>.html` y `... --mobile`, y mira las capturas.

## Reglas de marca

- **Idiomas:** el texto visible de la web en **inglés**; los comentarios del código en **español**, cortos, encima de cada bloque (`<!-- Restaurante destacado -->`, `/* Caja del login */`).
- **Autoras:** el comentario `<!-- Made by: Maria Cuadrado and Adriana Acebal -->` arriba del todo y el `<footer>` de la plantilla, sin cambiar.
- **Cabecera, menú y pie:** idénticos en todas las páginas. Copiar de la plantilla, no rehacerlos. El checkbox `#menu-toggle` tiene que ir justo antes del `<header>`, porque el botón ☰ funciona solo con CSS.
- **Emojis como iconos** (🍔 🍣 🍕 🥗 📍 ⭐ 🚚). No se usan librerías de iconos.

## Colores (los únicos permitidos)

| Uso | Color |
|---|---|
| Verde GLOBO: fondo de la página, botones del menú, logo | `#13916f` |
| Amarillo GLOBO: cabecera, menú lateral, títulos y texto sobre verde, botón principal | `#eec32c` |
| Verde oscuro: pie, texto sobre amarillo, degradado del hero | `#0d5f49` |
| Blanco: hover de botones, tarjetas, cajas de iframe/mapa, texto del home | `#ffffff` |
| Dorado: etiquetas pequeñas tipo "⭐ Top rated" sobre blanco | `#b8900f` |
| Texto sobre tarjeta blanca | `#333333` |

Combinaciones: sobre fondo verde el texto va en amarillo (o blanco en `.home`); sobre fondo amarillo, en verde (`#13916f` o `#0d5f49`); nunca amarillo sobre blanco.
Transparencias que se usan: `rgba(238,195,44,0.18)` (badge), `rgba(238,195,44,0.5)` (borde suave), sombras `rgba(0,0,0,0.15–0.25)`.

## Tipografía y forma

- Texto: `Arial, sans-serif` (viene del `body`; no hay que ponerlo).
- Logo y lemas: `Verdana` (clases `.logo` y `.tagline`).
- Esquinas redondeadas: 8px para inputs, 12px para cajas y botones del menú, 16–24px para tarjetas y hero, `999px` (píldora) para `.btn`.
- Hover típico: fondo pasa a blanco y el texto a verde, con un pequeño `transform` (`translateY(-2px)` o `translateX(4px)`) y `transition: 0.15s ease`.
- Móvil: el corte es `@media (max-width: 700px)`. Las cajas tienen `max-width` (400/700/1000/1200px) y `margin: 20px auto`.

## Componentes (clases de `styles.css`)

**Dos tipos de página:**
- **Página sencilla** (formulario, mapa, carta con iframe): `<main>` normal, como en la plantilla. Texto amarillo.
- **Página "de escaparate"** con varios bloques (hero, tarjetas, categorías, oferta): cambia a `<main class="home">` y pon cada bloque en su propio `<section>` o `<aside>`. Solo así hay 48px de separación entre bloques, ancho máximo de 1000px centrado y texto blanco. Con `<main>` normal los bloques salen pegados.

| Necesito… | Usa |
|---|---|
| Botón principal / secundario | `<a class="btn btn-primary">`, `<a class="btn btn-secondary">`, dentro de `<div class="hero-actions">` si van juntos |
| Título + lema en línea | `<div class="hero-head"><h1>…</h1><p>Find the <span>best…</span></p></div>` |
| Portada grande con degradado | `<main class="home">` + `<section class="hero">` con `.hero-badge`, `h1`, `.hero-text`, `.hero-actions`, `.hero-note` |
| Título de sección (en `.home`) | `<h2 class="section-title">` |
| Tarjeta destacada (imagen + texto) | `<article class="featured-card"><img …><div class="featured-body"><p class="featured-tag">…</p><h3>…</h3>…</div></article>` |
| Rejilla de categorías con emoji | `<ul class="home-categories"><li><a href="…"><span class="cat-icon">🍔</span>Burgers</a></li>…</ul>` |
| Banda con texto + botón | `<section class="near-you">` |
| Caja amarilla de oferta | `<aside class="offer">` |
| Formulario | `<form class="login-box">` con `<label>` + `<input>` + `<button>` |
| Google Form / web embebida | `<div class="doc-frame"><iframe … loading="lazy"></iframe></div>` (`.order-frame` = alto, `.menu-frame` = ancho para cartas) |
| Mapa | `<div class="map-frame"><div id="map"></div></div>` (ver `search.html`) |
| Lista de pasos | `<ol class="order-steps">` |
| Enlace destacado en texto | `<a class="menu-link">` |

## Si de verdad hace falta CSS nuevo

Añádelo al final de `styles.css` (no en `<style>` ni `style=""`), con un comentario en español encima, usando solo los colores de la tabla, las esquinas y el hover de arriba, y con su regla `@media (max-width: 700px)` si cambia en móvil.

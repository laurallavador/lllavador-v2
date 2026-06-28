# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static portfolio site for Laura Llavador, a Product UX/UI Designer based in Valencia, Spain. No build step, no package manager, no framework — plain HTML, CSS, and vanilla JS served directly from the filesystem or any static host.

## Running locally

Open any HTML file directly in a browser, or use any static file server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Architecture

One shared stylesheet (`styles.css`) and one shared script (`main.js`) used by all pages. No bundler.

**Pages:**
- `index.html` — main portfolio (hero, about, work grid, timeline, contact)
- `nextport.html`, `sportai.html`, `comida.html`, `compressflow.html` — individual case study pages

**CSS design system** (`styles.css`): All design tokens live in `:root` CSS custom properties at the top of the file. The palette is "Bosque Mediterráneo" — a dark forest/Mediterranean theme. Key tokens: `--bg`, `--ink`, `--terracotta`, `--sea`, `--turquoise`, `--leaf`, `--sun`.

CSS is organized in labeled sections (NAV, HERO, MARQUEE, SECTIONS, ABOUT, WORK, JOURNEY, CONTACT, PROJECT PAGES, REVEALS, RESPONSIVE). Project-page-specific components (`.split`, `.steps`, `.screens`, `.tokens`, `.skills-grid`, `.next`) are defined at the bottom of `styles.css` and reused across all case study pages.

**JS (`main.js`)**: Single IIFE. Handles: scroll progress bar, Valencia live clock, nav scroll state, mobile menu toggle, staggered reveal animations via `IntersectionObserver`, animated counters (`data-count` attribute), magnetic button effect on `.magnetic` elements, custom cursor (`.cursor-dot` / `.cursor-ring`), and hero blob parallax. All interactive features are gated on `prefers-reduced-motion` and `(hover: hover) and (pointer: fine)` media queries.

**Shared SVG frond**: Each page inlines the tropical leaf SVG (`#frond-art`) inside a hidden `<svg>` block and references it with `<use href="#frond-art">`. This pattern is repeated on every page — it is intentional duplication, not a bug.

**Images**: Loaded from `https://www.laurallavador.com/images/` with `onerror="this.style.display='none'"` fallbacks. Images are not stored in this repo.

## Reveal animation pattern

Elements with class `.reveal` start as `opacity:0; transform:translateY(38px)` and animate in when they enter the viewport (`.in` class added by the IntersectionObserver in `main.js`). Add `.reveal` to any new element that should animate on scroll. Parent containers with `data-stagger` attribute automatically stagger the transition delays of their direct `.reveal` children.

## Adding a new case study page

Copy an existing case study HTML file (e.g. `sportai.html`) as a starting point. The nav, frond SVG block, and contact/footer section are repeated verbatim on every page. Add a card for the new project in the `#work` section of `index.html`.

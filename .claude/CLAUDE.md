# Balina Antonella

Italian portfolio site (`lang="it"`) for the sculptor Antonella Balina, built with `@minimaz/sitekit`. Three pages plus an error page, a gallery with a lightbox, no forms, no cookies, no analytics, no third-party code. All content is real: the gallery and curriculum come from the artist's portfolio and CV PDFs and photos, and the contact details are in `output.replace`. Every page stays `noindex` until launch (see "Before launch").

## Commands

```bash
npm run build          # mz b --overwrite, src/ -> dist/
npm start              # build, then serve ./dist
npm run format         # prettier --write .
npm run format:check   # also part of the Husky pre-commit hook
npm run lint           # lint:html (htmlhint) + lint:css (stylelint) + lint:spelling (cspell)
npm run lint:a11y      # build, serve dist/, run axe-core on every built page
npm run lint:links     # build, serve dist/, crawl every link and asset
npm run check:release  # build, then fail while any placeholder or noindex (other than the error page's) is left in dist/
```

Node `26.13.0` (`.nvmrc`), `engines` `>=26`, `engine-strict=true`. The pre-commit hook runs `format:check` and `lint:html`.

`lint:a11y` and `lint:links` serve `dist/` on port 4175 (`serve.port` in `minimaz.config.json`; the sibling sites use 4173 and 4174), so stop any other server first. Rebuilding while a server holds `dist/` fails on Windows. `lint:links` skips URLs on `https://balinaantonella.it`, because canonical, Open Graph and sitemap URLs point at the live domain, which does not resolve before the first deploy. `check:release` is expected to fail until the swap list below is done.

## Pages

- `src/pages/index.html`: home, the gallery of works (six `figure.work` items) and the lightbox `dialog`. Carries the `Person` JSON-LD.
- `src/pages/curriculum.html`: portrait, bio, a row of four studio photos and the timelines (formazione, mostre collettive, residenze), all from the artist's CV.
- `src/pages/contatti.html`: email, phone and social links.
- `src/pages/error/index.html` with `script.ts`: one page for every HTTP error (same pattern as `zellerindustries-com` and `deshart-it`). It reads `?code=` and fills in the code, title, description and document title from a code-to-text map in `script.ts` (400, 401, 403, 404, 408, 429, 500; an unlisted 5xx shows as 500, anything else as 404). The static markup is the 404, so it also works without JavaScript. Kept out of the sitemap, with a permanent `noindex, follow` meta.

URLs are flat `.html` files: `/`, `/curriculum.html`, `/contatti.html`, plus the error page at `/error/`. The web server must route the error codes to it, for example `error_page 404 /error/?code=404;` in nginx. That config lives on the server, not in this repo. `mz serve` does not route errors, so locally you open `/error/?code=500` by hand. Every page copies the head of `index.html` (CSP meta, canonical, Open Graph and Twitter tags, fonts), with `__SITE_URL__`, `__SITE_NAME__` and `__ROBOTS__` tokens instead of literals. The og:image and twitter:image are always `__SITE_URL__/assets/works/01-full.webp`, the first gallery image.

## Structure

- Navigation: one `<nav>` inside `header.site-header` on every page, no duplicate markup. Below 768px it is a bar docked to the bottom of the screen (three equal items, icon over label, accent top edge on the current page); from 768px it is the usual top nav next to the wordmark, text only (the icons are `display: none`). The bar height is `--bottom-bar-height` in `root.css`. The footer and `html` `scroll-padding-block-end` reserve that height on phones, and the lightbox dialog sits above the bar. Each nav link is `<a><i class="icon name" aria-hidden="true"></i><span>Label</span></a>`, so a new page needs its link added to every page and an icon rule in `icons.css`.
- `src/style.css` is the bundle entry and only holds `@import`s, in cascade order. `src/styles/*.css` is one concern per file, under 250 lines each, and a new stylesheet must be imported in `src/style.css`.
- Design tokens (colours, type scale, spacing, breakpoints 480 / 768 / 1024) live only in `src/styles/root.css`, light theme only. The palette is violet and lilac, as the artist likes: lilac-tinted neutrals, one violet accent (`--color-accent`, rebeccapurple `#663399`, a web-safe violet) and a soft lilac (`--color-accent-soft`) for the current page in the phone nav. All text pairs are AA or better (ratios are in the `root.css` comments); recheck contrast when changing a colour. The `theme-color` meta on every page repeats `--color-bg`, so change both together.
- Cascade layers are declared once in `root.css`: `reset, base, layout, components, utilities`. Each stylesheet wraps its rules in one of them.
- `src/script.ts` is the single script entry (`<script type="module" src="/script.js">`). It imports `initLightbox` from `src/scripts/lightbox.ts`, which opens the full image of a work in the `#lightbox` dialog from the `data-*` attributes on each `.work-open` button. Without JavaScript the thumbnails stay visible as inert buttons. On touch screens a horizontal swipe steps through the works (`swipeDistance` and `swipeSlope` at the top of `lightbox.ts`; the dialog has `touch-action: pan-y pinch-zoom`, so vertical scrolling and pinch zoom still work).
- `src/public/`: `robots.txt` (blocks AI crawlers, allows Googlebot and Bingbot, points at the sitemap), `sitemap.xml` (home, curriculum and contatti, not the error page), `.well-known/security.txt`, `favicon.ico`, `favicon.svg`, self-hosted `fonts/` (Figtree body, Besley headings) and `assets/` (`works/`, `portrait.webp` and `studio-01` to `04.webp`).
- `scripts/` holds the Node tooling behind the npm scripts: `check-release.mjs` (takes an optional directory, default `dist`), `lint-a11y.mjs`, `lint-links.mjs` and `serve-dist.mjs`.
- `minimaz.config.json` maps `pages`, `public` and `styles` to the `dist/` root. CSS is bundled into one minified `style.css`. JS is minified, but sitekit keeps each module separate: `dist/script.js` imports `./scripts/lightbox.js`.

## Build-time replacements

Values that repeat or change at launch live once in `output.replace` in `minimaz.config.json`, and the pages carry `__TOKEN__` placeholders that the build swaps in (same pattern as `zellerindustries-com` and `yamastavernagreca-it`):

- `__SITE_URL__` (canonical, og:url, og:image, twitter:image, JSON-LD `url` and `image`) and `__SITE_NAME__` (og:site_name, JSON-LD `name`).
- `__ROBOTS__`: the robots meta of the home, curriculum and contacts pages. It is `noindex,nofollow` for now; the error page keeps its own literal `noindex, follow`.
- `__EMAIL__`, `__PHONE_DISPLAY__`, `__PHONE_TEL__` and `__LINKEDIN_URL__`: the contact details (contacts page, and the LinkedIn URL in the JSON-LD `sameAs`).

Replacement only runs on the built pages, never on `src/public/`: `robots.txt`, `sitemap.xml` and `security.txt` keep the real domain written out, so a domain change also means editing those. A token with no entry in `output.replace` is a typo that reaches production: `check:release` fails on any `__TOKEN__` left in `dist/`.

## Icons

Icons are the Bootstrap Icons font (`bootstrap-icons` dependency), used the same way as in `zellerindustries-com`: `src/styles/icons.css` does not load the full icon stylesheet, it has one `.icon.<name>::before { content: '...' }` rule per icon in use. Markup is an empty `<i class="icon name" aria-hidden="true"></i>`, always decorative: a text label or an `aria-label` next to it carries the meaning.

- To add an icon, add one rule to `icons.css` with the codepoint from `node_modules/bootstrap-icons/font/bootstrap-icons.json` (decimal there, hex in the CSS).
- `input.externals` in `minimaz.config.json` copies `bootstrap-icons.woff2` from `node_modules` to `/fonts`, so the font is self-hosted and the CSP stays `font-src 'self'`. The font is about 134 KB, but a browser only fetches it on a page that shows an icon (the contacts page, and the lightbox once opened).
- In use: envelope, telephone and linkedin on the contacts page, images, person and envelope in the phone nav bar, and x-lg, chevron-left and chevron-right on the lightbox buttons.
- `npm install` needs Node 26 (`engine-strict`). Without switching the machine default, prefix the PATH: `PATH="<nvm dir>/v26.13.0:$PATH" npm install`.

## Content Security Policy

Every page has the same meta CSP: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'`. So there are no inline `<style>` blocks, `style=""` attributes, inline scripts or `javascript:` URLs, no CDN and no external origin: set sizes with CSS classes and the `width` and `height` attributes. The one inline script is the JSON-LD block on the home page. It is a data block (`type="application/ld+json"`), never executed, so `script-src` does not govern it (`deshart-it` does the same). Any real script must stay an external file.

## Images

- Gallery: masonry columns (CSS `column-count`, 1 / 2 / 3) with every work at its own proportions, so no cropping. WebP, the real `width` and `height` on every `img`, `loading="lazy"` below the fold.
- Portrait and studio photos: uniform 4:5 `object-fit: cover` crops (`--ratio-work`). On phones the curriculum portrait is capped at `--portrait-max-width-narrow` so the bio starts on the first screen; from 768px it uses `--portrait-max-width`.
- A work has a thumbnail `NN-thumb.webp` (fitted inside 600x750) and a full image `NN-full.webp` (fitted inside 1600x1600, never upscaled) in `src/public/assets/works/`. The lightbox reads the full size from `data-full-width` and `data-full-height` on the `.work-open` button.

## Before launch

No placeholder content is left. The originals sent by the artist live in `data/`, which is git-ignored and never built. The robots meta of the home, curriculum and contacts pages comes from `__ROBOTS__` in `output.replace` and is still `noindex,nofollow`.

`check:release` scans the built `dist/`. It flags every `[PLACEHOLDER]` marker, every fake contact value (`example.it`, `linkedin.com/in/example`, `+390000000000`), every unresolved `__TOKEN__` and every robots `noindex` meta except the error page's. It is the launch gate: it fails until `__ROBOTS__` is changed. The error page (`src/pages/error/index.html`) keeps its `noindex, follow` meta permanently, since an error page must never be indexed, and `check:release` exempts it.

To launch:

- Set `__ROBOTS__` to `index, follow` in `minimaz.config.json`.
- Update the `lastmod` dates in `src/public/sitemap.xml`.
- Run `npm run check:release` and expect it to pass, then `npm run lint`, `npm run lint:a11y` and `npm run lint:links`.
- Make sure the web server routes error codes to `/error/?code=NNN`.

Content to confirm with the artist: the two photo-to-work matches (`03` Strozzatura, `06` Limitare), the unit of Cookies (66x40, read as cm), the spelling of the curator "Nãgele", her birthplace (the portfolio says Scafati, the CV says Napoli, so the pages only say 2003) and that she agrees to the studio portrait. Three works in the portfolio have no photo yet: Legami e tensioni (2025), Il nostro dolore (2023) and Untitled (2023, with Marco Graziano).

To add a work: resize the original outside the build, add `NN-thumb.webp` and `NN-full.webp`, and copy a `figure.work` item with the real `width`, `height`, `data-full-width` and `data-full-height`.

## Lint

- `.htmlhintrc` is shared with `zellerindustries-com`. stylelint covers `src/styles/`, cspell covers `src/pages/` with Italian and English dictionaries. Add legitimate names to `cspell.json` `words` rather than editing copy.
- `src/scripts/` is excluded from cspell.

## Deploy

Push to `main` builds and rsyncs `dist/` to production over SSH (`.github/workflows/deploy.yml`). Work happens on `develop`. The workflow only builds: it does not run `check:release`, so run it locally before merging to `main`.

## Scope

@SCOPE.md

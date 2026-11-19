# Balina Antonella

Italian portfolio site (`lang="it"`) for the sculptor Antonella Balina, built with `@minimaz/sitekit`. Three pages plus a 404, a gallery with a lightbox, no forms, no cookies, no analytics, no third-party code. All content is still placeholder text and images (see "Placeholder swap list"), so every page is `noindex` until the real content arrives.

## Commands

```bash
npm run build          # mz b --overwrite, src/ -> dist/
npm start              # build, then serve ./dist
npm run format         # prettier --write .
npm run format:check   # also part of the Husky pre-commit hook
npm run lint           # lint:html (htmlhint) + lint:css (stylelint) + lint:spelling (cspell)
npm run lint:a11y      # build, serve dist/, run axe-core on every built page
npm run lint:links     # build, serve dist/, crawl every link and asset
npm run check:release  # build, then fail while any placeholder or non-404 noindex is left in dist/
```

Node `26.13.0` (`.nvmrc`), `engines` `>=26`, `engine-strict=true`. The pre-commit hook runs `format:check` and `lint:html`.

`lint:a11y` and `lint:links` serve `dist/` on port 4173 (set `serve.port` in `minimaz.config.json` to change it), so stop any other server first. Rebuilding while a server holds `dist/` fails on Windows. `lint:links` skips URLs on `https://balinaantonella.it`, because canonical, Open Graph and sitemap URLs point at the live domain, which does not resolve before the first deploy. `check:release` is expected to fail until the swap list below is done.

## Pages

- `src/pages/index.html`: home, the gallery of works (six `figure.work` items) and the lightbox `dialog`. Carries the `Person` JSON-LD.
- `src/pages/curriculum.html`: portrait, short bio and timeline.
- `src/pages/contatti.html`: email, phone and social links.
- `src/pages/404.html`: not-found page, kept out of the sitemap.

URLs are flat `.html` files: `/`, `/curriculum.html`, `/contatti.html`, `/404.html`. Every page copies the head of `index.html` (CSP meta, canonical, Open Graph and Twitter tags, fonts). The og:image and twitter:image are always `https://balinaantonella.it/assets/works/01-full.webp`, the first gallery image.

## Structure

- `src/style.css` is the bundle entry and only holds `@import`s, in cascade order. `src/styles/*.css` is one concern per file, under 250 lines each, and a new stylesheet must be imported in `src/style.css`.
- Design tokens (colours, type scale, spacing, breakpoints 480 / 768 / 1024) live only in `src/styles/root.css`, light theme only.
- Cascade layers are declared once in `root.css`: `reset, base, layout, components, utilities`. Each stylesheet wraps its rules in one of them.
- `src/script.ts` is the single script entry (`<script type="module" src="/script.js">`). It imports `initLightbox` from `src/scripts/lightbox.ts`, which opens the full image of a work in the `#lightbox` dialog from the `data-*` attributes on each `.work-open` button. Without JavaScript the thumbnails stay visible as inert buttons.
- `src/public/`: `robots.txt` (blocks AI crawlers, allows Googlebot and Bingbot, points at the sitemap), `sitemap.xml` (home, curriculum and contatti, not the 404), `.well-known/security.txt`, `favicon.ico`, `favicon.svg`, self-hosted `fonts/` (Figtree body, Besley headings) and `assets/` (`works/` and `portrait-placeholder.webp`).
- `scripts/` holds the Node tooling behind the npm scripts: `check-release.mjs` (takes an optional directory, default `dist`), `lint-a11y.mjs`, `lint-links.mjs` and `serve-dist.mjs`.
- `minimaz.config.json` maps `pages`, `public` and `styles` to the `dist/` root. CSS is bundled into one minified `style.css`. JS is minified, but sitekit keeps each module separate: `dist/script.js` imports `./scripts/lightbox.js`.

## Content Security Policy

Every page has the same meta CSP: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'`. So there are no inline `<style>` blocks, `style=""` attributes, inline scripts or `javascript:` URLs, no CDN and no external origin: set sizes with CSS classes and the `width` and `height` attributes. The one inline script is the JSON-LD block on the home page. It is a data block (`type="application/ld+json"`), never executed, so `script-src` does not govern it (`deshart-it` does the same). Any real script must stay an external file.

## Images

- Gallery grid: uniform 4:5 thumbnails (`object-fit: cover`), WebP, `width` and `height` on every `img`, `loading="lazy"` below the fold.
- A work has a thumbnail `NN-thumb.webp` (about 600 px wide) and a full image `NN-full.webp` (about 1600 px wide) in `src/public/assets/works/`. The lightbox reads the full size from `data-full-width` and `data-full-height` on the `.work-open` button.

## Placeholder swap list

Everything below is placeholder content. Every placeholder carries the literal `[PLACEHOLDER]` (visible text or `alt`) and every page has `<meta name="robots" content="noindex" />`.

`check:release` flags every `[PLACEHOLDER]` and every placeholder contact value: `example.it`, `instagram.com/example`, `facebook.com/example` and `+390000000000`. So it also catches the `href`s and the JSON-LD `sameAs`, which carry no visible marker. It flags every robots `noindex` meta except the 404's.

- `src/pages/index.html`: intro text, the six works (titles, captions, `alt` texts), and the JSON-LD `Person` block with its `image` and `sameAs` (two placeholder social URLs).
- `src/pages/curriculum.html`: bio, timeline and the portrait `alt`.
- `src/pages/contatti.html`: the `.lead` intro (`[PLACEHOLDER]`), email (`example.it`), phone (fake number), Instagram and Facebook URLs.
- `src/pages/404.html`: no placeholder content. It keeps its `noindex` meta permanently, since a not-found page must never be indexed, and `check:release` exempts it.
- `src/public/assets/works/*`: the twelve WebP files `01` to `06` (`-thumb` and `-full`). They are six copies of one 720x720 image, not real resizes.
- `src/public/assets/portrait-placeholder.webp`: the portrait used on the curriculum page.

At swap time:

- Replace the text and the images. Resize each original outside the build to a thumbnail of about 600 px and a full image of about 1600 px, both WebP. Keep the 4:5 thumbnail crop.
- Set the real `width` and `height` on each thumbnail `img` and the real `data-full-width` and `data-full-height` on each `.work-open` button.
- Point the JSON-LD `image` and every og:image and twitter:image at the final first gallery image, and replace the `sameAs` URLs with the real profiles.
- Remove every `[PLACEHOLDER]` marker and every `noindex` meta except the 404's.
- Update the `lastmod` dates in `src/public/sitemap.xml`.
- Run `npm run check:release` and expect it to pass, then `npm run lint`, `npm run lint:a11y` and `npm run lint:links`.

## Lint

- `.htmlhintrc` is shared with `zellerindustries-com`. stylelint covers `src/styles/`, cspell covers `src/pages/` with Italian and English dictionaries. Add legitimate names to `cspell.json` `words` rather than editing copy.
- `src/scripts/` is excluded from cspell.

## Deploy

Push to `main` builds and rsyncs `dist/` to production over SSH (`.github/workflows/deploy.yml`). Work happens on `develop`. The workflow only builds: it does not run `check:release`, so run it locally before merging to `main`.

## Scope

@SCOPE.md

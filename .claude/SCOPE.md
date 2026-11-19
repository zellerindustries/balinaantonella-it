# Scope: balinaantonella-it

Italian portfolio site for the sculptor Antonella Balina: a gallery with a lightbox, a curriculum page, a contacts page and an error page. All content is real; every page stays `noindex` until launch.

- **In scope:** this repository only.
- **Built with:** @minimaz/sitekit static site (`mz b`), self-hosted fonts, a strict meta CSP and one bundled TypeScript entry for the lightbox.
- **Release gate:** `npm run check:release` fails while any `[PLACEHOLDER]` marker, placeholder contact value, unresolved `__TOKEN__` or `noindex` meta (other than the error page's) remains; the swap steps are in `CLAUDE.md`.

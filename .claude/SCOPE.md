# Scope: balinaantonella-it

Italian portfolio site for the sculptor Antonella Balina: a gallery with a lightbox, a curriculum page, a contacts page and a 404. All content is placeholder and every page is `noindex` until the owner supplies the real text and images.

- **In scope:** this repository only.
- **Built with:** @minimaz/sitekit static site (`mz b`), self-hosted fonts, a strict meta CSP and one bundled TypeScript entry for the lightbox.
- **Release gate:** `npm run check:release` fails while any `[PLACEHOLDER]` marker, placeholder contact URL or `noindex` meta (other than the 404's) remains; the swap steps are in `CLAUDE.md`.

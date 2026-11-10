# Balina Antonella

Placeholder, not a real site yet. It serves an unmodified HTML5 UP **Strata** template: English lorem-ipsum content, jQuery and Font Awesome, "I am Strata" headline. No customer content has been added. `README.txt` and `LICENSE.txt` at the root belong to the template (CC BY 3.0, attribution required); keep them.

## Commands

```bash
npm run build   # mz b --overwrite, src/ -> dist/
npm start       # build, then serve ./dist
npm run lint    # lint:html + lint:css + lint:spelling
```

Node `24.22.2` (`.nvmrc`), `engines` `>=24`, `engine-strict=true`.

## Structure

- Built with `@minimaz/sitekit`; `minimaz.config.json` maps `src/pages` and `src/public` to the `dist/` root, so the page keeps its relative `assets/...` and `images/...` URLs. JS and CSS bundling and minification are **off** on purpose: the template's vendor files (jQuery, poptrox, `main.css`) are copied byte-identical.
- `src/pages/index.html` is the only page. `src/public/assets/` (`css/`, `js/`, `webfonts/`, `sass/`) and `src/public/images/` are the template's assets. `sass/` is in `input.exclude` and does not reach `dist/`.
- `main.css` loads Source Sans Pro from Google Fonts at runtime; there is no CSP.
- Don't hand-edit vendor or minified files. When the real design replaces the template, drop the bundling-off settings and move styles to `src/styles/` like the other `websites/` sites.

## Lint

Configs (`.htmlhintrc`, `.stylelintrc.json`, `cspell.json`) are shared with `zellerindustries-com`. They currently report about 134 HTML, 199 CSS and 219 spelling findings, all from the stock template, so don't fix them in the template; resolve them when the real site is built. No Husky hook is installed, so nothing blocks commits.

## Scope

@SCOPE.md

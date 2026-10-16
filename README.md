# Insurance agency website

![Desktop preview](docs/preview.jpg)

A Persian, right-to-left insurance agency website with service pages, article rendering, quote and rating forms, and a browser-based admin demo.

## Run locally

Requires Python 3 for the optional static server. From this repository folder:

```bash
python -m http.server 8000
```

Open http://localhost:8000. No deployment is required.

## Repository structure

- `index.html` — home
- `about.html`, `contact.html`, `services.html`, `blog.html` — content pages
- `quote.html`, `rating.html`, `admin.html` — forms and admin demo
- `style.css`, `script.js` — shared styles and behavior
- `docs/` — import provenance and review notes

## Scope and dependencies

This uploaded version uses localStorage for articles, ratings and forms, and sessionStorage for the demo admin session. It contains no PHP API, server-side database, or shared multi-user storage. Admin credentials are demo values in `script.js` (`admin` / `123456`). About and Contact remain separate pages, as supplied in this archive. External fonts, icons and remote imagery need internet access.

## Validation

Local HTML/CSS asset references and JavaScript syntax are checked during the import. See `docs/VALIDATION.md` for the actual results and limits. CI is defined in `.github/workflows/quality.yml`.

## Source preservation

All original project files were imported in a separate Git commit before changes. `docs/ORIGINAL_FILES.sha256` lists the archive file checksums. Existing images, fonts and notices are retained. No repository-wide license grant has been added.

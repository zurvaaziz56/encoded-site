# Encoded

Marketing site for Encoded: editorial AI systems for PR agencies.
Live at [getencoded.co](https://getencoded.co).

Static site, no build step, deployed on Vercel. Pushes to `main` auto-deploy.

| File | What it is |
| --- | --- |
| `index.html` | Home page: hero draft demo, the rules scroll scene, plan, proof, pricing, about, FAQ. |
| `for-pr-agencies.html` | Short landing page for PR agency outreach (served at `/for-pr-agencies`). |
| `styles.css` | Shared stylesheet for both pages. |
| `site.js` | Shared behaviour: the two CTA URLs, scroll scenes, the hero demo and the line canvas. |
| `fonts/` | Self-hosted Newsreader, Geist and Geist Mono (latin, variable woff2, SIL OFL). |
| `og.png` | 1200x630 link preview image, rendered from `docs/og-template.html`. |
| `zurva.jpg`, `zurva.webp` | Portrait used in the about section. |
| `robots.txt`, `sitemap.xml`, `vercel.json` | Crawling, indexing and hosting config. |
| `docs/` | Redesign notes, OG template and QA screenshots. Not deployed (see `.vercelignore`). |

**The two CTA URLs live in `site.js` only** (`BOOKING_URL` for Cal.com, `FORM_URL` for Tally).
Every `data-cta="book"` and `data-cta="form"` link on both pages reads from there.

Preview locally: `python3 -m http.server 8767` from this folder (use `/for-pr-agencies.html` locally; Vercel serves clean URLs).

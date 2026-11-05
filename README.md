# Encoded

Marketing site for Encoded and the House Rules Kit: a self-serve kit that builds a PR team's house style into ChatGPT, Claude, Gemini or Copilot, plus a checker for every draft.
Live at [getencoded.co](https://getencoded.co).

Static site, no build step, deployed on Vercel. Pushes to `main` auto-deploy.

| File | What it is |
| --- | --- |
| `index.html` | The whole site: hero, how it works, before and after, what's in the kit, pricing, who builds it, FAQ. |
| `styles.css` | Aurora glass design: warm light behind frosted glass. Plus Jakarta Sans and JetBrains Mono (Google Fonts). |
| `site.js` | All CTA links (one place), scroll reveals, hero card tilt, the before/after slider. |
| `sample/fernhill-pr-kit.zip` | The downloadable sample kit for Fernhill PR, a fictional agency. |
| `og.png` | 1200x630 link preview, rendered from the hero. |
| `zurva.jpg`, `zurva.webp` | Portrait for the "who builds your kit" section. |
| `robots.txt`, `sitemap.xml`, `vercel.json` | Crawling, indexing and hosting. `/for-pr-agencies` redirects to `/`. |
| `docs/` | Redesign notes and QA screenshots. Not deployed (see `.vercelignore`). |

## Before this goes live

**The checkout links live in `site.js` only.** Set `BUY_URL` ($99 House Rules Kit) and `BUY_CALIBRATED_URL` ($249 Calibrated Kit) to your Stripe or Lemon Squeezy payment links, each redirecting to the intake questionnaire after payment. Until they are set, those buttons fall back to the Tally form (`FORM_URL`). `BOOKING_URL` (Cal.com) powers "Book a 30-minute call" and "Talk to us".

Preview locally: `python3 -m http.server 8767` from this folder.

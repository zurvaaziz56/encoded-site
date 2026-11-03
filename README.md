# Encoded

Marketing site for Encoded — editorial AI systems for PR agencies, podcast producers and content teams.
Live at [getencoded.co](https://getencoded.co).

Static site, no build step, deployed on Vercel. Pushes to `main` auto-deploy.

| File | What it is |
| --- | --- |
| `index.html` | Home page. Markup plus the hero animation and the editor demo. |
| `for-pr-agencies.html` | Dedicated landing page for PR agency outreach. |
| `styles.css` | Shared stylesheet for both pages. |
| `site.js` | Shared behaviour: the two CTA URLs, mobile menu, scroll reveals. |
| `og.png` | 1200x630 link preview image. |
| `zurva.jpg` | Portrait used in the about section. |
| `robots.txt`, `sitemap.xml`, `vercel.json` | Crawling, indexing and hosting config. |

**The two CTA URLs live in `site.js` only** (`BOOKING_URL` for Cal.com, `FORM_URL` for Tally).
Every `data-cta="book"` and `data-cta="form"` link on both pages reads from there.

Preview locally: `python3 -m http.server 8767` from this folder.

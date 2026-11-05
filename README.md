# Encoded

Marketing site for Encoded and the House Rules Kit: a self-serve kit that builds a PR team's house style into ChatGPT, Claude, Gemini or Copilot, plus a checker for every draft.
Live at [getencoded.co](https://getencoded.co).

Static site, no build step, deployed on Vercel. Pushes to `main` auto-deploy.

| File | What it is |
| --- | --- |
| `index.html` | The whole site: hero, how it works, before and after, what's in the kit, pricing, who builds it, FAQ. |
| `order.html`, `order.js` | The order form (six steps, uploads, plan choice). |
| `api/order.js` | Vercel function: emails the order to you and opens Stripe Checkout. |
| `api/confirm.js`, `lib/kit-build.js` | Automatic kit building after payment (optional). |
| `scripts/upload-engine.mjs` | One-time upload of the private kit-builder skill to your Anthropic account. |
| `thanks.html`, `terms.html` | After-payment page, and terms (delivery, refunds, privacy). |
| `styles.css` | Aurora glass design: warm light behind frosted glass. Plus Jakarta Sans and JetBrains Mono (Google Fonts). |
| `site.js` | All CTA links (one place), scroll reveals, hero card tilt, the before/after slider. |
| `sample/fernhill-pr-kit.zip` | The downloadable sample kit for Fernhill PR, a fictional agency. |
| `og.png` | 1200x630 link preview, rendered from the hero. |
| `zurva.jpg`, `zurva.webp` | Portrait for the "who builds your kit" section. |
| `robots.txt`, `sitemap.xml`, `vercel.json` | Crawling, indexing and hosting. `/for-pr-agencies` redirects to `/`. |
| `docs/` | Redesign notes and QA screenshots. Not deployed (see `.vercelignore`). |

## How an order works

1. "Get your kit" opens `/order`: a six-step form (you, what you write, house rules, what goes wrong, published samples, choose a plan).
2. On submit, `/api/order` (a Vercel function) emails the whole order to you, with the answers as `intake-answers.md` (numbered to match the kit builder's questionnaire) and the samples attached.
3. It then opens Stripe Checkout for $99 or $249. After payment the buyer lands on `/thanks`.
4. You check Stripe for the order number in the email, then build the kit: open Claude with the `encoded-kit-builder` skill, say "build a kit for [agency]", and attach the files from the email.

## Automatic kit building (optional)

When switched on, a paid order builds itself:

1. At order time, `/api/order` uploads the answers and samples to your Anthropic account (Files API) and puts their IDs on the Stripe payment.
2. After payment, `/thanks` calls `/api/confirm`, which asks Stripe directly whether the order is paid (no webhook needed) and marks it so it is only built once.
3. `/api/confirm` runs Claude (Opus 5.5, with server-side fallback on) with your kit builder as a **private custom skill**, plus code execution, in the background.
4. The finished kit (zip, build notes, delivery email draft) is emailed to you to check before it goes to the customer. If anything fails or runs out of time, you get a "build it by hand" email instead. The original order email always arrives at order time, so nothing is lost.

The engine is never stored in this public repository. Upload it once to your own Anthropic account:

```
npm install @anthropic-ai/sdk
ANTHROPIC_API_KEY=sk-ant-... node scripts/upload-engine.mjs /path/to/encoded-kit-builder
```

Then add `ANTHROPIC_API_KEY` and the printed `KIT_BUILDER_SKILL_ID` to Vercel (below).

**Time limit:** Vercel's Hobby plan stops a function after 300 seconds, and a full kit can take longer. On Vercel Pro, set `maxDuration` for `api/confirm.js` to 800 in `vercel.json` and `BUILD_TIME_LIMIT_MS` to `770000`. On Hobby, slower builds fall back to the "build it by hand" email.

## Switch it on (Vercel, Project > Settings > Environment Variables)

| Variable | What to put |
| --- | --- |
| `RESEND_API_KEY` | From resend.com (free tier). Verify your domain there first. |
| `ORDER_EMAIL_FROM` | A sender on that domain, e.g. `Encoded orders <orders@getencoded.co>` |
| `ORDER_EMAIL_TO` | Your inbox |
| `STRIPE_SECRET_KEY` | From Stripe, Developers > API keys. Start with the test key (`sk_test_...`), place a test order with card 4242 4242 4242 4242, then swap in the live key. |
| `SITE_URL` | Optional. Defaults to `https://www.getencoded.co` |
| `ANTHROPIC_API_KEY` | Optional: switches on automatic building. From the Claude Console, API keys. |
| `KIT_BUILDER_SKILL_ID` | Optional: printed by `scripts/upload-engine.mjs`. |
| `BUILD_TIME_LIMIT_MS` | Optional. Default 270000 (4.5 minutes); 770000 on Vercel Pro. |

Without the email variables, the form shows "Ordering is not switched on yet". Without the Stripe key, orders are still emailed and the buyer sees "we'll email you a payment link".

Other links (Cal.com, Tally) live in `site.js` only. `/terms` holds delivery, refunds and privacy.

Preview locally: `python3 -m http.server 8767` from this folder (the order form needs Vercel to send).

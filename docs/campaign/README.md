# Encoded launch campaign

| File | What it is |
| --- | --- |
| `01-go-to-market-strategy.md` | Who buys, why, the funnel, channels ranked, 6-week launch plan, weekly rhythm, targets, budget, posting grid |
| `linkedin.md` | Profile fixes, 18 LinkedIn posts (6 weeks), engagement routine, DM outreach scripts |
| `instagram-facebook.md` | Grid plan, 24 Instagram posts (carousels, Reels, memes), Stories, Facebook page and groups, small ad tests |
| `tiktok-reddit-more.md` | 15 TikTok scripts, Reddit plan with full posts and comment templates, other channels, cold emails, podcasts, partners |
| `BRIEF.md` | The brand voice and rules every post follows. Give it to anyone who writes for Encoded |
| `visuals/` | 19 ready-to-post images, plus `12-rules-carousel-linkedin.pdf` for LinkedIn |
| `render.js` | Makes new visuals in the same style: copy an entry in the list, change the words, run `node render.js` |
| `campaign.html` | Everything above on one page |

## Post visuals (every post, designed)

- `posts/`: 146 images for all 57 posts in the calendar (`li-` LinkedIn, `ig-` Instagram and Facebook, `tt-` TikTok covers). Named `<post>-<slide>.jpg`. Feed posts are 1080×1350, Reel and TikTok covers 1080×1920. `posts/index.json` lists each post's title, week, day, format and slides.
- `visuals-linkedin.json` and `visuals-instagram-tiktok.json`: the words on every slide. Edit the words, then run `node render_specs.js visuals-linkedin.json visuals-instagram-tiktok.json` to redraw them all (needs Playwright). `VISUAL-SPEC.md` explains the layouts.
- `campaign.html`: the whole playbook with every post's slides in one page (`python3 build_page.py` rebuilds it).

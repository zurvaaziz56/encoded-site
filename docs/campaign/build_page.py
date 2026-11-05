import os, re, html, markdown

D = os.path.dirname(os.path.abspath(__file__))
SECTIONS = [
    ("strategy", "Go-to-market strategy", "01-go-to-market-strategy.md"),
    ("linkedin", "LinkedIn", "linkedin.md"),
    ("instagram-facebook", "Instagram and Facebook", "instagram-facebook.md"),
    ("tiktok-reddit", "TikTok, Reddit and beyond", "tiktok-reddit-more.md"),
]
VISUALS = sorted(f for f in os.listdir(os.path.join(D, "visuals")) if f.endswith(".png") and f != "sheet.png")

def md(path):
    with open(path, encoding="utf-8") as f:
        text = f.read()
    text = re.sub(r"^# .*\n", "", text, count=1)  # page supplies its own section title
    return markdown.markdown(text, extensions=["tables", "fenced_code", "sane_lists"])

parts, toc = [], []
for sid, title, fname in SECTIONS:
    p = os.path.join(D, fname)
    if not os.path.exists(p):
        continue
    toc.append(f'<a href="#{sid}">{html.escape(title)}</a>')
    parts.append(f'<section class="sec" id="{sid}"><h2 class="sec__title">{html.escape(title)}</h2><div class="prose">{md(p)}</div></section>')

toc.insert(1, '<a href="#visuals">Ready-made visuals</a>')
gallery = "".join(
    f'<figure class="vis"><img src="visuals/{f}" alt="{html.escape(f[3:-4].replace("-", " "))}" loading="lazy"><figcaption>{html.escape(f[:-4])}</figcaption></figure>'
    for f in VISUALS)
parts.insert(1, f'<section class="sec" id="visuals"><h2 class="sec__title">Ready-made visuals</h2><p class="note">Feed posts at 1080×1350, Reel covers at 1080×1920, LinkedIn banner at 1584×396. Download any image and post it as is.</p><div class="gallery">{gallery}</div></section>')

import json
IDX = json.load(open(os.path.join(D, "posts", "index.json"), encoding="utf-8")) if os.path.exists(os.path.join(D, "posts", "index.json")) else []
CH = [("linkedin", "LinkedIn"), ("instagram", "Instagram and Facebook"), ("tiktok", "TikTok")]
FMT = {"image": "Single image", "carousel": "Carousel", "reel-cover": "Reel cover"}
if IDX:
    blocks = []
    for key, label in CH:
        posts = [q for q in IDX if q["channel"].lower().startswith(key)]
        if not posts:
            continue
        cards = []
        for q in posts:
            imgs = "".join(f'<a href="posts/{f}" target="_blank" rel="noopener"><img src="posts/{f}" alt="{html.escape(q["title"])}, slide {i+1}" loading="lazy" class="{'tall' if q['format']=='reel-cover' else ''}"></a>' for i, f in enumerate(q["files"]))
            meta = f'{html.escape(q["id"])} · week {q.get("week","")} · {html.escape(str(q.get("day","")))} · {FMT.get(q["format"], q["format"])} · {len(q["files"])} slide{"s" if len(q["files"])>1 else ""}'
            cards.append(f'<article class="post"><p class="post__meta">{meta}</p><h4 class="post__title">{html.escape(q["title"])}</h4><div class="strip">{imgs}</div></article>')
        blocks.append(f'<h3 class="ch">{label} <span>{len(posts)} posts</span></h3>' + "".join(cards))
    toc.insert(1, '<a href="#posts">Post visuals</a>')
    parts.insert(1, f'<section class="sec" id="posts"><h2 class="sec__title">Post visuals, ready to upload</h2><p class="note">Every post in the calendar, designed. Swipe each row for the slides. Feed posts are 1080×1350, Reel and TikTok covers 1080×1920. Tap a slide to open it full size. For LinkedIn carousels, combine the slides into one PDF.</p>{"".join(blocks)}</section>')

page = f"""<title>Encoded Launch Campaign</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* Layout: a long campaign playbook with a sticky contents rail; Aurora glass accents, theme-aware. */
:root{{--bg:#FFF9F5;--fg:#1D1A21;--muted:#5B5462;--line:rgba(29,26,33,.12);--card:rgba(255,255,255,.7);--accent:#0E7C66;--peach:#FFB49A;--mint:#A9E8CC;--apricot:#FFE0A8;--code:#F4EEEA}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#16141A;--fg:#F1ECEF;--muted:#B2A9B6;--line:rgba(241,236,239,.14);--card:rgba(40,36,44,.75);--accent:#7FD9B8;--peach:#7A4A3E;--mint:#2E5A4A;--apricot:#6A5530;--code:#221F27;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#16141A;--fg:#F1ECEF;--muted:#B2A9B6;--line:rgba(241,236,239,.14);--card:rgba(40,36,44,.75);--accent:#7FD9B8;--peach:#7A4A3E;--mint:#2E5A4A;--apricot:#6A5530;--code:#221F27;color-scheme:dark}}
*{{box-sizing:border-box}}
body{{background:var(--bg);color:var(--fg);font-family:"Plus Jakarta Sans",system-ui,-apple-system,Arial,sans-serif;font-size:16px;line-height:1.6;margin:0}}
.hero{{position:relative;overflow:hidden;padding-block:56px 40px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
.hero::before{{content:"";position:absolute;inset:-40%;background:radial-gradient(closest-side,var(--peach),transparent) 10% 30%/50% 60% no-repeat,radial-gradient(closest-side,var(--apricot),transparent) 50% 10%/45% 50% no-repeat,radial-gradient(closest-side,var(--mint),transparent) 85% 50%/50% 60% no-repeat;filter:blur(40px);opacity:.9;z-index:0}}
.hero>*{{position:relative;z-index:1;max-width:1100px;margin-inline:auto}}
.kicker{{font-family:"JetBrains Mono",monospace;font-size:13px;color:var(--muted)}}
h1{{font-size:clamp(2.2rem,1.4rem + 3vw,3.8rem);letter-spacing:-.045em;line-height:1;margin:10px 0 12px;text-wrap:balance}}
.hero p{{max-width:62ch;color:var(--muted)}}
.layout{{display:grid;grid-template-columns:220px minmax(0,1fr);gap:40px;max-width:1100px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 80px}}
nav.toc{{position:sticky;top:16px;align-self:start;display:flex;flex-direction:column;gap:6px}}
nav.toc a{{color:var(--fg);text-decoration:none;padding:8px 12px;border-radius:10px;font-weight:600;font-size:14px}}
nav.toc a:hover{{background:var(--card)}}
.sec{{margin-bottom:64px;min-width:0}}
.sec__title{{font-size:clamp(1.6rem,1.2rem + 1.4vw,2.4rem);letter-spacing:-.035em;margin:0 0 16px;padding-top:8px;text-wrap:balance}}
.prose{{min-width:0}}
.prose h2{{font-size:1.4rem;letter-spacing:-.02em;margin:36px 0 10px}}
.prose h3{{font-size:1.12rem;margin:28px 0 8px}}
.prose h4{{font-size:1rem;margin:20px 0 6px}}
.prose p,.prose li{{max-width:72ch}}
.prose blockquote{{margin:12px 0;padding:12px 16px;border-left:3px solid var(--accent);background:var(--card);border-radius:0 12px 12px 0}}
.prose code{{font-family:"JetBrains Mono",monospace;font-size:.88em;background:var(--code);padding:1px 5px;border-radius:5px}}
.prose pre{{background:var(--code);padding:14px 16px;border-radius:12px;overflow-x:auto;white-space:pre-wrap}}
.prose pre code{{background:none;padding:0}}
.prose table{{display:block;overflow-x:auto;border-collapse:collapse;margin:14px 0;font-size:14px;max-width:100%}}
.prose th,.prose td{{border-bottom:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}}
.prose th{{font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--muted);font-weight:500}}
.prose hr{{border:0;border-top:1px solid var(--line);margin:32px 0}}
.note{{color:var(--muted)}}
.gallery{{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-top:16px}}
.vis{{margin:0;border-radius:16px;overflow:hidden;background:var(--card);box-shadow:0 0 0 1px var(--line)}}
.vis img{{display:block;width:100%;height:auto;max-width:100%}}
.vis figcaption{{font-family:"JetBrains Mono",monospace;font-size:11px;color:var(--muted);padding:8px 10px}}
.ch{{font-size:1.3rem;letter-spacing:-.02em;margin:36px 0 6px}} .ch span{{font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--muted);font-weight:500;margin-left:8px}}
.post{{margin:18px 0 26px;min-width:0}}
.post__meta{{font-family:"JetBrains Mono",monospace;font-size:11px;color:var(--muted);margin:0}}
.post__title{{margin:2px 0 10px;font-size:1rem}}
.strip{{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px}}
.strip a{{flex:0 0 auto;scroll-snap-align:start}}
.strip img{{display:block;width:200px;height:250px;object-fit:cover;border-radius:12px;box-shadow:0 0 0 1px var(--line)}}
.strip img.tall{{width:160px;height:284px}}
@media (max-width:820px){{.layout{{grid-template-columns:minmax(0,1fr)}} nav.toc{{position:static;flex-direction:row;flex-wrap:wrap}}}}
</style>
<header class="hero">
  <p class="kicker">Encoded · House Rules Kit · launch campaign</p>
  <h1>From "never heard of you" to "where do I pay?"</h1>
  <p>The go-to-market plan, a six-week content calendar for LinkedIn, Instagram, Facebook, TikTok and Reddit, outreach scripts, and ready-made visuals. Written in plain, witty English. No em dashes, no hype, no invented results.</p>
</header>
<div class="layout">
  <nav class="toc" aria-label="Contents">{''.join(toc)}</nav>
  <main>{''.join(parts)}</main>
</div>
"""
with open(os.path.join(D, "campaign.html"), "w", encoding="utf-8") as f:
    f.write(page)
print("built", len(parts), "sections,", len(VISUALS), "visuals")

// Render post visuals from JSON specs (see VISUAL-SPEC.md). Usage: node render_specs.js spec.json [spec2.json ...]
// Output: posts/<id>-<n>.jpg (1080x1350 feed, 1080x1920 reel covers). Aurora glass style.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'posts');
fs.mkdirSync(OUT, { recursive: true });
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const marks = s => esc(s).replace(/\[\[(.+?)\]\]/g, '<u>$1</u>');
const tints = [['#FFB49A', '#FFE0A8', '#A9E8CC', '#BFDDFF'], ['#A9E8CC', '#BFDDFF', '#FFB49A', '#FFE0A8'], ['#FFE0A8', '#FFB49A', '#BFDDFF', '#A9E8CC']];

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{width:1080px;height:var(--h);overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif;color:#1D1A21;background:#FFF9F5;position:relative}
.au{position:absolute;inset:-25%;filter:blur(90px) saturate(1.15)}.au i{position:absolute;border-radius:50%;opacity:.9}
.au i:nth-child(1){width:55%;height:45%;left:0;top:8%;background:var(--c1)}.au i:nth-child(2){width:50%;height:40%;left:42%;top:0;background:var(--c2)}
.au i:nth-child(3){width:55%;height:45%;left:45%;top:48%;background:var(--c3)}.au i:nth-child(4){width:42%;height:35%;left:8%;top:62%;background:var(--c4)}
.w{position:absolute;inset:0;padding:80px 76px 70px;display:flex;flex-direction:column}
.tag{align-self:flex-start;font-family:'JetBrains Mono',monospace;font-size:25px;padding:10px 20px;border-radius:999px;background:rgba(255,255,255,.7);box-shadow:inset 0 0 0 2px #fff}
h1{font-size:86px;font-weight:800;letter-spacing:-.05em;line-height:1;margin-top:34px}h1.m{font-size:70px}h1.l{font-size:104px}
.sub{font-size:38px;color:#4C4553;margin-top:26px;line-height:1.35}
.glass{border-radius:34px;background:rgba(255,255,255,.66);box-shadow:inset 0 0 0 2px rgba(255,255,255,.95),0 40px 80px -50px rgba(70,35,45,.55);padding:34px 40px}
.mono{font-family:'JetBrains Mono',monospace}
u{text-decoration:underline wavy #C8342B;text-decoration-thickness:3px;text-underline-offset:8px;color:#9b2b23}
.foot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:24px}.foot b{font-weight:800;font-size:38px;letter-spacing:-.05em}.foot span{font-family:'JetBrains Mono',monospace;font-size:23px;color:#4C4553}
.ba .lab{font-family:'JetBrains Mono',monospace;font-size:24px;margin-bottom:12px}.ba .line{font-size:40px;font-weight:650;line-height:1.3}
.bad .lab{color:#C8342B}.bad .line{text-decoration:line-through;text-decoration-color:#C8342B;text-decoration-thickness:4px;color:#776c74}.good .lab{color:#0E7C66}
.good .line span{background:rgba(14,124,102,.16);box-shadow:inset 0 -4px 0 #0E7C66;border-radius:6px}
.rule{font-family:'JetBrains Mono',monospace;font-size:30px;color:#0E7C66;margin-top:24px}
.chat{margin-top:34px;display:flex;flex-direction:column;gap:22px}.bar{display:flex;gap:10px;align-items:center;font-family:'JetBrains Mono',monospace;font-size:22px;color:#6E6676}.bar i{width:14px;height:14px;border-radius:50%;background:#D9D3D6}
.ub{align-self:flex-end;max-width:84%;background:#1D1A21;color:#fff;border-radius:30px 30px 8px 30px;padding:26px 32px;font-size:34px;line-height:1.35}
.ab{align-self:flex-start;max-width:92%;border-radius:30px 30px 30px 8px;padding:28px 34px;font-size:35px;line-height:1.45;background:rgba(255,255,255,.85);box-shadow:inset 0 0 0 2px #fff,0 30px 60px -40px rgba(70,35,45,.5)}
.note{font-size:40px;font-weight:800;letter-spacing:-.03em;margin-top:30px;line-height:1.15}
.doc{margin-top:32px;background:#fff;border-radius:28px;padding:36px 40px;box-shadow:0 0 0 2px rgba(29,26,33,.06),0 40px 80px -50px rgba(70,35,45,.55)}
.doc .dh{font-size:42px;font-weight:800;letter-spacing:-.03em;line-height:1.15;margin-bottom:22px}.dl{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding:12px 0;border-top:1px dashed #E6DFE2;font-size:32px;line-height:1.35}
.dl.strike .t{text-decoration:line-through;text-decoration-color:#C8342B;text-decoration-thickness:4px;color:#8a7f87}.dl.flag .t{background:rgba(200,52,43,.1);box-shadow:inset 0 -3px 0 #C8342B;border-radius:4px}
.dn{flex:0 0 auto;font-family:'JetBrains Mono',monospace;font-size:21px;color:#C8342B;background:rgba(200,52,43,.1);padding:6px 12px;border-radius:999px;white-space:nowrap}
.verdict{margin-top:24px;align-self:flex-start;font-family:'JetBrains Mono',monospace;font-size:28px;padding:14px 22px;border-radius:14px;background:#1D1A21;color:#FFC9BC}
.qz{margin-top:30px;display:flex;flex-direction:column;gap:14px}.qi{display:flex;gap:20px;align-items:center;font-size:38px;font-weight:650;padding:16px 26px;border-radius:20px;background:rgba(255,255,255,.7);box-shadow:inset 0 0 0 2px #fff}
.qi b{font-family:'JetBrains Mono',monospace;font-size:28px;color:#6E6676;width:40px}.qi.x{background:rgba(200,52,43,.12);box-shadow:inset 0 0 0 3px #C8342B;color:#9b2b23}
.ck{margin-top:34px;display:flex;flex-direction:column;gap:16px}.ci{display:flex;gap:22px;align-items:center;font-size:38px;font-weight:650;padding:20px 28px;border-radius:22px;background:rgba(255,255,255,.72);box-shadow:inset 0 0 0 2px #fff}
.ci i{flex:0 0 46px;height:46px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:28px;color:#fff;background:#0E7C66}.ci.no i{background:#C8342B}
.meme{display:flex;flex-direction:column;gap:26px;margin-top:20px;flex:1;justify-content:center}.mp .ml{font-family:'JetBrains Mono',monospace;font-size:30px;color:#6E6676;margin-bottom:12px}.mp .mt{font-size:54px;font-weight:800;letter-spacing:-.035em;line-height:1.12}
.stat .num{font-size:300px;font-weight:800;letter-spacing:-.07em;line-height:.9;margin-top:60px}.stat .lbl{font-size:54px;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-top:20px}
.qt{font-size:66px;font-weight:800;letter-spacing:-.045em;line-height:1.08;margin-top:80px}.qt:before{content:"“";display:block;font-size:180px;line-height:.6;color:#FFB49A}.by{font-family:'JetBrains Mono',monospace;font-size:28px;margin-top:30px;color:#4C4553}
.st{margin-top:36px;display:flex;flex-direction:column;gap:18px}.si{display:flex;gap:26px;align-items:center;font-size:40px;font-weight:700;padding:26px 30px;border-radius:24px;background:rgba(255,255,255,.72);box-shadow:inset 0 0 0 2px #fff}.si b{flex:0 0 64px;height:64px;border-radius:50%;background:#1D1A21;color:#fff;display:grid;place-items:center;font-size:32px}
.fl{display:flex;flex-wrap:wrap;gap:16px;margin-top:36px}.fi{font-size:34px;font-weight:700;padding:20px 28px;border-radius:999px;background:rgba(255,255,255,.78);box-shadow:inset 0 0 0 2px #fff}.fi b{font-family:'JetBrains Mono',monospace;font-weight:500;color:#0E7C66;margin-right:10px;font-size:26px}
.btn{display:inline-block;margin-top:40px;font-size:38px;font-weight:700;padding:26px 44px;border-radius:999px;background:#1D1A21;color:#fff;align-self:flex-start}
.c{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0}.c>.tag{margin-bottom:6px}.tall h1{font-size:110px}.tall .chat .ub,.tall .chat .ab{font-size:40px}`;

function slideHTML(s, post, i, n) {
  const inner = slideInner(s, post, i, n);
  const cut = inner.lastIndexOf('<div class="foot">');
  return `<div class="c">${inner.slice(0, cut)}</div>${inner.slice(cut)}`;
}
function slideInner(s, post, i, n) {
  const tag = s.tag ? `<div class="tag">${esc(s.tag)}</div>` : '';
  const right = n > 1 ? (i < n - 1 ? `${i + 1}/${n} · swipe →` : `${i + 1}/${n}`) : 'getencoded.co';
  const foot = `<div class="foot"><b>encoded</b><span>${esc(right)}</span></div>`;
  const len = t => String(t || '').length;
  switch (s.layout) {
    case 'before_after':
      return `${tag}${s.title ? `<h1 class="m">${esc(s.title)}</h1>` : ''}<div class="glass ba bad" style="margin-top:34px"><div class="lab">AI wrote</div><div class="line">${esc(s.bad)}</div></div><div class="glass ba good" style="margin-top:22px"><div class="lab">Your rules</div><div class="line"><span>${esc(s.good)}</span></div></div>${s.rule ? `<div class="rule">${esc(s.rule)}</div>` : ''}${foot}`;
    case 'chat':
      return `${tag}<div class="chat"><div class="bar"><i></i><i></i><i></i>&nbsp;Any AI chat</div><div class="ub">${esc(s.prompt)}</div><div class="ab">${marks(s.reply)}</div></div>${s.note ? `<div class="note">${esc(s.note)}</div>` : ''}${foot}`;
    case 'doc':
      return `${tag}<div class="doc"><div class="dh">${esc(s.headline)}</div>${(s.lines || []).map(l => `<div class="dl ${l.mark || 'none'}"><span class="t">${esc(l.text)}</span>${l.note && l.mark !== 'none' ? `<span class="dn">${esc(l.note)}</span>` : ''}</div>`).join('')}</div>${s.verdict ? `<div class="verdict">${esc(s.verdict)}</div>` : ''}${foot}`;
    case 'quiz':
      return `${tag}<h1 class="m">${esc(s.title)}</h1>${s.question ? `<div class="sub">${esc(s.question)}</div>` : ''}<div class="qz">${(s.items || []).map((t, k) => `<div class="qi ${s.answer_index === k ? 'x' : ''}"><b>${k + 1}</b>${esc(t)}</div>`).join('')}</div>${foot}`;
    case 'checklist':
      return `${tag}<h1 class="m">${esc(s.title)}</h1><div class="ck">${(s.items || []).map(it => `<div class="ci ${it.ok === false ? 'no' : ''}"><i>${it.ok === false ? '✕' : '✓'}</i>${esc(it.text)}</div>`).join('')}</div>${foot}`;
    case 'meme':
      return `<div class="meme">${(s.panels || []).map(p => `<div class="mp glass"><div class="ml">${esc(p.label)}</div><div class="mt">${esc(p.text)}</div></div>`).join('')}</div>${foot}`;
    case 'stat':
      return `${tag}<div class="stat"><div class="num">${esc(s.number)}</div><div class="lbl">${esc(s.label)}</div>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ''}</div>${foot}`;
    case 'quote':
      return `<div class="qt">${esc(s.quote)}</div><div class="by">${esc(s.by)}</div>${foot}`;
    case 'steps':
      return `${tag}<h1 class="m">${esc(s.title)}</h1><div class="st">${(s.steps || []).map((t, k) => `<div class="si"><b>${k + 1}</b>${esc(t)}</div>`).join('')}</div>${foot}`;
    case 'files':
      return `${tag}<h1 class="m">${esc(s.title)}</h1><div class="fl">${(s.items || []).map((t, k) => `<div class="fi"><b>${String(k + 1).padStart(2, '0')}</b>${esc(t)}</div>`).join('')}</div>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ''}${foot}`;
    case 'cta':
      return `${tag}<h1>${esc(s.title)}</h1>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ''}<div class="btn">${esc(s.button || 'getencoded.co')}</div>${foot}`;
    case 'cover':
    default:
      return `${tag}<h1 class="${len(s.title) < 30 ? 'l' : len(s.title) > 48 ? 'm' : ''}">${esc(s.title)}</h1>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ''}${foot}`;
  }
}

(async () => {
  const specs = process.argv.slice(2).flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')).posts || []);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  let count = 0, k = 0;
  const index = [];
  for (const post of specs) {
    const tall = post.format === 'reel-cover';
    const h = tall ? 1920 : 1350;
    await page.setViewportSize({ width: 1080, height: h });
    const t = tints[k++ % tints.length];
    const files = [];
    const slides = post.slides || [];
    for (let i = 0; i < slides.length; i++) {
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>:root{--h:${h}px;--c1:${t[0]};--c2:${t[1]};--c3:${t[2]};--c4:${t[3]}}${CSS}</style></head><body class="${tall ? 'tall' : ''}"><div class="au"><i></i><i></i><i></i><i></i></div><div class="w">${slideHTML(slides[i], post, i, slides.length)}</div></body></html>`;
      await page.setContent(html, { waitUntil: count === 0 ? 'networkidle' : 'load' });
      if (count === 0) await page.waitForTimeout(400);
      const name = `${post.id}-${String(i + 1).padStart(2, '0')}.jpg`;
      await page.screenshot({ path: path.join(OUT, name), type: 'jpeg', quality: 84 });
      files.push(name); count++;
    }
    index.push({ id: post.id, channel: post.channel, week: post.week, day: post.day, title: post.title, format: post.format, files });
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1));
  await browser.close();
  console.log('rendered', count, 'images for', specs.length, 'posts');
})();

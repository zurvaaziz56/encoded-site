const {chromium}=require('playwright');
const OUT='/tmp/claude-0/-home-user-encoded-site/9a706735-17b4-5738-adf3-6dbf5f8974df/scratchpad/campaign/visuals/';
const css=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0}body{width:var(--w);height:var(--h);overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif;color:#1D1A21;background:#FFF9F5;position:relative}
.au{position:absolute;inset:-25%;filter:blur(90px) saturate(1.15)}.au i{position:absolute;border-radius:50%;opacity:.9}
.au i:nth-child(1){width:55%;height:45%;left:0;top:10%;background:#FFB49A}.au i:nth-child(2){width:50%;height:40%;left:40%;top:0;background:#FFE0A8}
.au i:nth-child(3){width:55%;height:45%;left:45%;top:45%;background:#A9E8CC}.au i:nth-child(4){width:40%;height:35%;left:10%;top:62%;background:#BFDDFF}
.wrap{position:absolute;inset:0;padding:84px 80px;display:flex;flex-direction:column}
.tag{align-self:flex-start;font-family:'JetBrains Mono',monospace;font-size:26px;padding:10px 20px;border-radius:999px;background:rgba(255,255,255,.65);box-shadow:inset 0 0 0 2px #fff}
h1{font-size:96px;font-weight:800;letter-spacing:-.05em;line-height:.98;margin-top:40px}
h1.s{font-size:78px}
.card{margin-top:44px;border-radius:36px;padding:40px 44px;background:rgba(255,255,255,.62);box-shadow:inset 0 0 0 2px rgba(255,255,255,.95),0 40px 80px -50px rgba(70,35,45,.55);backdrop-filter:blur(20px)}
.lab{font-family:'JetBrains Mono',monospace;font-size:24px;margin-bottom:14px}.bad .lab{color:#C8342B}.good .lab{color:#0E7C66}
.line{font-size:40px;font-weight:600;line-height:1.3}.bad .line s{text-decoration-color:#C8342B;text-decoration-thickness:4px;color:#7a6f78}
.good .line mark{background:rgba(14,124,102,.16);box-shadow:inset 0 -4px 0 #0E7C66;color:inherit;border-radius:6px;padding:0 4px}
.foot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;font-size:30px;font-weight:700}
.foot span{font-family:'JetBrains Mono',monospace;font-weight:400;font-size:24px;color:#4C4553}
.brand{font-weight:800;font-size:40px;letter-spacing:-.05em}
.big{font-size:150px;font-weight:800;letter-spacing:-.06em;line-height:.9}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:40px}.chip{font-size:32px;font-weight:700;padding:18px 26px;border-radius:999px;background:rgba(255,255,255,.75);box-shadow:inset 0 0 0 2px #fff}
.chip b{font-family:'JetBrains Mono',monospace;font-weight:500;color:#0E7C66;margin-right:10px;font-size:26px}
ol{margin:26px 0 0 0;padding-left:46px;font-size:38px;font-weight:600;line-height:1.5}ol li.x{color:#C8342B}
.btn{display:inline-block;margin-top:36px;font-size:36px;font-weight:700;padding:24px 40px;border-radius:999px;background:#1D1A21;color:#fff;align-self:flex-start}
.sub{font-size:40px;color:#4C4553;margin-top:28px;line-height:1.35;max-width:22ch}
.rule{font-family:'JetBrains Mono',monospace;font-size:34px;color:#0E7C66;margin-top:30px}`;
const au='<div class="au"><i></i><i></i><i></i><i></i></div>';
const foot=(l='getencoded.co',r='')=>`<div class="foot"><div class="brand">encoded</div><span>${r||l}</span></div>`;
const P=[
 ['10-carousel-02',1080,1350,`<div class="tag">12 rules · 1 and 2</div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 01</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">The count matches the headline</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">"5 tips" means five. Not six. Not four and a vibe.</div></div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 02</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">Items are what the headline promised</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">Mistakes are mistakes. Tips are tips. Don't swap them mid-list.</div></div>${foot("getencoded.co","swipe →")}`],
 ['10-carousel-03',1080,1350,`<div class="tag">12 rules · 3 and 4</div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 03</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">Every brief point gets covered</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">The client asked for four points. Count them back.</div></div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 04</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">The real credential, never "expert"</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">"Chartered financial planner" beats "finance expert". Every time.</div></div>${foot("getencoded.co","swipe →")}`],
 ['10-carousel-04',1080,1350,`<div class="tag">12 rules · 5 and 6</div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 05</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">House labels, word for word</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">If it's "What to do:", it's never "Top tip:".</div></div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 06</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">No placeholders</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">"TBD%" has never been a statistic.</div></div>${foot("getencoded.co","swipe →")}`],
 ['10-carousel-05',1080,1350,`<div class="tag">12 rules · 7 and 8</div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 07</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">Spelling matches the outlet</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">London outlet, London spelling. Colour, organise, centre.</div></div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 08</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">No em dashes</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">The fastest way to look like a robot wrote it.</div></div>${foot("getencoded.co","swipe →")}`],
 ['10-carousel-06',1080,1350,`<div class="tag">12 rules · 9 and 10</div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 09</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">No AI filler</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">Delete "in today's fast-paced world". Nobody misses it.</div></div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 10</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">Open on the point</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">First sentence: the news. Not a scene, not a mood.</div></div>${foot("getencoded.co","swipe →")}`],
 ['10-carousel-07',1080,1350,`<div class="tag">12 rules · 11 and 12</div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 11</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">Quotes sound like people</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">People say "we're pleased". Brochures say "thrilled to announce".</div></div><div class="card" style="margin-top:34px"><div class="lab" style="color:#0E7C66">Rule 12</div><div class="line" style="font-size:48px;font-weight:800;letter-spacing:-.03em">Nothing invented</div><div class="sub" style="font-size:34px;margin-top:14px;max-width:none">No made-up numbers, names or quotes. Flag what's missing.</div></div>${foot("getencoded.co","swipe →")}`],
 ['10-carousel-08',1080,1350,`<div class="tag">Your rules, not ours</div><h1>Your agency has its own 12. Probably 30.</h1><div class="sub">We write them down and build them into your AI, with a checker that catches every break.</div><div class="btn">House Rules Kit · $99</div>${foot("getencoded.co","getencoded.co")}`],
 ['01-red-pen-friday-filler',1080,1350,`<div class="tag">Red Pen Friday</div><h1 class="s">AI wrote it. An editor fixed it.</h1>
  <div class="card bad"><div class="lab">AI wrote</div><div class="line"><s>In today's fast-paced world,</s> loyalty is everything.</div></div>
  <div class="card good"><div class="lab">Editor wrote</div><div class="line"><mark>Shoppers choose who keeps them</mark> in the first week of January.</div></div>
  <div class="rule">Rule V1 · Open on the point.</div>${foot()}`],
 ['02-count-the-items',1080,1350,`<div class="tag">Count the items</div><h1 class="s">"5 money mistakes new parents make"</h1>
  <ol><li>No will</li><li>Late Child Benefit claim</li><li>No emergency fund</li><li>Default life insurance</li><li>Pausing the pension</li><li class="x">Buying a fancy pram</li></ol>
  <div class="sub" style="margin-top:34px">Your AI can't count. Your editor can. Your kit can too.</div>${foot('getencoded.co','Rule S2 · count = headline')}`],
 ['03-rewrite-pass',1080,1350,`<div class="tag">The rewrite pass</div><h1 style="font-size:118px;margin-top:60px">The rewrite pass is not a job title.</h1>
  <div class="sub">Yet somehow it's someone's whole Thursday.</div><div class="btn">Get your house rules kit · $99</div>${foot()}`],
 ['04-offer-99',1080,1350,`<div class="tag">House Rules Kit</div><h1>Your house style, built into your AI.</h1>
  <div class="big" style="margin-top:50px">$99</div><div class="sub">15 minutes of questions. 3 published pieces. Ready in 2 business days.</div><div class="btn">getencoded.co</div>${foot('getencoded.co','Claude · ChatGPT · Gemini · Copilot')}`],
 ['05-what-99-gets-you',1080,1350,`<div class="tag">What $99 gets you</div><h1 class="s">6 files. 10 minutes to set up.</h1>
  <div class="chips"><div class="chip"><b>01</b>Your rules, written down</div><div class="chip"><b>02</b>Claude writer</div><div class="chip"><b>03</b>Checker for any draft</div><div class="chip"><b>04</b>ChatGPT, Gemini, Copilot</div><div class="chip"><b>05</b>Setup guide</div><div class="chip"><b>06</b>Test report</div></div>
  <div class="sub">No subscription. No new app. Your AI, your rules.</div>${foot()}`],
 ['06-rule-of-the-week-credential',1080,1350,`<div class="tag">Rule of the week · H2</div><h1 class="s">Real credential. Never "expert".</h1>
  <div class="card bad"><div class="lab">AI wrote</div><div class="line"><s>Finance expert</s> Mia Okafor shares her top tips</div></div>
  <div class="card good"><div class="lab">Your rule</div><div class="line"><mark>Chartered financial planner</mark> Mia Okafor says</div></div>
  <div class="sub" style="font-size:34px">Journalists want the title. Your client earned it.</div>${foot()}`],
 ['07-colour-london',1080,1350,`<div class="tag">Spot the problem</div><h1 style="font-size:130px;margin-top:70px">AI wrote "color".</h1>
  <div class="sub" style="font-size:52px;max-width:18ch">Your outlet is in London.</div><div class="rule" style="margin-top:60px">Rule L1 · UK spelling for UK titles</div>${foot()}`],
 ['08-free-sample-kit',1080,1350,`<div class="tag">Free · no email needed</div><h1>See a whole kit before you buy one.</h1>
  <div class="sub">A complete House Rules Kit for Fernhill PR, a made-up agency. Rules, writer, checker, test report.</div>
  <div class="btn">Download at getencoded.co</div>${foot()}`],
 ['09-reel-cover-11pm',1080,1920,`<div class="tag" style="margin-top:120px">POV</div><h1 style="font-size:120px">It's 11pm and you're deleting the AI's em dashes. Again.</h1>
  <div class="sub" style="font-size:48px">There's a $99 fix for that.</div>${foot()}`],
 ['10-carousel-cover-12-rules',1080,1350,`<div class="tag">Save this</div><h1>12 rules AI breaks in every press release.</h1>
  <div class="sub">And how to make it stop. Swipe →</div><div class="chips"><div class="chip"><b>S2</b>Counts</div><div class="chip"><b>H2</b>Credentials</div><div class="chip"><b>L1</b>Spelling</div><div class="chip"><b>N1</b>Filler</div></div>${foot()}`],
 ['11-reel-cover-house-style',1080,1920,`<div class="tag" style="margin-top:140px">30-second demo</div><h1 style="font-size:132px">Watch a checker catch 15 mistakes.</h1>
  <div class="sub" style="font-size:48px">One AI draft. One house style. Zero rewrite pass.</div>${foot()}`],
 ['12-linkedin-banner',1584,396,`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 90px 0 520px"><div><div style="font-size:64px;font-weight:800;letter-spacing:-.05em;line-height:1">Your house style, built into your AI.</div><div style="font-size:30px;color:#4C4553;margin-top:16px">House Rules Kits for PR teams · getencoded.co</div></div></div>`],
];
(async()=>{const b=await chromium.launch();
 for(const [name,w,h,html] of P.filter(x=>process.argv[2]?x[0].startsWith(process.argv[2]):true)){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
  await p.setContent(`<!doctype html><html><head><meta charset=utf-8><style>:root{--w:${w}px;--h:${h}px}${css}</style></head><body>${au}${name.startsWith('12')?html:`<div class="wrap">${html}</div>`}</body></html>`,{waitUntil:'networkidle'});
  await p.waitForTimeout(300);await p.screenshot({path:OUT+name+'.png'});await p.close();}
 await b.close();console.log('rendered',P.length);})();

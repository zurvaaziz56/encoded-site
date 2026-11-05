/* Encoded · shared behaviour for every page. */

/* ===== YOUR LINKS: the only place these two URLs live. =====
   data-cta="book" links open Cal.com, data-cta="form" links open Tally. */
const BOOKING_URL = "https://cal.com/zurva-aziz-encoded/30min";  /* Cal.com intro call */
const FORM_URL    = "https://tally.so/r/RGl40j";                 /* Tally "what's breaking" form */

document.querySelectorAll('[data-cta="book"]').forEach(a => { a.href = BOOKING_URL; a.target = "_blank"; a.rel = "noopener"; });
document.querySelectorAll('[data-cta="form"]').forEach(a => { a.href = FORM_URL; a.target = "_blank"; a.rel = "noopener"; });

const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------- small helpers ---------- */
document.querySelectorAll('.viz-stages i, .viz-days i').forEach(el => {
  el.style.setProperty('--i', [...el.parentNode.children].indexOf(el));
});
document.querySelectorAll('.rulebook li').forEach((el, i) => el.style.setProperty('--i', i));
document.querySelectorAll('[data-dots]').forEach(box => {
  const n = +box.dataset.dots, frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) { const d = document.createElement('i'); d.style.setProperty('--i', i); frag.appendChild(d); }
  box.appendChild(frag);
});

/* ---------- reveal on enter ---------- */
const revealables = document.querySelectorAll('[data-reveal], .viz-dots');
if (noMotion || !('IntersectionObserver' in window)) {
  revealables.forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  revealables.forEach(el => io.observe(el));
}

/* ---------- count up ---------- */
if (!noMotion && 'IntersectionObserver' in window) {
  const co = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1400;
      const tick = now => {
        const k = clamp((now - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(end * eased);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => co.observe(el));
}

/* ---------- nav border on scroll ---------- */
const nav = document.getElementById('nav');
const nightZones = [...document.querySelectorAll('[data-night]')];

/* ---------- hero: a draft checked against house rules ---------- */
(function draftDemo() {
  const fig = document.getElementById('draft');
  if (!fig) return;
  const rows = [...fig.querySelectorAll('[data-issue]')];
  const checks = [...fig.querySelectorAll('[data-check]')];
  const checkFor = n => checks.find(c => c.dataset.check === String(n));
  const passing = checks.filter(c => c.dataset.check === '0');

  if (noMotion) {
    rows.forEach(r => r.classList.add('flag', 'fixed'));
    checks.forEach(c => c.classList.add('pass'));
    fig.classList.add('is-done');
    return;
  }

  let timers = [], visible = true, waiting = false;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const reset = () => {
    timers.forEach(clearTimeout); timers = [];
    fig.classList.remove('is-scan', 'is-done');
    rows.forEach(r => r.classList.remove('flag', 'fixed'));
    checks.forEach(c => c.classList.remove('pass', 'fail'));
  };
  const play = () => {
    reset();
    at(300, () => fig.classList.add('is-scan'));
    at(900, () => passing.forEach(c => c.classList.add('pass')));
    rows.forEach((r, i) => at(1000 + i * 380, () => { r.classList.add('flag'); checkFor(r.dataset.issue).classList.add('fail'); }));
    rows.forEach((r, i) => at(3100 + i * 520, () => {
      r.classList.add('fixed');
      const c = checkFor(r.dataset.issue); c.classList.remove('fail'); c.classList.add('pass');
    }));
    at(5500, () => { fig.classList.remove('is-scan'); fig.classList.add('is-done'); });
    at(14000, () => { if (visible && !document.hidden) play(); else waiting = true; });
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && waiting) { waiting = false; play(); }
    }, { threshold: 0.3 }).observe(fig);
  }
  play();
})();

/* ---------- flowing ruled lines (canvas) ----------
   Lines run loose on the left and settle into straight rules on the right:
   the drafts before and after the rules hold. Drawn at device resolution. */
function smooth(a, b, x) { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }

const FLOWS = {
  hero: {
    gap: 17,
    amp: u => 1.2 + 30 * (1 - smooth(0.12, 0.72, u)),
    alpha: u => 0.045 + 0.10 * smooth(0.25, 0.9, u),
    rgb: '22,19,15',
    red: 0.8,
    redAlpha: u => 0.6 * smooth(0.45, 0.95, u)
  },
  final: {
    gap: 22,
    amp: u => 2 + 7 * Math.sin(u * Math.PI),
    alpha: u => 0.05 + 0.07 * Math.sin(u * Math.PI),
    rgb: '239,233,221',
    red: 0.12,
    redAlpha: u => 0.5 * Math.sin(u * Math.PI)
  }
};

document.querySelectorAll('canvas[data-flow]').forEach(canvas => {
  const cfg = FLOWS[canvas.dataset.flow];
  const ctx = canvas.getContext('2d');
  if (!cfg || !ctx) return;
  let w = 0, h = 0, running = false, raf = 0, grad = null, redGrad = null;
  const ptr = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

  const size = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    grad = ctx.createLinearGradient(0, 0, w, 0);
    redGrad = ctx.createLinearGradient(0, 0, w, 0);
    for (let s = 0; s <= 10; s++) {
      grad.addColorStop(s / 10, `rgba(${cfg.rgb},${cfg.alpha(s / 10).toFixed(3)})`);
      redGrad.addColorStop(s / 10, `rgba(210,62,38,${cfg.redAlpha(s / 10).toFixed(3)})`);
    }
  };

  const draw = t => {
    ctx.clearRect(0, 0, w, h);
    const n = Math.ceil(h / cfg.gap) + 1;
    const step = w > 900 ? 6 : 5;
    const redLine = Math.round(n * cfg.red);
    ptr.x += (ptr.tx - ptr.x) * 0.08; ptr.y += (ptr.ty - ptr.y) * 0.08;
    for (let li = 0; li < n; li++) {
      const y0 = li * cfg.gap + cfg.gap * 0.5;
      const isRed = li === redLine;
      ctx.beginPath();
      for (let x = 0; x <= w + step; x += step) {
        const u = x / w;
        const a = cfg.amp(u);
        const nz = Math.sin(x * 0.0042 + t * 0.5 + li * 0.38) * 0.55
                 + Math.sin(x * 0.011 - t * 0.75 + li * 0.93) * 0.3
                 + Math.sin(x * 0.024 + t * 1.15 + li * 1.71) * 0.15;
        let y = y0 + a * nz;
        const dx = x - ptr.x, dy = y0 - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 52000) y += Math.sign(dy || 1) * 16 * Math.exp(-d2 / 11000);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      if (isRed) { ctx.strokeStyle = redGrad; ctx.lineWidth = 1.5; }
      else { ctx.strokeStyle = grad; ctx.lineWidth = 1; }
      ctx.stroke();
    }
  };

  const loop = now => { draw(now / 1000); raf = requestAnimationFrame(loop); };
  const start = () => { if (!running && !noMotion) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  size(); draw(0);
  window.addEventListener('resize', () => { size(); if (!running) draw(0); }, { passive: true });

  if (noMotion) return;
  const host = canvas.parentElement;
  host.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    ptr.tx = e.clientX - r.left; ptr.ty = e.clientY - r.top;
    if (ptr.x < -9000) { ptr.x = ptr.tx; ptr.y = ptr.ty; }
  }, { passive: true });
  host.addEventListener('pointerleave', () => { ptr.tx = -9999; ptr.ty = -9999; ptr.x = -9999; ptr.y = -9999; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(canvas);
  } else start();
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
});

/* ---------- scroll scenes ---------- */
// 1. The problem statement fills in word by word, then the red pencil circles "everything".
const statement = document.querySelector('[data-words]');
let words = [];
if (statement && !noMotion) {
  const parts = [];
  [...statement.childNodes].forEach(node => {
    if (node.nodeType === 3) {
      node.textContent.split(/(\s+)/).forEach(tok => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) parts.push(document.createTextNode(tok));
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = tok; parts.push(s); }
      });
    } else { node.classList.add('w'); parts.push(node); }
  });
  statement.textContent = '';
  parts.forEach(p => statement.appendChild(p));
  words = [...statement.querySelectorAll('.w')];
}
const circle = document.querySelector('.circled');

// 2. Drafts flow through the rules.
const system = document.querySelector('[data-scene="system"]');
const stream = system && system.querySelector('.stream');
const docs = stream ? [...stream.querySelectorAll('.doc')] : [];
const rules = stream ? [...stream.querySelectorAll('.gate__rules li')] : [];
const tilt = [-4, 3.5, -2.5, 5, -3.5, 2.5, -4.5];
const jolt = [10, -14, 8, -6, 12, -10, 7];
docs.forEach((d, i) => { d.style.setProperty('--r', tilt[i % tilt.length] + 'deg'); d.style.setProperty('--jy', jolt[i % jolt.length] + 'px'); });

// 3. The plan line draws as you read the steps.
const steps = document.querySelector('[data-line]');

function viewProgress(el, from, to) {
  const top = el.getBoundingClientRect().top, vh = window.innerHeight;
  return clamp((vh * from - top) / (vh * (from - to)));
}

function update() {
  ticking = false;
  if (nav) {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    const mid = nav.offsetHeight / 2;
    nav.classList.toggle('is-night', nightZones.some(z => { const r = z.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; }));
  }
  const vh = window.innerHeight;

  if (words.length) {
    const p = viewProgress(statement, 0.88, 0.32), n = words.length;
    words.forEach((w, i) => { w.style.opacity = (0.16 + 0.84 * clamp((p * (n + 2) - i) / 2.5)).toFixed(3); });
    if (circle) circle.style.setProperty('--draw', (1 - clamp((p - 0.62) / 0.3)).toFixed(3));
  }

  if (docs.length) {
    let p = 0.46;
    if (!noMotion) {
      const r = system.getBoundingClientRect();
      const span = r.height - vh;
      p = span > 10 ? clamp(-r.top / span) : 0.46;
    }
    const W = stream.clientWidth, dw = docs[0].offsetWidth || 170;
    const gx = W / 2, gap = dw * 1.32;
    const travel = gap * (docs.length + 0.9);
    let nearest = null, best = Infinity;
    docs.forEach((d, i) => {
      const cx = gx - gap * 0.75 - i * gap + p * travel;
      const c = clamp((cx - (gx - dw * 0.35)) / (dw * 0.7));
      d.style.setProperty('--x', (cx - dw / 2).toFixed(1) + 'px');
      d.style.setProperty('--c', c.toFixed(3));
      const dist = Math.abs(cx - gx);
      if (dist < best) { best = dist; nearest = c; }
    });
    const lit = noMotion ? rules.length : nearest === null ? 0 : Math.floor(nearest * (rules.length + 0.999));
    rules.forEach((li, i) => li.classList.toggle('on', i < lit));
  }

  if (steps && !noMotion) steps.style.setProperty('--line', viewProgress(steps, 0.82, 0.42).toFixed(3));
}

let ticking = false;
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
update();

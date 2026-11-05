/* Encoded · shared behaviour. */

/* ===== YOUR LINKS: the only place these URLs live. =====
   BUY_URL            data-cta="buy"             $99 House Rules Kit checkout (Stripe or Lemon Squeezy payment link)
   BUY_CALIBRATED_URL data-cta="buy-calibrated"  $249 Calibrated Kit checkout
   BOOKING_URL        data-cta="book"            Cal.com intro call (custom systems)
   FORM_URL           data-cta="form"            Tally "what's breaking" form
   Until a checkout link is set, its buttons fall back to FORM_URL so nobody hits a dead end. */
const BUY_URL            = "";  /* paste the $99 payment link here */
const BUY_CALIBRATED_URL = "";  /* paste the $249 payment link here */
const BOOKING_URL        = "https://cal.com/zurva-aziz-encoded/30min";
const FORM_URL           = "https://tally.so/r/RGl40j";

const LINKS = { buy: BUY_URL || FORM_URL, "buy-calibrated": BUY_CALIBRATED_URL || FORM_URL, book: BOOKING_URL, form: FORM_URL };
document.querySelectorAll('[data-cta]').forEach(a => {
  const url = LINKS[a.dataset.cta];
  if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
});

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* nav background once scrolled */
const nav = document.getElementById('nav');
const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* reveal on enter */
const reveal = document.querySelectorAll('[data-reveal], .tray');
if (reduce || !('IntersectionObserver' in window)) {
  reveal.forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
  reveal.forEach(el => io.observe(el));
}
document.querySelectorAll('.tray .kf').forEach((k, i) => { k.style.transitionDelay = (i * 90) + 'ms'; });

/* hero glass cards tilt with the cursor */
const hero = document.querySelector('.hero'), cards = document.getElementById('cards');
if (hero && cards && !reduce) {
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    cards.style.transform = `rotateX(${-y * 10}deg) rotateY(${x * 14}deg)`;
  });
  hero.addEventListener('pointerleave', () => { cards.style.transform = ''; });
}

/* before / after: the same draft, without and with a House Rules Kit (sample kit: Fernhill PR, fictional) */
const PAIRS = [
  ["6 Financial Mistakes Every New Parent Makes", "5 money mistakes new parents make, according to a chartered financial planner", "S2 · H2 · H3"],
  ["In today's fast-paced world, becoming a parent is a thrilling journey!", "Most new parents budget for nappies and a pram. Far fewer plan for the paperwork.", "V1 · N1 · L6"],
  ["Finance expert Mia Okafor from Ledgerwise shares her top tips:", "Mia Okafor, chartered financial planner at Ledgerwise, says:", "F1"],
  ["Not having a will. Tip: Get one written ASAP.", "Not updating your will. Why it matters: a court decides who raises your child.", "S3"],
  ["No emergency fund. Tip: Save 3 months of expenses.", "Treating savings as an emergency fund. What to do: keep three months aside.", "L3 · S4"],
  ["Start a color-coded budget — it's a game-changer.", "Start a colour-coded budget, and review it every month.", "L1 · L5 · N1"]
];
function fillDraft(el, after) {
  const sw = p => `<span class="sw"><span class="o">${p[0]}</span><span class="n">${p[1]}</span></span><span class="rt">${p[2]}</span>`;
  el.innerHTML =
    `<div class="tagline"><span>${after ? 'With your kit' : 'AI today'}</span><span>${after ? 'All rules pass' : '15 mistakes'}</span></div>` +
    `<div class="hd">${sw(PAIRS[0])}</div><p>${sw(PAIRS[1])}</p><p style="margin-top:10px">${sw(PAIRS[2])}</p>` +
    `<ol><li>${sw(PAIRS[3])}</li><li>${sw(PAIRS[4])}</li><li>${sw(PAIRS[5])}</li></ol>`;
  if (!after) el.querySelectorAll('.n, .rt').forEach(n => n.setAttribute('aria-hidden', 'true'));
}
const cmp = document.getElementById('cmp');
if (cmp) {
  fillDraft(document.getElementById('cb'), false);
  fillDraft(document.getElementById('ca'), true);
  document.getElementById('ca').setAttribute('aria-hidden', 'true');
  let auto = !reduce, drag = false, visible = true;
  const t0 = performance.now();
  const set = v => cmp.style.setProperty('--cut', Math.max(4, Math.min(96, v)) + '%');
  const pos = e => { const r = cmp.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
  cmp.addEventListener('pointerdown', e => { drag = true; auto = false; pos(e); });
  window.addEventListener('pointerup', () => { drag = false; });
  cmp.addEventListener('pointermove', e => { if (drag) pos(e); });
  cmp.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { auto = false; const cur = parseFloat(getComputedStyle(cmp).getPropertyValue('--cut')) || 50; set(cur + (e.key === 'ArrowRight' ? 5 : -5)); } });
  cmp.tabIndex = 0;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(cmp);
  const loop = now => { if (auto && visible) set(50 + 36 * Math.sin((now - t0) / 1000 * 0.55)); requestAnimationFrame(loop); };
  if (reduce) set(50); else requestAnimationFrame(loop);
}

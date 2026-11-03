/* Encoded: shared behaviour for every page. Loaded before any page-specific script. */
document.body.classList.add('js');

/* ===== YOUR LINKS: the only place these two URLs live. Both pages read them. =====
   data-cta="book" links go to Cal.com, data-cta="form" links go to Tally. ===== */
const BOOKING_URL = "https://cal.com/zurva-aziz-encoded/30min";  /* Cal.com intro call */
const FORM_URL    = "https://tally.so/r/RGl40j";  /* Tally "what's breaking" form */
document.querySelectorAll('[data-cta="book"]').forEach(a=>{ if(BOOKING_URL){a.href=BOOKING_URL;a.target="_blank";a.rel="noopener";} });
document.querySelectorAll('[data-cta="form"]').forEach(a=>{ if(FORM_URL){a.href=FORM_URL;a.target="_blank";a.rel="noopener";} });

window.noMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const noMotion=window.noMotion;

/* mobile menu */
function toggleMenu(btn){
  const links=document.getElementById('navLinks');
  const open=links.classList.toggle('open');
  btn.setAttribute('aria-expanded',open);
}
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{
  document.getElementById('navLinks').classList.remove('open');
}));

/* ---------- scroll-triggered marks ---------- */
if(!noMotion && 'IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add(e.target.classList.contains('hl')?'hl-on':'in-view');
        io.unobserve(e.target);
      }
    });
  },{threshold:0.6});
  document.querySelectorAll('.hl').forEach(el=>io.observe(el));
  document.querySelectorAll('.desk .card, .folder, .step, .f-stamp').forEach((el,i)=>{el.style.transitionDelay=((i%3)*90)+'ms';io.observe(el);});
}else{
  document.querySelectorAll('.hl').forEach(el=>el.classList.add('hl-on'));
  document.querySelectorAll('.desk .card, .folder, .step, .f-stamp').forEach(el=>el.classList.add('in-view'));
}

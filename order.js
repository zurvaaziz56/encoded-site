/* Encoded order form: step-by-step intake, then Stripe checkout via /api/order. */
(function () {
  const form = document.getElementById('oform');
  if (!form) return;
  const steps = [...form.querySelectorAll('.ostep')];
  const bar = document.getElementById('obar'), count = document.getElementById('ocount');
  const back = document.getElementById('oback'), next = document.getElementById('onext'), submit = document.getElementById('osubmit');
  const errBox = document.getElementById('oerror');
  const fileInput = document.getElementById('files'), fileList = document.getElementById('filelist'), drop = document.getElementById('drop');
  const MAX_BYTES = 3 * 1024 * 1024;
  const KEY = 'encoded-order-draft';
  let step = 0, files = [];

  /* plan from the link (?tier=calibrated) */
  const params = new URLSearchParams(location.search);
  if (params.get('tier') === 'calibrated') form.querySelector('input[value="calibrated"]').checked = true;

  /* chips */
  form.querySelectorAll('.chips').forEach(group => {
    const one = group.classList.contains('chips--one');
    group.addEventListener('click', e => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      if (one) group.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' && !one ? 'false' : 'true');
      save();
    });
    group.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
  });
  const chipValues = name => [...form.querySelectorAll(`.chips[data-name="${name}"] .chip[aria-pressed="true"]`)].map(c => c.dataset.v);

  /* files */
  const fmt = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  function renderFiles() {
    fileList.innerHTML = '';
    files.forEach((f, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="fl__ic" aria-hidden="true"></span><b></b><small>${fmt(f.size)}</small><button type="button" aria-label="Remove">×</button>`;
      li.querySelector('b').textContent = f.name;
      li.querySelector('button').onclick = () => { files.splice(i, 1); renderFiles(); };
      fileList.appendChild(li);
    });
  }
  function addFiles(list) {
    for (const f of list) {
      if (files.length >= 8) break;
      if (files.some(x => x.name === f.name && x.size === f.size)) continue;
      files.push(f);
    }
    const total = files.reduce((a, f) => a + f.size, 0);
    if (total > MAX_BYTES) { showError('Those files are over 3 MB in total. Remove one, or paste the text instead.'); }
    else showError('');
    renderFiles();
  }
  fileInput.addEventListener('change', () => addFiles(fileInput.files));
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));

  /* save and restore text answers (this browser only) */
  function save() {
    try {
      const data = Object.fromEntries(new FormData(form));
      ['tools', 'formats', 'english'].forEach(n => data[n] = chipValues(n));
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* storage unavailable: fine */ }
  }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) {
      Object.entries(saved).forEach(([k, v]) => {
        if (Array.isArray(v)) { v.forEach(val => { const c = form.querySelector(`.chips[data-name="${k}"] .chip[data-v="${CSS.escape(val)}"]`); if (c) c.setAttribute('aria-pressed', 'true'); }); return; }
        const el = form.elements[k];
        if (!el || k === 'consent' || k === 'tier') return;
        if (el.value === '' && typeof v === 'string') el.value = v;
      });
    }
  } catch (e) { /* ignore */ }
  form.addEventListener('input', save);

  /* steps */
  function showError(msg) { errBox.textContent = msg; errBox.classList.toggle('is-on', !!msg); }
  function mark(el) {
    const box = el.type === 'checkbox' ? el.closest('.consent') : el;
    box.classList.add('is-missing'); el.focus();
    const clear = () => { box.classList.remove('is-missing'); el.removeEventListener('input', clear); el.removeEventListener('change', clear); };
    el.addEventListener('input', clear); el.addEventListener('change', clear);
  }
  function validate(i) {
    const s = steps[i];
    for (const el of s.querySelectorAll('[required]')) {
      if (el.type === 'checkbox' ? !el.checked : !el.value.trim()) { mark(el); return el.type === 'checkbox' ? 'Please tick the box to confirm.' : 'Please fill in the highlighted field.'; }
      if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) { mark(el); return 'Please check your email address.'; }
    }
    for (const g of s.querySelectorAll('.chips[data-required]')) {
      if (!chipValues(g.dataset.name).length) { g.classList.add('is-missing'); g.addEventListener('click', () => g.classList.remove('is-missing'), { once: true }); return 'Please pick at least one option.'; }
    }
    if (i === 4) {
      const pasted = (form.elements.pasted.value || '').trim();
      if (!files.length && pasted.length < 200) return 'Please add at least 3 published pieces (files or pasted text).';
      if (files.reduce((a, f) => a + f.size, 0) > MAX_BYTES) return 'Those files are over 3 MB in total. Remove one, or paste the text instead.';
    }
    return '';
  }
  function go(i) {
    step = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach((s, k) => s.classList.toggle('is-on', k === step));
    bar.style.width = ((step + 1) / steps.length * 100) + '%';
    count.textContent = `Step ${step + 1} of ${steps.length}`;
    back.style.visibility = step === 0 ? 'hidden' : 'visible';
    next.hidden = step === steps.length - 1;
    submit.hidden = step !== steps.length - 1;
    if (step === steps.length - 1) renderSummary();
    showError('');
    const first = steps[step].querySelector('input:not([type=hidden]):not([type=file]), textarea');
    if (first && window.matchMedia('(min-width: 700px)').matches) first.focus({ preventScroll: true });
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  next.addEventListener('click', () => { const e = validate(step); if (e) return showError(e); go(step + 1); });
  back.addEventListener('click', () => go(step - 1));
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && step < steps.length - 1) { e.preventDefault(); next.click(); }
  });

  function renderSummary() {
    const f = form.elements;
    const rows = [['Agency', f.agency.value], ['Email', f.email.value], ['AI tools', chipValues('tools').join(', ')], ['Formats', chipValues('formats').join(', ')], ['English', chipValues('english').join(', ')], ['Samples', files.length ? files.length + ' file(s)' : 'Pasted text']];
    document.getElementById('summary').innerHTML = rows.map(r => `<div><span>${r[0]}</span><b></b></div>`).join('');
    document.querySelectorAll('#summary b').forEach((b, i) => b.textContent = rows[i][1] || '—');
  }

  const toBase64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(f); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    for (let i = 0; i < steps.length; i++) { const err = validate(i); if (err) { go(i); return showError(err); } }
    submit.disabled = true; submit.textContent = 'Sending…';
    try {
      const f = form.elements;
      const payload = {
        tier: form.querySelector('input[name="tier"]:checked').value,
        name: f.name.value.trim(), email: f.email.value.trim(), agency: f.agency.value.trim(), website: f.website.value.trim(),
        tools: chipValues('tools'), formats: chipValues('formats'), english: chipValues('english')[0] || '',
        priority: f.priority.value.trim(), outlets: f.outlets.value.trim(),
        headlines: f.headlines.value.trim(), labels: f.labels.value.trim(), quotes: f.quotes.value.trim(), numbers: f.numbers.value.trim(),
        banned: f.banned.value.trim(), names: f.names.value.trim(), punctuation: f.punctuation.value.trim(), style: f.style.value.trim(),
        fixes: f.fixes.value.trim(), baddraft: f.baddraft.value.trim(), pushback: f.pushback.value.trim(),
        pasted: f.pasted.value.trim(), consent: f.consent.checked,
        files: await Promise.all(files.map(async x => ({ name: x.name, type: x.type || 'application/octet-stream', data: await toBase64(x) })))
      };
      const r = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const out = await r.json().catch(() => ({}));
      if (!r.ok || !out.ok) throw new Error(out.error || 'Something went wrong sending your order.');
      try { localStorage.removeItem(KEY); } catch (_) {}
      location.href = out.checkoutUrl || `/thanks?status=received&order=${encodeURIComponent(out.orderId || '')}`;
    } catch (err) {
      showError(err.message + ' Please try again, or book a call and we will sort it out.');
      submit.disabled = false; submit.textContent = 'Continue to payment';
    }
  });

  go(0);
})();

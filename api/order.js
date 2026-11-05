/* Encoded: receive a kit order, email it to Encoded, then start Stripe Checkout.
 *
 * Vercel environment variables (Project > Settings > Environment Variables):
 *   RESEND_API_KEY     required. Sends the order email (resend.com, free tier is enough).
 *   ORDER_EMAIL_TO     required. Where orders go, e.g. your own inbox.
 *   ORDER_EMAIL_FROM   required. A sender on a domain verified in Resend, e.g. "Encoded orders <orders@getencoded.co>".
 *   STRIPE_SECRET_KEY  optional but needed to take payment. Without it, orders are still emailed and the
 *                      customer sees "we'll send a payment link".
 *   SITE_URL           optional. Defaults to https://www.getencoded.co
 *
 * Nothing secret lives in this file: keys are read from the environment only.
 */

const PLANS = {
  kit: { name: 'House Rules Kit', amount: 9900 },
  calibrated: { name: 'Calibrated Kit', amount: 24900 }
};
const MAX_FILES = 8;
const MAX_FILE_BYTES = 3 * 1024 * 1024;

function clean(v, max = 4000) {
  return typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '';
}
function list(v) {
  return Array.isArray(v) ? v.filter(x => typeof x === 'string').map(x => clean(x, 60)).slice(0, 12) : [];
}

/* The order as Markdown, numbered to match the kit builder's questionnaire, so it can be pasted straight in. */
function intakeMarkdown(o, orderId) {
  const line = (n, q, a) => `${n} ${q}: ${a || '(skipped)'}`;
  return [
    `# Intake answers: ${o.agency} (order ${orderId})`,
    ``,
    `Tier: ${PLANS[o.tier].name}`,
    ``,
    line('1.1', 'Agency or team name', o.agency),
    line('1.2', 'Name and email', `${o.name} <${o.email}>`),
    line('1.3', 'Website', o.website),
    line('1.5', 'AI tools', o.tools.join(', ')),
    ``,
    line('2.1', 'What we write most', o.formats.join(', ')),
    line('2.2', 'Matters most', o.priority),
    line('2.3', 'Who for', o.outlets),
    line('2.4', 'UK or US English', o.english),
    ``,
    line('3.1', 'Headlines', o.headlines),
    line('3.2', 'Fixed labels', o.labels),
    line('3.3', 'Experts and quotes', o.quotes),
    line('3.4', 'Numbers, dates, money', o.numbers),
    line('3.5', 'Never use', o.banned),
    line('3.6', 'Always exact', o.names),
    line('3.7', 'Punctuation', o.punctuation),
    line('3.8', 'Style', o.style),
    ``,
    line('4.1', 'What editors fix most', '\n' + o.fixes),
    line('4.2', 'Bad AI draft', o.baddraft ? '\n' + o.baddraft : ''),
    line('4.3', 'Client pushback', o.pushback),
    ``,
    line('5.1', 'Samples', `${o.files.length} file(s) attached${o.pasted ? ', plus pasted text below' : ''}`),
    line('6.1', 'Confirmation', o.consent ? 'yes' : 'no'),
    o.pasted ? `\n## Pasted samples\n\n${o.pasted}` : ''
  ].join('\n');
}

async function sendEmail(o, orderId, md) {
  const attachments = [
    { filename: `${orderId}-intake-answers.md`, content: Buffer.from(md, 'utf8').toString('base64') },
    ...o.files.map(f => ({ filename: f.name, content: f.data }))
  ];
  const text = [
    `New ${PLANS[o.tier].name} order ${orderId} from ${o.agency}.`,
    `Payment: check Stripe for order ${orderId} before you build.`,
    ``,
    `To build the kit: open Claude with the encoded-kit-builder skill, say "build a kit for ${o.agency}", and attach the files from this email.`,
    ``,
    md
  ].join('\n');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.ORDER_EMAIL_FROM,
      to: [process.env.ORDER_EMAIL_TO],
      reply_to: o.email,
      subject: `Kit order ${orderId} · ${o.agency} · ${PLANS[o.tier].name}`,
      text,
      attachments
    })
  });
  if (!r.ok) throw new Error(`email ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

async function createCheckout(o, orderId, site) {
  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('customer_email', o.email);
  p.set('client_reference_id', orderId);
  p.set('success_url', `${site}/thanks?status=paid&order=${orderId}`);
  p.set('cancel_url', `${site}/order?cancelled=1&tier=${o.tier}`);
  p.set('line_items[0][quantity]', '1');
  p.set('line_items[0][price_data][currency]', 'usd');
  p.set('line_items[0][price_data][unit_amount]', String(PLANS[o.tier].amount));
  p.set('line_items[0][price_data][product_data][name]', PLANS[o.tier].name);
  p.set('line_items[0][price_data][product_data][description]', `Order ${orderId} · ${o.agency}`.slice(0, 200));
  p.set('metadata[order_id]', orderId);
  p.set('metadata[agency]', o.agency.slice(0, 200));
  p.set('payment_intent_data[metadata][order_id]', orderId);
  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: p.toString()
  });
  const out = await r.json().catch(() => ({}));
  if (!r.ok || !out.url) throw new Error(`stripe ${r.status}: ${out.error ? out.error.message : 'no url'}`);
  return out.url;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'Use POST.' }); }

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'We could not read your order.' });

  const o = {
    tier: PLANS[b.tier] ? b.tier : 'kit',
    name: clean(b.name, 120), email: clean(b.email, 200), agency: clean(b.agency, 160), website: clean(b.website, 300),
    tools: list(b.tools), formats: list(b.formats), english: clean(b.english, 40),
    priority: clean(b.priority, 300), outlets: clean(b.outlets, 600),
    headlines: clean(b.headlines), labels: clean(b.labels), quotes: clean(b.quotes), numbers: clean(b.numbers),
    banned: clean(b.banned), names: clean(b.names), punctuation: clean(b.punctuation), style: clean(b.style, 600),
    fixes: clean(b.fixes), baddraft: clean(b.baddraft, 12000), pushback: clean(b.pushback),
    pasted: clean(b.pasted, 60000), consent: b.consent === true,
    files: []
  };

  const missing = [];
  if (!o.name) missing.push('your name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email)) missing.push('a valid email');
  if (!o.agency) missing.push('your agency');
  if (!o.tools.length) missing.push('your AI tools');
  if (!o.formats.length) missing.push('what you write');
  if (!o.fixes) missing.push('what your editors fix');
  if (!o.consent) missing.push('the confirmation box');
  if (missing.length) return res.status(400).json({ ok: false, error: `Please add ${missing.join(', ')}.` });

  if (Array.isArray(b.files)) {
    for (const f of b.files.slice(0, MAX_FILES)) {
      if (!f || typeof f.data !== 'string' || typeof f.name !== 'string') continue;
      const bytes = Math.floor(f.data.length * 3 / 4);
      if (bytes > MAX_FILE_BYTES) return res.status(413).json({ ok: false, error: `${f.name} is too large. Keep files under 3 MB in total.` });
      o.files.push({ name: f.name.replace(/[^\w.\- ()&]/g, '_').slice(0, 120), data: f.data });
    }
  }
  if (!o.files.length && o.pasted.length < 200) return res.status(400).json({ ok: false, error: 'Please add at least 3 published pieces.' });

  if (!process.env.RESEND_API_KEY || !process.env.ORDER_EMAIL_TO || !process.env.ORDER_EMAIL_FROM) {
    console.error('Order system not configured: set RESEND_API_KEY, ORDER_EMAIL_TO and ORDER_EMAIL_FROM.');
    return res.status(503).json({ ok: false, error: 'Ordering is not switched on yet.' });
  }

  const orderId = 'EN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const md = intakeMarkdown(o, orderId);

  try {
    await sendEmail(o, orderId, md);
  } catch (e) {
    console.error('Order email failed', orderId, e.message);
    return res.status(502).json({ ok: false, error: 'We could not send your order.' });
  }

  const site = (process.env.SITE_URL || 'https://www.getencoded.co').replace(/\/$/, '');
  if (!process.env.STRIPE_SECRET_KEY) return res.status(200).json({ ok: true, orderId });
  try {
    const checkoutUrl = await createCheckout(o, orderId, site);
    return res.status(200).json({ ok: true, orderId, checkoutUrl });
  } catch (e) {
    console.error('Stripe checkout failed', orderId, e.message);
    return res.status(200).json({ ok: true, orderId });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };
module.exports._test = { intakeMarkdown };

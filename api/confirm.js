/* Encoded: confirm a payment with Stripe, then build the kit automatically.
 *
 * Called by /thanks after Stripe Checkout: GET /api/confirm?session_id=cs_...
 * It asks Stripe directly whether the session is paid (no webhook needed), marks the session so a
 * kit is only built once, then runs the build in the background and emails the kit to Encoded for
 * review. Extra environment variables: ANTHROPIC_API_KEY and KIT_BUILDER_SKILL_ID.
 */
const { waitUntil } = require('@vercel/functions');
const { buildKit, emailKit, emailFailure } = require('../lib/kit-build');

async function stripe(path, form) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: form ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body: form ? new URLSearchParams(form).toString() : undefined
  });
  const out = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`stripe ${r.status}: ${out.error ? out.error.message : ''}`);
  return out;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const id = String((req.query && req.query.session_id) || '');
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return res.status(400).json({ ok: false, error: 'Missing payment reference.' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ ok: false, error: 'Payments are not switched on.' });

  let session;
  try { session = await stripe(`checkout/sessions/${id}`); }
  catch (e) { console.error('confirm: session lookup failed', e.message); return res.status(502).json({ ok: false, error: 'Could not check the payment.' }); }

  const m = session.metadata || {};
  const paid = session.payment_status === 'paid';
  if (!paid) return res.status(200).json({ ok: true, paid: false });

  const automated = process.env.ANTHROPIC_API_KEY && process.env.KIT_BUILDER_SKILL_ID && process.env.RESEND_API_KEY && m.files;
  if (m.build) return res.status(200).json({ ok: true, paid: true, building: m.build !== 'failed', order: m.order_id });
  if (!automated) return res.status(200).json({ ok: true, paid: true, building: false, order: m.order_id });

  try { await stripe(`checkout/sessions/${id}`, { 'metadata[build]': 'started' }); }
  catch (e) { console.error('confirm: could not mark session', e.message); return res.status(200).json({ ok: true, paid: true, building: false, order: m.order_id }); }

  const order = {
    orderId: m.order_id, agency: m.agency || 'your agency', email: m.email || session.customer_email || '',
    tier: m.tier || 'kit', slug: m.slug || 'house-rules', fileIds: m.files.split(',').filter(Boolean)
  };
  // Stop waiting just before the function's time limit, so a slow build becomes a "build it by hand" email, not silence.
  const limit = Number(process.env.BUILD_TIME_LIMIT_MS || 270000);
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`still running after ${Math.round(limit / 1000)} seconds`)), limit); });
  timeout.catch(() => {});
  waitUntil((async () => {
    try {
      const result = await Promise.race([buildKit(order), timeout]).finally(() => clearTimeout(timer));
      await emailKit(order, result);
      await stripe(`checkout/sessions/${id}`, { 'metadata[build]': 'done' }).catch(() => {});
    } catch (e) {
      console.error('build failed', order.orderId, e.message);
      await stripe(`checkout/sessions/${id}`, { 'metadata[build]': 'failed' }).catch(() => {});
      await emailFailure(order, e);
    }
  })());
  return res.status(200).json({ ok: true, paid: true, building: true, order: order.orderId });
};

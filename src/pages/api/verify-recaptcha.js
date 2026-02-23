const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.RECAPTCHA_V3_SECRET_KEY;
  if (!secret) {
    return res.status(200).json({ ok: true, score: 1 });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { token, action } = body;
    if (!token) {
      return res.status(400).json({ ok: false, error: 'Missing token' });
    }

    const form = new URLSearchParams();
    form.append('secret', secret);
    form.append('response', token);
    if (req.headers['x-forwarded-for']) {
      form.append('remoteip', req.headers['x-forwarded-for'].split(',')[0].trim());
    } else if (req.socket && req.socket.remoteAddress) {
      form.append('remoteip', req.socket.remoteAddress);
    }

    const verifyRes = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const data = await verifyRes.json();

    if (!data.success) {
      return res.status(200).json({ ok: false, score: 0, errors: data['error-codes'] });
    }

    const score = typeof data.score === 'number' ? data.score : 0;
    const expectedAction = action || 'homepage';
    if (data.action && data.action !== expectedAction) {
      return res.status(200).json({ ok: false, score: 0, error: 'action_mismatch' });
    }

    return res.status(200).json({ ok: true, score, action: data.action });
  } catch (e) {
    console.error('verify-recaptcha error:', e);
    return res.status(500).json({ ok: false, score: 0 });
  }
}

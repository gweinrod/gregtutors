const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export async function verifyRecaptchaToken(token, expectedAction, req) {
  const secret = process.env.RECAPTCHA_V3_SECRET_KEY;
  if (!secret) return { ok: true, score: 1, action: expectedAction };
  if (!token) return { ok: false, score: 0 };

  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);
  if (req && req.headers['x-forwarded-for']) {
    form.append('remoteip', req.headers['x-forwarded-for'].split(',')[0].trim());
  } else if (req && req.socket && req.socket.remoteAddress) {
    form.append('remoteip', req.socket.remoteAddress);
  }

  const verifyRes = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const data = await verifyRes.json();

  if (!data.success) return { ok: false, score: 0 };
  const score = typeof data.score === 'number' ? data.score : 0;
  if (data.action && data.action !== expectedAction) return { ok: false, score: 0 };
  return { ok: true, score, action: data.action || expectedAction };
}

export const RECAPTCHA_SCORE_THRESHOLDS = { contact: 0.6 };

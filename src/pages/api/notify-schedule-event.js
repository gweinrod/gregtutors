import { Resend } from 'resend';
import { getAdminNotifyEmail } from '../../lib/adminEmail';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Greg Tutors <onboarding@resend.dev>';

const CAT_LABELS = { inperson: 'In Person', remote: 'Remote', unavailable: 'Unavailable' };

function buildAddedHtml(payload) {
  const { userName, userEmail, title, date, start, end, cat, is_recurring, recurrence_interval } = payload;
  const recurrence = is_recurring
    ? (recurrence_interval === 2 ? 'Bi-weekly' : 'Weekly') + ' recurring'
    : 'One-time';
  const dateLine = date ? `Date: ${date}` : 'Recurring (no single date)';
  const rows = [
    ['User', userName || userEmail || '—'],
    ['User email', userEmail || '—'],
    ['Client / Title', title || '—'],
    ['Type', recurrence],
    [dateLine.split(':')[0], date || '—'],
    ['Time', `${start || ''} – ${end || ''}`.trim()],
    ['Category', CAT_LABELS[cat] || cat || '—'],
  ].filter(([, v]) => v && v !== '—');
  const body = rows
    .map(([label, value]) => `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;font-weight:600;">${label}</td><td style="padding:6px 0;">${String(value)}</td></tr>`)
    .join('');
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.5;">
  <h2 style="margin-bottom: 16px;">Schedule event added</h2>
  <table style="border-collapse: collapse;">${body}</table>
</body>
</html>`;
}

function buildDeletedHtml(payload) {
  const { userName, userEmail, title, date, start, end, cat } = payload;
  const rows = [
    ['User', userName || userEmail || '—'],
    ['User email', userEmail || '—'],
    ['Client / Title', title || '—'],
    ['Date', date || '(recurring)'],
    ['Time', `${start || ''} – ${end || ''}`.trim()],
    ['Category', CAT_LABELS[cat] || cat || '—'],
  ].filter(([, v]) => v);
  const body = rows
    .map(([label, value]) => `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;font-weight:600;">${label}</td><td style="padding:6px 0;">${String(value)}</td></tr>`)
    .join('');
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.5;">
  <h2 style="margin-bottom: 16px;">Schedule event deleted</h2>
  <table style="border-collapse: collapse;">${body}</table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { action, userName, userEmail, title, date, start, end, cat, is_recurring, recurrence_interval } = body;

    if (action !== 'added' && action !== 'deleted') {
      return res.status(400).json({ error: 'Invalid action; use "added" or "deleted"' });
    }

    const adminEmail = getAdminNotifyEmail();
    if (!resendApiKey || !adminEmail) {
      return res.status(200).json({ ok: true });
    }

    const resend = new Resend(resendApiKey);
    const subject =
      action === 'added'
        ? `[Greg Tutors] Schedule event added${title ? `: ${title}` : ''}`
        : `[Greg Tutors] Schedule event deleted${title ? `: ${title}` : ''}`;
    const html =
      action === 'added'
        ? buildAddedHtml({ userName, userEmail, title, date, start, end, cat, is_recurring, recurrence_interval })
        : buildDeletedHtml({ userName, userEmail, title, date, start, end, cat });

    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Notify schedule event error:', e);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getAdminNotifyEmail } from '../../lib/adminEmail';
import { verifyRecaptchaToken, RECAPTCHA_SCORE_THRESHOLDS } from '../../lib/recaptchaServer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Greg Tutors Contact <onboarding@resend.dev>';

function buildNotificationHtml(payload) {
  const { email, myName, studentName, about, location, bestReachedBy, contactInfo, message } = payload;
  const rows = [
    ['Email', email],
    ['My name is', myName],
    ["Student's name", studentName || '—'],
    ['This is about', about || '—'],
    ['Location', location || '—'],
    ['Best reached by', bestReachedBy || '—'],
    ['Contact number/email', contactInfo || '—'],
    ['Message', message],
  ];
  const body = rows
    .map(([label, value]) => `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;font-weight:600;">${label}</td><td style="padding:6px 0;">${String(value).replace(/\n/g, '<br>')}</td></tr>`)
    .join('');
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.5;">
  <h2 style="margin-bottom: 16px;">New contact form submission</h2>
  <table style="border-collapse: collapse;">${body}</table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      email,
      myName,
      studentName,
      about,
      location,
      bestReachedBy,
      contactInfo,
      message,
      recaptchaToken,
    } = body || {};

    if (!email || !myName || !message) {
      return res.status(400).json({ error: 'Missing required fields: email, myName, message' });
    }

    const { ok, score } = await verifyRecaptchaToken(recaptchaToken || '', 'contact', req);
    const contactThreshold = RECAPTCHA_SCORE_THRESHOLDS.contact ?? 0.6;
    if (!ok || score < contactThreshold) {
      return res.status(400).json({ error: 'Verification failed. Please try again.' });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase env vars');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from('contact_submissions').insert({
      email,
      my_name: myName,
      student_name: studentName || null,
      about: about || null,
      location: location || null,
      best_reached_by: bestReachedBy || null,
      contact_info: contactInfo || null,
      message,
    });

    if (error) {
      console.error('Contact submission error:', error);
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    const adminEmail = getAdminNotifyEmail();
    if (resendApiKey && adminEmail) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          subject: `[Greg Tutors] New contact from ${myName}`,
          html: buildNotificationHtml({ email, myName, studentName, about, location, bestReachedBy, contactInfo, message }),
        });
      } catch (err) {
        console.error('Contact notification email error:', err);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Contact API error:', e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

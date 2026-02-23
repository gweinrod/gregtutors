import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/backfill-schedule-name
 * Updates all schedule_events with user_email = caller's email to title = body.name.
 * Called after login so the displayed name on every session/event matches the user's OAuth name.
 * Body: { name: string }. Requires Bearer token (any logged-in user). Uses service role to update.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server config missing' });
  }

  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
  if (userError || !user?.email) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : null;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { error } = await adminClient
    .from('schedule_events')
    .update({ title: name })
    .eq('user_email', user.email);

  if (error) {
    console.error('backfill-schedule-name update error:', error);
    return res.status(500).json({ error: 'Failed to update schedule names' });
  }

  return res.status(200).json({ ok: true });
}

import { createClient } from '@supabase/supabase-js';
import { getAdminNotifyEmail } from '../../lib/adminEmail';

/**
 * POST /api/add-client
 * Adds a client to public.clients (auth_user_id = null) so they appear in the Schedule client dropdown.
 * When they sign in, login sync upserts by email and updates name from OAuth.
 * Body: { email: string, name?: string }. Admin only. Requires SUPABASE_SERVICE_ROLE_KEY.
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
  const adminEmail = getAdminNotifyEmail();

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server config missing' });
  }

  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (user.email !== adminEmail) {
    return res.status(403).json({ error: 'Admin only' });
  }

  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : null;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data: existing } = await adminClient.from('clients').select('auth_user_id').eq('email', email).maybeSingle();
  if (existing?.auth_user_id) {
    return res.status(200).json({ ok: true }); // already a signed-in client, no change
  }

  const { error } = await adminClient
    .from('clients')
    .upsert(
      { email, name: name || email, auth_user_id: null },
      { onConflict: 'email' }
    );

  if (error) {
    console.error('add-client upsert error:', error);
    return res.status(500).json({ error: 'Failed to add client' });
  }

  return res.status(200).json({ ok: true });
}

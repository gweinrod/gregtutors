import { createClient } from '@supabase/supabase-js';
import { getAdminNotifyEmail } from '../../lib/adminEmail';

/**
 * GET /api/list-users
 * Returns list of registered users { email, name } for admin schedule client selector.
 * Requires Authorization: Bearer <access_token> and caller email must match ADMIN_NOTIFY_EMAIL.
 * If SUPABASE_SERVICE_ROLE_KEY is not set, returns [] (admin can still use "New client").
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization', users: [] });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const adminEmail = getAdminNotifyEmail();

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server config missing', users: [] });
  }

  // Verify caller is admin using anon client + JWT
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid token', users: [] });
  }
  if (user.email !== adminEmail) {
    return res.status(403).json({ error: 'Admin only', users: [] });
  }

  // Need service role to read all rows from public.clients (RLS only allows own row otherwise)
  if (!serviceRoleKey) {
    const raw = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.warn('list-users: SUPABASE_SERVICE_ROLE_KEY not set or empty. In .env.local use the service_role secret from Supabase Dashboard → Settings → API → Project API keys (long JWT). Has key:', !!raw, 'length:', raw ? String(raw).length : 0);
    return res.status(200).json({ users: [] });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  // Get auth.users for backfill and fallback when clients table empty/fails
  const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers({ perPage: 500 });
  const authList = !authError && authUsers?.length
    ? authUsers
        .filter((u) => u.email)
        .map((u) => ({
          email: u.email,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email || ''
        }))
    : [];

  // Backfill: sync auth.users into public.clients by email (set auth_user_id and name)
  if (authList.length) {
    const rows = authUsers
      .filter((u) => u.email)
      .map((u) => ({
        email: u.email,
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email || null,
        auth_user_id: u.id
      }));
    const { error: upsertErr } = await adminClient.from('clients').upsert(rows, { onConflict: 'email' });
    if (upsertErr) console.error('list-users backfill upsert error:', upsertErr);
  }

  const { data: rows, error } = await adminClient.from('clients').select('email, name').order('name');
  if (error) {
    console.error('list-users clients select error:', error);
    // Fallback: use auth.users if clients select fails (e.g. migration not run, table missing)
    const fallback = authList
      .map((r) => ({ email: r.email || '', name: r.name || r.email || '' }))
      .filter((r) => r.email)
      .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
    return res.status(200).json({ users: fallback });
  }

  let list = (rows || []).map((r) => ({
    email: r.email || '',
    name: r.name || r.email || ''
  })).filter((r) => r.email).sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));

  // Fallback: if clients is empty, use auth.users (e.g. right after migration before backfill)
  if (list.length === 0 && authList.length) {
    list = authList
      .map((r) => ({ email: r.email || '', name: r.name || r.email || '' }))
      .filter((r) => r.email)
      .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
  }

  return res.status(200).json({ users: list });
}

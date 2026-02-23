# Supabase

## Migrations

Run SQL migrations in the **Supabase Dashboard → SQL Editor** (paste and run the contents of each file in order).

- **`migrations/20250213000000_create_clients_table.sql`** – Creates `public.clients` (all users who have ever logged in) and RLS. Required for the admin Schedule “select client” dropdown. Run this once so the table exists; the app will populate it on login and backfill from auth when the admin loads the client list.

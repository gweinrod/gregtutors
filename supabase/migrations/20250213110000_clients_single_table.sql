-- Single-table clients: id = generated UUID, email = unique key, auth_user_id = link to auth (nullable).
-- Admin-added clients have auth_user_id = null; when they sign in, we upsert by email and set auth_user_id + OAuth name.

-- Drop admin_added_clients if it was created (from previous two-table approach)
drop table if exists public.admin_added_clients;

-- Replace clients with new structure (id no longer = auth.users.id)
create table if not exists public.clients_new (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  auth_user_id uuid references auth.users(id) on delete set null unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Migrate existing data: old id was auth user id, so set auth_user_id = old id
insert into public.clients_new (email, name, auth_user_id, created_at, updated_at)
  select email, name, id, created_at, updated_at from public.clients
  on conflict (email) do nothing;

drop table if exists public.clients;
alter table public.clients_new rename to clients;

create index if not exists clients_name_idx on public.clients (name);
create index if not exists clients_email_idx on public.clients (email);
create index if not exists clients_auth_user_id_idx on public.clients (auth_user_id);

alter table public.clients enable row level security;

-- Users can insert a row for themselves (auth_user_id = their id)
create policy "Users can insert own client row"
  on public.clients for insert
  with check (auth.uid() = auth_user_id);

-- Users can update their own row, or "claim" an admin-added row (auth_user_id was null) on first login
create policy "Users can update own or unclaimed row"
  on public.clients for update
  using (auth_user_id = auth.uid() or auth_user_id is null);

-- Users can only read their own row
create policy "Users can read own client row"
  on public.clients for select
  using (auth_user_id = auth.uid());

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

comment on table public.clients is 'All clients: admin-added (auth_user_id null) or signed-in (auth_user_id set). On login, upsert by email and set name from OAuth.';

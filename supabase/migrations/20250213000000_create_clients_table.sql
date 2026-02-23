-- Table: public.clients
-- Stores every user who has ever logged in (synced on login and from auth backfill).
-- Used by admin Schedule "select client" dropdown.

create table if not exists public.clients (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for admin list ordered by name
create index if not exists clients_name_idx on public.clients (name);
create index if not exists clients_email_idx on public.clients (email);

-- RLS: users can upsert their own row (so client-side login can sync)
alter table public.clients enable row level security;

create policy "Users can insert own client row"
  on public.clients for insert
  with check (auth.uid() = id);

create policy "Users can update own client row"
  on public.clients for update
  using (auth.uid() = id);

create policy "Users can read own client row"
  on public.clients for select
  using (auth.uid() = id);

-- Service role (used in API) bypasses RLS and can read all rows.

-- Optional: auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

comment on table public.clients is 'All clients who have ever logged in; populated on login and backfilled from auth.users for admin client selector';

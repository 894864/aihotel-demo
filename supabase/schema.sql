create type ticket_status as enum ('pending', 'accepted', 'processing', 'completed', 'timeout', 'cancelled');
create type ticket_department as enum ('housekeeping', 'engineering', 'frontdesk', 'food', 'manager');
create type ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type ticket_source as enum ('ai_call', 'frontdesk', 'staff', 'manager');

create table if not exists public.tickets (
  id uuid primary key,
  room text not null,
  request text not null,
  department ticket_department not null,
  source ticket_source not null default 'frontdesk',
  status ticket_status not null default 'pending',
  priority ticket_priority not null default 'normal',
  assignee_id text,
  assignee_name text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  due_at timestamptz not null,
  notes text
);

create index if not exists tickets_created_at_idx on public.tickets (created_at desc);
create index if not exists tickets_status_idx on public.tickets (status);
create index if not exists tickets_department_idx on public.tickets (department);

alter table public.tickets enable row level security;

drop policy if exists "demo read tickets" on public.tickets;
drop policy if exists "demo insert tickets" on public.tickets;
drop policy if exists "demo update tickets" on public.tickets;

create policy "demo read tickets" on public.tickets for select using (true);
create policy "demo insert tickets" on public.tickets for insert with check (true);
create policy "demo update tickets" on public.tickets for update using (true) with check (true);

alter publication supabase_realtime add table public.tickets;

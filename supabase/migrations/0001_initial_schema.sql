create extension if not exists "pgcrypto";

do $$ begin
  create type event_status as enum ('draft', 'active', 'paused', 'completed', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status as enum ('waiting', 'active', 'skipped', 'cancelled', 'used');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('manual_cash', 'manual_card', 'manual_etransfer', 'manual_other', 'stripe');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('paid', 'pending', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type photo_kind as enum ('original', 'layout', 'thumbnail', 'video');
exception when duplicate_object then null; end $$;

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  event_date timestamptz,
  status event_status not null default 'draft',
  current_queue_number integer not null default 1,
  next_queue_number integer not null default 1,
  branding jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  queue_number integer not null,
  access_code text,
  access_code_hash text not null,
  access_code_last4 text not null,
  gallery_token_hash text not null,
  gallery_token_lookup text not null unique,
  status ticket_status not null default 'waiting',
  payment_status payment_status not null default 'paid',
  payment_method payment_method not null,
  stripe_checkout_session_id text,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, queue_number)
);

create table if not exists photo_assets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  ticket_id uuid not null references tickets(id) on delete cascade,
  kind photo_kind not null,
  r2_key text not null unique,
  content_type text not null,
  size_bytes bigint,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table if not exists queue_actions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  ticket_id uuid references tickets(id) on delete set null,
  action text not null,
  actor_type text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists landing_pages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete set null,
  slug text not null unique,
  content_json jsonb not null,
  source_poster_r2_key text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at before update on events
for each row execute function set_updated_at();

drop trigger if exists tickets_set_updated_at on tickets;
create trigger tickets_set_updated_at before update on tickets
for each row execute function set_updated_at();

drop trigger if exists landing_pages_set_updated_at on landing_pages;
create trigger landing_pages_set_updated_at before update on landing_pages
for each row execute function set_updated_at();

create or replace function create_manual_ticket(
  p_event_id uuid,
  p_access_code text,
  p_access_code_hash text,
  p_access_code_last4 text,
  p_gallery_token_hash text,
  p_gallery_token_lookup text,
  p_payment_method payment_method
)
returns tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event events;
  v_ticket tickets;
begin
  select * into v_event
  from events
  where id = p_event_id
  for update;

  if not found then
    raise exception 'Event not found';
  end if;

  insert into tickets (
    event_id,
    queue_number,
    access_code,
    access_code_hash,
    access_code_last4,
    gallery_token_hash,
    gallery_token_lookup,
    payment_method,
    payment_status,
    status
  )
  values (
    p_event_id,
    v_event.next_queue_number,
    p_access_code,
    p_access_code_hash,
    p_access_code_last4,
    p_gallery_token_hash,
    p_gallery_token_lookup,
    p_payment_method,
    'paid',
    'waiting'
  )
  returning * into v_ticket;

  update events
  set next_queue_number = v_event.next_queue_number + 1
  where id = p_event_id;

  insert into queue_actions (event_id, ticket_id, action, actor_type)
  values (p_event_id, v_ticket.id, 'create_manual_ticket', 'staff');

  return v_ticket;
end;
$$;

create or replace function advance_event_queue(p_event_id uuid)
returns events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next_queue_number integer;
  v_event events;
begin
  select queue_number into v_next_queue_number
  from tickets
  where event_id = p_event_id
    and status = 'waiting'
  order by queue_number asc
  limit 1;

  update events
  set current_queue_number = coalesce(v_next_queue_number, current_queue_number)
  where id = p_event_id
  returning * into v_event;

  insert into queue_actions (event_id, action, actor_type, metadata)
  values (p_event_id, 'advance_queue', 'staff', jsonb_build_object('current_queue_number', v_event.current_queue_number));

  return v_event;
end;
$$;

do $$ begin
  alter publication supabase_realtime add table events;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table tickets;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table photo_assets;
exception when duplicate_object then null; end $$;

create table if not exists booking_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  event_date date,
  city text,
  notes text,
  created_at timestamptz not null default now()
);

alter table tickets
  add column if not exists phone_number text;

create index if not exists tickets_event_phone_number_idx
  on tickets (event_id, phone_number)
  where phone_number is not null;


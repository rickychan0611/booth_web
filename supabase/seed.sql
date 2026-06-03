insert into events (name, slug, event_date, status, current_queue_number, next_queue_number, branding)
values (
  'Demo Photo Booth Event',
  'demo-photo-booth-event',
  now(),
  'active',
  1,
  1,
  '{"accent":"#f43f5e","logoText":"Booth Pro"}'::jsonb
)
on conflict (slug) do nothing;

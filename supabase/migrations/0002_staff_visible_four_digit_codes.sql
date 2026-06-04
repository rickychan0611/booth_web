alter table tickets
add column if not exists access_code text;

update tickets
set
  access_code = access_code_last4,
  access_code_hash = encode(digest(access_code_last4, 'sha256'), 'hex')
where access_code is null;

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

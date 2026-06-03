# Photo Booth Web System Architecture

This MVP is a Next.js App Router application for staff queue control, Electron booth integration, private media uploads, and guest galleries.

## Runtime Pieces

- Next.js on Vercel serves staff/admin pages, public gallery pages, booth helper pages, and API routes.
- Supabase Postgres is the source of truth for events, tickets, queue state, landing pages, and photo metadata.
- Supabase Realtime pushes event/ticket changes to staff and booth clients. The UI also polls `/api/queue` every 15 seconds as a fallback.
- Cloudflare R2 stores original photos, print layouts, thumbnails, and later videos. Objects stay private and are accessed with signed URLs.
- Stripe webhook verification is wired as a stub. Ticket creation from Checkout should be added after the manual paid guest flow is stable.

## Key Flows

Manual ticket creation uses the `create_manual_ticket` Postgres RPC function. The function locks the event row, assigns the current `next_queue_number`, inserts the paid waiting ticket, increments `next_queue_number`, and writes an audit row.

Queue advancement uses `advance_event_queue`, which chooses the lowest queue number still in `waiting` status. Skipped, cancelled, and used tickets are ignored.

Gallery URLs use an unguessable random token. The token is stored as `gallery_token_lookup` for lookup and `gallery_token_hash` for verification. R2 keys are never exposed directly to public clients.

## Security Notes

- Staff/admin authentication and RLS policies still need to be added before production use.
- Booth APIs require `x-booth-secret` matching `BOOTH_SHARED_SECRET`.
- Access codes are stored as hashes plus the last four digits for staff reference.
- R2 buckets should remain private.

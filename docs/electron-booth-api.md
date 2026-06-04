# Electron Booth API Contract

The Electron booth should store an event ID and booth shared secret on the kiosk PC. The temporary web booth screen does not ask for the secret; it is intended for local kiosk testing. Keep direct upload routes protected with the booth secret.

Send the booth secret as:

```http
x-booth-secret: <BOOTH_SHARED_SECRET>
```

## Queue Display

Read the current queue snapshot:

```http
GET /api/queue?eventId=<eventId>
```

Use Supabase Realtime for live updates on:

- `events` where `id = eventId`
- `tickets` where `event_id = eventId`

Poll `/api/queue` every 10-15 seconds as a fallback.

## Validate Guest Code

```http
POST /api/booth/validate-code
content-type: application/json
x-booth-secret: <secret>

{
  "eventId": "<uuid>",
  "accessCode": "123456"
}
```

Success returns the ticket and gallery URL. The booth can start the photo session only after this succeeds.

## Upload Photos

Ask for presigned R2 upload URLs:

```http
POST /api/uploads/presign
content-type: application/json
x-booth-secret: <secret>

{
  "eventId": "<uuid>",
  "ticketId": "<uuid>",
  "assets": [
    { "kind": "original", "filename": "photo-001.jpg", "contentType": "image/jpeg" },
    { "kind": "layout", "filename": "layout.jpg", "contentType": "image/jpeg" },
    { "kind": "thumbnail", "filename": "thumb.jpg", "contentType": "image/jpeg" }
  ]
}
```

Upload each file directly to its `uploadUrl` using HTTP `PUT`, then confirm metadata:

```http
POST /api/uploads/complete
content-type: application/json
x-booth-secret: <secret>

{
  "eventId": "<uuid>",
  "ticketId": "<uuid>",
  "assets": [
    {
      "kind": "layout",
      "r2Key": "events/<eventId>/tickets/<ticketId>/001-layout-layout.jpg",
      "contentType": "image/jpeg",
      "sizeBytes": 123456,
      "width": 1800,
      "height": 1200
    }
  ]
}
```

## Complete Session

```http
POST /api/booth/complete-session
content-type: application/json
x-booth-secret: <secret>

{
  "eventId": "<uuid>",
  "ticketId": "<uuid>"
}
```

This marks the ticket used and advances the event queue to the next waiting ticket.

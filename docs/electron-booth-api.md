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

## Upload Photos and Session Video

Supported asset kinds: `original`, `layout`, `thumbnail`, `video`.

Allowed content types:

- Images: `image/jpeg`, `image/png`, `image/webp`
- Video: `video/mp4`, `video/webm`

Video assets are stored under `events/<eventId>/tickets/<ticketId>/videos/`. Width and height may be omitted or sent as `0` for video.

### Presigned uploads (recommended for video)

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
    { "kind": "thumbnail", "filename": "thumb.jpg", "contentType": "image/jpeg" },
    { "kind": "video", "filename": "session.mp4", "contentType": "video/mp4" }
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
    },
    {
      "kind": "video",
      "r2Key": "events/<eventId>/tickets/<ticketId>/videos/004-video-session.mp4",
      "contentType": "video/mp4",
      "sizeBytes": 8450000,
      "width": 0,
      "height": 0
    }
  ]
}
```

### Direct multipart upload

For smaller payloads or local testing, upload in one request:

```http
POST /api/uploads/direct
content-type: multipart/form-data
x-booth-secret: <secret>

eventId, ticketId, kind=video, filename=session.mp4, file=<bytes>
```

Direct uploads through Next.js are capped at 100MB. Prefer presigned PUT for longer session videos, especially on hosted platforms with smaller function payload limits.

## Complete Session

```http
POST /api/booth/complete-session
content-type: application/json
x-booth-secret: <secret>

{
  "eventId": "<uuid>",
  "ticketId": "<uuid>",
  "phoneNumber": "6041234567"
}
```

This marks the ticket used, stores the normalized guest phone number when provided, and advances the event queue to the next waiting ticket.

## Find Gallery By Phone

Look up uploaded galleries for one event and phone number:

```http
GET /api/gallery/by-phone?eventId=<uuid>&phone=6041234567
```

The phone number is normalized to digits before lookup. The response includes matching sessions, gallery URLs, and serialized layout/video assets.

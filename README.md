# ArchWalk 360 reference application

This is a small fictional property platform (Reference Realty) with ArchWalk 360 embedded on the seller and public listing pages.

- `/editor` — seller workspace with the embedded Creator
- `/viewer` — public listing with the published Viewer
- `/` redirects to `/editor`

Both pages share one hardcoded listing (`Sunset Villa`, external key `sunset-villa-001`). There is no database, partner authentication, or CMS.

## Running locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Server-side only (never prefix these with `NEXT_PUBLIC_`):

| Variable | Purpose |
|---|---|
| `ARCHWALK_API_BASE` | Partner API host, no trailing slash |
| `ARCHWALK_APP_ORIGIN` | ArchWalk app origin for Creator/Viewer iframes |
| `AW360_API_KEY` | Partner API key (`aw360_sk_…`) |
| `APP_ORIGIN` | This app’s origin, used when minting Creator sessions |

## ArchWalk setup

1. Enable ArchWalk 360 for the Organization and create an Integration.
2. Set media policy to `managed_only` or `both` (this app uses Creator-managed uploads).
3. Add this app’s exact origin (`APP_ORIGIN`) to Integration allowed origins.
4. Issue a Partner API credential with at least: `experiences:read`, `experiences:write`, `experiences:publish`, `panoramas:read`, `panoramas:write`, `panoramas:upload`, `creator_sessions:issue`.
5. Store the raw key immediately; it is shown once.

## Tests

```bash
pnpm test
```

## Embedding layout

The partner controls iframe width, height, surrounding layout, and where the
Viewer appears. ArchWalk supplies the embedded Creator runtime. This reference
editor demonstrates a spacious integration, rather than requiring partners to
use the same host layout: readable intro copy, a workspace up to 1536px wide with
20–32px gutters, and an iframe sized to `100dvh - 6rem` (minimum 860px for
the stacked mobile editor, or 720px on larger screens). The ready iframe has no surrounding card or status footer.

Keep `allow="fullscreen"` and `allowFullScreen` on the Creator iframe so its
immersive editor can use native fullscreen. Unsupported browsers retain the
expanded preview inside the partner-sized iframe. No cross-origin DOM height
inspection is used.

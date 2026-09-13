# ArchWalk 360 reference application

This repository is the host shell for the ArchWalk 360 reference application. It is a deliberately small fictional property platform, not an integration sample yet.

## What is included

Reference Realty is a two-page product:

- `/editor` — seller-facing listing workspace
- `/viewer` — customer-facing public listing

`/` redirects to `/editor`. Both pages share one hardcoded property (`Sunset Villa`). There is no database, authentication, CMS, or backend API.

## Running locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). No credentials are required at this stage.

## Next step

ArchWalk 360 integration will be added separately using the public Developer Docs / AI integration handoff. This host shell does not include that work.

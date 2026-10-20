# Lost-Found_SDLC (Campus Lost & Found)

## Purpose

This starter application displays simple campus lost-and-found records. It provides a small client-side codebase for an SDLC class exercise.

## Requirements

- A current Node.js LTS release
- npm

## Quick Start

```bash
npm install
npm run dev
```

Open the local address shown by Vite. Run `npm run build` to create a production build in `dist/`.

## What Works

- View six seeded item records and select an item for details.
- See total and stored item counts.
- Change a `FOUND` item to `STORED` with **Mark as Stored**.
- Reset all browser demo changes to the original seed data.

## Data & Reset

Static starter records come from `src/data/seed.js`. Changes are saved as JSON under `sdlc:case-a:v1` in this browser's `localStorage`. They are not shared with another browser or device and are not written back to Git. Use **Reset Demo Data** to restore a fresh copy of the seed data.

## Project Structure

- `src/App.jsx` owns the page state and connects the UI actions.
- `src/components/` contains the item list, cards, details, and status badge.
- `src/data/seed.js` contains deterministic demo records.
- `src/utils/itemUtils.js` contains small item transformations and counts.
- `src/utils/storage.js` safely loads, saves, and resets local browser data.
- `src/styles.css` contains the responsive page styles.

## Collaboration Notes

Work from your group's own Sprint Backlog. Use a branch, make focused commits, open a pull request, and ask a peer to review it before merge. Keep the code change and review evidence connected to the backlog item selected by your group.

## Limitations

This is a client-side demonstration only. It has no backend, authentication, shared database, or cross-device synchronization. Browser data is for local practice and should not be used for sensitive or operational information.


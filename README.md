# Vessel Positions Client

Vue 3 SPA for browsing vessel trips and submitting new position reports. Talks to the [Vessel Positions API](../backend/README.md).

**Stack:** Vue 3 · TypeScript · Vite · Tailwind CSS v4 · Vue Router

## Quick start

Backend must be running on port 3000 (with data ingested). Then:

```bash
npm install
cp .env.example .env
npm run dev    # http://localhost:5173
```

## Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/trips` | Trip list, filters, position tables, add-positions modal |

## Features

### Trips page (`/trips`)

- **Trip cards** — one per vessel with start/end location and paginated position table
- **Filters** — vessel, date range, ocean region, rows per page (25–200)
- **Pagination** — previous/next per vessel card
- **Add positions** — batch form modal; posts to `POST /positions`

### State on refresh

Filters and pagination are stored in the **URL query string** (not localStorage), so refresh and shared links keep the same view.

Example:

```
/trips?vessel=5091&region=Caribbean+Sea&limit=100&offsets=5091:50
```

| Query param | Meaning |
|-------------|---------|
| `vessel` | Filter to one vessel ID |
| `from`, `to` | Date range (`YYYY-MM-DD`) |
| `region` | Ocean region name |
| `limit` | Rows per page |
| `offsets` | Pagination per vessel (`5091:50,4378:100`) |

### Add positions modal

- Multi-row batch submit (one vessel per submission)
- UTC datetime picker
- **No client-side validation** — all rules and error messages come from the API
- Client requests use all-or-nothing mode: any error → nothing saved, errors shown per row

## Configuration

| Variable | Default |
|----------|---------|
| `VITE_API_URL` | `http://localhost:3000` |

Copy `.env.example` to `.env` and adjust if the API runs elsewhere.

## Scripts

```bash
npm run dev       # development server
npm run build     # typecheck + production build
npm run preview   # serve production build locally
```

## Project layout

```
src/
  pages/         Route views (Home, Trips)
  components/    TripCard, TripFilters, AddPositionModal, …
  api/           Axios calls to the backend
  types/         Shared TypeScript interfaces
  utils/         Filters, URL state, location labels
  router/        Vue Router setup
```

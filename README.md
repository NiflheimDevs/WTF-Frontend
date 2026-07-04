# WTF — Water Task Force (Frontend)

A frontend for reporting and dispatching water-shortage relief requests. Citizens can submit a need (bottled water or tanker delivery) for their region without logging in, while authenticated dispatchers manage incoming requests, track regional metrics, and update statuses from a live dashboard.

Built with React 19, Vite, and Tailwind CSS. Supports English and Persian (Farsi), including full RTL layout.

## Features

- **Public reporter form** — submit a water request via a country → province → city region cascade, need type (bottled water / tanker), and quantity, with phone and note fields, offline detection, and a success confirmation view.
- **Request tracking** — a public `/track/:id?` page where anyone with a reference ID can look up a request's status and audit timeline without logging in.
- **Dispatcher dashboard** — authenticated area for managing requests, viewing live KPIs, and breaking down metrics by region and need type.
- **Requests management** — list and update the status of incoming requests (pending → dispatched → fulfilled / cancelled).
- **Regions view** — see request volume and status across regions, with hierarchical (country/province/city) filters.
- **Live updates** — a WebSocket hook for real-time data, layered on top of interval polling on dispatcher queries.
- **i18n & RTL** — English and Persian locales with a locale-aware digit formatter, switchable via a locale context.
- **Light/dark theme** — a theme context/toggle persisted to `localStorage`.
- **Auth** — token-based session handling via an auth context and route guard (`RequireAuth`).

## Tech stack

| Layer              | Tooling                              |
| ------------------ | ------------------------------------ |
| Framework          | React 19 + Vite                      |
| Routing            | React Router v7                      |
| Data fetching      | TanStack Query (React Query) + Axios |
| Forms & validation | React Hook Form + Zod                |
| Styling            | Tailwind CSS v4                      |
| Icons              | lucide-react                         |
| Notifications      | react-hot-toast                      |
| Linting            | ESLint                               |
| Deployment         | Docker (multi-stage build) + Nginx   |

## Project structure

```
src/
├── api/            # Axios instance, endpoint definitions, shared types/enums
├── components/
│   ├── auth/        # Login form, route guard (RequireAuth)
│   ├── dispatcher/   # Dashboard, requests table, KPIs, region breakdown UI
│   ├── layout/        # App shell, header, page loader, toaster
│   ├── primitives/     # Buttons, cards, inputs, select, badges, etc.
│   ├── regions/         # Region hierarchy filters (dispatcher regions view)
│   └── reporter/          # Public reporting form + tracking components
├── context/        # Auth, locale, theme, and mobile-sidebar providers
├── hooks/          # Data hooks (requests, regions, metrics, tracking, websocket, etc.)
├── i18n/           # Locale strings (en, fa)
├── lib/            # Alternate React Query client/key-factory setup (not currently wired in — see Architecture.md)
├── pages/          # Route-level pages
└── utils/          # Formatters, validators, error handling, helpers
```

> Note: `src/components/layout/DispatcherLayout.jsx`, `PublicLayout.jsx`, `Sidebar.jsx`, and `TopBar.jsx` implement a sidebar-based dispatcher shell but aren't referenced by `App.jsx` yet — the app currently renders every route through the single `AppHeader`-based shell. See `Documents/Architecture.md` for details.

## Routes

| Path                    | Access    | Description                                              |
| ----------------------- | --------- | --------------------------------------------------------- |
| `/`                     | Public    | Reporter form                                            |
| `/login`                | Public    | Dispatcher login                                         |
| `/admin`                | Public    | Alias for `/login` (also renders `LoginPage`)            |
| `/track/:id?`           | Public    | Track a request by reference ID (path param or `?id=`)   |
| `/dispatcher/login`     | Public    | Redirects to `/login`                                    |
| `/dispatcher`           | Protected | Dashboard (KPIs, recent requests)                        |
| `/dispatcher/requests`  | Protected | Request list & status management                         |
| `/dispatcher/regions`   | Protected | Regional breakdown                                       |
| `/dispatcher/settings`  | Protected | Settings                                                  |
| `/404`                  | Public    | Not found page                                           |
| `*`                     | —         | Redirects to `/404`                                      |

## Getting started

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
git clone https://github.com/NiflheimDevs/WTF-Frontend.git
cd WTF-Frontend
npm install
```

### Environment variables

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:8080/api/v1
```

Point this at your backend API. If `VITE_API_URL` is unset, the Axios client falls back to `http://localhost:8080/api/v1` (see `src/api/axios.js`).

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

### Lint

```bash
npm run lint
```

## Docker

A multi-stage Dockerfile builds the app and serves it with Nginx.

```bash
docker build -t wtf-frontend .
docker run -p 80:80 wtf-frontend
```

Or with Docker Compose:

```bash
docker compose up --build
```

## API integration

This frontend expects a backend exposing the following endpoint groups (see `src/api/endpoints.js`):

- **Public**: `GET /regions/countries`, `GET /regions/countries/:countryId/provinces`, `GET /regions/provinces/:provinceId/cities`, `POST /requests`, `GET /request/:id` (public tracking lookup), `GET /health`, `GET /health/ready`
- **Auth**: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- **Dispatcher**: `GET /dispatcher/requests`, `GET /dispatcher/requests/:id`, `PATCH /dispatcher/requests/:id/status`, `GET /dispatcher/metrics/summary`, `GET /dispatcher/metrics/by-region`, `GET /dispatcher/metrics/by-need-type`

Note the region endpoints are a hierarchical country → province → city cascade rather than a flat region list, and `GET /request/:id` is unauthenticated (distinct from the dispatcher-only `GET /dispatcher/requests/:id`).

## License

No license specified yet.

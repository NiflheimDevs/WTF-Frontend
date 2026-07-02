# WTF — Water Task Force (Frontend)

A frontend for reporting and dispatching water-shortage relief requests. Citizens can submit a need (bottled water or tanker delivery) for their region without logging in, while authenticated dispatchers manage incoming requests, track regional metrics, and update statuses from a live dashboard.

Built with React 19, Vite, and Tailwind CSS. Supports English and Persian (Farsi), including full RTL layout.

## Features

- **Public reporter form** — submit a water request by region, need type (bottled water / tanker), and quantity, with phone and note fields, offline detection, and a success confirmation view.
- **Dispatcher dashboard** — authenticated area for managing requests, viewing live KPIs, and breaking down metrics by region and need type.
- **Requests management** — list and update the status of incoming requests (pending → dispatched → fulfilled / cancelled).
- **Regions view** — see request volume and status across regions.
- **Live updates** — a WebSocket hook for real-time data without manual refreshing.
- **i18n & RTL** — English and Persian locales with a locale-aware digit formatter, switchable via a locale context.
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
│   ├── auth/        # Route guards
│   ├── dispatcher/   # Dashboard, requests, regions UI
│   ├── layout/        # App shell, header, page loader
│   ├── primitives/     # Buttons, cards, inputs, etc.
│   └── reporter/        # Public reporting form components
├── context/        # Auth, locale, and theme providers
├── hooks/          # Data hooks (requests, regions, metrics, websocket, etc.)
├── i18n/           # Locale strings (en, fa)
├── lib/            # React Query client setup
├── pages/          # Route-level pages
└── utils/          # Formatters, validators, helpers
```

## Routes

| Path                   | Access    | Description                       |
| ---------------------- | --------- | --------------------------------- |
| `/`                    | Public    | Reporter form                     |
| `/dispatcher/login`    | Public    | Dispatcher login                  |
| `/dispatcher`          | Protected | Dashboard (KPIs, recent requests) |
| `/dispatcher/requests` | Protected | Request list & status management  |
| `/dispatcher/regions`  | Protected | Regional breakdown                |
| `/dispatcher/settings` | Protected | Settings                          |

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
VITE_API_URL=http://localhost:8000/api/v1
```

Point this at your backend API.

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

- **Public**: `GET /regions`, `POST /requests`, `GET /health`, `GET /health/ready`
- **Auth**: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- **Dispatcher**: `GET /dispatcher/requests`, `GET /dispatcher/requests/:id`, `PATCH /dispatcher/requests/:id/status`, `GET /dispatcher/metrics/summary`, `GET /dispatcher/metrics/by-region`, `GET /dispatcher/metrics/by-need-type`

## License

No license specified yet.

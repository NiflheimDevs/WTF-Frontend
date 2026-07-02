# Architecture

This document describes how WTF-Frontend is put together: the provider/render tree, routing and access control, the data layer, state management strategy, and how the app talks to the backend.

## High-level overview

The app has two distinct surfaces sharing one codebase:

1. **Reporter surface** (`/`) — public, unauthenticated. A single-page form citizens use to report a water need.
2. **Dispatcher surface** (`/dispatcher/*`) — authenticated. A dashboard for managing requests, viewing metrics, and administering regions.

Both surfaces share the same app shell, theme, locale, and API client, but the dispatcher surface sits behind a route guard.

## Provider tree

Providers are composed in `main.jsx`, outside-in:

```
BrowserRouter
└── QueryClientProvider        (TanStack Query cache)
    └── LocaleProvider         (i18n + RTL)
        └── AuthProvider       (session/token state)
            └── App            (routes, lazy-loaded)
            └── AppToaster     (global toast notifications)
```

- **QueryClientProvider** wraps the whole app so any component can fetch/cache server state without prop drilling. Defaults: 30s stale time, 5 min garbage collection, no refetch on window focus, refetch on reconnect.
- **LocaleProvider** owns the active locale (`en` / `fa`), persists it to `localStorage`, and sets `document.documentElement.lang` / `dir` so the whole page flips to RTL for Persian. It exposes `t()` for translations via `useTranslation()`.
- **AuthProvider** owns `user`, `token`, and `loading`, restores a session from `localStorage` on mount, and exposes `login()` / `logout()`.
- **ThemeProvider** (light/dark) is mounted separately, inside `App.jsx`, since it only affects rendered UI and not data/auth concerns.

React Query Devtools are lazy-loaded and only mounted in development (`import.meta.env.DEV`).

## Routing

Routing lives in `App.jsx` using React Router v7. All pages are lazy-loaded (`React.lazy`) and wrapped in a single top-level `<Suspense>` with a shared `PageLoader` fallback, so route chunks are fetched on demand.

| Path | Guarded | Page |
|---|---|---|
| `/` | No | `ReporterPage` |
| `/dispatcher/login` | No | `LoginPage` |
| `/dispatcher` | Yes | `DashboardPage` |
| `/dispatcher/requests` | Yes | `RequestsPage` |
| `/dispatcher/regions` | Yes | `RegionsPage` |
| `/dispatcher/settings` | Yes | `SettingsPage` |
| `/404` | No | `NotFoundPage` |
| `*` | — | redirects to `/404` |

Every route is rendered inside a shared `AppShell` (background + `AppHeader`), so header/branding stay consistent across both surfaces.

### Route protection

`RequireAuth` (`components/auth/RequireAuth.jsx`) wraps protected routes:

- While `AuthContext` is still restoring a session (`loading === true`), it shows a spinner instead of redirecting — this avoids a flash-redirect to `/login` on page refresh.
- Once loaded, if there's no `user`, it redirects to `/dispatcher/login`.
- Otherwise it renders the protected page.

## Authentication

Auth state is managed by `AuthContext` (`context/AuthContext.jsx`), backed by `localStorage`:

- `dispatcher_token` — the bearer token
- `dispatcher_user` — the serialized user object

**Login flow:** `authApi.login(email, password)` → backend returns `{ access_token, expires_at, user }` → stored in both React state and `localStorage`.

**Token attachment:** a request interceptor in `api/axios.js` reads `dispatcher_token` from `localStorage` and attaches it as `Authorization: Bearer <token>` on every outgoing request — including ones fired from React Query hooks, not just ones explicitly called inside `AuthContext`.

**Session expiry / 401 handling:** a response interceptor watches for `401` responses. On the first 401 for a given request, it clears stored credentials and hard-redirects to `/dispatcher/login` (`window.location.href`, not a router navigation — this guarantees a full state reset).

**Logout:** calls `authApi.logout()` (best-effort — errors are swallowed), then clears state, resets the `<html>` theme attributes to light, and redirects to the login page.

## Data layer

All server communication goes through a single Axios instance (`api/axios.js`) with a 15s timeout and the interceptors described above. Endpoints are grouped by access level in `api/endpoints.js`:

- `publicApi` — regions, request submission, health checks
- `authApi` — login, refresh, logout
- `dispatcherApi` — requests CRUD/status, metrics

### React Query conventions

Each domain has its own hook module under `src/hooks/` (`useRequests.js`, `useMetrics.js`, `useRegions.js`, etc.) with:

- A **query key factory** (e.g. `requestsKeys.list(filters)`, `metricsKeys.byRegion(limit)`) so cache entries are addressable and invalidation is precise rather than blunt.
- **Polling via `refetchInterval`** rather than push-based updates for most dispatcher data — requests poll every 15s, metrics every 30s. This is the primary mechanism for "live" dashboard data.
- **Optimistic updates** for mutations that affect visible UI immediately. `useUpdateRequestStatus` is the clearest example: on `onMutate` it snapshots the current list cache, writes the new status in immediately, and on `onError` rolls back to the snapshot. `onSettled` invalidates both the requests and metrics caches so server truth reconciles shortly after.
- **`select` transforms** to reshape snake_case API responses into the camelCase shapes components expect, keeping that translation in one place per hook instead of scattered through components.

`src/lib/queryClient.js` defines the shared `QueryClient` instance and key factories; `src/lib/reactQuery.js` adds small wrapper helpers (`useMutationWithInvalidation`, `prefetchQuery`, `invalidateQueries`, etc.) used by some hooks to reduce repetition.

### Real-time updates

`hooks/useWebSocket.js` is a standalone WebSocket hook with auto-reconnect (default 3s backoff) and connect/disconnect/send controls. It's a generic primitive — current consumers can use it to receive push events (e.g. `request_submitted`, `request_status_changed`) and trigger query invalidation, on top of the baseline polling described above. Event type constants live in `api/types.js` (`EVENT_TYPES`).

## State management strategy

The app intentionally keeps different kinds of state in different places rather than centralizing everything:

| State | Owner |
|---|---|
| Server data (requests, regions, metrics) | React Query cache |
| Auth session | `AuthContext` + `localStorage` |
| Locale / direction | `LocaleContext` + `localStorage` |
| Theme | `ThemeContext` + `localStorage` |
| Form state | Local component state / React Hook Form |
| Ephemeral UI state (loading, errors) | Local component state |

There is no global client-state store (Redux/Zustand/etc.) — React Query plus a small number of purpose-built contexts cover the app's needs.

## Internationalization

`src/i18n/` holds locale dictionaries (`en.js`, `fa.js`) and a `translate()` function keyed by dot-path strings (e.g. `t("reporter.submitRequest")`). `LocaleContext` wires this to the active locale, flips `document.dir` for RTL when Persian is active, and swaps the document title. `utils/localeDigits.js` formats numbers using locale-appropriate digits (Persian numerals in `fa`).

## Domain model

Core enums live in `api/types.js` and are shared across the reporter form, dispatcher dashboard, and validators:

- `NEED_TYPES`: `bottled_water`, `tanker`
- `REQUEST_STATUS`: `pending`, `dispatched`, `fulfilled`, `cancelled`
- `USER_ROLES`: `dispatcher`, `admin`
- `EVENT_TYPES`: websocket event names

## Build & deployment

- **Dev/build tooling**: Vite, with `@vitejs/plugin-react` and `@tailwindcss/vite`.
- **Runtime config**: a single env var, `VITE_API_URL`, points the Axios client at the backend's `/api/v1` base path.
- **Production image**: a two-stage `Dockerfile` — Node 22 Alpine builds the static bundle (`npm run build`), then an `nginx:alpine` stage serves `dist/` using `nginx.conf`. `docker-compose.yml` wraps this for local/prod orchestration.

## Directory reference

```
src/
├── api/            # Axios instance, endpoint groups, shared domain enums
├── components/
│   ├── auth/        # RequireAuth route guard
│   ├── dispatcher/   # Dashboard/requests/regions UI
│   ├── layout/         # AppShell, AppHeader, PageLoader, AppToaster
│   ├── primitives/      # Generic UI building blocks (Button, Card, Input, Spinner)
│   └── reporter/          # Public reporting form components
├── context/        # AuthContext, LocaleContext, ThemeContext
├── hooks/          # Domain data hooks + websocket/local-storage/debounce utilities
├── i18n/           # Locale dictionaries + translate()
├── lib/            # QueryClient instance, key factories, React Query helpers
├── pages/          # Route-level page components
└── utils/          # Formatters, validators, locale digit helpers, error handling
```

## Notable design decisions

- **Polling over pure websocket dependency**: dispatcher data hooks set their own `refetchInterval`, so the dashboard stays reasonably fresh even if the websocket connection drops or push events aren't wired up for a given view. The websocket hook is additive, not a single point of failure.
- **Hard redirect on auth failure**: using `window.location.href` instead of router navigation on 401/logout deliberately throws away all in-memory state (including the React Query cache), preventing stale authenticated data from lingering after a session ends.
- **Snake_case at the boundary, camelCase in the app**: API responses use snake_case (matching the backend); hooks normalize this in their `select`/`queryFn` so components consume clean camelCase props.

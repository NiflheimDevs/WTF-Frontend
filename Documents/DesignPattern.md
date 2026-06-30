# Design patterns

This document covers the recurring code patterns used across WTF-Frontend: how components are composed, how state and data are managed, how styling is applied, and where the codebase is inconsistent.

## Component patterns

### Primitives + feature components

UI is split into two layers:

- **`components/primitives/`** — generic, domain-agnostic building blocks (`Button`, `Card`, `Input`, `Badge`, `Spinner`, `Skeleton`, `Toast`, `ThemeToggle`, `LanguageToggle`). These know nothing about water requests, regions, or dispatchers.
- **`components/{reporter,dispatcher,auth,layout}/`** — feature components that compose primitives into domain-specific UI (`RegionSelect`, `NeedTypePicker`, `QuantityStepper`, `SuccessView`, etc.).

This keeps the primitives reusable and testable in isolation, and keeps domain logic out of generic UI.

### Variant + size props over separate components

Primitives like `Button` take `variant` (`primary` / `secondary` / `ghost` / `danger` / `success` / `warning`) and `size` (`sm` / `md` / `lg` / `xl`) props mapped to class-name lookup objects, rather than having `PrimaryButton`, `DangerButton`, etc. as separate components. This keeps the API small and makes new variants a one-line addition to a lookup table.

```js
const variants = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 ...",
  danger: "bg-danger-bg text-danger-fg hover:bg-danger-bg/80 ...",
  // ...
};
```

### Compound components

`Card` is split into `Card`, `CardHeader`, `CardTitle`, `CardContent` — composable pieces rather than one component with many props for header text, title text, etc. Consumers assemble only the parts they need.

### `forwardRef` on interactive primitives

`Button` uses `forwardRef` so parent components (e.g. forms needing focus management) can get a ref to the underlying DOM node. Non-interactive primitives like `Card` don't bother with this.

### Controlled components throughout

Form-adjacent components (`RegionSelect`, `NeedTypePicker`, `QuantityStepper`) are fully controlled: they receive `value` and `onChange` and hold no internal state of their own. The owning page (`ReporterPage`) is the single source of truth for form state. This makes validation, reset, and submission logic live in one place instead of being scattered across child components.

### Lazy-loaded routes

Every page component is wrapped in `React.lazy()` and the route tree sits inside one shared `<Suspense>` with a single `PageLoader` fallback, rather than per-route fallbacks. This keeps initial bundle size down — the reporter form (the most-trafficked, public route) doesn't pay for dispatcher dashboard code.

## State & data patterns

### Context for cross-cutting concerns, React Query for server state

Three contexts (`AuthContext`, `LocaleContext`, `ThemeContext`) cover authentication, language/direction, and color theme — all things many unrelated components need. Everything that originates from the backend (requests, regions, metrics) goes through React Query instead of context, so it benefits from caching, polling, and invalidation rather than being manually synced into a context value.

### Query key factories

Every data hook module defines a key factory object instead of inlining array literals at call sites:

```js
export const requestsKeys = {
  all: ["requests"],
  lists: () => [...requestsKeys.all, "list"],
  list: (filters) => [...requestsKeys.lists(), { ...filters }],
  details: () => [...requestsKeys.all, "detail"],
  detail: (id) => [...requestsKeys.details(), id],
};
```

This makes invalidation targetable at different levels of granularity (`invalidateQueries({ queryKey: requestsKeys.all })` nukes everything request-related; `requestsKeys.detail(id)` targets one record) and avoids typos in hand-written key arrays scattered through the app.

### Optimistic updates with rollback

Mutations that affect already-visible data follow the same `onMutate` / `onError` / `onSettled` shape:

1. `onMutate`: cancel in-flight queries for the affected key, snapshot the current cache, write the optimistic value.
2. `onError`: restore the snapshot if the mutation fails.
3. `onSettled`: invalidate the relevant keys so the next fetch reconciles with server truth.

`useUpdateRequestStatus` is the canonical example — see `src/hooks/useRequests.js`.

### `select` for server/client shape translation

Hooks normalize snake_case API payloads into the shape components want, in one place, via React Query's `select` option:

```js
select: (data) => ({
  totalRequests: data.total_requests,
  pendingRequests: data.pending_requests,
  // ...
}),
```

This means components never see `total_requests` — they see `totalRequests` — and that translation only has to be written once per query, not in every consuming component.

### Polling as the default "live data" mechanism

Dispatcher queries set `refetchInterval` (15s for requests, 30s for metrics) rather than depending solely on the websocket hook to trigger refetches. This is a deliberate resilience choice: the dashboard stays reasonably current even if a push event is missed or the socket reconnect logic is mid-backoff.

### Validator factories

`utils/validators.js` builds validators from a `t` (translate) function rather than hardcoding English strings, so the same validation logic produces localized error messages:

```js
export function createValidators(t) {
  return {
    required: (value) => { /* ... uses t("validation.required") ... */ },
    min: (min) => (value) => { /* ... */ },
    compose: (...validators) => (value) => { /* runs each, returns first error */ },
  };
}
```

`compose()` is a small left-to-right validator pipeline — `validateQuantity = compose(min(1), max(50))` — rather than one big function with nested conditionals.

## Styling patterns

### Tailwind v4 with CSS-variable theme tokens

`src/index.css` defines an `@theme` block mapping Tailwind's color/shadow/animation tokens to CSS custom properties (`--color-primary-500`, `--shadow-card`, etc.) rather than hardcoding values in `tailwind.config.js`. This is the Tailwind v4 convention and means theme values can be swapped (e.g. for dark mode) by changing the underlying CSS variables, not the Tailwind config.

### `cn()` helper for conditional classes

A small wrapper around `clsx` + `tailwind-merge`:

```js
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

`clsx` handles conditional class composition (`active && "border-primary-500"`); `twMerge` resolves Tailwind class conflicts (e.g. a passed-in `className` overriding a default `p-4`) so the last-applied utility wins predictably instead of both being emitted. Used throughout primitives and any component accepting a `className` prop.

### Inline ternaries for two-state visual variants

Smaller, local pieces of conditional styling (an active/inactive toggle button, an error/non-error input border) are written as inline template-literal ternaries rather than going through `cn()` every time — `cn()` is reserved for components that also accept an external `className` prop to merge against.

### Locale-aware typography

`--font-family-persian` (Vazirmatn) is defined alongside `--font-family-sans` (Inter) in the theme block, and `document.dir` flips per locale via `LocaleContext`. Components don't individually branch on locale for direction — RTL is handled once, globally, at the document level.

## Error-handling patterns

The codebase has **two parallel error-handling approaches** that aren't fully unified:

1. **Centralized handler** (`utils/errorHandler.js`): `handleApiError()` maps HTTP status codes to an `AppError` class with project-specific error codes (`AUTH_003`, `REQ_001`, etc.), fires a toast, and — on `401` — clears credentials and redirects after a short delay.
2. **Per-hook inline handling**: hooks like `useSubmitRequest` instead branch on `error.response?.status` directly inside `onError` and fire their own `t(...)`-translated toasts, without going through `handleApiError` or `AppError`.

In practice, the Axios response interceptor (`api/axios.js`) already handles `401` globally and redirects immediately (no delay), which overlaps with what `errorHandler.js` also does for the same status code. When extending error handling, prefer the **per-hook, translated-toast pattern** used in `useSubmitRequest` for new mutations — it's the one actually wired up to the i18n system end-to-end. `errorHandler.js` is best treated as a utility to consolidate into, not one currently exercised by the main request flows.

## Internationalization pattern

Translation keys are dot-path strings resolved against locale dictionaries (`reporter.submitRequest`, `validation.required`), accessed two ways depending on context:

- **Inside components**: `const { t } = useTranslation()` (reads the live `LocaleContext`, reactive to locale switches).
- **Outside React** (hooks' `onError`/`onSuccess` callbacks, non-component utility code): a standalone `t` exported directly from `src/i18n/index.js`, reading the last-set global locale rather than subscribing to context.

This split exists because mutation callbacks and module-level code can't call hooks. Code reviewers should treat "is this inside a component render?" as the deciding factor for which `t` to import.

## Summary table

| Concern | Pattern |
|---|---|
| Generic UI | Primitives layer, variant/size props, compound components |
| Domain UI | Feature folders per area, fully controlled by parent page state |
| Server state | React Query, key factories, `select` for shape translation |
| Live data | Polling (`refetchInterval`) as baseline, websocket as enhancement |
| Mutations with visible side effects | Optimistic update + rollback (`onMutate`/`onError`/`onSettled`) |
| Conditional classes | `cn()` (clsx + tailwind-merge) when merging external `className`; inline ternaries otherwise |
| Theming | Tailwind v4 `@theme` block over CSS variables |
| Validation | Composable validator factories parameterized by `t` |
| Errors | Inconsistent — prefer per-hook translated toasts over `errorHandler.js` for new code |
| i18n | `useTranslation()` in components, standalone `t` outside components |

# Servia Frontend UI Portal

A Next.js App Router portal designed for restaurant customers (catalog, carts, checkout) and operators (real-time dashboards, analytics, and booking managers).

---

## Key Engineering Highlights

### 1. Dynamic Operator Dashboard
The operator panel (`/admin/dashboard`) displays restaurant metrics in real-time without reliance on pre-calculated cache layers:
- **Instant Aggregations**: Requests metrics from the backend API using dynamic date range filters (`TODAY`, `WEEK`, `MONTH`, `ALL`).
- **Data Visualization**: Implements custom UI bar charts that scale dynamically relative to the highest-performing menu item, ensuring accurate visual scaling.
- **Data Integrity**: Groups popular items based on the transaction snapshot field (`nameAtPurchase`) to ensure historical records remain correct even if items are renamed or soft-deleted.

### 2. State Management & Session Hydration
Servia manages transient states using **Zustand**:
- **Cart Store**: Manages catalog items, quantity increments, and subtotals. It is configured with local storage persistence (`useCartStore` with `persist`) to keep cart states hydrated across browser reloads.
- **Auth Store**: Coordinates active user profiles and JWT access tokens.
- **Token Handling**: Relies on browser-managed secure `HttpOnly` refresh cookies for background token rotation, avoiding storage of refresh credentials in JavaScript-accessible memory space.

### 3. Route Guarding & Client Security
The React components are protected against unauthorized access:
- **Admin Layout**: The page checks user roles (`ADMIN` or `OPERATOR`) during mount and automatically redirects unauthorized customers back to the login page or catalog view.
- **Fetch Interceptors**: An API wrapper coordinates request header injection, automatically attaching the JWT access token and correlating tracing IDs to outgoing requests.

---

## Local Development & Styling
- **Styling**: Structured using Vanilla CSS Modules for maximum control, avoidance of utility bloat, and modular styling.
- **TypeScript**: Typed interface payloads sharing structures with `@servia/shared` to enforce type safety on API responses.

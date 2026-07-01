# IoT Protocol Engine

A multi-tenant web platform for managing, monitoring, and billing fleets of IoT devices. Built with Angular 16 and Angular Material, it gives tenant admins and users a single dashboard to provision devices, define data-processing and alert rules, manage teams, and track usage-based billing.

## Highlights

- **Multi-tenant device fleet management** — track boards/sensors (temperature, humidity, pressure, motion) with live status (`ONLINE`, `OFFLINE`, `MAINTENANCE`, `ERROR`), firmware versions, and remote command dispatch with full execution history.
- **Configurable data pipeline per tenant** — a rules engine lets each tenant define its own data schema (typed fields including temperature, humidity, pressure, GPS, voltage/current), processing rules (transform, filter, aggregate, enrich) with conditional logic, and alert rules with severity levels and multi-channel notifications (email, SMS, webhook, push, Slack, Teams).
- **Usage-based billing engine** — automatic bill calculation per period with itemized subscription, overage, and discount line items, paginated bill history, PDF export, and device API token management with masked-token display.
- **Role-based access control** — route guards and interceptors enforce `tenant_admin` vs `tenant_user` permissions across users, billing, and configuration areas; JWT is injected automatically and refreshed sessions are handled via HTTP interceptors.
- **Zero-backend developer experience** — every service ships with a realistic mock-data layer toggled by a single `environment.mockApi` flag, so the full UI — dashboards, boards, billing, configuration — is explorable and demoable without standing up an API.
- **Modern Angular architecture** — standalone components throughout (no NgModules), lazy-loaded feature routes, barrel-exported core/shared layers, and a clean separation between `core` (services, guards, interceptors, models) and `shared` (reusable UI components and pipes).
- **Polished, responsive UI** — Angular Material with a custom indigo theme, a collapsible sidenav that adapts from desktop to mobile, KPI stat cards, status badges, and reusable dialogs/spinners for a consistent experience across every screen.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 16 (standalone components) |
| UI | Angular Material 16 + Angular CDK |
| Reactive state | RxJS (Observables / BehaviorSubjects) |
| Styling | SCSS, custom indigo Material theme, DM Sans / JetBrains Mono |
| HTTP | Angular `HttpClient` with JWT interceptor |
| Testing | Karma + Jasmine |
| Language | TypeScript 5.1 |

## Application Structure

```
src/app/
├── auth/            # Login, registration, forgot/reset password
├── dashboard/        # Landing page with fleet stats and recent activity
├── boards/           # IoT device list and detail views
├── users/             # Tenant user management (admin only)
├── configuration/     # Data schema, processing rules, alert rules (admin only)
├── billing/           # Bill overview, history, and detail (admin only)
├── settings/          # User account settings
├── core/
│   ├── guards/        # auth.guard, role.guard
│   ├── interceptors/  # JWT injection, error handling
│   ├── services/      # auth, api, board, user, billing, config
│   └── models/        # Typed domain models (User, Board, Bill, Config, Tenant)
└── shared/
    ├── components/    # stats-card, status-badge, page-header, confirm-dialog, loading-spinner
    └── pipes/         # relative-time, truncate
```

## Getting Started

### Prerequisites
- Node.js and npm
- Angular CLI 16.x (`npm install -g @angular/cli@16`)

### Install
```bash
npm install
```

### Run the development server
```bash
npm start
```
Navigate to `http://localhost:4200/`. With `environment.mockApi` set to `true` (the default in development), the app runs fully self-contained against realistic in-memory sample data — no backend required.

### Build for production
```bash
npm run build
```
Production builds use `environment.prod.ts` (`mockApi: false`) and require `apiUrl` to be pointed at a real backend implementing the endpoints declared in `src/environments/environment.prod.ts`.

### Run unit tests
```bash
npm test
```

## Configuration

Environment files live in `src/environments/`:

| Key | Purpose |
|---|---|
| `production` | Enables production optimizations |
| `mockApi` | Serves mock data from services instead of calling a real API |
| `apiUrl` | Base URL for the backend API |
| `endpoints` | Path map for auth, boards, users, config, and billing endpoints |
| `tokenKey` / `userKey` | localStorage keys for the JWT and current user session |

## Roles

- **`tenant_admin`** — full access, including Users, Configuration, and Billing.
- **`tenant_user` / `end_user`** — access to Dashboard, Boards, and Settings.

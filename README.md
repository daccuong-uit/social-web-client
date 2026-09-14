# Social Commerce Creator Platform — Frontend

> High-performance, modular Angular 21 frontend monorepo for the Social Commerce Creator Platform.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (Standalone, Signals-first) |
| Monorepo | Nx 22 |
| Styling | Tailwind CSS v4 (native Angular integration) |
| State | Angular Signals + RxJS |
| Linting | ESLint + Prettier |
| Testing | Jest |

## Project Structure

```
.
├── apps/
│   └── web/                    # Entry point — routing shell only, zero business logic
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout/     # AppShell component (header, router-outlet)
│       │   │   ├── routes/     # Lazy-loaded route definitions
│       │   │   └── app.config.ts
│       │   ├── styles.css      # Global design tokens (@theme) + base styles
│       │   └── index.html
│
├── libs/
│   ├── core/                   # tag: type:core
│   │   └── src/lib/
│   │       ├── config/         # app-config.ts, url-config.ts (Centralized configuration)
│   │       ├── services/       # AuthService, ApiService, ThemeService
│   │       ├── interceptors/   # HTTP auth + error interceptors
│   │       └── guards/         # AuthGuard, GuestGuard
│   │
│   ├── ui/                     # tag: type:ui — reusable presentation components
│   │   └── src/lib/
│   │       ├── button/         # UiButton — raw CSS (no Tailwind dependency)
│   │       └── card/           # UiCard — glassmorphism card
│   │
│   ├── entities/               # tag: type:entity — domain models and data access
│   │   ├── profile/
│   │   ├── media/
│   │   └── social/
│   │
│   └── features/               # tag: type:feature — user-facing vertical slices
│       ├── auth/               # scope:auth — Login, Register (lazy loaded at /auth)
│       ├── home/               # scope:home — Homepage and quick links
│       ├── media/              # scope:media — Creator and admin media management
│       └── dashboard/          # scope:dashboard — Dashboard (lazy loaded at /dashboard)
│
└── nx.json, tsconfig.base.json, eslint.config.mjs
```

## Module Boundary Rules

```
type:app     → can use: type:core, type:ui, type:feature
type:feature → can use: type:core, type:ui, type:entity
type:ui      → can use: type:core
type:core    → can use: type:core only
```

Enforced via ESLint `@nx/enforce-module-boundaries`.

## Path Aliases

All imports use scoped `@fe/*` aliases (no bare module names):

```ts
import { AuthService } from '@fe/core';
import { UiButton }    from '@fe/ui';
// Feature libs are lazy-loaded via router — never imported directly
```

## Getting Started

## Docker-first startup

From the Agent repository, build and start the full stack:

```powershell
docker compose build frontend
docker compose up -d frontend gateway
```

Open `http://localhost:4200`. Nginx serves the Angular bundle and proxies `/api/` to Gateway. The client therefore does not need a host Node installation to run the production image.

## Changes and deployment

This is an independent frontend repository. A Git push runs frontend CI; it does not update a running container. Build and recreate the image after code changes:

```powershell
docker compose build frontend
docker compose up -d frontend
```

In production, publish the frontend image and update its Docker Compose service or Kubernetes Deployment image tag. Kubernetes then rolls out the new pods.

## Local tooling

```bash
# Install dependencies
npm install

# Serve dev server
npx nx serve web

# Build production
npx nx build web

# Lint all
npx nx run-many -t lint

# Test all
npx nx run-many -t test
```

The commands above are for repository development and CI only. The supported application runtime is the Docker image.

## Phase Status

| Phase | Name | Status |
|---|---|---|
| **0** | Cross Project Foundation Platform | ✅ Complete |
| **1** | Frontend Foundation Platform | ✅ Complete |
| **2** | Design System Platform | ✅ Complete |
| **3** | Auth + Identity Platform | ✅ Complete |
| **4** | Media Platform | ✅ Complete |
| **5** | Social Platform | 🔜 Next |
| **6** | Realtime Platform | ⏳ Planned |
| **7** | Search Platform | ⏳ Planned |
| **8** | Creator Studio Platform | ⏳ Planned |
| **9** | Chat Platform | ⏳ Planned |
| **10** | Commerce Platform | ⏳ Planned |
| **11** | Live Platform | ⏳ Planned |
| **12** | Recommendation Platform | ⏳ Planned |
| **13** | Performance Platform | ⏳ Planned |
| **14** | Platform Engineering | ⏳ Planned |

## Phase 0 — What was built

- **Design Token System**: Semantic OKLCH color tokens defined in `styles.css` via Tailwind v4 `@theme`.
- **Global CSS Architecture**: Native Tailwind v4 + Angular 21 esbuild integration.
- **Feature Modularization**: Pages moved out of `apps/` into `libs/features/*` as lazy-loaded libraries.
- **Lazy Loading**: Initial bundle ~42KB, features load on demand.
- **Core Services**: Organized into dedicated folders (config, services, interceptors, guards) in `@fe/core`.
- **Shared UI**: `UiButton`, `UiCard` in `@fe/ui` with inline styles (library build compatible).
- **ESLint Module Boundaries**: Dependency rules strictly enforced.

## Phase 4 — What was built

- **Media Platform**: Creator file management page at `/media` with authenticated user upload, preview, delete, and user-specific media listing.
- **Media Studio**: Admin/system-wide media management page at `/media/studio` with list filtering, sorting, pagination, and delete actions via shared table component.
- **Shared Media API client**: `MediaApiService` supports CRUD and list operations with `filter`, `sort`, `page`, `pageSize`.
- **Shared Table Component**: reusable table in `libs/ui/src/lib/components/shared-table` for list views across media and future admin pages.
- **Route organization**: `/media` lazy-loads `@fe/features/media`, preserving separate creator and admin flows.

## Architecture Rules

- `apps/web` contains only bootstrap, global configuration, and top-level routes.
- `libs/core` contains singleton infrastructure such as guards, interceptors, and services.
- `libs/entities` contains domain models and data-access services without page composition.
- `libs/features` owns routes, pages, feature-specific UI, and feature state.
- `libs/ui` contains reusable presentation components and has no feature dependencies.

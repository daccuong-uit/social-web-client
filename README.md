# Social Commerce Creator Platform — Frontend

> High-performance, modular Angular 21 frontend monorepo for the Social Commerce Creator Platform.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (Standalone, Signals-first) |
| Monorepo | Nx 22 |
| Styling | Tailwind CSS v4 (native Angular integration) |
| i18n | Transloco |
| State | Angular Signals + RxJS |
| Linting | ESLint + Prettier |
| Testing | Jest |

## Project Structure

```
.
├── apps/
│   └── app-shell/              # Entry point — routing shell only, zero business logic
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout/     # AppShell component (header, router-outlet)
│       │   │   ├── routes/     # Lazy-loaded route definitions
│       │   │   └── app.config.ts
│       │   ├── styles.css      # Global design tokens (@theme) + base styles
│       │   └── index.html
│       └── public/
│           └── assets/i18n/    # Translation files (en.json, vi.json)
│
├── libs/
│   ├── core/                   # tag: type:core
│   │   └── src/lib/
│   │       ├── config/         # app-config.ts, url-config.ts (Centralized configuration)
│   │       ├── services/       # AuthService, ApiService, ThemeService
│   │       ├── interceptors/   # HTTP auth + error interceptors
│   │       └── guards/         # AuthGuard, GuestGuard
│   │
│   ├── ui/                     # tag: type:ui
│   │   └── src/lib/
│   │       ├── button/         # UiButton — raw CSS (no Tailwind dependency)
│   │       └── card/           # UiCard — glassmorphism card
│   │
│   └── features/               # tag: type:feature
│       ├── auth/               # scope:auth — Login, Register (lazy loaded at /auth)
│       ├── home/               # scope:home — Homepage and quick links
│       ├── media/              # scope:media — Creator and admin media management
│       └── dashboard/          # scope:dashboard — Dashboard (lazy loaded at /dashboard)
│
├── docs/
│   ├── ai/                     # Playbook, agent roles (Strategic documentation)
│   └── architecture/           # Design tokens, i18n, monorepo-structure (Technical specs)
│
└── nx.json, tsconfig.base.json, eslint.config.mjs
```

## Module Boundary Rules

```
type:app     → can use: type:core, type:ui, type:feature
type:feature → can use: type:core, type:ui
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

```bash
# Install dependencies
npm install

# Serve dev server
npx nx serve app-shell

# Build production
npx nx build app-shell

# Lint all
npx nx run-many -t lint

# Test all
npx nx run-many -t test
```

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
- **i18n**: Transloco configured with `en` and `vi` locales. Assets served from `public/assets/i18n/`.
- **Core Services**: Organized into dedicated folders (config, services, interceptors, guards) in `@fe/core`.
- **Shared UI**: `UiButton`, `UiCard` in `@fe/ui` with inline styles (library build compatible).
- **ESLint Module Boundaries**: Dependency rules strictly enforced.

## Phase 4 — What was built

- **Media Platform**: Creator file management page at `/media` with authenticated user upload, preview, delete, and user-specific media listing.
- **Media Studio**: Admin/system-wide media management page at `/media/studio` with list filtering, sorting, pagination, and delete actions via shared table component.
- **Shared Media API client**: `MediaApiService` supports CRUD and list operations with `filter`, `sort`, `page`, `pageSize`.
- **Shared Table Component**: reusable table in `libs/ui/src/lib/components/shared-table` for list views across media and future admin pages.
- **Route organization**: `/media` lazy-loads `@fe/features/media`, preserving separate creator and admin flows.

## Architecture Decisions

See [`docs/architecture/`](./docs/architecture/) for:
- Design Tokens specification
- i18n guidelines
- Monorepo structure and module boundaries
- Media feature architecture and route design

See [`docs/ai/frontend-ai-playbook.md`](./docs/ai/frontend-ai-playbook.md) for the full roadmap and FE philosophy.

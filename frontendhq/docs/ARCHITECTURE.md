# HackQuest Unified Architecture

## Overview
This project consolidates three separate frontend codebases (landing page, auth flow, and full dashboard app) into one Next.js App Router codebase with route groups.

## Route Groups
- `(public)`: public marketing routes (`/`, `/about`, `/features`)
- `(auth)`: auth/onboarding routes (`/login`, `/signup`, `/auth/wallet`, `/auth/profile-setup`)
- `(dashboard)`: player-facing product routes (`/dashboard`, `/quests`, `/marketplace`, `/wallet`, etc.)
- `(admin)`: admin control routes (`/admin`, `/admin/users`, `/admin/quests`, `/admin/market`, `/admin/withdrawals`, `/admin/simulation`)

## Component Layers
- `components/layout`: dashboard shell, sidebar, topbar, background
- `components/auth`: login/signup, wallet onboarding, profile setup, auth context
- `components/marketing`: landing page sections
- `components/pages`: migrated full-site feature pages (quests, team, event, wallet, etc.)
- `components/ui`: shared shadcn-style primitives (single canonical copy)

## Data and Services
- `lib/services/hackquest.service.ts`: primary API layer for auth, quests, leaderboard, activity, wallet, and blockchain routes
- `lib/supabase/*`: optional Supabase clients kept for integration parity
- `lib/constants/hackquest-tables.ts`: configurable table-name mapping to the Hackquest database schema

## Routing Compatibility
- `lib/router-compat.tsx` emulates React Router hooks (`useNavigate`, `useParams`, `useLocation`, `NavLink`) so migrated components work with minimal rewrites while running on Next.js.

## Migration Decisions
- Canonical base for dashboard/features: `full website` app
- Canonical base for auth UX: `loginpage` app
- Canonical base for public marketing: `landing page` app
- Duplicate `components/ui` libraries merged into a single shared source
- Legacy `/auth/login` paths retained for backward compatibility

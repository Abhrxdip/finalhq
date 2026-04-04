# HackQuest Unified

Single, production-style Next.js App Router codebase for the HackQuest platform.

This app consolidates:
- landing page UI
- login/onboarding flow
- full dashboard and admin experience
- backend-authenticated quest, wallet, and blockchain workflows

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- backend API service layer (JWT auth)

## Run Locally
1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Configure frontend environment values in `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

3. Start dev server:

```bash
npm run dev
```

4. Build for production validation:

```bash
npm run build
```

## Route Map

Public:
- `/`
- `/about`
- `/features`

Auth:
- `/login`
- `/signup`
- `/auth/login` (legacy compatibility)
- `/auth/wallet`
- `/auth/profile-setup`

Dashboard:
- `/dashboard`
- `/quests`
- `/quests/[id]`
- `/quests/[id]/submit`
- `/quests/[id]/status`
- `/inventory`
- `/marketplace`
- `/wallet`
- `/withdraw`
- `/leaderboard`
- `/event`
- `/team`
- `/activity`
- `/notifications`
- `/settings`
- `/profile/[username]`

Admin:
- `/admin`
- `/admin/users`
- `/admin/quests`
- `/admin/market`
- `/admin/withdrawals`
- `/admin/simulation`

## Project Structure
- `app/`: Next.js routes and group layouts
- `components/`: reusable UI and feature components
- `lib/`: tokens, services, Supabase clients, compatibility hooks
- `styles/`: shared theme and typography
- `docs/ARCHITECTURE.md`: integration and migration details

## Smart Contract Deploy From Frontend

The deploy workflow is available from the admin page and calls backend blockchain routes.

1. Start backend with blockchain env configured (`ALGO_ADMIN_MNEMONIC`, `PYTHON_BIN`, `ALGO_STRICT=true` for strict mode).
2. In backend `.env`, set `ADMIN_EMAILS` to include your login email.
3. Register/login in frontend using that admin email.
4. Open `/admin` and click `Deploy XP Registry`.
5. Use `Record +25 XP` to verify write flow, then verify tx in wallet/admin screens.

If deploy fails, check:
- backend auth token exists (login first)
- account role is `admin`
- backend can run python scripts from `blockchain_py/scripts`
- Algorand mnemonic/network env vars are valid

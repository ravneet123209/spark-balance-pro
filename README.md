# Expense Tracker

A polished full-stack personal-finance dashboard built as a university final project. Track income and expenses, visualize spending with charts, and stay in control of your money.

![Tech](https://img.shields.io/badge/React-19-61dafb) ![Tech](https://img.shields.io/badge/TanStack_Start-1.x-fff) ![Tech](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Tech](https://img.shields.io/badge/Supabase-DB%20%2B%20Auth-3ecf8e)

## Features

- **Authentication** — email/password sign up & sign in (Lovable Cloud / Supabase Auth)
- **Full CRUD** for transactions (create, read, update, delete) with confirmation dialogs and toast feedback
- **Description, category dropdown, type, date, amount** on every transaction
- **Search, filters & sorting** — search by description/category, filter by type & category, sort by date or amount
- **Dashboard analytics** — total income, total expenses, remaining balance, savings rate, transaction count
- **Charts** — pie chart of expenses by category, bar chart of monthly income vs expenses (Recharts, fully responsive)
- **Modern fintech UI** — collapsible sidebar, icons throughout, smooth hover transitions, polished cards
- **Responsive** for mobile, tablet, and desktop
- **Empty & loading states** with friendly messages and spinners
- **Row-Level Security** — every query is scoped to the authenticated user

## Tech Stack

- **Frontend:** React 19, TanStack Start (file-based routing + SSR), TanStack Query, Tailwind CSS 4, shadcn/ui, Recharts, Lucide icons, Sonner toasts, Zod
- **Backend:** Lovable Cloud (Supabase) — PostgreSQL, Auth, RLS policies
- **Build:** Vite 7, deployable to Cloudflare Workers / Vercel

## Folder Structure

```
src/
├── components/
│   ├── stat-card.tsx          # KPI card
│   ├── transaction-dialog.tsx # Add/Edit modal
│   ├── confirm-dialog.tsx     # Delete confirmation
│   └── ui/                    # shadcn primitives
├── hooks/
│   ├── use-auth.ts            # Supabase session hook
│   └── use-transactions.ts    # TanStack Query hooks for CRUD
├── integrations/supabase/     # Auto-generated client + types
├── lib/
│   └── categories.ts          # Category list, colors, currency formatter
├── routes/
│   ├── __root.tsx             # Root layout (QueryClient, Toaster)
│   ├── index.tsx              # Redirects to /dashboard or /login
│   ├── login.tsx              # Sign in / sign up
│   ├── _app.tsx               # Auth-guarded layout (sidebar)
│   └── _app/
│       ├── dashboard.tsx      # Analytics + charts
│       └── transactions.tsx   # CRUD list with filters
└── styles.css                 # Design tokens (oklch)
```

## Database Schema

`public.transactions`

| column        | type         | notes                                |
| ------------- | ------------ | ------------------------------------ |
| `id`          | uuid (PK)    | default `gen_random_uuid()`          |
| `user_id`     | uuid         | scoped via RLS                       |
| `amount`      | numeric(12,2)| `>= 0`                               |
| `type`        | text         | `'income'` \| `'expense'`            |
| `category`    | text         | Food, Transport, ...                 |
| `description` | text (null)  | optional note                        |
| `date`        | date         | transaction date                     |
| `created_at`  | timestamptz  | default `now()`                      |

RLS policies allow each authenticated user to `select / insert / update / delete` only rows where `auth.uid() = user_id`.

## Local Development

```bash
bun install
bun run dev
```

App runs at `http://localhost:5173`.

## Environment Variables

Provided automatically by Lovable Cloud (already present in `.env`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

If self-hosting on Supabase, set the same variables to point at your project.

## Backend Setup (self-hosting)

1. Create a Supabase project.
2. Run the migration found in `supabase/migrations/` to create the `transactions` table and RLS policies.
3. Enable email/password sign-ups in Authentication settings.
4. Paste the project URL + anon key into `.env`.

## Deployment

The project is configured for the TanStack Start Cloudflare Worker runtime out of the box. To deploy to **Vercel**:

1. Push to GitHub.
2. Import the repo on Vercel and pick the **TanStack Start** preset (or "Other" with `bun run build`).
3. Add the three `VITE_SUPABASE_*` environment variables.
4. Deploy.

On Lovable, just click **Publish** — frontend and backend ship together.

## License

MIT — built for educational purposes.

# HOET Work Report

A video-editing **work report management app** for House of EduTech — replaces
the daily/deputy/manager report spreadsheets with one connected application.

Two roles:

- **Editor** — logs each video (My Work), gets a personal **My Week** and **My Month**
  report, and can **see all team data** (Daily Dashboard + Monthly Report, read-only).
- **Manager** — everything editors see, plus the **Team & Users** page to add people,
  assign/create teams, set content focus, and change roles.

One editor's entry **flows up automatically** into every connected view (daily + monthly).
Login is by email (`name@houseofedtech.in`) or username; in local demo mode use the
username + `Hoet@2026`.

## Two modes (same codebase)

| | Local demo (default) | Cloud / production |
|---|---|---|
| Setup | none | Supabase project |
| Data | browser `localStorage` | shared Postgres |
| Sync | across browser tabs | across all devices (realtime) |
| Login | username + `Hoet@2026` | username + real password |

The app picks the mode automatically: if `NEXT_PUBLIC_SUPABASE_URL` is set it uses
Supabase, otherwise it runs the local demo.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Sign in with any username and password `Hoet@2026`:
`krishna` / `prince` (editors), `sathiya` / `vyshak` / `mukesh` / `kaustubh` /
`dheemanth` (managers). Open two browser tabs as different roles to watch updates
sync live. The demo is pre-seeded with Sathiya Moorthy's sample work entries.

## Deploy to Vercel (shared live data)

1. **Create a Supabase project** → copy `Project URL` and `anon` + `service_role` keys
   from *Project Settings → API*.
2. **Run the schema** — paste `supabase/schema.sql` into the Supabase SQL Editor and run it.
3. **Create accounts** locally:
   ```bash
   cp .env.local.example .env.local   # fill in URL + service_role key
   npm run seed                       # creates all 25 accounts
   ```
4. **Push to GitHub** and import the repo in Vercel.
5. In Vercel → *Settings → Environment Variables*, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy. Everyone logs in with their username + the seed password (they can
   change it later in Supabase).

## Roster & structure

Editors, pods and managers are defined in `lib/roster.data.json` (single source
for both the app and the seed script). Categories: **Organic, Ads, ReAsh, Course**.

## Tech

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Supabase
(Postgres + Auth + Realtime). All aggregation derives from one `work_entries`
table, so daily and monthly views are always consistent.

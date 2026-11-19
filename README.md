# Deal or Steal — AI property agent for Dubai

Next.js 16 · TypeScript · Tailwind CSS v4 · Auth.js (next-auth v5) · Drizzle ORM + SQLite

Anyone can browse: home, properties, property detail, insights, price check and the agent chat are public.
An account is needed only to **save homes**, **book viewings** and **make offers**.

## Setup

```bash
npm install
cp .env.example .env.local      # then fill in AUTH_SECRET (see below)
npm run db:setup                # create data/app.db and seed the demo account
npm run dev                     # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Required | What it's for |
|---|---|---|
| `AUTH_SECRET` | **Yes** | Signs and encrypts the session cookie. Generate one with `npx auth secret` or `openssl rand -base64 33`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Enables "Continue with Google". The button only appears when both are set. Authorised redirect URI: `http://localhost:3000/api/auth/callback/google` (and your production URL). |
| `ANTHROPIC_API_KEY` | No | Lets an LLM write the agent's replies. Without it the built-in rule-based agent (`src/lib/agent.ts`) is used. It works offline, which is safer for a live demo. |
| `AGENT_MODEL` | No | Model for the agent, defaults to `claude-sonnet-5-5`. |

### Database

SQLite lives at `data/app.db` (git-ignored). The schema is in `src/db/schema.ts`, and the SQL migrations are in `drizzle/`.

| Script | What it does |
|---|---|
| `npm run db:migrate` | Applies migrations in `drizzle/` to `data/app.db` |
| `npm run db:seed` | Creates/resets the demo account with a saved home, a viewing and an offer |
| `npm run db:setup` | Both of the above |
| `npm run db:generate` | After editing `schema.ts`, generates a new migration |

The app also applies pending migrations when it first connects, so a missing database won't crash it.

### Demo account

```
demo@dealorsteal.ae / demo1234
```

## How auth works

- **Auth.js v5** (`src/auth.ts`), JWT sessions, email + password (bcrypt-hashed) and optional Google. Google sign-ins are linked to a row in `users` by email.
- **Pages stay static.** The session is read on the client (`SessionProvider`) for UI only, so public pages remain in the prerendered shell under `cacheComponents`. `/account` reads the session on the server inside a `<Suspense>` boundary.
- **Writes are protected on the server.** Every server action in `src/app/actions.ts` and every route handler re-checks the session (`getCurrentUser()` in `src/lib/session.ts`) and validates input with zod (`src/lib/validation.ts`). Hiding a button is not the protection.
- **Gated actions resume after sign-in.** `src/components/auth/AuthGate.tsx` exposes `requireAuth(intent, run)`. Signed-out users get a sign-in/sign-up modal; after an email sign-in the original action runs in place (e.g. the viewing slot they picked is booked). Flows that leave the page (Google, `/sign-in?callbackUrl=…`) come back with `?intent=…`, and the component restores its draft from `sessionStorage` and finishes the action.
- **The agent asks first.** "Book a viewing for X" in `/agent` returns a *Sign in to book* button when signed out. Once signed in, it books the viewing and links to `/account?tab=viewings`.

## Pages

| Route | What it is |
|---|---|
| `/` | Hero with the agent search (typewriter examples + quick picks), a live verdict card that cycles through listings, area ticker, featured listings |
| `/agent` | AI agent chat. Accepts `?q=` to pre-fill a question |
| `/properties` | Listings with filters, verdict badges and save (heart) buttons |
| `/properties/[id]` | Detail page: fair-price scale, comps, 12-month trend, yield, **Book a viewing**, **Make an offer**, **Save** |
| `/price-check` | Paste any listing's details and get a verdict |
| `/insights` | Price/sq ft, yields, trends and a table by community |
| `/about` | How the fair price works, plus the FAQ |
| `/sign-in`, `/sign-up` | Account pages. Both accept `?callbackUrl=` (relative paths only) |
| `/account` | Tabs: Saved, My viewings, My offers, Profile, Sign out |
| `/legal/*` | Terms, privacy (covers account data), disclaimer. These are drafts that need legal review |
| `POST /api/agent` | Agent endpoint `{ message, history }` |
| `GET /api/me/favourites` | Signed-in user's saved listing ids |

## Design

A light, warm glassmorphism theme. Tokens live in `src/app/globals.css`: `canvas` (page background), `ink` (text), `gold` (#c9a35c brand fill), `gold-ink` (gold for text), plus a `glass` utility for frosted panels. Headings use Plus Jakarta Sans and body text uses Inter, both loaded with `next/font`. Hero animations are switched off for `prefers-reduced-motion`.

## Where to plug in real data

Everything lives in `src/lib/data.ts`:

- `AREAS`: benchmark AED/sq ft, yield and YoY per community. These are illustrative 2026 figures from public reports; replace them with medians computed from the DLD transactions and rents CSVs (data.dubai).
- `comparableSales()`: currently generates demo comps. Replace it with a query over the DLD transactions CSV (same area, similar size, last 6 months).
- `LISTINGS`: sample listings, used to demo the product.
- `assess()`: the fair-price logic. ≤ −5% vs fair value → **Steal**, ≥ +8% → **Overpriced**, otherwise **Fair**.

Images are hot-linked from Unsplash (free licence). To use your own, change `IMAGES` in `data.ts`.

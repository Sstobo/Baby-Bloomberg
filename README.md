# Baby Bloomberg

Self-hostable financial terminal built with TanStack Start + Convex.

![Screenshot 1](./public/Screenshot%202026-03-02%20at%209.33.29%E2%80%AFAM.png)
![Screenshot 2](./public/Screenshot%202026-03-01%20at%2011.23.13%E2%80%AFAM.png)

## What Is Implemented Today

- Real-time quote refresh for watchlist symbols (background cron every 30s)
- Local default watchlist with add/remove symbols
- Company profile + quote summary in sidebar accordions
- Company news feed per selected symbol
- SEC filings feed per selected symbol (10-K, 10-Q, 8-K, DEF 14A)
- Financial statements from FMP (income, balance sheet, cash flow)
- AI summaries for news + filings (Gemini + Firecrawl)
- Resizable terminal layout

## Current Product Scope

- `/terminal`: main product experience
- `/dashboard`: simple landing card linking to terminal
- `/design`: design system showcase page

## Notes On Current Behavior

- News is fetched when you select a symbol and when you click refresh.
- Filings auto-refresh every 5 minutes while a symbol is active (plus manual refresh).
- AI summary buttons are currently visible even without optional AI keys. Without those keys, analysis requests fail and log errors to the browser console.
- Panel-switch commands (`GP`, `DES`, `NEWS`, `FA`) exist in code, but the command bar is not mounted in the current terminal layout.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- One package manager: `npm`, `pnpm`, or `bun`
- A [Convex](https://convex.dev/) account

## Quick Start (Recommended)

```bash
git clone https://github.com/Sstobo/Baby-Bloomberg.git
cd Baby-Bloomberg
node setup.mjs
```

`setup.mjs` will:

- check Node/package-manager prerequisites
- install dependencies (if needed)
- run `npx convex dev --once` to initialize Convex
- add `VITE_CONVEX_URL` to `.env.local` when possible
- prompt you to set backend API keys

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/terminal`.

On first load:

- click a symbol in the watchlist to load its news and filings
- use the `+` button in the watchlist header to add a new symbol

## Manual Setup

### 1. Clone and install

```bash
git clone https://github.com/Sstobo/Baby-Bloomberg.git
cd Baby-Bloomberg
npm install
```

### 2. Initialize Convex (one-time)

```bash
npx convex dev --once
```

### 3. Configure frontend env

```bash
cp .env.example .env.local
```

Set `VITE_CONVEX_URL` in `.env.local`. You can fetch it with:

```bash
npx convex url
```

### 4. Set backend API keys in Convex

```bash
npx convex env set FINNHUB_API_KEY your_key_here
npx convex env set FMP_API_KEY your_key_here
```

Optional AI features:

```bash
npx convex env set FIRECRAWL_API_KEY your_key_here
npx convex env set GOOGLE_GENERATIVE_AI_API_KEY your_key_here
```

### 5. Start development

```bash
npm run dev
```

## API Keys

| Env var | Required | Used for |
| --- | --- | --- |
| `FINNHUB_API_KEY` | Yes | quotes, candles, company news, ticker search, company profile |
| `FMP_API_KEY` | Yes | financial statements |
| `FIRECRAWL_API_KEY` | No | scraping article/filing content for analysis |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Gemini text generation for analysis/reporting |

Signup links:

- Finnhub: <https://finnhub.io/register>
- Financial Modeling Prep: <https://site.financialmodelingprep.com/register>
- Firecrawl: <https://www.firecrawl.dev/app/sign-up>
- Google AI Studio: <https://aistudio.google.com/apikey>

## Dev Commands

```bash
npm run dev           # full stack (convex + web)
npm run dev:web       # vite frontend only
npm run dev:convex    # convex backend only
npm run build         # production build + type-check
npm run lint          # tsc + eslint
npm run format        # prettier write
npm run format:check  # prettier check
npm run start         # run built server from .output
```

`npm run dev` currently runs:

```bash
npx convex dev --once && concurrently -r npm:dev:web npm:dev:convex
```

If you use `pnpm` or `bun`, swap command prefixes accordingly.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | [TanStack Start](https://tanstack.com/start) + React 19 + Vite |
| Routing | [TanStack Router](https://tanstack.com/router) |
| Backend | [Convex](https://convex.dev/) |
| UI | Tailwind CSS v4 + shadcn/ui patterns |
| Charts | [lightweight-charts](https://tradingview.github.io/lightweight-charts/) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) + Google Gemini |
| Data Providers | Finnhub, Financial Modeling Prep, SEC EDGAR |

## Project Layout

```text
src/
  routes/                    # route files
  features/terminal/         # terminal UI (watchlist, news, filings, chart, financials)
  features/dashboard/        # dashboard page
  features/design/           # design system page
  components/                # shared UI + header/theme primitives
  styles/                    # app.css

convex/
  market/                    # quotes, news, filings, financials, search, ai analysis
  terminal/                  # watchlist + health checks
  schema.ts                  # db schema
  crons.ts                   # quote/news refresh schedules
  rateLimits.ts              # provider rate limiter config
  model.ts                   # Gemini model binding
```

## Troubleshooting

- `VITE_CONVEX_URL is not set`:
  - add `VITE_CONVEX_URL=...` to `.env.local`
  - restart the dev server
- Missing data in terminal:
  - verify required keys with `npx convex env list`
  - set `FINNHUB_API_KEY` and `FMP_API_KEY`
- AI summary action spins then does nothing:
  - set both optional keys (`FIRECRAWL_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`)
  - check browser console for action errors

## License

[MIT](LICENSE)

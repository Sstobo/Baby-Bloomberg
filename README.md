# Baby Bloomberg

A self-hostable financial terminal with real-time market data, interactive charts, AI-powered analysis, and SEC filing research. Built with TanStack Start and Convex.

![Screenshot 1](./public/Screenshot%202026-03-01%20at%2011.23.02%E2%80%AFAM.png)
![Screenshot 2](./public/Screenshot%202026-03-01%20at%2011.23.13%E2%80%AFAM.png)

## Features

- **Real-time quotes** — live price updates every 30 seconds
- **Interactive charts** — candlestick charts with multiple timeframes
- **Company profiles** — sector, industry, market cap, and logo
- **News feed** — auto-refreshing market news with optional AI summaries
- **SEC filings** — EDGAR integration for 10-K, 10-Q, 8-K, and more
- **Financial statements** — income, balance sheet, and cash flow data
- **AI analysis** — Gemini-powered article and filing analysis
- **Watchlists** — create and manage symbol watchlists
- **Terminal UI** — resizable multi-panel layout inspired by Bloomberg terminals
- **Dark/light themes** — system-aware theme switching

---

## Quick Start

### Prerequisites

- **[Node.js](https://nodejs.org/)** v20+ — download from [nodejs.org](https://nodejs.org/)
- A package manager: **[npm](https://docs.npmjs.com/)** (included with Node), **[pnpm](https://pnpm.io/)**, or **[bun](https://bun.sh/)**
- **[Convex](https://convex.dev/)** account — free at [convex.dev](https://convex.dev/)

### Option A: Interactive Setup Script

The setup script walks you through everything step by step — installs dependencies, sets up Convex, and prompts for each API key:

```bash
git clone https://github.com/your-username/baby-bloomberg.git
cd baby-bloomberg
node setup.mjs
```

It checks prerequisites, runs the Convex setup flow, configures your environment, and prompts for each API key with direct links to sign up. Works on macOS, Linux, and Windows.

### Option B: Manual Setup

If you prefer to do it yourself, follow the steps below.

---

## Manual Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/baby-bloomberg.git
cd baby-bloomberg
npm install    # or: pnpm install / bun install
```

### 2. Set up Convex

```bash
npx convex dev
```

On first run, this walks you through creating a free Convex project. It will output your deployment URL — copy it for the next step.

> Leave this terminal running. Open a **new terminal** for the remaining steps.

### 3. Configure frontend environment

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your Convex URL:

```
VITE_CONVEX_URL=https://your-project-123.convex.cloud
```

### 4. Get your API keys

You need **4 API keys** from free services. The first two are required. The last two are optional and enable AI analysis features.

---

#### Finnhub (required)

Provides: stock quotes, candlestick charts, company news, ticker search

1. Go to [finnhub.io/register](https://finnhub.io/register)
2. Sign up with email or Google
3. After signup, your API key is shown on the dashboard
4. Copy the key and run:

```bash
npx convex env set FINNHUB_API_KEY your_key_here
```

> Free tier: 60 API calls per minute. The app is rate-limited to stay within this.

---

#### Financial Modeling Prep (required)

Provides: financial statements (income, balance sheet, cash flow), company profiles

1. Go to [site.financialmodelingprep.com/register](https://site.financialmodelingprep.com/register)
2. Sign up for a free account
3. Your API key is on the dashboard after login
4. Copy the key and run:

```bash
npx convex env set FMP_API_KEY your_key_here
```

> Free tier: 250 API calls per day. The app caches results to minimize usage.

---

#### Firecrawl (optional — AI analysis)

Provides: web scraping that extracts article and SEC filing content for AI analysis

1. Go to [firecrawl.dev/app/sign-up](https://www.firecrawl.dev/app/sign-up)
2. Sign up for a free account
3. Go to API Keys in your dashboard and create a key
4. Copy the key and run:

```bash
npx convex env set FIRECRAWL_API_KEY your_key_here
```

> Free tier: 500 credits per month. Each article/filing analysis uses 1 credit.

---

#### Google AI / Gemini (optional — AI analysis)

Provides: the LLM that generates analysis summaries of news articles and SEC filings

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key" and select any Google Cloud project (or create one)
4. Copy the key and run:

```bash
npx convex env set GOOGLE_GENERATIVE_AI_API_KEY your_key_here
```

> Free tier: generous rate limits for Gemini Flash. More than enough for personal use.

---

> **Note:** Without Firecrawl and Gemini keys, the app works perfectly — you just won't see the "Analyze" buttons on news articles and SEC filings.

### 5. Start the app

```bash
npm run dev    # or: pnpm dev / bun dev
```

Open **[http://localhost:3000](http://localhost:3000)** — it redirects to the terminal view. Type a stock ticker (e.g. `AAPL`) in the command bar to get started.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | [TanStack Start](https://tanstack.com/start) (React 19, Vite) |
| Routing | [TanStack Router](https://tanstack.com/router) (file-based, type-safe) |
| UI | [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS 4](https://tailwindcss.com/) |
| Backend | [Convex](https://convex.dev/) (real-time database) |
| Charts | [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) + [Google Gemini](https://ai.google.dev/) |
| Market Data | [Finnhub](https://finnhub.io/), [FMP](https://financialmodelingprep.com/), [SEC EDGAR](https://www.sec.gov/edgar) |

## Project Structure

```
src/
├── routes/              # Thin route shells (loader + component import)
│   ├── __root.tsx       # App shell, providers, error boundary
│   ├── index.tsx        # Redirects to /terminal
│   ├── terminal.tsx     # Main terminal view
│   ├── dashboard.tsx    # Market dashboard
│   └── design.tsx       # Design system showcase
├── features/
│   ├── terminal/        # Terminal layout, panels, providers
│   ├── dashboard/       # Dashboard page
│   └── design/          # Design system page
├── components/
│   ├── ui/              # shadcn/ui components
│   └── header/          # App header & navigation
└── lib/                 # Utilities (cn, motion tokens)

convex/
├── schema.ts            # Database schema
├── market/              # Market data (quotes, news, filings, financials, search)
├── terminal/            # Watchlist management
├── model.ts             # AI model config (Gemini)
├── crons.ts             # Scheduled jobs (quote & news refresh)
├── rateLimits.ts        # API rate limiting
├── validators.ts        # Shared Convex validators
└── http.ts              # HTTP router
```

## Development Commands

```bash
npm run dev          # Full-stack (Convex + Vite)
npm run dev:web      # Frontend only
npm run dev:convex   # Backend only
npm run build        # Production build
npm run lint         # TypeScript + ESLint
npm run format       # Prettier
```

> Using **pnpm**? Replace `npm run` with `pnpm`. Using **bun**? Replace `npm run` with `bun`.

## License

[MIT](LICENSE)

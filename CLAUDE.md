# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 1. Project Overview

Self-hostable financial terminal with real-time market data, interactive charts, AI-powered analysis, and SEC filing research.

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | TanStack Start (React meta-framework on Vite) |
| **Routing** | TanStack Router (file-based, type-safe) |
| **UI** | React 19, shadcn/ui, Tailwind CSS 4 |
| **Backend** | Convex (real-time BaaS) |
| **Charts** | Lightweight Charts (TradingView) |
| **AI** | Vercel AI SDK + Google Gemini |
| **Market Data** | Finnhub, FMP, SEC EDGAR |
| **Validation** | Zod (frontend), Convex validators (backend) |

---

## 2. Development Commands

```bash
pnpm dev          # Full-stack (Convex + Vite)
pnpm dev:web      # Frontend only (port 3000)
pnpm dev:convex   # Backend only
pnpm build        # Production build
pnpm lint         # TypeScript + ESLint (zero warnings)
pnpm format       # Format code
```

### Environment Variables

**Frontend** (`.env.local`):
```
VITE_CONVEX_URL=           # Convex deployment URL
```

**Backend** (via `npx convex env set`):
```
FINNHUB_API_KEY=                   # Real-time quotes & news
FMP_API_KEY=                       # Financial statements & profiles
FIRECRAWL_API_KEY=                 # AI article/filing analysis (optional)
GOOGLE_GENERATIVE_AI_API_KEY=      # Gemini LLM (optional)
```

---

## 3. Project Structure

```
src/
├── routes/                       # Thin shells: loader, guard, component import
│   ├── __root.tsx               # App shell, providers, error boundary
│   ├── index.tsx                # Redirects to /terminal
│   ├── terminal.tsx             # Main terminal view
│   ├── dashboard.tsx            # Market dashboard
│   └── design.tsx               # Design system showcase
├── features/                    # Feature modules (all UI logic lives here)
│   ├── terminal/                # Terminal layout, panels, providers
│   ├── dashboard/               # Dashboard page
│   └── design/                  # Design system page
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── header/                  # App header & navigation
│   ├── page-layout.tsx          # Standard page wrapper
│   └── theme-toggle.tsx         # Dark/light toggle
└── lib/
    ├── motion.ts                # Animation tokens & variants
    └── utils.ts                 # cn() utility

convex/
├── schema.ts                    # Database schema (CHECK FIRST)
├── validators.ts                # Shared Convex validators
├── model.ts                     # AI model definitions (Gemini)
├── rateLimits.ts                # Rate limiter config (Finnhub, FMP)
├── crons.ts                     # Scheduled jobs (quote & news refresh)
├── http.ts                      # HTTP routes
├── convex.config.ts             # Registered components
├── market/                      # Market data modules
│   ├── quotes.ts                # Real-time quote fetching
│   ├── news.ts                  # Market news
│   ├── filings.ts               # SEC filing retrieval
│   ├── filingAnalysis.ts        # AI filing analysis
│   ├── financials.ts            # Financial statements
│   ├── historical.ts            # Historical price bars
│   ├── profiles.ts              # Company profiles
│   ├── search.ts                # Symbol search
│   ├── analysis.ts              # AI news analysis
│   ├── edgar.ts                 # SEC EDGAR integration
│   ├── finnhub.ts               # Finnhub API client
│   └── fmp.ts                   # FMP API client
└── terminal/
    └── watchlists.ts            # Watchlist CRUD
```

---

## 4. Convex Backend

### 4.1 Schema

**Always check `convex/schema.ts` before writing any Convex function.** Current tables:

- `quotes` — real-time price data (indexed by symbol, updatedAt)
- `companyProfiles` — company info, sector, logo (indexed by symbol)
- `historicalBars` — OHLCV candle data (indexed by symbol+resolution)
- `watchlists` — user watchlists (indexed by userId, userId+isDefault)
- `newsArticles` — market news with AI analysis (indexed by symbol, externalId, publishedAt)
- `secFilings` — SEC filings (indexed by symbol, accessionNumber)
- `cikMappings` — symbol-to-CIK lookups (indexed by symbol)
- `financialStatements` — income/balance/cash flow (indexed by symbol+type+period)

### 4.2 Writing Functions

All functions are public (no auth). Use `query`, `mutation`, `action`, `internalQuery`, `internalMutation`, `internalAction` from `"./_generated/server"`.

**Index usage — always use `.withIndex()`, never `.filter()` on table scans:**

```typescript
// ✅ CORRECT
const quote = await ctx.db
  .query("quotes")
  .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
  .unique();

// ❌ WRONG — full table scan
const quote = await ctx.db
  .query("quotes")
  .filter((q) => q.eq(q.field("symbol"), symbol))
  .unique();
```

### 4.3 Validators

Shared validators live in `convex/validators.ts`. Every function must have a `returns` validator.

Key patterns:
- Nullable: `v.union(v.null(), validator)` — NOT `v.optional()`
- Optional field: `v.optional(v.string())` — field may be absent
- System fields: always include `_id: v.id("tableName")` and `_creationTime: v.number()` when returning full docs

### 4.4 Scheduling

```typescript
await ctx.scheduler.runAfter(0, internal.market.analysis.analyzeArticle, { articleId });
```

- `ctx.scheduler.runAfter(delayMs, functionRef, args)` — schedule from mutations or actions
- Target function must be `internal*` (not exported to client)
- Actions for I/O (API calls, HTTP). Mutations for DB writes.

### 4.5 Rate Limiting

```typescript
import { rateLimiter } from "./rateLimits";

const { ok, retryAfter } = await rateLimiter.limit(ctx, "finnhubApi", { throws: true });
```

Configured limits: `finnhubApi` (55/min), `fmpApi` (240/day).

### 4.6 Registered Components

Defined in `convex/convex.config.ts`:

| Component | Package |
|-----------|---------|
| `rateLimiter` | `@convex-dev/rate-limiter` |

---

## 5. TanStack Start Frontend

### 5.1 Router Setup

The router is configured in `__root.tsx`:
- Provider stack: `ConvexQueryCacheProvider` → `ThemeProvider` → `MotionConfig`
- No auth — all routes are public

### 5.2 Route Shell Pattern

Routes are thin shells — loaders, guards, layout wrappers only. Feature logic lives in `src/features/<name>/`.

### 5.3 Loaders & Real-time Data

- **Loaders** use `convexQuery()` from `@convex-dev/react-query` — wraps Convex queries for TanStack Query
- **Components** use `useQuery()` from `convex-helpers/react/cache` — real-time subscriptions

```tsx
// In loader (SSR)
await context.queryClient.ensureQueryData(convexQuery(api.market.quotes.getQuote, { symbol }))

// In component (real-time)
const quote = useQuery(api.market.quotes.getQuote, { symbol })
```

### 5.4 Loading States

**Three-state query handling:**

```tsx
const data = useQuery(api.getData, { id })

if (data === undefined) return <Skeleton />  // Loading
if (data === null) return <NotFound />       // Not found
return <Content data={data} />               // Success
```

**Skip pattern for conditional queries:**

```tsx
const data = useQuery(api.something, userId ? { userId } : "skip")
```

### 5.5 Component Composition

- **Compound components** — `Component.Frame`, `Component.Input`, etc. with shared context
- **Provider pattern** — `{ state, actions, meta }` context interface
- **Explicit variants** — create separate components instead of boolean mode props
- **Children over render props** — compose via `children`, not callbacks
- **React 19 APIs:** `use(Context)` instead of `useContext()`, `ref` as regular prop

---

## 6. UI & Design System

### 6.1 Colors

- OKLch color system — primary defined in CSS variables
- **No hardcoded Tailwind colors** — use semantic tokens (`text-primary`, `bg-muted`, etc.)

### 6.2 Depth System

Pure drop shadows only — **no white inset glows**.

- **Surface**: `shadow-depth-1` through `shadow-depth-5`
- **Interactive**: `button-elevated` class
- **Controls**: Tailwind builtins (`shadow-xs`, `shadow-sm`)

### 6.3 Motion

Import from `~/lib/motion`:
- `MOTION.duration` — `instant` (0.15s), `fast` (0.2s), `normal` (0.3s), `slow` (0.5s)
- `MOTION.ease` — `expoOut`, `easeOut`, `easeIn`
- `MOTION.spring` — `snappy`, `gentle`
- Max animation duration: 600ms

### 6.4 PageLayout

```tsx
import { PageLayout } from '~/components/page-layout'

<PageLayout title="Page Title" subtitle="Optional" maxWidth="6xl" fillHeight>
  {/* content */}
</PageLayout>
```

---

## 7. Import Map

| What | Import from | NOT from |
|------|-------------|----------|
| `useQuery` | `convex-helpers/react/cache` | `convex/react` |
| `useMutation`, `useAction` | `convex/react` | — |
| `convexQuery` (loaders) | `@convex-dev/react-query` | — |
| `api` | `@/../convex/_generated/api` | — |
| `v` (validators) | `convex/values` | — |
| `Doc`, `Id` (types) | `import type { Doc, Id } from "./_generated/dataModel"` | — |
| `query`, `mutation`, etc. | `"./_generated/server"` (within convex/) | — |
| UI components | `~/components/ui/<name>` | — |
| Motion tokens | `~/lib/motion` | hardcoded values |

---

## 8. Rules

### DO

- **Check `convex/schema.ts` first** before writing any Convex function
- **Always use indexes** — `.withIndex()` on every query
- **Write `returns` validators** on every new Convex function
- **Add `type` before type imports**: `import type { Doc } from "..."`
- **Keep routes as thin shells** — loaders, guards, layout wrappers only
- **Use `~` or `@` path aliases** for imports
- **Use `PageLayout`** for all new route pages
- **Use semantic color tokens** — `text-primary`, `bg-muted`, etc.
- **Make all builds responsive**
- **Use Conventional Commits** formatting
- **Call all hooks before any conditional returns**
- **Use compound components** for complex UI
- **Use `use(Context)` (React 19)** — not `useContext(Context)`
- **Pass `ref` as a regular prop in new components** — no `forwardRef`

### DO NOT

- **Never `.filter()` on table scans** — always use indexes
- **Never import `useQuery` from `convex/react`** — use `convex-helpers/react/cache`
- **Never hardcode Tailwind colors** — no `text-blue-500`, `bg-red-200`, etc.
- **Never add white inset glows** — pure drop shadows only
- **Never add docstrings, JSDoc, or comment blocks**
- **Never use `v.optional()` for nullable return values** — use `v.union(v.null(), validator)`
- **Never call actions from mutations** — schedule them instead
- **Never use `forwardRef` in new components** — React 19 supports `ref` as regular prop
- **Never use `useContext()`** — use `use()` from React 19
- **Never access browser APIs during initial render** — defer to `useEffect`

---

## 9. Common Gotchas

1. **Wrong `useQuery` import** — must be from `convex-helpers/react/cache`, not `convex/react`
2. **Zod ≠ Convex validators** — Zod for frontend forms, Convex `v.*` for backend. Never mix.
3. **`v.union(v.null(), X)` for nullable returns** — `v.optional()` means field may be absent, not null.
4. **Index queries require exact field match** — `withIndex("by_symbol", q => q.eq("symbol", val))` must match index field order.
5. **Actions cannot write to DB directly** — schedule a mutation: `ctx.scheduler.runAfter(0, internal.module.mutation, args)`.
6. **`convexQuery` (loaders) vs `useQuery` (components)** — loaders use `convexQuery()` for SSR. Components use `useQuery()` for real-time.
7. **Skip pattern for conditional queries** — always call the hook, pass `"skip"` as second arg.
8. **`_creationTime` is milliseconds** — Unix epoch in ms, not seconds.

## Final Core Instructions

Behavioral guidelines to reduce common LLM coding mistakes.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.
If multiple interpretations exist, present them - don't pick silently.
If a simpler approach exists, say so. Push back when warranted.
If something is unclear, stop. Name what's confusing. Ask.
2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

No features beyond what was asked.
No abstractions for single-use code.
No "flexibility" or "configurability" that wasn't requested.
No error handling for impossible scenarios.
If you write 200 lines and it could be 50, rewrite it.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

3. Surgical Changes
Touch only what you must. Clean up only your own mess.

When editing existing code:

Don't "improve" adjacent code, comments, or formatting.
Don't refactor things that aren't broken.
Match existing style, even if you'd do it differently.
If you notice unrelated dead code, mention it - don't delete it.
When your changes create orphans:

Remove imports/variables/functions that YOUR changes made unused.
Don't remove pre-existing dead code unless asked.
The test: Every changed line should trace directly to the user's request.

4. Goal-Driven Execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

"Add validation" → "Write tests for invalid inputs, then make them pass"
"Fix the bug" → "Write a test that reproduces it, then make it pass"
"Refactor X" → "Ensure tests pass before and after"
For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

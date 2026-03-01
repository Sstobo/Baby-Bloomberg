import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery } from 'convex-helpers/react/cache'
import { useMutation } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useTerminal } from '../terminal-provider'
import { X, Plus, ChevronRight } from 'lucide-react'

export function WatchlistPanel() {
  const { state, actions } = useTerminal()
  const watchlist = useQuery(api.terminal.watchlists.getDefault, {})
  const ensureDefault = useMutation(api.terminal.watchlists.ensureDefault)
  const addSymbol = useMutation(api.terminal.watchlists.addSymbol)
  const removeSymbol = useMutation(api.terminal.watchlists.removeSymbol)

  const symbols = watchlist?.symbols ?? []
  const quotes = useQuery(
    api.market.quotes.getQuotes,
    symbols.length > 0 ? { symbols } : 'skip'
  )
  const requestQuote = useMutation(api.market.quotes.requestQuote)

  const [addInput, setAddInput] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const ensuredRef = useRef(false)
  useEffect(() => {
    if (!ensuredRef.current && watchlist === null) {
      ensuredRef.current = true
      ensureDefault()
    }
  }, [watchlist, ensureDefault])

  const prevSymbolsRef = useRef<string>('')
  useEffect(() => {
    const key = symbols.join(',')
    if (key !== prevSymbolsRef.current && symbols.length > 0) {
      prevSymbolsRef.current = key
      for (const s of symbols) {
        requestQuote({ symbol: s })
      }
    }
  }, [symbols, requestQuote])

  const quoteMap = new Map(
    (quotes ?? []).map((q) => [q.symbol, q])
  )

  const handleAdd = useCallback(async () => {
    const sym = addInput.trim().toUpperCase()
    if (sym.length > 0) {
      await addSymbol({ symbol: sym })
      setAddInput('')
      setShowAdd(false)
    }
  }, [addInput, addSymbol])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-terminal px-2 py-1">
        <span className="text-t-muted text-[10px] font-semibold uppercase tracking-wider">
          Watchlist
        </span>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-t-muted hover:text-amber transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {showAdd && (
        <div className="border-b border-terminal px-2 py-1">
          <input
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') setShowAdd(false)
            }}
            placeholder="Add symbol..."
            className="w-full bg-transparent text-xs text-[var(--terminal-text-primary)] placeholder:text-[var(--terminal-text-muted)] focus:outline-none"
            autoFocus
          />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-t-muted border-b border-terminal">
              <th className="px-2 py-1 text-left font-medium">Symbol</th>
              <th className="px-2 py-1 text-right font-medium">Last</th>
              <th className="px-2 py-1 text-right font-medium">Chg%</th>
              <th className="w-5" />
            </tr>
          </thead>
          <tbody>
            {symbols.map((sym) => {
              const q = quoteMap.get(sym)
              const isUp = q ? q.change >= 0 : true
              const isActive = state.activeSecurity === sym

              return (
                <WatchlistRow
                  key={sym}
                  symbol={sym}
                  price={q?.price}
                  changePercent={q?.changePercent}
                  isUp={isUp}
                  isActive={isActive}
                  onSelect={() => actions.setSecurity(sym)}
                  onRemove={() => removeSymbol({ symbol: sym })}
                />
              )
            })}
          </tbody>
        </table>

        {state.activeSecurity && (
          <div className="border-t border-terminal">
            <OverviewAccordion symbol={state.activeSecurity} />
            <FinancialsAccordion symbol={state.activeSecurity} />
          </div>
        )}
      </div>
    </div>
  )
}

function AccordionSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-terminal">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-t-muted transition-colors hover:text-t-primary"
      >
        <ChevronRight className={`h-2.5 w-2.5 transition-transform ${open ? 'rotate-90' : ''}`} />
        {label}
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </div>
  )
}

function OverviewAccordion({ symbol }: { symbol: string }) {
  const [open, setOpen] = useState(false)
  const quote = useQuery(api.market.quotes.getQuote, { symbol })
  const profile = useQuery(api.market.profiles.getProfile, { symbol })
  const requestQuote = useMutation(api.market.quotes.requestQuote)
  const requestProfile = useMutation(api.market.profiles.requestProfile)

  const prevSymbolRef = useRef<string | null>(null)
  useEffect(() => {
    if (symbol !== prevSymbolRef.current) {
      prevSymbolRef.current = symbol
      requestQuote({ symbol })
      requestProfile({ symbol })
    }
  }, [symbol, requestQuote, requestProfile])

  const isUp = quote ? quote.change >= 0 : true

  return (
    <AccordionSection label="Overview" open={open} onToggle={() => setOpen(!open)}>
      {quote === undefined ? (
        <p className="text-t-muted animate-pulse text-[10px]">Loading...</p>
      ) : quote === null ? (
        <p className="text-t-muted text-[10px]">No data</p>
      ) : (
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-t-primary text-sm font-bold tabular-nums">
              {quote.price.toFixed(2)}
            </span>
            <span className={`text-[10px] tabular-nums ${isUp ? 'text-up' : 'text-down'}`}>
              {isUp ? '+' : ''}{quote.change.toFixed(2)} ({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
            <MiniStat label="Open" value={quote.open.toFixed(2)} />
            <MiniStat label="High" value={quote.high.toFixed(2)} />
            <MiniStat label="Low" value={quote.low.toFixed(2)} />
            <MiniStat label="Vol" value={fmtVol(quote.volume)} />
            {profile?.marketCap && <MiniStat label="MCap" value={fmtCap(profile.marketCap)} />}
            {profile?.sector && <MiniStat label="Sector" value={profile.sector} />}
          </div>
        </div>
      )}
    </AccordionSection>
  )
}

function FinancialsAccordion({ symbol }: { symbol: string }) {
  const [open, setOpen] = useState(false)
  const [statementType, setStatementType] = useState<'income' | 'balance_sheet' | 'cash_flow'>('income')

  const statementDoc = useQuery(
    api.market.financials.getStatement,
    { symbol, statementType, period: 'annual' }
  )
  const requestStatement = useMutation(api.market.financials.requestStatement)

  const prevKeyRef = useRef<string | null>(null)
  useEffect(() => {
    const key = `${symbol}-${statementType}`
    if (key !== prevKeyRef.current) {
      prevKeyRef.current = key
      requestStatement({ symbol, statementType, period: 'annual' })
    }
  }, [symbol, statementType, requestStatement])

  const latest = useMemo(() => {
    if (!statementDoc?.data) return null
    try {
      const periods = JSON.parse(statementDoc.data) as Array<Record<string, unknown>>
      return periods[0] ?? null
    } catch {
      return null
    }
  }, [statementDoc?.data])

  const rows = SUMMARY_ROWS[statementType]

  return (
    <AccordionSection label="Financials" open={open} onToggle={() => setOpen(!open)}>
      <div className="mb-1.5 flex items-center gap-1">
        {(['income', 'balance_sheet', 'cash_flow'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setStatementType(t)}
            className={`rounded px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
              t === statementType
                ? 'bg-[var(--terminal-amber)] text-[var(--terminal-bg)]'
                : 'text-t-muted hover:text-t-primary'
            }`}
          >
            {t === 'income' ? 'Inc' : t === 'balance_sheet' ? 'BS' : 'CF'}
          </button>
        ))}
      </div>
      {statementDoc === undefined ? (
        <p className="text-t-muted animate-pulse text-[10px]">Loading...</p>
      ) : !latest ? (
        <p className="text-t-muted text-[10px]">No data</p>
      ) : (
        <div className="space-y-0.5">
          {rows.map((r) => {
            const val = latest[r.key] as number | undefined | null
            return (
              <div key={r.key} className="flex items-center justify-between text-[10px]">
                <span className="text-t-muted">{r.label}</span>
                <span className={`tabular-nums ${val != null && val < 0 ? 'text-down' : 'text-t-primary'}`}>
                  {fmtFin(val)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </AccordionSection>
  )
}

const SUMMARY_ROWS: Record<'income' | 'balance_sheet' | 'cash_flow', { key: string; label: string }[]> = {
  income: [
    { key: 'revenue', label: 'Revenue' },
    { key: 'grossProfit', label: 'Gross Profit' },
    { key: 'operatingIncome', label: 'Op. Income' },
    { key: 'netIncome', label: 'Net Income' },
    { key: 'epsdiluted', label: 'EPS (Dil)' },
  ],
  balance_sheet: [
    { key: 'cashAndCashEquivalents', label: 'Cash' },
    { key: 'totalAssets', label: 'Total Assets' },
    { key: 'totalLiabilities', label: 'Total Liab.' },
    { key: 'totalStockholdersEquity', label: 'Equity' },
  ],
  cash_flow: [
    { key: 'operatingCashFlow', label: 'Op. CF' },
    { key: 'capitalExpenditure', label: 'CapEx' },
    { key: 'freeCashFlow', label: 'Free CF' },
  ],
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-t-muted">{label}</span>
      <span className="text-t-primary tabular-nums">{value}</span>
    </div>
  )
}

function fmtVol(v: number | undefined): string {
  if (!v) return '—'
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return v.toLocaleString()
}

function fmtCap(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`
  return `$${v.toLocaleString()}`
}

function fmtFin(v: number | undefined | null): string {
  if (v === undefined || v === null || v === 0) return '—'
  const abs = Math.abs(v)
  const s = abs >= 1e9 ? `$${(abs / 1e9).toFixed(1)}B`
    : abs >= 1e6 ? `$${(abs / 1e6).toFixed(0)}M`
    : abs >= 1e3 ? `$${(abs / 1e3).toFixed(0)}K`
    : `$${abs.toFixed(2)}`
  return v < 0 ? `(${s})` : s
}

function WatchlistRow({
  symbol,
  price,
  changePercent,
  isUp,
  isActive,
  onSelect,
  onRemove,
}: {
  symbol: string
  price: number | undefined
  changePercent: number | undefined
  isUp: boolean
  isActive: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  const prevPriceRef = useRef<number | undefined>(undefined)
  const rowRef = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    if (
      price !== undefined &&
      prevPriceRef.current !== undefined &&
      price !== prevPriceRef.current
    ) {
      const flashClass =
        price > prevPriceRef.current ? 'animate-flash-up' : 'animate-flash-down'
      rowRef.current?.classList.add(flashClass)
      const timer = setTimeout(() => {
        rowRef.current?.classList.remove(flashClass)
      }, 600)
      prevPriceRef.current = price
      return () => clearTimeout(timer)
    }
    prevPriceRef.current = price
  }, [price])

  return (
    <tr
      ref={rowRef}
      onClick={onSelect}
      className={`group cursor-pointer transition-colors ${
        isActive
          ? 'bg-[var(--terminal-surface)]'
          : 'hover:bg-[var(--terminal-surface-hover)]'
      }`}
    >
      <td className="px-2 py-1 font-semibold text-[var(--terminal-amber)]">
        {symbol}
      </td>
      <td className="px-2 py-1 text-right tabular-nums text-[var(--terminal-text-primary)]">
        {price !== undefined ? price.toFixed(2) : '—'}
      </td>
      <td
        className={`px-2 py-1 text-right tabular-nums ${
          isUp ? 'text-up' : 'text-down'
        }`}
      >
        {changePercent !== undefined
          ? `${isUp ? '+' : ''}${changePercent.toFixed(2)}%`
          : '—'}
      </td>
      <td className="px-1 py-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="opacity-0 group-hover:opacity-100 text-[var(--terminal-text-muted)] hover:text-[var(--terminal-down)] transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      </td>
    </tr>
  )
}

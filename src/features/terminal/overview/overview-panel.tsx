import { useEffect, useRef } from 'react'
import { useQuery } from 'convex-helpers/react/cache'
import { useMutation } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useTerminal } from '../terminal-provider'

function formatMarketCap(value: number | undefined): string {
  if (!value) return '—'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === 0) return '—'
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatVolume(value: number | undefined): string {
  if (!value) return '—'
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
  return value.toLocaleString()
}

interface OverviewPanelProps {
  sidebar?: boolean
}

export function OverviewPanel({ sidebar }: OverviewPanelProps) {
  const { state } = useTerminal()
  const symbol = state.activeSecurity

  const quote = useQuery(api.market.quotes.getQuote, symbol ? { symbol } : 'skip')
  const profile = useQuery(api.market.profiles.getProfile, symbol ? { symbol } : 'skip')
  const requestQuote = useMutation(api.market.quotes.requestQuote)
  const requestProfile = useMutation(api.market.profiles.requestProfile)

  const prevSymbolRef = useRef<string | null>(null)

  useEffect(() => {
    if (symbol && symbol !== prevSymbolRef.current) {
      prevSymbolRef.current = symbol
      requestQuote({ symbol })
      requestProfile({ symbol })
    }
  }, [symbol, requestQuote, requestProfile])

  if (!symbol) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-t-muted text-xs">Select a security</p>
      </div>
    )
  }

  if (quote === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-t-muted text-xs animate-pulse">Loading...</p>
      </div>
    )
  }

  const isUp = quote ? quote.change >= 0 : true
  const changeColor = isUp ? 'text-up' : 'text-down'
  const changeSign = isUp ? '+' : ''

  if (sidebar) {
    return (
      <div className="h-full overflow-y-auto p-3">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            {profile?.logo && (
              <img src={profile.logo} alt="" className="h-5 w-5 rounded" />
            )}
            <span className="text-amber text-sm font-semibold">{symbol}</span>
          </div>
          {profile && (
            <p className="text-t-secondary mt-0.5 text-[11px] leading-tight">
              {profile.name}
            </p>
          )}
        </div>

        {quote && (
          <>
            <div className="mb-3">
              <div className="text-t-primary text-2xl font-bold tabular-nums">
                {formatNumber(quote.price)}
              </div>
              <div className={`text-xs tabular-nums ${changeColor}`}>
                {changeSign}{formatNumber(quote.change)} ({changeSign}{quote.changePercent.toFixed(2)}%)
              </div>
            </div>

            <div className="space-y-1.5">
              <StatRow label="Open" value={formatNumber(quote.open)} />
              <StatRow label="High" value={formatNumber(quote.high)} />
              <StatRow label="Low" value={formatNumber(quote.low)} />
              <StatRow label="Prev Close" value={formatNumber(quote.prevClose)} />
              <StatRow label="Volume" value={formatVolume(quote.volume)} />
              {profile?.marketCap && (
                <StatRow label="Market Cap" value={formatMarketCap(profile.marketCap)} />
              )}
              {profile?.sector && (
                <StatRow label="Sector" value={profile.sector} />
              )}
              {profile?.exchange && (
                <StatRow label="Exchange" value={profile.exchange} />
              )}
              {profile?.country && (
                <StatRow label="Country" value={profile.country} />
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-4 flex items-center gap-3">
          {profile?.logo && (
            <img src={profile.logo} alt="" className="h-8 w-8 rounded" />
          )}
          <div>
            <span className="text-amber text-lg font-semibold">{symbol}</span>
            {profile && (
              <p className="text-t-secondary text-xs">{profile.name}</p>
            )}
          </div>
        </div>

        {quote && (
          <>
            <div className="mb-6">
              <div className="text-t-primary text-4xl font-bold tabular-nums">
                {formatNumber(quote.price)}
              </div>
              <div className={`mt-1 text-sm tabular-nums ${changeColor}`}>
                {changeSign}{formatNumber(quote.change)} ({changeSign}{quote.changePercent.toFixed(2)}%)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <StatRow label="Open" value={formatNumber(quote.open)} />
              <StatRow label="High" value={formatNumber(quote.high)} />
              <StatRow label="Low" value={formatNumber(quote.low)} />
              <StatRow label="Prev Close" value={formatNumber(quote.prevClose)} />
              <StatRow label="Volume" value={formatVolume(quote.volume)} />
              {profile?.marketCap && (
                <StatRow label="Market Cap" value={formatMarketCap(profile.marketCap)} />
              )}
              {profile?.sector && (
                <StatRow label="Sector" value={profile.sector} />
              )}
              {profile?.exchange && (
                <StatRow label="Exchange" value={profile.exchange} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-t-muted">{label}</span>
      <span className="text-t-primary tabular-nums">{value}</span>
    </div>
  )
}

import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery } from 'convex-helpers/react/cache'
import { useMutation } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useTerminal } from '../terminal-provider'
import { CandlestickChart } from './candlestick-chart'

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y'

const TIMEFRAME_CONFIG: Record<Timeframe, { resolution: string; daysBack: number }> = {
  '1D': { resolution: '5', daysBack: 1 },
  '5D': { resolution: '15', daysBack: 5 },
  '1M': { resolution: '60', daysBack: 30 },
  '3M': { resolution: 'D', daysBack: 90 },
  '6M': { resolution: 'D', daysBack: 180 },
  '1Y': { resolution: 'D', daysBack: 365 },
  '5Y': { resolution: 'W', daysBack: 1825 },
}

const TIMEFRAMES: Timeframe[] = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y']

export function ChartPanel() {
  const { state } = useTerminal()
  const symbol = state.activeSecurity
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y')

  const config = TIMEFRAME_CONFIG[timeframe]
  const now = useMemo(() => Math.floor(Date.now() / 1000), [])
  const from = useMemo(
    () => now - config.daysBack * 24 * 60 * 60,
    [now, config.daysBack]
  )

  const barsDoc = useQuery(
    api.market.historical.getBars,
    symbol ? { symbol, resolution: config.resolution } : 'skip'
  )
  const requestBars = useMutation(api.market.historical.requestBars)

  const prevKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!symbol) return
    const key = `${symbol}-${config.resolution}`
    if (key !== prevKeyRef.current) {
      prevKeyRef.current = key
      requestBars({
        symbol,
        resolution: config.resolution,
        from,
        to: now,
      })
    }
  }, [symbol, config.resolution, from, now, requestBars])

  const bars = useMemo(() => {
    if (!barsDoc?.bars) return []
    try {
      return JSON.parse(barsDoc.bars) as Array<{
        time: number
        open: number
        high: number
        low: number
        close: number
        volume: number
      }>
    } catch {
      return []
    }
  }, [barsDoc?.bars])

  if (!symbol) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-t-muted text-xs">Select a security to view chart</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-terminal px-3 py-1">
        <span className="text-amber mr-2 text-xs font-semibold">{symbol}</span>
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              tf === timeframe
                ? 'bg-[var(--terminal-amber)] text-[var(--terminal-bg)]'
                : 'text-t-muted hover:text-t-primary'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      <div className="flex-1 p-1">
        <CandlestickChart data={bars} />
      </div>
    </div>
  )
}

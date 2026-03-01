import { useState, useEffect } from 'react'
import { useAction } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useDefaultLayout } from 'react-resizable-panels'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '~/components/ui/resizable'
import { TerminalProvider } from './terminal-provider'
import { WatchlistPanel } from './watchlist/watchlist-panel'
import { ChartPanel } from './chart/chart-panel'
import { NewsPanel } from './news/news-panel'
import { FilingsPanel } from './filings/filings-panel'
import { useTerminal } from './terminal-provider'

const KEY_INFO: Record<string, { label: string; url: string }> = {
  finnhub: { label: 'FINNHUB_API_KEY', url: 'https://finnhub.io/register' },
  fmp: { label: 'FMP_API_KEY', url: 'https://financialmodelingprep.com/developer/docs' },
  firecrawl: { label: 'FIRECRAWL_API_KEY', url: 'https://firecrawl.dev' },
  google: { label: 'GOOGLE_GENERATIVE_AI_API_KEY', url: 'https://aistudio.google.com/apikey' },
}

type KeyStatus = { finnhub: boolean; fmp: boolean; firecrawl: boolean; google: boolean }

function SetupBanner() {
  const checkKeys = useAction(api.terminal.health.checkApiKeys)
  const [status, setStatus] = useState<KeyStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    checkKeys().then(setStatus).catch(() => {})
  }, [checkKeys])

  if (dismissed || !status) return null

  const missing = (Object.keys(KEY_INFO) as (keyof KeyStatus)[]).filter((k) => !status[k])
  if (missing.length === 0) return null

  const required = missing.filter((k) => k === 'finnhub' || k === 'fmp')
  const optional = missing.filter((k) => k !== 'finnhub' && k !== 'fmp')

  if (required.length === 0) return null

  return (
    <div className="flex shrink-0 items-start gap-3 border-b border-terminal bg-[var(--terminal-bg)] px-3 py-2">
      <span className="mt-0.5 text-xs" style={{ color: 'var(--terminal-warn, #d4a017)' }}>
        {"[!]"}
      </span>
      <div className="flex-1 text-[11px] leading-relaxed" style={{ color: 'var(--terminal-warn, #d4a017)' }}>
        <span className="font-semibold">Missing required API keys.</span>
        {" Run "}
        <code className="rounded bg-[var(--terminal-surface)] px-1 py-0.5 text-[var(--terminal-text)]">
          node setup.mjs
        </code>
        {" or set them manually:"}
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
          {required.map((k) => (
            <a
              key={k}
              href={KEY_INFO[k].url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted"
              style={{ color: 'var(--terminal-warn, #d4a017)' }}
            >
              {KEY_INFO[k].label}
            </a>
          ))}
          {optional.map((k) => (
            <a
              key={k}
              href={KEY_INFO[k].url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 underline decoration-dotted"
              style={{ color: 'var(--terminal-warn, #d4a017)' }}
            >
              {KEY_INFO[k].label} (optional)
            </a>
          ))}
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="mt-0.5 shrink-0 text-xs opacity-50 hover:opacity-100"
        style={{ color: 'var(--terminal-warn, #d4a017)' }}
      >
        {"[x]"}
      </button>
    </div>
  )
}

function TerminalContent() {
  const { state } = useTerminal()
  const storage = typeof window !== 'undefined'
    ? localStorage
    : { getItem: () => null, setItem: () => {} }
  const { defaultLayout, onLayoutChange } = useDefaultLayout({
    id: 'terminal-panels-v4',
    storage,
  })

  return (
    <div className="terminal fixed inset-0 flex flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-terminal px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--terminal-up)]" />
          <span className="text-t-muted text-[10px] uppercase tracking-wider">
            Market Open
          </span>
        </div>
      </div>

      <SetupBanner />

      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-0 flex-1"
        defaultLayout={defaultLayout}
        onLayoutChange={onLayoutChange}
      >
        <ResizablePanel defaultSize={20} minSize={14}>
          <WatchlistPanel />
        </ResizablePanel>

        <ResizableHandle className="w-[2px] bg-[var(--terminal-divider)]" />

        <ResizablePanel defaultSize={80} minSize={40}>
          {state.activePanel === 'chart' && <ChartPanel />}
          {(state.activePanel === 'overview' || state.activePanel === 'news' || state.activePanel === 'financials') && (
            <div className="flex h-full flex-col">
              <div className="min-h-0 flex-[7] overflow-hidden">
                <NewsPanel />
              </div>
              <div className="h-[2px] shrink-0 bg-[var(--terminal-divider)]" />
              <div className="min-h-0 flex-[3] overflow-hidden">
                <FilingsPanel />
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export function TerminalLayout() {
  return (
    <TerminalProvider>
      <TerminalContent />
    </TerminalProvider>
  )
}

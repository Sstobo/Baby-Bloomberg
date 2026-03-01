import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from 'convex-helpers/react/cache'
import { useMutation } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useTerminal } from '../terminal-provider'
import { FileText, RefreshCw, Sparkles, ChevronDown, ExternalLink } from 'lucide-react'
import { AnalysisContent } from '../news/analysis-dialog'
import { useFilingAnalysis } from './use-filing-analysis'

const FORM_COLORS: Record<string, string> = {
  '10-K': 'text-[var(--terminal-amber)]',
  '10-Q': 'text-up',
  '8-K': 'text-t-primary',
  'DEF 14A': 'text-[var(--terminal-text-secondary)]',
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

function parseSentiment(analysis: string): 'bullish' | 'bearish' | 'neutral' {
  const match = analysis.match(/sentiment\s*:\s*(bullish|bearish|neutral)/i)
  if (match) return match[1].toLowerCase() as 'bullish' | 'bearish' | 'neutral'
  return 'neutral'
}

const SENTIMENT_COLORS: Record<string, string> = {
  bullish: 'oklch(0.75 0.20 155)',
  bearish: 'oklch(0.62 0.25 25)',
  neutral: 'oklch(0.60 0.10 65)',
}

export function FilingsPanel() {
  const { state } = useTerminal()
  const symbol = state.activeSecurity

  const filings = useQuery(
    api.market.filings.getFilings,
    symbol ? { symbol } : 'skip'
  )
  const requestFilings = useMutation(api.market.filings.requestFilings)
  const refreshFilings = useMutation(api.market.filings.refreshFilings)
  const clearFilings = useMutation(api.market.filings.clearFilings)

  const { loadingIds, analyze, expandedId, toggleExpanded } = useFilingAnalysis()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(() => {
    if (!symbol || refreshing) return
    setRefreshing(true)
    refreshFilings({ symbol })
      .finally(() => setRefreshing(false))
  }, [symbol, refreshing, refreshFilings])

  const handleClear = useCallback(() => {
    if (symbol) clearFilings({ symbol })
  }, [symbol, clearFilings])

  const prevSymbolRef = useRef<string | null>(null)

  useEffect(() => {
    if (symbol && symbol !== prevSymbolRef.current) {
      prevSymbolRef.current = symbol
      requestFilings({ symbol })
    }
  }, [symbol, requestFilings])

  useEffect(() => {
    if (!symbol) return
    const id = setInterval(() => {
      refreshFilings({ symbol })
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [symbol, refreshFilings])

  if (!symbol) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-t-muted text-xs">Select a security to view filings</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-terminal px-3 py-1">
        <FileText className="h-3 w-3 text-t-muted" />
        <span className="text-amber text-xs font-semibold">{symbol}</span>
        <span className="text-t-muted text-[10px]">SEC Filings</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded p-0.5 text-t-muted transition-colors hover:bg-[var(--terminal-surface)] hover:text-amber disabled:opacity-50 disabled:pointer-events-none"
            title="Refresh filings"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleClear}
            className="rounded px-1.5 py-0.5 text-[9px] text-t-muted transition-colors hover:bg-[var(--terminal-surface)] hover:text-down"
            title="Clear all filings"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filings === undefined ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-t-muted animate-pulse text-xs">Loading filings...</p>
          </div>
        ) : filings.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-t-muted text-xs">No filings found</p>
          </div>
        ) : (
          <div>
            {filings.map((filing) => {
              const isAnalyzing = loadingIds.has(filing._id)
              const hasAnalysis = !!filing.analysis
              const isExpanded = expandedId === filing._id

              const sentiment = hasAnalysis ? parseSentiment(filing.analysis!) : null
              const sentimentColor = sentiment ? SENTIMENT_COLORS[sentiment] : null

              return (
                <div
                  key={filing._id}
                  className="relative border-b border-[var(--terminal-border)]"
                  style={hasAnalysis ? {
                    border: '1px solid rgba(255,160,40,0.3)',
                    boxShadow: '0 0 10px rgba(255,160,40,0.12), 0 0 4px rgba(255,160,40,0.08)',
                    margin: '2px 0',
                  } : undefined}
                >
                  {sentimentColor && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{
                        background: `linear-gradient(to bottom, ${sentimentColor}, ${sentimentColor}00)`,
                      }}
                    />
                  )}
                  <div className="group flex items-start gap-2 px-3 py-2 hover:bg-[var(--terminal-surface-hover)]">
                    <button
                      onClick={() => {
                        if (hasAnalysis) toggleExpanded(filing._id)
                      }}
                      disabled={!hasAnalysis}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold shrink-0 w-14 ${FORM_COLORS[filing.form] ?? 'text-t-primary'}`}
                        >
                          {filing.form}
                        </span>
                        <p className="text-t-primary text-xs font-medium leading-tight line-clamp-1 flex-1">
                          {filing.description}
                        </p>
                      </div>
                      <div className="text-t-muted mt-0.5 flex items-center gap-1.5 text-[10px]">
                        <span>Filed {filing.fileDate}</span>
                        <span>·</span>
                        <span>Period ending {filing.periodEnding}</span>
                      </div>
                    </button>
                    {isAnalyzing && (
                      <div className="shrink-0 p-0.5">
                        <div className="h-3 w-3 animate-spin rounded-full border border-t-[var(--terminal-amber)] border-[var(--terminal-amber)]/30" />
                      </div>
                    )}
                    {hasAnalysis && (
                      <button
                        onClick={() => toggleExpanded(filing._id)}
                        className="shrink-0 flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium text-[var(--terminal-amber)] transition-colors hover:bg-[var(--terminal-surface)]"
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        <ChevronDown className={`h-2.5 w-2.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                    {!isAnalyzing && !hasAnalysis && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          analyze(filing._id, {
                            url: filing.url,
                            form: filing.form,
                            description: filing.description,
                            symbol: filing.symbol,
                          })
                        }}
                        className="shrink-0 rounded p-0.5 text-t-muted opacity-0 transition-all hover:text-[var(--terminal-amber)] group-hover:opacity-100"
                        title="AI Analysis"
                      >
                        <Sparkles className="h-3 w-3" />
                      </button>
                    )}
                    <a
                      href={filing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded p-0.5 text-t-muted opacity-0 transition-all hover:text-[var(--terminal-blue)] group-hover:opacity-100"
                      title="Open filing"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {isExpanded && filing.analysis && (
                    <div className="border-t border-[var(--terminal-border)] bg-[var(--terminal-surface)] px-3 py-2">
                      <AnalysisContent text={filing.analysis} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

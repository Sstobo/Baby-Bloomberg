import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from 'convex-helpers/react/cache'
import { useMutation } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useTerminal } from '../terminal-provider'
import { Trash2, Sparkles, ChevronDown, ExternalLink, RefreshCw, FileText } from 'lucide-react'
import { AnalysisContent, useArticleAnalysis } from './analysis-dialog'
import { MasterReportDialog } from './master-report-dialog'
import type { Id } from '@/../convex/_generated/dataModel'

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

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

const BATCH_OPTIONS = [
  { label: '8h+', ms: 8 * 60 * 60 * 1000 },
  { label: '1d+', ms: 24 * 60 * 60 * 1000 },
  { label: '3d+', ms: 3 * 24 * 60 * 60 * 1000 },
] as const

export function NewsPanel() {
  const { state } = useTerminal()
  const symbol = state.activeSecurity
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const companyNews = useQuery(
    api.market.news.getCompanyNews,
    symbol ? { symbol } : 'skip'
  )

  const requestCompanyNews = useMutation(api.market.news.requestCompanyNews)
  const deleteArticle = useMutation(api.market.news.deleteArticle)
  const deleteOlderThan = useMutation(api.market.news.deleteOlderThan)
  const deleteAllMutation = useMutation(api.market.news.deleteAll)

  const prevSymbolRef = useRef<string | null>(null)
  useEffect(() => {
    if (symbol && symbol !== prevSymbolRef.current) {
      prevSymbolRef.current = symbol
      requestCompanyNews({ symbol })
    }
  }, [symbol, requestCompanyNews])

  const handleDelete = useCallback(
    (id: Id<"newsArticles">) => {
      setDeletedIds((prev) => new Set(prev).add(id))
      deleteArticle({ id })
    },
    [deleteArticle]
  )

  const handleDeleteOlderThan = useCallback(
    (ms: number) => {
      if (companyNews) {
        const cutoff = Date.now() - ms
        const toRemove = companyNews.filter((a) => a.publishedAt < cutoff)
        setDeletedIds((prev) => {
          const next = new Set(prev)
          for (const a of toRemove) next.add(a._id)
          return next
        })
      }
      deleteOlderThan({ olderThanMs: ms })
    },
    [companyNews, deleteOlderThan]
  )

  const handleDeleteAll = useCallback(() => {
    if (companyNews) {
      setDeletedIds((prev) => {
        const next = new Set(prev)
        for (const a of companyNews) next.add(a._id)
        return next
      })
    }
    deleteAllMutation({})
  }, [companyNews, deleteAllMutation])

  const { loadingIds, analyze, expandedId, toggleExpanded } = useArticleAnalysis()
  const [reportOpen, setReportOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const isLoading = symbol && companyNews === undefined
  const articles = companyNews?.filter((a) => !deletedIds.has(a._id))
  const analyzedArticles = articles?.filter((a) => !!(a as any).analysis) ?? []

  const handleRefresh = useCallback(() => {
    if (!symbol || refreshing) return
    setRefreshing(true)
    requestCompanyNews({ symbol, force: true })
      .finally(() => setRefreshing(false))
  }, [symbol, refreshing, requestCompanyNews])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-terminal px-3 py-1">
        <span className="text-amber mr-2 text-xs font-semibold">NEWS</span>
        {symbol && (
          <span className="rounded bg-[var(--terminal-amber)] px-2 py-0.5 text-[10px] font-medium text-[var(--terminal-bg)]">
            {symbol}
          </span>
        )}
        {analyzedArticles.length > 0 && (
          <button
            onClick={() => setReportOpen(true)}
            disabled={reportOpen}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold text-[var(--terminal-bg)] bg-[var(--terminal-amber)] transition-colors hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
          >
            <FileText className="h-3 w-3" />
            REPORT
          </button>
        )}

        {symbol && (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded p-0.5 text-t-muted transition-colors hover:bg-[var(--terminal-surface)] hover:text-amber disabled:opacity-50 disabled:pointer-events-none"
              title="Refresh news"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {BATCH_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleDeleteOlderThan(opt.ms)}
                className="rounded px-1.5 py-0.5 text-[9px] text-t-muted transition-colors hover:bg-[var(--terminal-surface)] hover:text-down"
                title={`Delete articles older than ${opt.label}`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={handleDeleteAll}
              className="rounded px-1.5 py-0.5 text-[9px] text-t-muted transition-colors hover:bg-[var(--terminal-surface)] hover:text-down"
              title="Delete all articles"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!symbol ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-t-muted text-xs">Select a security to view news</p>
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-t-muted animate-pulse text-xs">Loading news...</p>
          </div>
        ) : !articles || articles.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-t-muted text-xs">No articles found</p>
          </div>
        ) : (
          <div>
            {articles.map((article) => {
              const isAnalyzing = loadingIds.has(article._id)
              const hasAnalysis = !!article.analysis
              const isExpanded = expandedId === article._id

              const sentiment = hasAnalysis ? parseSentiment(article.analysis!) : null
              const sentimentColor = sentiment ? SENTIMENT_COLORS[sentiment] : null

              return (
                <div
                  key={article._id}
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
                        if (hasAnalysis) toggleExpanded(article._id)
                      }}
                      disabled={!hasAnalysis}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-t-primary text-xs font-medium leading-tight line-clamp-1">
                        {article.headline}
                      </p>
                      <div className="text-t-muted mt-0.5 flex items-center gap-1.5 text-[10px]">
                        <span>{article.source}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(article.publishedAt)}</span>
                      </div>
                    </button>
                    {isAnalyzing && (
                      <div className="shrink-0 p-0.5">
                        <div className="h-3 w-3 animate-spin rounded-full border border-t-[var(--terminal-amber)] border-[var(--terminal-amber)]/30" />
                      </div>
                    )}
                    {hasAnalysis && (
                      <button
                        onClick={() => toggleExpanded(article._id)}
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
                          analyze(article._id, {
                            url: article.url,
                            headline: article.headline,
                            symbol: article.symbol,
                          })
                        }}
                        className="shrink-0 rounded p-0.5 text-t-muted opacity-0 transition-all hover:text-[var(--terminal-amber)] group-hover:opacity-100"
                        title="AI Analysis"
                      >
                        <Sparkles className="h-3 w-3" />
                      </button>
                    )}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded p-0.5 text-t-muted opacity-0 transition-all hover:text-[var(--terminal-blue)] group-hover:opacity-100"
                      title="Open article"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      onClick={() => handleDelete(article._id)}
                      className="shrink-0 rounded p-0.5 text-t-muted opacity-0 transition-all hover:text-down group-hover:opacity-100"
                      title="Delete article"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {isExpanded && article.analysis && (
                    <div className="border-t border-[var(--terminal-border)] bg-[var(--terminal-surface)] px-3 py-2">
                      <AnalysisContent text={article.analysis} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {symbol && (
        <MasterReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          symbol={symbol}
          articles={analyzedArticles.map((a) => ({
            headline: a.headline,
            source: a.source,
            publishedAt: a.publishedAt,
            analysis: (a as any).analysis as string,
          }))}
        />
      )}
    </div>
  )
}

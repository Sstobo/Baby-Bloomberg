import { useState, useEffect, useRef } from 'react'
import { useAction } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '~/components/ui/dialog'

interface AnalyzedArticle {
  headline: string
  source: string
  publishedAt: number
  analysis: string
}

function parseSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const match = text.match(/sentiment\s*:\s*(bullish|bearish|neutral)/i)
  if (match) return match[1].toLowerCase() as 'bullish' | 'bearish' | 'neutral'
  return 'neutral'
}

const SENTIMENT_LABELS: Record<string, { label: string; color: string }> = {
  bullish: { label: 'BULLISH', color: 'var(--terminal-up)' },
  bearish: { label: 'BEARISH', color: 'var(--terminal-down)' },
  neutral: { label: 'NEUTRAL', color: 'var(--terminal-text-muted)' },
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function MasterReportDialog({
  open,
  onOpenChange,
  symbol,
  articles,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  articles: AnalyzedArticle[]
}) {
  const generateReport = useAction(api.market.analysis.generateReport)
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const prevKeyRef = useRef<string | null>(null)

  const articlesKey = articles.map((a) => a.headline).join('|')

  useEffect(() => {
    if (!open || articles.length === 0) return
    if (articlesKey === prevKeyRef.current && summary) return

    prevKeyRef.current = articlesKey
    setSummaryLoading(true)
    setSummary(null)

    generateReport({
      symbol,
      analyses: articles.map((a) => ({
        headline: a.headline,
        analysis: a.analysis,
      })),
    })
      .then((text) => setSummary(text))
      .catch(() => setSummary('Failed to generate summary.'))
      .finally(() => setSummaryLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps -- articlesKey stabilizes articles; summary checked inside guard
  }, [open, articlesKey, generateReport, symbol])

  useEffect(() => {
    if (!open) {
      prevKeyRef.current = null
      setSummary(null)
    }
  }, [open])

  const sentimentCounts = { bullish: 0, bearish: 0, neutral: 0 }
  for (const a of articles) {
    sentimentCounts[parseSentiment(a.analysis)]++
  }

  const dominant = sentimentCounts.bullish >= sentimentCounts.bearish
    ? sentimentCounts.bullish > sentimentCounts.neutral ? 'bullish' : 'neutral'
    : sentimentCounts.bearish > sentimentCounts.neutral ? 'bearish' : 'neutral'

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="terminal" className="sm:max-w-2xl">
        <div className="flex flex-col max-h-[80vh]">
          <div className="shrink-0 border-b border-[var(--terminal-divider)] px-5 py-4">
            <DialogTitle className="text-[var(--terminal-amber)] text-base font-bold tracking-wide">
              {symbol} — INTELLIGENCE BRIEF
            </DialogTitle>
            <p className="text-[var(--terminal-text-muted)] text-[11px] mt-1">{dateStr}</p>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[var(--terminal-text-muted)] uppercase tracking-wider">Sentiment</span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: SENTIMENT_LABELS[dominant].color }}
                >
                  {SENTIMENT_LABELS[dominant].label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span style={{ color: 'var(--terminal-up)' }}>{sentimentCounts.bullish} bullish</span>
                <span style={{ color: 'var(--terminal-down)' }}>{sentimentCounts.bearish} bearish</span>
                <span className="text-[var(--terminal-text-muted)]">{sentimentCounts.neutral} neutral</span>
              </div>
              <span className="ml-auto text-[10px] text-[var(--terminal-text-muted)]">
                {articles.length} analyzed
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="border-b border-[var(--terminal-divider)] px-5 py-4">
              <p className="text-[10px] text-[var(--terminal-amber)] font-semibold uppercase tracking-wider mb-2">
                Executive Summary
              </p>
              {summaryLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border border-t-[var(--terminal-amber)] border-[var(--terminal-amber)]/30" />
                  <span className="text-[var(--terminal-text-muted)] text-[11px] animate-pulse">
                    Synthesizing analyses...
                  </span>
                </div>
              ) : summary ? (
                <p className="text-[var(--terminal-text-primary)] text-[12px] leading-relaxed">
                  {summary}
                </p>
              ) : (
                <p className="text-[var(--terminal-text-muted)] text-[11px]">
                  Waiting for data...
                </p>
              )}
            </div>

            <div className="px-5 py-3 space-y-0">
              {articles.map((article, i) => {
                const sentiment = parseSentiment(article.analysis)
                const { color } = SENTIMENT_LABELS[sentiment]

                return (
                  <div key={i} className="py-3 border-b border-[var(--terminal-border)] last:border-b-0">
                    <div className="flex items-start gap-2 mb-1.5">
                      <div
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[var(--terminal-text-primary)] text-xs font-semibold leading-tight">
                          {article.headline}
                        </p>
                        <p className="text-[var(--terminal-text-muted)] text-[10px] mt-0.5">
                          {article.source} · {formatDate(article.publishedAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-[var(--terminal-text-secondary)] text-[11px] leading-relaxed pl-4">
                      {article.analysis}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="shrink-0 border-t border-[var(--terminal-divider)] px-5 py-2">
            <p className="text-[var(--terminal-text-muted)] text-[9px] text-center uppercase tracking-widest">
              AI-generated analysis · Not financial advice
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

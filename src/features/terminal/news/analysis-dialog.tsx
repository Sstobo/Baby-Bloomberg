import { useState, useCallback, useRef } from 'react'
import { useAction } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import type { Id } from '@/../convex/_generated/dataModel'

export function useArticleAnalysis() {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const analyzeArticle = useAction(api.market.analysis.analyzeArticle)
  const pendingRef = useRef(new Set<string>())

  const analyze = useCallback(
    (articleId: Id<"newsArticles">, info: { url: string; headline: string; symbol: string }) => {
      if (pendingRef.current.has(articleId)) return
      pendingRef.current.add(articleId)

      setLoadingIds((prev) => new Set(prev).add(articleId))

      analyzeArticle({
        articleId,
        url: info.url,
        headline: info.headline,
        symbol: info.symbol,
      })
        .catch((e) => console.error('Article analysis failed:', e))
        .finally(() => {
          pendingRef.current.delete(articleId)
          setLoadingIds((prev) => {
            const next = new Set(prev)
            next.delete(articleId)
            return next
          })
        })
    },
    [analyzeArticle]
  )

  const toggleExpanded = useCallback((articleId: string) => {
    setExpandedId((prev) => (prev === articleId ? null : articleId))
  }, [])

  return { loadingIds, analyze, expandedId, toggleExpanded }
}

export function AnalysisContent({ text }: { text: string }) {
  return (
    <p className="max-w-[70%] text-[10px] leading-[1.4] font-[Inter,system-ui,sans-serif] text-[var(--terminal-text-secondary)]">
      {text}
    </p>
  )
}

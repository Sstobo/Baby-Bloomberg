import { useState, useCallback, useRef } from 'react'
import { useAction } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import type { Id } from '@/../convex/_generated/dataModel'

export function useFilingAnalysis() {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const analyzeFiling = useAction(api.market.filingAnalysis.analyzeFiling)
  const pendingRef = useRef(new Set<string>())

  const analyze = useCallback(
    (filingId: Id<"secFilings">, info: { url: string; form: string; description: string; symbol: string }) => {
      if (pendingRef.current.has(filingId)) return
      pendingRef.current.add(filingId)

      setLoadingIds((prev) => new Set(prev).add(filingId))

      analyzeFiling({
        filingId,
        url: info.url,
        form: info.form,
        description: info.description,
        symbol: info.symbol,
      })
        .catch((e) => console.error('Filing analysis failed:', e))
        .finally(() => {
          pendingRef.current.delete(filingId)
          setLoadingIds((prev) => {
            const next = new Set(prev)
            next.delete(filingId)
            return next
          })
        })
    },
    [analyzeFiling]
  )

  const toggleExpanded = useCallback((filingId: string) => {
    setExpandedId((prev) => (prev === filingId ? null : filingId))
  }, [])

  return { loadingIds, analyze, expandedId, toggleExpanded }
}

import { useState, useRef, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTerminal } from '../terminal-provider'
import { Search } from 'lucide-react'

const PANEL_COMMANDS: Record<string, 'chart' | 'overview' | 'news' | 'financials'> = {
  GP: 'chart',
  DES: 'overview',
  NEWS: 'news',
  N: 'news',
  FA: 'financials',
}

export function CommandBar() {
  const { state, actions } = useTerminal()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useHotkeys('ctrl+g, meta+g', (e) => {
    e.preventDefault()
    inputRef.current?.focus()
  })

  const handleSubmit = useCallback(() => {
    const upper = query.trim().toUpperCase()
    const panel = PANEL_COMMANDS[upper]
    if (panel) {
      actions.setPanel(panel)
    }
    setQuery('')
    inputRef.current?.blur()
  }, [query, actions])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === 'Escape') {
        setQuery('')
        inputRef.current?.blur()
      }
    },
    [handleSubmit]
  )

  return (
    <div className="relative flex-1 max-w-md">
      <div className="flex items-center gap-1.5 rounded bg-[var(--terminal-surface)] px-2 py-1">
        <Search className="h-3 w-3 text-[var(--terminal-amber-dim)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={state.activeSecurity ? `${state.activeSecurity} — GP, DES, NEWS, FA` : 'GP, DES, NEWS, FA'}
          className="w-full bg-transparent text-xs text-[var(--terminal-text-primary)] placeholder:text-[var(--terminal-text-muted)] focus:outline-none"
        />
        <kbd className="hidden text-[10px] text-[var(--terminal-text-muted)] sm:inline">
          Ctrl+G
        </kbd>
      </div>
    </div>
  )
}

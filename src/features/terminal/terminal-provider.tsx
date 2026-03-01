import { createContext, use, useState, useCallback, type ReactNode } from 'react'

interface TerminalState {
  activeSecurity: string | null
  activePanel: 'overview' | 'chart' | 'news' | 'financials'
  commandOpen: boolean
}

interface TerminalActions {
  setSecurity: (symbol: string | null) => void
  setPanel: (panel: TerminalState['activePanel']) => void
  openCommand: () => void
  closeCommand: () => void
}

interface TerminalContextValue {
  state: TerminalState
  actions: TerminalActions
}

const TerminalContext = createContext<TerminalContextValue | null>(null)

export function useTerminal() {
  const ctx = use(TerminalContext)
  if (!ctx) throw new Error('useTerminal must be used within TerminalProvider')
  return ctx
}

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [activeSecurity, setActiveSecurity] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<TerminalState['activePanel']>('news')
  const [commandOpen, setCommandOpen] = useState(false)

  const setSecurity = useCallback((symbol: string | null) => {
    setActiveSecurity(symbol)
  }, [])

  const setPanel = useCallback((panel: TerminalState['activePanel']) => {
    setActivePanel(panel)
  }, [])

  const openCommand = useCallback(() => setCommandOpen(true), [])
  const closeCommand = useCallback(() => setCommandOpen(false), [])

  return (
    <TerminalContext
      value={{
        state: { activeSecurity, activePanel, commandOpen },
        actions: { setSecurity, setPanel, openCommand, closeCommand },
      }}
    >
      {children}
    </TerminalContext>
  )
}

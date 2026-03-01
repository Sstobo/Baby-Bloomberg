import { createFileRoute } from '@tanstack/react-router'
import { TerminalLayout } from '~/features/terminal/terminal-layout'
import { TerminalPending } from '~/features/terminal/terminal-pending'

export const Route = createFileRoute('/terminal')({
  component: TerminalLayout,
  pendingComponent: TerminalPending,
})

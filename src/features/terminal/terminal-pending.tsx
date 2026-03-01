import { Skeleton } from '~/components/ui/skeleton'

export function TerminalPending() {
  return (
    <div className="terminal flex h-screen flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-terminal px-3 py-1.5">
        <Skeleton className="h-7 w-80 bg-[var(--terminal-surface)]" />
      </div>
      <div className="flex flex-1">
        <div className="w-[20%] border-r border-terminal p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="mb-1 h-6 bg-[var(--terminal-surface)]" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full bg-[var(--terminal-surface)]" />
        </div>
        <div className="w-[25%] border-l border-terminal p-2">
          <Skeleton className="mb-2 h-8 bg-[var(--terminal-surface)]" />
          <Skeleton className="mb-1 h-20 bg-[var(--terminal-surface)]" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="mb-1 h-5 bg-[var(--terminal-surface)]" />
          ))}
        </div>
      </div>
    </div>
  )
}

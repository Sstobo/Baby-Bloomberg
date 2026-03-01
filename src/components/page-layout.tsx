import { useRouter } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { fadeUpVariants, staggerContainer } from '~/lib/motion'

// Max width variants matching Tailwind classes
const MAX_WIDTH_CLASSES = {
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
} as const

export type MaxWidth = keyof typeof MAX_WIDTH_CLASSES

export interface PageLayoutProps {
  /** Page title (h1) */
  title: string
  /** Optional subtitle below title */
  subtitle?: string
  /** Page content */
  children: React.ReactNode
  /** Actions to display on the right side of the header (e.g., ThemeToggle, buttons) */
  headerActions?: React.ReactNode
  /** Show back button that navigates using browser history */
  showBack?: boolean
  /** Maximum width of the content area */
  maxWidth?: MaxWidth
  /** Fill remaining viewport height (for chat, editor layouts) */
  fillHeight?: boolean
  /** Additional CSS classes for the main element */
  className?: string
}

export function PageLayout({
  title,
  subtitle,
  children,
  headerActions,
  showBack,
  maxWidth = '7xl',
  fillHeight,
  className,
}: PageLayoutProps) {
  const router = useRouter()

  const handleBack = () => {
    router.history.back()
  }

  return (
    <motion.main
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={cn(
        'p-4 md:p-8',
        fillHeight && 'flex h-[calc(100vh-64px)] flex-col',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto space-y-6',
          MAX_WIDTH_CLASSES[maxWidth],
          fillHeight && 'flex w-full flex-1 flex-col',
        )}
      >
        {/* Header */}
        <motion.div
          variants={fadeUpVariants}
          className="flex items-center justify-between"
        >
          {/* Left side: Back button + Title/Subtitle */}
          <div className="flex items-center gap-3">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={handleBack}
              >
                <ArrowLeftIcon className="size-4" />
                <span className="sr-only">Go back</span>
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side: Header actions */}
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          variants={fadeUpVariants}
          className={cn(fillHeight && 'min-h-0 flex-1')}
        >
          {children}
        </motion.div>
      </div>
    </motion.main>
  )
}

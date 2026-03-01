'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { usePrefersReducedMotion } from './hooks'
import { cn } from '~/lib/utils'

interface MobileMenuProps {
  open: boolean
  children: React.ReactNode
  className?: string
}

export function MobileMenu({ open, children, className }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className={cn(
            'fixed inset-x-0 bottom-0 top-14 z-40 flex flex-col overflow-hidden md:hidden',
            'bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80'
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, scale: 0.98, filter: 'blur(2px)' }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn('size-full overflow-y-auto p-4', className)}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

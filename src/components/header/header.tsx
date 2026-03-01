'use client'

import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { usePrefersReducedMotion, useScroll } from './hooks'
import { MobileMenu } from './mobile-menu'
import { appNavLinks } from './navigation-data'
import type { HeaderProps } from './types'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { MenuToggleIcon } from '~/components/ui/menu-toggle-icon'
import { ThemeToggle } from '~/components/theme-toggle'

const SCROLL_THRESHOLD = 10

export function Header({ className }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrolled = useScroll(SCROLL_THRESHOLD)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const original = document.body.style.overflow
    if (mobileOpen) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [mobileOpen])

  return (
    <motion.header
      animate={
        scrolled
          ? {
              backdropFilter: 'blur(20px)',
              boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
            }
          : {
              backdropFilter: 'blur(0px)',
              boxShadow: '0 0 0 rgba(0,0,0,0), 0 0 0 rgba(0,0,0,0)',
            }
      }
      transition={{
        duration: prefersReducedMotion ? 0 : scrolled ? 0.4 : 0.3,
        ease: [0.16, 1, 0.3, 1] as const,
      }}
      className={cn(
        'sticky top-0 z-50 w-full',
        scrolled && 'header-scrolled',
        className
      )}
    >
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-1">
          <Link
            to="/terminal"
            className="mr-4 flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
          >
            <span className="text-sm font-semibold tracking-tight">
              Baby Bloomberg
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 md:flex">
            {appNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:text-foreground"
              >
                {link.icon && <link.icon size={16} />}
                {link.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <ThemeToggle />
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          <MenuToggleIcon open={mobileOpen} className="size-5" />
        </Button>
      </nav>

      <MobileMenu open={mobileOpen} className="flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          {appNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-accent [&.active]:bg-accent"
            >
              {link.icon && <link.icon size={18} />}
              {link.title}
            </Link>
          ))}
        </div>
      </MobileMenu>
    </motion.header>
  )
}

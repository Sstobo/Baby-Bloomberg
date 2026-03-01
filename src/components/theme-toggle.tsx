'use client'

import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { SunMoonIcon } from '~/components/ui/sun-moon'
import type { SunMoonIconHandle } from '~/components/ui/sun-moon'

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const iconRef = useRef<SunMoonIconHandle>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    iconRef.current?.startAnimation()
  }, [resolvedTheme, setTheme])

  // SSR safe - render placeholder until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        aria-label="Toggle theme"
      >
        <div className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label="Toggle theme"
    >
      <SunMoonIcon ref={iconRef} size={20} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

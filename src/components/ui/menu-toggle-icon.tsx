'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '~/lib/utils'

interface MenuToggleIconProps extends React.ComponentProps<'svg'> {
  open: boolean
}

export function MenuToggleIcon({
  open,
  className,
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = 2.5,
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  ...props
}: MenuToggleIconProps) {
  const prefersReducedMotion = useReducedMotion()
  const transition = {
    duration: prefersReducedMotion ? 0 : open ? 0.45 : 0.35,
    ease: [0.16, 1, 0.3, 1] as const,
  }

  return (
    <motion.svg
      initial={false}
      animate={{ rotate: open ? -45 : 0 }}
      transition={transition}
      strokeWidth={strokeWidth}
      fill={fill}
      stroke={stroke}
      viewBox="0 0 32 32"
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      className={cn('origin-center', className)}
      {...(props as React.ComponentProps<typeof motion.svg>)}
    >
      <motion.path
        initial={false}
        animate={{
          strokeDasharray: open ? '20 300' : '12 63',
          strokeDashoffset: open ? -32.42 : 0,
        }}
        transition={transition}
        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
      />
      <path d="M7 16 27 16" />
    </motion.svg>
  )
}

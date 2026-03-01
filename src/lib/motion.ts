/**
 * Shared motion tokens from the design system (Section 10).
 * Import from here instead of hardcoding values.
 */

export const MOTION = {
  duration: {
    instant: 0.15,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
  ease: {
    expoOut: [0.16, 1, 0.3, 1] as const,
    easeOut: [0, 0, 0.2, 1] as const,
    easeIn: [0.4, 0, 1, 1] as const,
  },
  spring: {
    snappy: { type: 'spring' as const, stiffness: 400, damping: 30 },
    gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
  stagger: {
    fast: 0.02,
    normal: 0.04,
    slow: 0.08,
  },
} as const

/** Fade up + blur entrance variant (for stagger containers) */
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: MOTION.duration.slow, ease: MOTION.ease.expoOut },
  },
}

/** Stagger container variant */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: MOTION.stagger.normal },
  },
}

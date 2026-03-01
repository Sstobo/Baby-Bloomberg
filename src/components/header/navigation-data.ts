import { GaugeIcon } from '~/components/ui/gauge'
import { SparklesIcon } from '~/components/ui/sparkles'
import { BarChart3Icon } from '~/components/ui/bar-chart-3'
import type { NavLink } from './types'

export const appNavLinks: Array<NavLink> = [
  { title: 'Terminal', href: '/terminal', icon: BarChart3Icon },
  { title: 'Dashboard', href: '/dashboard', icon: GaugeIcon },
  { title: 'Design System', href: '/design', icon: SparklesIcon },
]

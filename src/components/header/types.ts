import type { ComponentType, HTMLAttributes } from 'react'

export interface NavLink {
  title: string
  href: string
  icon?: ComponentType<{ size?: number } & HTMLAttributes<HTMLDivElement>>
}

export interface HeaderProps {
  className?: string
}

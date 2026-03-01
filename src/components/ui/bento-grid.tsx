import * as React from "react"

import { cn } from "~/lib/utils"

type ElevationLevel = 1 | 2 | 3 | 4

function BentoGrid({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-grid"
      className={cn(
        "grid auto-rows-[minmax(180px,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
      {...props}
    />
  )
}

interface BentoCardProps extends React.ComponentProps<"div"> {
  colSpan?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2 | 3
  /** Apply premium 3D elevation shadow (1-4, higher = more pop) */
  elevated?: ElevationLevel | boolean
  /** Add hover lift effect for clickable cards */
  interactive?: boolean
}

function BentoCard({
  className,
  colSpan = 1,
  rowSpan = 1,
  elevated,
  interactive = false,
  ...props
}: BentoCardProps) {
  const elevationClass = elevated
    ? `shadow-depth-${typeof elevated === "number" ? elevated : 2}`
    : undefined

  return (
    <div
      data-slot="bento-card"
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-card p-6 transition-all",
        colSpan === 2 && "sm:col-span-2",
        colSpan === 3 && "sm:col-span-2 lg:col-span-3",
        colSpan === 4 && "sm:col-span-2 xl:col-span-4",
        rowSpan === 2 && "row-span-2",
        rowSpan === 3 && "row-span-3",
        elevationClass && "border-0",
        elevationClass,
        interactive && "card-interactive cursor-pointer",
        !elevated && !interactive && "hover:shadow-lg",
        className
      )}
      {...props}
    />
  )
}

function BentoCardImage({
  className,
  src,
  alt,
  ...props
}: React.ComponentProps<"img"> & { src: string; alt: string }) {
  return (
    <img
      data-slot="bento-card-image"
      src={src}
      alt={alt}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
        className
      )}
      {...props}
    />
  )
}

function BentoCardOverlay({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-card-overlay"
      className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent",
        className
      )}
      {...props}
    />
  )
}

function BentoCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-card-content"
      className={cn("relative z-10 flex h-full flex-col", className)}
      {...props}
    />
  )
}

function BentoCardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="bento-card-title"
      className={cn(
        "text-xl font-bold tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function BentoCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="bento-card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  BentoGrid,
  BentoCard,
  BentoCardImage,
  BentoCardOverlay,
  BentoCardContent,
  BentoCardTitle,
  BentoCardDescription,
}

/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'

import { ConvexQueryCacheProvider } from 'convex-helpers/react/cache'
import type { ConvexQueryClient } from '@convex-dev/react-query'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'
import { MotionConfig } from 'motion/react'
import { ThemeProvider } from '~/components/theme-provider'
import { Toaster } from '~/components/ui/sonner'
import { PageLayout } from '~/components/page-layout'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Baby Bloomberg' },
      {
        name: 'description',
        content: 'Real-time market terminal with AI-powered analysis',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Baby Bloomberg' },
      {
        property: 'og:description',
        content: 'Real-time market terminal with AI-powered analysis',
      },
      { property: 'og:image', content: '/og-image.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Baby Bloomberg' },
      {
        name: 'twitter:description',
        content: 'Real-time market terminal with AI-powered analysis',
      },
      { name: 'twitter:image', content: '/og-image.png' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      { rel: 'icon', href: '/favicon.ico' },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#0d0d0d' },
    ],
  }),

  errorComponent: ErrorBoundary,
  notFoundComponent: NotFound,
  component: RootComponent,
})

function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <PageLayout title="Not Found">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </CardFooter>
      </Card>
    </PageLayout>
  )
}

function RootComponent() {
  return (
    <ConvexQueryCacheProvider>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <RootDocument>
            <Outlet />
            <Toaster />
          </RootDocument>
        </MotionConfig>
      </ThemeProvider>
    </ConvexQueryCacheProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

import { createRouter } from '@tanstack/react-router'
import { QueryClient, notifyManager  } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexProvider } from 'convex/react'
import { routeTree } from './routeTree.gen'
import { ErrorFallback } from '~/components/error-fallback'

export function getRouter() {
  if (typeof document !== 'undefined') {
    notifyManager.setScheduler(window.requestAnimationFrame)
  }

  // Use process.env for SSR, import.meta.env for client
  const convexUrl = typeof process !== 'undefined' && process.env.VITE_CONVEX_URL
    ? process.env.VITE_CONVEX_URL
    : import.meta.env.VITE_CONVEX_URL

  if (!convexUrl) {
    throw new Error('VITE_CONVEX_URL is not set')
  }

  const convexQueryClient = new ConvexQueryClient(convexUrl)

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  })
  convexQueryClient.connect(queryClient)

  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadDelay: 50,
    defaultViewTransition: true,
    context: { queryClient, convexQueryClient },
    scrollRestoration: true,
    defaultErrorComponent: ({ error, reset }) => (
      <ErrorFallback error={error} reset={reset} />
    ),
    defaultNotFoundComponent: () => (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    ),
    Wrap: ({ children }) => (
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    ),
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}

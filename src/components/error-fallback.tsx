import { useRouter } from '@tanstack/react-router'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

interface ErrorFallbackProps {
  error: Error
  reset?: () => void
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const router = useRouter()
  const isDev = import.meta.env.DEV

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDev && (
            <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {error.message}
              {error.stack && (
                <>
                  {'\n\n'}
                  {error.stack}
                </>
              )}
            </pre>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.history.back()}
          >
            Go Back
          </Button>
          <Button
            onClick={() => {
              if (reset) {
                reset()
              } else {
                window.location.reload()
              }
            }}
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

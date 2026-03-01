import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { PageLayout } from '~/components/page-layout'
import { Header } from '~/components/header'

export function DashboardPending() {
  return (
    <>
      <Header />
      <PageLayout title="Dashboard">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </PageLayout>
    </>
  )
}

export function DashboardPage() {
  return (
    <>
      <Header />
      <PageLayout title="Dashboard">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Baby Bloomberg</CardTitle>
              <CardDescription>Real-time market terminal with AI-powered analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/terminal">Open Terminal</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </>
  )
}

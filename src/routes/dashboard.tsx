import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage, DashboardPending } from '~/features/dashboard/dashboard-page'

export const Route = createFileRoute('/dashboard')({
  pendingComponent: DashboardPending,
  component: DashboardPage,
})

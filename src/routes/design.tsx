import { createFileRoute } from '@tanstack/react-router'
import { DesignSystemPage } from '~/features/design/design-system-page'

export const Route = createFileRoute('/design')({
  component: DesignSystemPage,
})

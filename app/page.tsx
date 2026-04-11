export const dynamic = 'force-dynamic'

import dynamic_import from 'next/dynamic'

// All components that use React hooks/context are imported with ssr: false
// This prevents "Cannot read properties of null (reading 'useContext')" during prerender

const Toaster = dynamic_import(
  () => import('sonner').then(m => ({ default: m.Toaster })),
  { ssr: false }
)

const StatsBar = dynamic_import(
  () => import('@/components/StatsBar').then(m => ({ default: m.StatsBar })),
  { ssr: false }
)

const FilterBar = dynamic_import(
  () => import('@/components/FilterBar').then(m => ({ default: m.FilterBar })),
  { ssr: false }
)

const KanbanBoard = dynamic_import(
  () => import('@/components/KanbanBoard').then(m => ({ default: m.KanbanBoard })),
  { ssr: false }
)

const JobsTable = dynamic_import(
  () => import('@/components/JobsTable').then(m => ({ default: m.JobsTable })),
  { ssr: false }
)

const JobDetailDrawer = dynamic_import(
  () => import('@/components/JobDetailDrawer').then(m => ({ default: m.JobDetailDrawer })),
  { ssr: false }
)

import { DashboardClient } from '@/components/DashboardClient'

export default function Page() {
  return (
    <>
      <Toaster theme="dark" position="bottom-right" richColors />
      <DashboardClient
        StatsBar={StatsBar}
        FilterBar={FilterBar}
        KanbanBoard={KanbanBoard}
        JobsTable={JobsTable}
        JobDetailDrawer={JobDetailDrawer}
      />
    </>
  )
}

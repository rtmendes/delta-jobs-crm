'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { DeltaJob, JobStatus } from '@/lib/types'

// All hook-heavy components loaded client-side only (ssr: false)
// This prevents "Cannot read properties of null (reading 'useContext')" during SSR
const Toaster = dynamic(
  () => import('sonner').then(m => ({ default: m.Toaster })),
  { ssr: false }
)

const StatsBar = dynamic(
  () => import('./StatsBar').then(m => ({ default: m.StatsBar })),
  { ssr: false }
)

const FilterBar = dynamic(
  () => import('./FilterBar').then(m => ({ default: m.FilterBar })),
  { ssr: false }
)

const KanbanBoard = dynamic(
  () => import('./KanbanBoard').then(m => ({ default: m.KanbanBoard })),
  { ssr: false }
)

const JobsTable = dynamic(
  () => import('./JobsTable').then(m => ({ default: m.JobsTable })),
  { ssr: false }
)

const JobDetailDrawer = dynamic(
  () => import('./JobDetailDrawer').then(m => ({ default: m.JobDetailDrawer })),
  { ssr: false }
)

export function DashboardClient() {
  const [jobs, setJobs] = useState<DeltaJob[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [filters, setFilters] = useState<{ search: string; status: JobStatus | ''; minScore: number }>({
    search: '',
    status: '',
    minScore: 0,
  })
  const [selectedJob, setSelectedJob] = useState<DeltaJob | null>(null)
  const [isScraperRunning, setIsScraperRunning] = useState(false)

  const showToast = async (message: string, type: 'success' | 'error' = 'success') => {
    const { toast } = await import('sonner')
    if (type === 'error') toast.error(message)
    else toast.success(message)
  }

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.minScore > 0) params.set('minScore', String(filters.minScore))
      if (filters.search) params.set('search', filters.search)
      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setJobs(data)
    } catch {
      showToast('Failed to load jobs', 'error')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleStatusChange = async (id: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      showToast(`Moved to ${status.replace('_', ' ')}`)
    } catch {
      fetchJobs()
      showToast('Failed to update status', 'error')
    }
  }

  const handleUpdate = async (id: string, updates: Partial<DeltaJob>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j))
    if (selectedJob?.id === id) setSelectedJob(prev => prev ? { ...prev, ...updates } : null)
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error()
      if (updates.status) showToast(`Status updated to ${updates.status.replace('_', ' ')}`)
    } catch {
      fetchJobs()
      showToast('Failed to save', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id))
    if (selectedJob?.id === id) setSelectedJob(null)
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast('Job removed')
    } catch {
      fetchJobs()
      showToast('Failed to delete', 'error')
    }
  }

  const handleRunScraper = async () => {
    setIsScraperRunning(true)
    try {
      const res = await fetch('/api/run-scraper', { method: 'POST' })
      const data = await res.json()
      showToast(data.message ?? 'Scraper triggered!')
      setTimeout(fetchJobs, 3000)
    } catch {
      showToast('Failed to trigger scraper', 'error')
    } finally {
      setIsScraperRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Toaster theme="dark" position="bottom-right" richColors />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-sm font-bold text-white">Δ</div>
            <h1 className="text-lg font-semibold text-white">Delta Jobs CRM</h1>
          </div>
          {/* View toggle */}
          <div className="flex bg-gray-900 border border-gray-800 rounded-lg overflow-hidden text-sm">
            {(['kanban', 'table'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 capitalize transition-colors ${
                  view === v
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-5 space-y-4">
        {/* Stats */}
        <StatsBar jobs={jobs} />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onRunScraper={handleRunScraper}
          isScraperRunning={isScraperRunning}
        />

        {/* Board / Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : view === 'kanban' ? (
          <KanbanBoard
            jobs={jobs}
            onSelect={setSelectedJob}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <JobsTable
            jobs={jobs}
            onSelect={setSelectedJob}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Detail drawer */}
      <JobDetailDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onUpdate={handleUpdate}
      />
    </div>
  )
}

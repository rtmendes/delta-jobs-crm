'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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

const AdvisorPanel = dynamic(
  () => import('./AdvisorPanel').then(m => ({ default: m.AdvisorPanel })),
  { ssr: false }
)

const LOCAL_SERVER = 'http://localhost:8765'

export function DashboardClient() {
  const [jobs, setJobs] = useState<DeltaJob[]>([])
  const [allJobs, setAllJobs] = useState<DeltaJob[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [filters, setFilters] = useState<{ search: string; status: JobStatus | ''; minScore: number; company: string }>({
    search: '',
    status: '',
    minScore: 0,
    company: '',
  })

  // Derive unique companies from ALL jobs (unfiltered) for the dropdown
  const companies = useMemo(() =>
    [...new Set(allJobs.map(j => j.company))].sort(),
    [allJobs]
  )
  const [selectedJob, setSelectedJob] = useState<DeltaJob | null>(null)
  const [isScraperRunning, setIsScraperRunning] = useState(false)
  const [showAdvisor, setShowAdvisor] = useState(false)

  const showToast = async (message: string, type: 'success' | 'error' = 'success') => {
    const { toast } = await import('sonner')
    if (type === 'error') toast.error(message)
    else toast.success(message)
  }

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all jobs (unfiltered) once for the company dropdown
      const allRes = await fetch('/api/jobs')
      if (allRes.ok) setAllJobs(await allRes.json())

      // Fetch filtered jobs for the board
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.minScore > 0) params.set('minScore', String(filters.minScore))
      if (filters.search) params.set('search', filters.search)
      if (filters.company) params.set('company', filters.company)
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

  // Calls the LOCAL FastAPI server at localhost:8765 directly from the browser.
  // Vercel server-side cannot reach localhost, so this must be a client-side call.
  const handleRunScraper = async () => {
    setIsScraperRunning(true)
    try {
      // First check if local server is alive
      const statusRes = await fetch(`${LOCAL_SERVER}/status`, { signal: AbortSignal.timeout(3000) })
      if (!statusRes.ok) throw new Error('Server not responding')
      const status = await statusRes.json()
      if (status.scraper_busy) {
        showToast('Scraper is already running…')
        setIsScraperRunning(false)
        return
      }

      showToast('▶ Scraper started — this takes 1–3 minutes')

      const res = await fetch(`${LOCAL_SERVER}/run-scraper`, {
        method: 'POST',
        signal: AbortSignal.timeout(300_000), // 5-min timeout
      })
      const data = await res.json()

      if (data.status === 'completed') {
        showToast(`✓ Scraper done — ${data.jobsInExport ?? 0} jobs found. Importing…`)
        // Auto-import from local server
        await importFromLocalServer()
      } else {
        showToast(data.message ?? 'Scraper finished with errors', 'error')
      }
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && err.name === 'TimeoutError'
      if (isTimeout) {
        showToast('Scraper timed out — check /tmp/delta-scraper.log on your Mac', 'error')
      } else {
        showToast(
          '⚠️ Cannot reach local server (localhost:8765). Make sure the Delta Jobs server is running.',
          'error'
        )
      }
    } finally {
      setIsScraperRunning(false)
    }
  }

  const importFromLocalServer = async () => {
    try {
      const res = await fetch(`${LOCAL_SERVER}/jobs`)
      if (!res.ok) throw new Error()
      const scraped: DeltaJob[] = await res.json()
      if (!scraped.length) return

      let imported = 0
      for (const job of scraped) {
        const postRes = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(job),
        })
        if (postRes.ok) imported++
      }
      showToast(`✓ Imported ${imported} new jobs into CRM`)
      fetchJobs()
    } catch {
      showToast('Could not import jobs from scraper', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Toaster theme="dark" position="bottom-right" richColors />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-sm font-bold text-white">✈</div>
            <h1 className="text-lg font-semibold text-white">Aviation Jobs CRM</h1>
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

        {/* Filters + Scraper button */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onRunScraper={handleRunScraper}
          isScraperRunning={isScraperRunning}
          companies={companies}
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

      {/* Captain Advisor panel */}
      {showAdvisor && (
        <AdvisorPanel
          jobs={jobs}
          onClose={() => setShowAdvisor(false)}
        />
      )}

      {/* Floating Advisor button — bottom-right */}
      {!showAdvisor && (
        <button
          onClick={() => setShowAdvisor(true)}
          title="Open Captain Advisor"
          className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all"
        >
          ✈
        </button>
      )}
    </div>
  )
}

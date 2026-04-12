'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, ChevronDown, ChevronRight, FileText, Mail, BarChart2, Briefcase, Loader2 } from 'lucide-react'
import { DeltaJob, JobStatus, STATUS_LABELS, STATUS_COLORS, KANBAN_COLUMNS, SCORE_COLOR } from '@/lib/types'

interface JobDetailDrawerProps {
  job: DeltaJob | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<DeltaJob>) => void
}

type Tab = 'details' | 'resume' | 'cover_letter' | 'fit'

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
      >
        {title}
        {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-2 text-xs text-gray-400 bg-gray-950/50 whitespace-pre-wrap max-h-64 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Details Tab ─────────────────────────────────────────────
function DetailsTab({ job, onUpdate }: { job: DeltaJob; onUpdate: (id: string, updates: Partial<DeltaJob>) => void }) {
  const [notes, setNotes] = useState(job.notes ?? '')

  useEffect(() => { setNotes(job.notes ?? '') }, [job.id, job.notes])

  const scoreColor = SCORE_COLOR(job.score ?? 0)
  const scoreClass =
    scoreColor === 'emerald' ? 'text-emerald-400' :
    scoreColor === 'amber' ? 'text-amber-400' : 'text-red-400'
  const barClass =
    scoreColor === 'emerald' ? 'bg-emerald-500' :
    scoreColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'

  const handleNotesBlur = () => {
    if (notes !== job.notes) onUpdate(job.id, { notes })
  }

  return (
    <div className="space-y-4">
      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[job.status]}`}>
          {STATUS_LABELS[job.status]}
        </span>
        {job.score !== null && (
          <span className={`text-sm font-bold ${scoreClass}`}>{job.score}/100</span>
        )}
        {job.pay_rate && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-300 border border-emerald-700/30">
            {job.pay_rate}
          </span>
        )}
        {job.job_type && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
            {job.job_type}
          </span>
        )}
      </div>

      {/* Status changer */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Move to</p>
        <div className="flex flex-wrap gap-1.5">
          {KANBAN_COLUMNS.filter(s => s !== job.status).map(s => (
            <button
              key={s}
              onClick={() => onUpdate(job.id, { status: s as JobStatus })}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors hover:opacity-80 ${STATUS_COLORS[s]}`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* AI Fit Score bar */}
      {job.score !== null && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">AI Fit Score</p>
            <span className={`text-xs font-bold ${scoreClass}`}>{job.score}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${barClass} rounded-full transition-all`} style={{ width: `${job.score}%` }} />
          </div>
        </div>
      )}

      {/* AI Reasoning */}
      {job.reasoning && <Accordion title="AI Reasoning">{job.reasoning}</Accordion>}

      {/* JD text */}
      {job.jd_text && <Accordion title="Job Description">{job.jd_text}</Accordion>}

      {/* Notes */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Notes</p>
        <textarea
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
          rows={4}
          placeholder="Add your notes…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
        />
      </div>
    </div>
  )
}

// ── Resume Tab ───────────────────────────────────────────────
function ResumeTab({ job, onUpdate }: { job: DeltaJob; onUpdate: (id: string, updates: Partial<DeltaJob>) => void }) {
  const [resume, setResume] = useState(job.resume ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => { setResume(job.resume ?? '') }, [job.id, job.resume])

  const handleSave = () => {
    onUpdate(job.id, { resume })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tailored Resume for this Role</p>
        <button
          onClick={handleSave}
          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <textarea
        className="flex-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none font-mono"
        style={{ minHeight: '400px' }}
        placeholder={`Paste or write your tailored resume for ${job.title} at ${job.company ?? 'this company'} here…\n\nTip: Use Captain Advisor to generate a Delta-targeted resume.`}
        value={resume}
        onChange={e => setResume(e.target.value)}
      />
    </div>
  )
}

// ── Cover Letter Tab ─────────────────────────────────────────
function CoverLetterTab({ job, onUpdate }: { job: DeltaJob; onUpdate: (id: string, updates: Partial<DeltaJob>) => void }) {
  const [coverLetter, setCoverLetter] = useState(job.cover_letter ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => { setCoverLetter(job.cover_letter ?? '') }, [job.id, job.cover_letter])

  const handleSave = () => {
    onUpdate(job.id, { cover_letter: coverLetter })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Cover Letter</p>
        <button
          onClick={handleSave}
          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <textarea
        className="flex-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
        style={{ minHeight: '400px' }}
        placeholder={`Write your cover letter for ${job.title} at ${job.company ?? 'this company'} here…\n\nTip: Ask Captain Advisor to draft a compelling aviation cover letter highlighting your pathway toward Delta.`}
        value={coverLetter}
        onChange={e => setCoverLetter(e.target.value)}
      />
    </div>
  )
}

// ── Δ Fit Tab ────────────────────────────────────────────────
const FIT_DIMENSIONS = [
  { key: 'ai_income', label: '💰 Income Trajectory', color: 'emerald' },
  { key: 'ai_flight_hours', label: '⏱ Flight Hours Path', color: 'blue' },
  { key: 'ai_seniority', label: '📈 Seniority Impact', color: 'violet' },
  { key: 'ai_fo_credentials', label: '🎓 FO Credentials', color: 'amber' },
] as const

type FitKey = typeof FIT_DIMENSIONS[number]['key']

function FitTab({ job, onUpdate }: { job: DeltaJob; onUpdate: (id: string, updates: Partial<DeltaJob>) => void }) {
  const [generating, setGenerating] = useState<FitKey | 'all' | null>(null)

  const getJobContext = () => `
Job: ${job.title}
Company: ${job.company ?? 'Unknown'}
Location: ${job.location ?? 'Unknown'}
Pay Rate: ${job.pay_rate ?? 'Not listed'}
Job Type: ${job.job_type ?? 'Unknown'}
AI Score: ${job.score ?? 'N/A'}/100
Job Description: ${job.jd_text?.slice(0, 1500) ?? 'Not available'}
`.trim()

  const generateDimension = async (dimKey: FitKey) => {
    const dim = FIT_DIMENSIONS.find(d => d.key === dimKey)!
    setGenerating(dimKey)
    const prompt = `You are a Delta Air Lines career advisor. Analyze this job opportunity and give a 2-3 sentence analysis specifically for the "${dim.label}" dimension of a pilot's career path toward Delta Captain.

${getJobContext()}

Focus your response ONLY on how this role impacts ${dim.label} for someone pursuing a Delta Air Lines career. Be specific and concise.`

    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3', prompt, stream: false }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      onUpdate(job.id, { [dimKey]: data.response?.trim() ?? 'Analysis unavailable.' })
    } catch {
      onUpdate(job.id, { [dimKey]: '⚠️ Ollama unavailable. Run `ollama serve` and ensure llama3 is installed.' })
    } finally {
      setGenerating(null)
    }
  }

  const generateAll = async () => {
    setGenerating('all')
    for (const dim of FIT_DIMENSIONS) {
      await generateDimension(dim.key)
    }
    setGenerating(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Δ Delta Career Fit Analysis</p>
          <p className="text-xs text-gray-500 mt-0.5">AI-powered analysis across 4 career dimensions</p>
        </div>
        <button
          onClick={generateAll}
          disabled={!!generating}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {generating === 'all' ? <Loader2 className="w-3 h-3 animate-spin" /> : '✦'}
          {generating === 'all' ? 'Analyzing…' : 'Analyze All'}
        </button>
      </div>

      {FIT_DIMENSIONS.map(dim => {
        const value = job[dim.key as keyof DeltaJob] as string | null
        const isLoading = generating === dim.key || generating === 'all'
        const borderColor = {
          emerald: 'border-emerald-800/60',
          blue: 'border-blue-800/60',
          violet: 'border-violet-800/60',
          amber: 'border-amber-800/60',
        }[dim.color]
        const labelColor = {
          emerald: 'text-emerald-400',
          blue: 'text-blue-400',
          violet: 'text-violet-400',
          amber: 'text-amber-400',
        }[dim.color]

        return (
          <div key={dim.key} className={`border ${borderColor} rounded-lg p-3 space-y-2`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${labelColor}`}>{dim.label}</span>
              <button
                onClick={() => generateDimension(dim.key)}
                disabled={!!generating}
                className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-400 rounded transition-colors"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Regenerate'}
              </button>
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" /> Generating analysis…
              </div>
            ) : value ? (
              <p className="text-xs text-gray-300 leading-relaxed">{value}</p>
            ) : (
              <p className="text-xs text-gray-600 italic">Click &ldquo;Regenerate&rdquo; or &ldquo;Analyze All&rdquo; to generate this dimension.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Drawer ──────────────────────────────────────────────
export function JobDetailDrawer({ job, onClose, onUpdate }: JobDetailDrawerProps) {
  const [tab, setTab] = useState<Tab>('details')

  // Reset tab when job changes
  useEffect(() => { setTab('details') }, [job?.id])

  if (!job) return null

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Details', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'resume', label: 'Resume', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'cover_letter', label: 'Cover Letter', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'fit', label: 'Δ Fit', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-30" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-950 border-l border-gray-800 z-40 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-800">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-base font-semibold text-white truncate">{job.title}</h2>
            <p className="text-sm text-gray-400">{job.company}{job.location ? ` · ${job.location}` : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 px-4 gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'details' && <DetailsTab job={job} onUpdate={onUpdate} />}
          {tab === 'resume' && <ResumeTab job={job} onUpdate={onUpdate} />}
          {tab === 'cover_letter' && <CoverLetterTab job={job} onUpdate={onUpdate} />}
          {tab === 'fit' && <FitTab job={job} onUpdate={onUpdate} />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Apply / View Listing
          </a>
        </div>
      </div>
    </>
  )
}

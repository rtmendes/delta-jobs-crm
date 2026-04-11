'use client'

import { useState } from 'react'
import { X, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'
import { DeltaJob, JobStatus, STATUS_LABELS, STATUS_COLORS, KANBAN_COLUMNS, SCORE_COLOR } from '@/lib/types'

interface JobDetailDrawerProps {
  job: DeltaJob | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<DeltaJob>) => void
}

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

export function JobDetailDrawer({ job, onClose, onUpdate }: JobDetailDrawerProps) {
  const [notes, setNotes] = useState(job?.notes ?? '')

  if (!job) return null

  const scoreColor = SCORE_COLOR(job.score)
  const scoreClass =
    scoreColor === 'emerald' ? 'text-emerald-400' :
    scoreColor === 'amber' ? 'text-amber-400' : 'text-red-400'
  const barClass =
    scoreColor === 'emerald' ? 'bg-emerald-500' :
    scoreColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'

  const handleBlur = () => {
    if (notes !== job.notes) {
      onUpdate(job.id, { notes })
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-30"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-950 border-l border-gray-800 z-40 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-800">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-base font-semibold text-white truncate">{job.title}</h2>
            <p className="text-sm text-gray-400">{job.company} · {job.location}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[job.status]}`}>
              {STATUS_LABELS[job.status]}
            </span>
            <span className={`text-sm font-bold ${scoreClass}`}>{job.score}/100</span>
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

          {/* AI Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">AI Fit Score</p>
              <span className={`text-xs font-bold ${scoreClass}`}>{job.score}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${barClass} rounded-full transition-all`}
                style={{ width: `${job.score}%` }}
              />
            </div>
          </div>

          {/* Reasoning */}
          {job.reasoning && (
            <Accordion title="AI Reasoning">
              {job.reasoning}
            </Accordion>
          )}

          {/* JD text */}
          {job.jd_text && (
            <Accordion title="Job Description">
              {job.jd_text}
            </Accordion>
          )}

          {/* Notes */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Notes</p>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
              rows={4}
              placeholder="Add your notes…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={handleBlur}
            />
          </div>
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

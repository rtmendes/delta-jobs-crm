'use client'

import { useState } from 'react'
import { ArrowUpDown, ExternalLink, Trash2 } from 'lucide-react'
import { DeltaJob, STATUS_LABELS, STATUS_COLORS, SCORE_COLOR } from '@/lib/types'

type SortKey = 'score' | 'created_at' | 'status' | 'title'

interface JobsTableProps {
  jobs: DeltaJob[]
  onSelect: (job: DeltaJob) => void
  onDelete: (id: string) => void
}

export function JobsTable({ jobs, onSelect, onDelete }: JobsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = [...jobs].sort((a, b) => {
    let av: string | number = a[sortKey]
    let bv: string | number = b[sortKey]
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av < bv) return sortAsc ? -1 : 1
    if (av > bv) return sortAsc ? 1 : -1
    return 0
  })

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p)
    else { setSortKey(key); setSortAsc(false) }
  }

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      onClick={() => toggle(k)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-300 transition-colors"
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortKey === k ? 'text-blue-400' : 'text-gray-700'}`} />
      </span>
    </th>
  )

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-900/60">
          <tr>
            <Th k="title" label="Title" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Company</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Location</th>
            <Th k="status" label="Status" />
            <Th k="score" label="Score" />
            <Th k="created_at" label="Added" />
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {sorted.map(job => {
            const scoreColor = SCORE_COLOR(job.score)
            const scoreClass =
              scoreColor === 'emerald' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
              scoreColor === 'amber' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
              'text-red-400 bg-red-500/10 border-red-500/20'
            return (
              <tr
                key={job.id}
                onClick={() => onSelect(job)}
                className="group hover:bg-gray-800/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-medium text-gray-200 max-w-[220px]">
                  <span className="truncate block">{job.title}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{job.company}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{job.location}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[job.status]}`}>
                    {STATUS_LABELS[job.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${scoreClass}`}>
                    {job.score}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(job.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-gray-500 hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(job.id) }}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-gray-600">
                No jobs match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

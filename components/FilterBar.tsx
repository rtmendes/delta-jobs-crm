'use client'

import { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { JobStatus, STATUS_LABELS, KANBAN_COLUMNS } from '@/lib/types'

export interface Filters {
  search: string
  status: JobStatus | ''
  minScore: number
}

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
  onRunScraper: () => void
  isScraperRunning: boolean
}

export function FilterBar({ filters, onChange, onRunScraper, isScraperRunning }: FilterBarProps) {
  const [showScore, setShowScore] = useState(false)

  const hasActive =
    filters.search !== '' || filters.status !== '' || filters.minScore > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search title, company, location…"
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={e => onChange({ ...filters, status: e.target.value as JobStatus | '' })}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
      >
        <option value="">All statuses</option>
        {KANBAN_COLUMNS.map(s => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      {/* Min score */}
      <div className="relative">
        <button
          onClick={() => setShowScore(p => !p)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
            filters.minScore > 0
              ? 'border-blue-500 bg-blue-500/10 text-blue-300'
              : 'border-gray-700 bg-gray-900 text-gray-400 hover:text-gray-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Score {filters.minScore > 0 ? `≥ ${filters.minScore}` : 'min'}
        </button>
        {showScore && (
          <div className="absolute top-full mt-1 right-0 z-20 bg-gray-900 border border-gray-700 rounded-lg p-3 w-48 shadow-xl">
            <p className="text-xs text-gray-500 mb-2">Min score: {filters.minScore}</p>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={filters.minScore}
              onChange={e => onChange({ ...filters, minScore: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0</span><span>100</span>
            </div>
          </div>
        )}
      </div>

      {/* Clear */}
      {hasActive && (
        <button
          onClick={() => onChange({ search: '', status: '', minScore: 0 })}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Clear
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Run Scraper */}
      <button
        onClick={onRunScraper}
        disabled={isScraperRunning}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        {isScraperRunning ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Running…
          </>
        ) : (
          <>▶ Run Scraper</>
        )}
      </button>
    </div>
  )
}

'use client'

import { DeltaJob } from '@/lib/types'

interface StatsBarProps {
  jobs: DeltaJob[]
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
}

function StatCard({ label, value, sub, color = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex flex-col gap-0.5">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

export function StatsBar({ jobs }: StatsBarProps) {
  const total = jobs.length
  const avgScore = total > 0 ? Math.round(jobs.reduce((s, j) => s + j.score, 0) / total) : 0
  const appliedCount = jobs.filter(j =>
    ['applied', 'phone_screen', 'interview', 'offer'].includes(j.status)
  ).length
  const interviewCount = jobs.filter(j => j.status === 'interview').length
  const offerCount = jobs.filter(j => j.status === 'offer').length
  const highScoreCount = jobs.filter(j => j.score >= 80).length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard label="Total Jobs" value={total} />
      <StatCard
        label="Avg Score"
        value={`${avgScore}%`}
        color={avgScore >= 80 ? 'text-emerald-400' : avgScore >= 60 ? 'text-amber-400' : 'text-red-400'}
      />
      <StatCard label="In Pipeline" value={appliedCount} sub="applied → offer" color="text-violet-400" />
      <StatCard label="Interviewing" value={interviewCount} color="text-cyan-400" />
      <StatCard label="Offers" value={offerCount} color="text-emerald-400" />
      <StatCard label="High Fit (≥80)" value={highScoreCount} color="text-blue-400" />
    </div>
  )
}

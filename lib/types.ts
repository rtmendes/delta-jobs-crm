export type JobStatus =
  | 'new'
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'archived'

export interface DeltaJob {
  id: string
  title: string
  url: string
  company: string
  location: string
  status: JobStatus
  score: number
  reasoning: string
  jd_text: string
  notes: string
  source_query: string
  created_at: string
  updated_at: string
}

export const STATUS_LABELS: Record<JobStatus, string> = {
  new: 'New',
  applied: 'Applied',
  phone_screen: 'Phone Screen',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  archived: 'Archived',
}

export const KANBAN_COLUMNS: JobStatus[] = [
  'new',
  'applied',
  'phone_screen',
  'interview',
  'offer',
  'rejected',
  'archived',
]

export const STATUS_COLORS: Record<JobStatus, string> = {
  new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  applied: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  phone_screen: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  interview: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  offer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export const SCORE_COLOR = (score: number) => {
  if (score >= 80) return 'emerald'
  if (score >= 60) return 'amber'
  return 'red'
}

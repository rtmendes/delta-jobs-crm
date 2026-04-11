'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DeltaJob, JobStatus, STATUS_LABELS, STATUS_COLORS, KANBAN_COLUMNS, SCORE_COLOR } from '@/lib/types'
import { ExternalLink } from 'lucide-react'

interface KanbanBoardProps {
  jobs: DeltaJob[]
  onSelect: (job: DeltaJob) => void
  onStatusChange: (id: string, status: JobStatus) => void
}

function JobCard({ job, onSelect, isDragging = false }: {
  job: DeltaJob
  onSelect?: (job: DeltaJob) => void
  isDragging?: boolean
}) {
  const scoreColor = SCORE_COLOR(job.score)
  const scoreClass =
    scoreColor === 'emerald' ? 'text-emerald-400' :
    scoreColor === 'amber' ? 'text-amber-400' : 'text-red-400'
  const barClass =
    scoreColor === 'emerald' ? 'bg-emerald-500' :
    scoreColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div
      onClick={() => onSelect?.(job)}
      className={`bg-gray-900 border border-gray-800 rounded-lg p-3 cursor-pointer select-none transition-shadow hover:border-gray-700 hover:shadow-lg ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <p className="text-sm font-medium text-gray-200 leading-tight mb-1">{job.title}</p>
      <p className="text-xs text-gray-500 mb-2">{job.company} · {job.location}</p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full ${barClass} rounded-full`} style={{ width: `${job.score}%` }} />
        </div>
        <span className={`text-xs font-bold ${scoreClass} shrink-0`}>{job.score}</span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-gray-600 hover:text-blue-400 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

function SortableCard({ job, onSelect }: { job: DeltaJob; onSelect: (job: DeltaJob) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
    data: { status: job.status },
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <JobCard job={job} onSelect={onSelect} isDragging={isDragging} />
    </div>
  )
}

function KanbanColumn({
  status,
  jobs,
  onSelect,
  isOver,
}: {
  status: JobStatus
  jobs: DeltaJob[]
  onSelect: (job: DeltaJob) => void
  isOver: boolean
}) {
  const ids = jobs.map(j => j.id)
  return (
    <div
      data-column-status={status}
      className={`flex flex-col min-w-[220px] w-[220px] shrink-0 rounded-xl border transition-colors ${
        isOver ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-800 bg-gray-900/30'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        <span className="text-xs text-gray-600">{jobs.length}</span>
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex-1 flex flex-col gap-2 p-2 min-h-[120px]">
          {jobs.map(job => (
            <SortableCard key={job.id} job={job} onSelect={onSelect} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({ jobs, onSelect, onStatusChange }: KanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<DeltaJob | null>(null)
  const [overColumn, setOverColumn] = useState<JobStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const columns = KANBAN_COLUMNS.reduce<Record<JobStatus, DeltaJob[]>>(
    (acc, s) => ({ ...acc, [s]: jobs.filter(j => j.status === s) }),
    {} as Record<JobStatus, DeltaJob[]>
  )

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find(j => j.id === event.active.id)
    setActiveJob(job ?? null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (!over) { setOverColumn(null); return }
    // over could be a card or a column
    const overJob = jobs.find(j => j.id === over.id)
    if (overJob) {
      setOverColumn(overJob.status)
    } else {
      // over.id might be a column status string
      if (KANBAN_COLUMNS.includes(over.id as JobStatus)) {
        setOverColumn(over.id as JobStatus)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveJob(null)
    setOverColumn(null)

    if (!over || !activeJob) return

    // Determine target status
    let targetStatus: JobStatus | null = null
    const overJob = jobs.find(j => j.id === over.id)
    if (overJob) {
      targetStatus = overJob.status
    } else if (KANBAN_COLUMNS.includes(over.id as JobStatus)) {
      targetStatus = over.id as JobStatus
    }

    if (targetStatus && targetStatus !== activeJob.status) {
      onStatusChange(activeJob.id, targetStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            jobs={columns[status] ?? []}
            onSelect={onSelect}
            isOver={overColumn === status}
          />
        ))}
      </div>
      <DragOverlay>
        {activeJob && <JobCard job={activeJob} />}
      </DragOverlay>
    </DndContext>
  )
}

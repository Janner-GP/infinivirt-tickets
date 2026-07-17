import type { TicketPriority } from '../types/ticket'

const LABELS: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

const DOT_CLASSES: Record<TicketPriority, string> = {
  LOW: 'bg-priority-low',
  MEDIUM: 'bg-priority-medium',
  HIGH: 'bg-priority-high',
  CRITICAL: 'bg-priority-critical',
}

export function PriorityIndicator({ priority }: { priority: TicketPriority }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
      <span className={`h-2 w-2 rounded-full ${DOT_CLASSES[priority]}`} />
      {LABELS[priority]}
    </span>
  )
}

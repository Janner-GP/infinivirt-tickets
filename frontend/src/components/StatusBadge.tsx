import type { TicketStatus } from '../types/ticket'

const LABELS: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  PENDING_CUSTOMER: 'Esperando cliente',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
}

const CLASSES: Record<TicketStatus, string> = {
  OPEN: 'bg-status-open-bg text-status-open',
  IN_PROGRESS: 'bg-status-progress-bg text-status-progress',
  PENDING_CUSTOMER: 'bg-status-pending-bg text-status-pending',
  RESOLVED: 'bg-status-resolved-bg text-status-resolved',
  CLOSED: 'bg-status-closed-bg text-status-closed',
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CLASSES[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}

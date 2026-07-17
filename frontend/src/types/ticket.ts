export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface TicketComment {
  id: string
  authorId: string
  content: string
  isInternal: boolean
  createdAt: string
}

export interface Ticket {
  id: string
  clientId: string
  categoryId: string
  subcategoryId: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdById: string
  assignedToId: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  closedAt: string | null
  comments?: TicketComment[]
}

export interface DashboardMetrics {
  totalOpen: number
  byStatus: Record<TicketStatus, number>
}

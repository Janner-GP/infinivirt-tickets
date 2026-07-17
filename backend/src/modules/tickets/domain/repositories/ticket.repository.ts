import { TicketPriority, TicketStatus } from '@prisma/client';
import { TicketCommentEntity } from '../entities/ticket-comment.entity';
import { TicketEntity } from '../entities/ticket.entity';

export interface TicketFilter {
  status?: TicketStatus;
  priority?: TicketPriority;
  clientId?: string;
  assignedToId?: string;
  categoryId?: string;
  subcategoryId?: string;
}

export interface CreateTicketData {
  clientId: string;
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  priority: TicketPriority;
  createdById: string;
  assignedToId: string | null;
}

export interface UpdateTicketFieldsData {
  title?: string;
  description?: string;
  priority?: TicketPriority;
}

export interface UpdateStatusData {
  status: TicketStatus;
  changedById: string;
  previousStatus: TicketStatus;
  resolvedAt: Date | null;
  closedAt: Date | null;
}

export interface ReassignData {
  newUserId: string;
  assignedById: string;
  previousUserId: string | null;
}

export interface CreateCommentData {
  ticketId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
}

export interface DashboardMetrics {
  totalOpen: number;
  byStatus: Record<TicketStatus, number>;
}

/**
 * Puerto del dominio Tickets. La implementación concreta (Prisma) vive en
 * infrastructure/persistence — ver docs/ADRs/008-backend-architecture-ddd-lite.md
 */
export abstract class TicketRepository {
  abstract findById(id: string): Promise<TicketEntity | null>;
  abstract findMany(filter: TicketFilter): Promise<TicketEntity[]>;
  abstract create(data: CreateTicketData): Promise<TicketEntity>;
  abstract updateFields(
    id: string,
    data: UpdateTicketFieldsData,
  ): Promise<TicketEntity>;
  abstract updateStatus(
    id: string,
    data: UpdateStatusData,
  ): Promise<TicketEntity>;
  abstract reassign(id: string, data: ReassignData): Promise<TicketEntity>;
  abstract addComment(data: CreateCommentData): Promise<TicketCommentEntity>;
  abstract findComments(ticketId: string): Promise<TicketCommentEntity[]>;
  abstract findOverdue(hoursThreshold: number): Promise<TicketEntity[]>;
  abstract getDashboardMetrics(): Promise<DashboardMetrics>;
}

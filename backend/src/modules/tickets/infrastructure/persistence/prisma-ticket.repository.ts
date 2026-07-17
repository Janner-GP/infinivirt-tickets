import { Injectable } from '@nestjs/common';
import {
  Ticket as PrismaTicket,
  TicketComment as PrismaTicketComment,
  TicketStatus,
} from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TicketCommentEntity } from '../../domain/entities/ticket-comment.entity';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import {
  CreateCommentData,
  CreateTicketData,
  DashboardMetrics,
  ReassignData,
  TicketFilter,
  TicketRepository,
  UpdateStatusData,
  UpdateTicketFieldsData,
} from '../../domain/repositories/ticket.repository';

const ALL_STATUSES: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
  TicketStatus.PENDING_CUSTOMER,
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
];

@Injectable()
export class PrismaTicketRepository implements TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TicketEntity | null> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    return ticket ? this.toDomain(ticket) : null;
  }

  async findMany(filter: TicketFilter): Promise<TicketEntity[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        status: filter.status,
        priority: filter.priority,
        clientId: filter.clientId,
        assignedToId: filter.assignedToId,
        categoryId: filter.categoryId,
        subcategoryId: filter.subcategoryId,
      },
      orderBy: { createdAt: 'desc' },
    });
    return tickets.map((ticket) => this.toDomain(ticket));
  }

  async create(data: CreateTicketData): Promise<TicketEntity> {
    const ticket = await this.prisma.ticket.create({ data });
    return this.toDomain(ticket);
  }

  async updateFields(
    id: string,
    data: UpdateTicketFieldsData,
  ): Promise<TicketEntity> {
    const ticket = await this.prisma.ticket.update({ where: { id }, data });
    return this.toDomain(ticket);
  }

  async updateStatus(
    id: string,
    data: UpdateStatusData,
  ): Promise<TicketEntity> {
    const [ticket] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id },
        data: {
          status: data.status,
          resolvedAt: data.resolvedAt,
          closedAt: data.closedAt,
        },
      }),
      this.prisma.ticketStatusHistory.create({
        data: {
          ticketId: id,
          previousStatus: data.previousStatus,
          newStatus: data.status,
          changedById: data.changedById,
        },
      }),
    ]);
    return this.toDomain(ticket);
  }

  async reassign(id: string, data: ReassignData): Promise<TicketEntity> {
    const [ticket] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id },
        data: { assignedToId: data.newUserId },
      }),
      this.prisma.ticketAssignmentHistory.create({
        data: {
          ticketId: id,
          previousUserId: data.previousUserId,
          newUserId: data.newUserId,
          assignedById: data.assignedById,
        },
      }),
    ]);
    return this.toDomain(ticket);
  }

  async addComment(data: CreateCommentData): Promise<TicketCommentEntity> {
    const comment = await this.prisma.ticketComment.create({ data });
    return this.toCommentDomain(comment);
  }

  async findComments(ticketId: string): Promise<TicketCommentEntity[]> {
    const comments = await this.prisma.ticketComment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });
    return comments.map((comment) => this.toCommentDomain(comment));
  }

  async findOverdue(hoursThreshold: number): Promise<TicketEntity[]> {
    const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
    const tickets = await this.prisma.ticket.findMany({
      where: {
        updatedAt: { lt: threshold },
        status: { not: TicketStatus.CLOSED },
      },
      orderBy: { updatedAt: 'asc' },
    });
    return tickets.map((ticket) => this.toDomain(ticket));
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const grouped = await this.prisma.ticket.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const byStatus = Object.fromEntries(
      ALL_STATUSES.map((status) => [status, 0]),
    ) as Record<TicketStatus, number>;
    for (const group of grouped) {
      byStatus[group.status] = group._count._all;
    }

    return {
      totalOpen: byStatus[TicketStatus.OPEN],
      byStatus,
    };
  }

  private toDomain(ticket: PrismaTicket): TicketEntity {
    return TicketEntity.create(ticket);
  }

  private toCommentDomain(comment: PrismaTicketComment): TicketCommentEntity {
    return TicketCommentEntity.create(comment);
  }
}

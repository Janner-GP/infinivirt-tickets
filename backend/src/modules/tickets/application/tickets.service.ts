import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, TicketPriority, TicketStatus } from '@prisma/client';
import { AssignmentRuleRepository } from '../../assignment-rules/domain/repositories/assignment-rule.repository';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { TicketCommentEntity } from '../domain/entities/ticket-comment.entity';
import { TicketEntity } from '../domain/entities/ticket.entity';
import {
  isAdminOnlyTransition,
  TICKET_STATUS_TRANSITIONS,
} from '../domain/constants/ticket-status-transitions';
import {
  DashboardMetrics,
  TicketFilter,
  TicketRepository,
} from '../domain/repositories/ticket.repository';

const OVERDUE_HOURS_THRESHOLD = 48;

export interface CreateTicketInput {
  clientId?: string;
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  priority: TicketPriority;
  assignedToId?: string;
}

export interface UpdateTicketFieldsInput {
  title?: string;
  description?: string;
  priority?: TicketPriority;
}

export interface AddCommentInput {
  content: string;
  isInternal?: boolean;
}

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly assignmentRuleRepository: AssignmentRuleRepository,
  ) {}

  async create(
    input: CreateTicketInput,
    currentUser: AuthenticatedUser,
  ): Promise<TicketEntity> {
    const clientId =
      currentUser.role === Role.CLIENT ? currentUser.clientId : input.clientId;
    if (!clientId) {
      throw new BadRequestException(
        'Debes indicar el cliente asociado al ticket',
      );
    }

    const assignedToId = await this.resolveAssignedToId(input, currentUser);

    return this.ticketRepository.create({
      clientId,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      createdById: currentUser.id,
      assignedToId,
    });
  }

  /**
   * El Agente que crea un ticket siempre se auto-asigna a sí mismo (no lo pisa
   * la regla). En cualquier otro caso, si no viene un assignedToId explícito,
   * se consulta la regla configurada para la subcategoría — decisión confirmada
   * con el usuario: la regla solo "llena huecos".
   */
  private async resolveAssignedToId(
    input: CreateTicketInput,
    currentUser: AuthenticatedUser,
  ): Promise<string | null> {
    if (currentUser.role === Role.AGENT) {
      return currentUser.id;
    }

    if (input.assignedToId) {
      return input.assignedToId;
    }

    const rule = await this.assignmentRuleRepository.findBySubcategoryId(
      input.subcategoryId,
    );
    return rule?.agentId ?? null;
  }

  findMany(
    filter: TicketFilter,
    currentUser: AuthenticatedUser,
  ): Promise<TicketEntity[]> {
    let scopedFilter = filter;
    if (currentUser.role === Role.AGENT) {
      scopedFilter = { ...filter, assignedToId: currentUser.id };
    } else if (currentUser.role === Role.CLIENT) {
      scopedFilter = { ...filter, clientId: currentUser.clientId };
    }

    return this.ticketRepository.findMany(scopedFilter);
  }

  async findById(id: string): Promise<TicketEntity> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    return ticket;
  }

  async updateFields(
    id: string,
    data: UpdateTicketFieldsInput,
  ): Promise<TicketEntity> {
    await this.findById(id);
    return this.ticketRepository.updateFields(id, data);
  }

  async updateStatus(
    id: string,
    newStatus: TicketStatus,
    currentUser: AuthenticatedUser,
  ): Promise<TicketEntity> {
    const ticket = await this.findById(id);

    const allowedNextStatuses = TICKET_STATUS_TRANSITIONS[ticket.status];
    if (!allowedNextStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede pasar de ${ticket.status} a ${newStatus}`,
      );
    }

    if (
      isAdminOnlyTransition(ticket.status, newStatus) &&
      currentUser.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'Solo un Administrador puede cerrar o reabrir un ticket',
      );
    }

    let resolvedAt = ticket.resolvedAt;
    let closedAt = ticket.closedAt;
    if (newStatus === TicketStatus.RESOLVED) {
      resolvedAt = new Date();
    } else if (newStatus === TicketStatus.CLOSED) {
      closedAt = new Date();
    } else {
      resolvedAt = null;
      closedAt = null;
    }

    return this.ticketRepository.updateStatus(id, {
      status: newStatus,
      changedById: currentUser.id,
      previousStatus: ticket.status,
      resolvedAt,
      closedAt,
    });
  }

  async reassign(
    id: string,
    newUserId: string,
    currentUser: AuthenticatedUser,
  ): Promise<TicketEntity> {
    const ticket = await this.findById(id);

    return this.ticketRepository.reassign(id, {
      newUserId,
      assignedById: currentUser.id,
      previousUserId: ticket.assignedToId,
    });
  }

  async addComment(
    id: string,
    input: AddCommentInput,
    currentUser: AuthenticatedUser,
  ): Promise<TicketCommentEntity> {
    await this.findById(id);

    const canMarkInternal =
      currentUser.role === Role.ADMIN || currentUser.role === Role.SUPERVISOR;

    return this.ticketRepository.addComment({
      ticketId: id,
      authorId: currentUser.id,
      content: input.content,
      isInternal: canMarkInternal ? (input.isInternal ?? false) : false,
    });
  }

  findComments(ticketId: string): Promise<TicketCommentEntity[]> {
    return this.ticketRepository.findComments(ticketId);
  }

  findOverdue(): Promise<TicketEntity[]> {
    return this.ticketRepository.findOverdue(OVERDUE_HOURS_THRESHOLD);
  }

  getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.ticketRepository.getDashboardMetrics();
  }
}

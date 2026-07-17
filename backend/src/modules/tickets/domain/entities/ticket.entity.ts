import { TicketPriority, TicketStatus } from '@prisma/client';

export class TicketEntity {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly categoryId: string,
    public readonly subcategoryId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly status: TicketStatus,
    public readonly priority: TicketPriority,
    public readonly createdById: string,
    public readonly assignedToId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly resolvedAt: Date | null,
    public readonly closedAt: Date | null,
  ) {}

  static create(props: {
    id: string;
    clientId: string;
    categoryId: string;
    subcategoryId: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdById: string;
    assignedToId: string | null;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt: Date | null;
    closedAt: Date | null;
  }): TicketEntity {
    return new TicketEntity(
      props.id,
      props.clientId,
      props.categoryId,
      props.subcategoryId,
      props.title,
      props.description,
      props.status,
      props.priority,
      props.createdById,
      props.assignedToId,
      props.createdAt,
      props.updatedAt,
      props.resolvedAt,
      props.closedAt,
    );
  }

  isAssignedTo(userId: string): boolean {
    return this.assignedToId === userId;
  }

  belongsToClient(clientId: string): boolean {
    return this.clientId === clientId;
  }
}

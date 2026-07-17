export class TicketCommentEntity {
  constructor(
    public readonly id: string,
    public readonly ticketId: string,
    public readonly authorId: string,
    public readonly content: string,
    public readonly isInternal: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: string;
    ticketId: string;
    authorId: string;
    content: string;
    isInternal: boolean;
    createdAt: Date;
  }): TicketCommentEntity {
    return new TicketCommentEntity(
      props.id,
      props.ticketId,
      props.authorId,
      props.content,
      props.isInternal,
      props.createdAt,
    );
  }
}

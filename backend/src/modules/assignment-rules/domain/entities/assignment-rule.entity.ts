export class AssignmentRuleEntity {
  constructor(
    public readonly id: string,
    public readonly subcategoryId: string,
    public readonly agentId: string,
    public readonly createdAt: Date,
    public readonly subcategoryName?: string,
    public readonly categoryId?: string,
    public readonly categoryName?: string,
    public readonly agentName?: string,
    public readonly agentEmail?: string,
  ) {}

  static create(props: {
    id: string;
    subcategoryId: string;
    agentId: string;
    createdAt: Date;
    subcategoryName?: string;
    categoryId?: string;
    categoryName?: string;
    agentName?: string;
    agentEmail?: string;
  }): AssignmentRuleEntity {
    return new AssignmentRuleEntity(
      props.id,
      props.subcategoryId,
      props.agentId,
      props.createdAt,
      props.subcategoryName,
      props.categoryId,
      props.categoryName,
      props.agentName,
      props.agentEmail,
    );
  }
}

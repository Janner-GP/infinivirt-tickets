import { AssignmentRuleEntity } from '../entities/assignment-rule.entity';

export interface CreateAssignmentRuleData {
  subcategoryId: string;
  agentId: string;
}

export interface UpdateAssignmentRuleData {
  agentId: string;
}

/**
 * Puerto del dominio Assignment Rules. La implementación concreta (Prisma) vive en
 * infrastructure/persistence — ver docs/ADRs/008-backend-architecture-ddd-lite.md
 */
export abstract class AssignmentRuleRepository {
  abstract findAll(): Promise<AssignmentRuleEntity[]>;
  abstract findById(id: string): Promise<AssignmentRuleEntity | null>;
  abstract findBySubcategoryId(
    subcategoryId: string,
  ): Promise<AssignmentRuleEntity | null>;
  abstract create(
    data: CreateAssignmentRuleData,
  ): Promise<AssignmentRuleEntity>;
  abstract update(
    id: string,
    data: UpdateAssignmentRuleData,
  ): Promise<AssignmentRuleEntity>;
  abstract delete(id: string): Promise<void>;
}

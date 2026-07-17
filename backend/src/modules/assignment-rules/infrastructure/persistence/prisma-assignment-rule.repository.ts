import { Injectable } from '@nestjs/common';
import {
  AssignmentRule as PrismaAssignmentRule,
  Category as PrismaCategory,
  Subcategory as PrismaSubcategory,
  User as PrismaUser,
} from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AssignmentRuleEntity } from '../../domain/entities/assignment-rule.entity';
import {
  AssignmentRuleRepository,
  CreateAssignmentRuleData,
  UpdateAssignmentRuleData,
} from '../../domain/repositories/assignment-rule.repository';

type RuleWithRelations = PrismaAssignmentRule & {
  subcategory: PrismaSubcategory & { category: PrismaCategory };
  agent: PrismaUser;
};

const WITH_RELATIONS = {
  subcategory: { include: { category: true } },
  agent: true,
} as const;

@Injectable()
export class PrismaAssignmentRuleRepository implements AssignmentRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AssignmentRuleEntity[]> {
    const rules = await this.prisma.assignmentRule.findMany({
      include: WITH_RELATIONS,
      orderBy: { createdAt: 'desc' },
    });
    return rules.map((rule) => this.toDomain(rule));
  }

  async findById(id: string): Promise<AssignmentRuleEntity | null> {
    const rule = await this.prisma.assignmentRule.findUnique({
      where: { id },
      include: WITH_RELATIONS,
    });
    return rule ? this.toDomain(rule) : null;
  }

  async findBySubcategoryId(
    subcategoryId: string,
  ): Promise<AssignmentRuleEntity | null> {
    const rule = await this.prisma.assignmentRule.findUnique({
      where: { subcategoryId },
    });
    return rule ? AssignmentRuleEntity.create(rule) : null;
  }

  async create(data: CreateAssignmentRuleData): Promise<AssignmentRuleEntity> {
    const rule = await this.prisma.assignmentRule.create({
      data,
      include: WITH_RELATIONS,
    });
    return this.toDomain(rule);
  }

  async update(
    id: string,
    data: UpdateAssignmentRuleData,
  ): Promise<AssignmentRuleEntity> {
    const rule = await this.prisma.assignmentRule.update({
      where: { id },
      data,
      include: WITH_RELATIONS,
    });
    return this.toDomain(rule);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.assignmentRule.delete({ where: { id } });
  }

  private toDomain(rule: RuleWithRelations): AssignmentRuleEntity {
    return AssignmentRuleEntity.create({
      id: rule.id,
      subcategoryId: rule.subcategoryId,
      agentId: rule.agentId,
      createdAt: rule.createdAt,
      subcategoryName: rule.subcategory.name,
      categoryId: rule.subcategory.categoryId,
      categoryName: rule.subcategory.category.name,
      agentName: rule.agent.name,
      agentEmail: rule.agent.email,
    });
  }
}

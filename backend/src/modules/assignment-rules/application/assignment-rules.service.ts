import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CategoryRepository } from '../../categories/domain/repositories/category.repository';
import { UserRepository } from '../../users/domain/repositories/user.repository';
import { AssignmentRuleEntity } from '../domain/entities/assignment-rule.entity';
import { AssignmentRuleRepository } from '../domain/repositories/assignment-rule.repository';

@Injectable()
export class AssignmentRulesService {
  constructor(
    private readonly assignmentRuleRepository: AssignmentRuleRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(
    subcategoryId: string,
    agentId: string,
  ): Promise<AssignmentRuleEntity> {
    const subcategory =
      await this.categoryRepository.findSubcategoryById(subcategoryId);
    if (!subcategory) {
      throw new NotFoundException('Subcategoría no encontrada');
    }

    await this.assertIsAgent(agentId);

    const existing =
      await this.assignmentRuleRepository.findBySubcategoryId(subcategoryId);
    if (existing) {
      throw new ConflictException(
        'Ya existe una regla de asignación para esta subcategoría; edítala en vez de crear una nueva',
      );
    }

    return this.assignmentRuleRepository.create({ subcategoryId, agentId });
  }

  findAll(): Promise<AssignmentRuleEntity[]> {
    return this.assignmentRuleRepository.findAll();
  }

  async findById(id: string): Promise<AssignmentRuleEntity> {
    const rule = await this.assignmentRuleRepository.findById(id);
    if (!rule) {
      throw new NotFoundException('Regla de asignación no encontrada');
    }
    return rule;
  }

  async update(id: string, agentId: string): Promise<AssignmentRuleEntity> {
    await this.findById(id);
    await this.assertIsAgent(agentId);
    return this.assignmentRuleRepository.update(id, { agentId });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.assignmentRuleRepository.delete(id);
  }

  private async assertIsAgent(agentId: string): Promise<void> {
    const user = await this.userRepository.findById(agentId);
    if (!user || user.role !== Role.AGENT) {
      throw new BadRequestException(
        'El usuario indicado debe tener rol Agente',
      );
    }
  }
}

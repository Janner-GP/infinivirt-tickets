import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';
import { AssignmentRulesService } from './application/assignment-rules.service';
import { AssignmentRuleRepository } from './domain/repositories/assignment-rule.repository';
import { PrismaAssignmentRuleRepository } from './infrastructure/persistence/prisma-assignment-rule.repository';
import { AssignmentRulesController } from './presentation/assignment-rules.controller';

@Module({
  imports: [UsersModule, CategoriesModule],
  controllers: [AssignmentRulesController],
  providers: [
    AssignmentRulesService,
    {
      provide: AssignmentRuleRepository,
      useClass: PrismaAssignmentRuleRepository,
    },
  ],
  exports: [AssignmentRuleRepository],
})
export class AssignmentRulesModule {}

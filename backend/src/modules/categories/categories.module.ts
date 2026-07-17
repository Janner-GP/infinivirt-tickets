import { Module } from '@nestjs/common';
import { CategoriesService } from './application/categories.service';
import { CategoryRepository } from './domain/repositories/category.repository';
import { PrismaCategoryRepository } from './infrastructure/persistence/prisma-category.repository';
import { CategoriesController } from './presentation/categories.controller';

@Module({
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    { provide: CategoryRepository, useClass: PrismaCategoryRepository },
  ],
  exports: [CategoriesService, CategoryRepository],
})
export class CategoriesModule {}

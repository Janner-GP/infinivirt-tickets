import { Injectable } from '@nestjs/common';
import { Subcategory as PrismaSubcategory } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { SubcategoryEntity } from '../../domain/entities/subcategory.entity';
import {
  CategoryRepository,
  CreateCategoryData,
  CreateSubcategoryData,
  UpdateCategoryData,
  UpdateSubcategoryData,
} from '../../domain/repositories/category.repository';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWithSubcategories(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      include: { subcategories: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });
    return categories.map((category) =>
      CategoryEntity.create({
        ...category,
        subcategories: category.subcategories.map((sub) =>
          this.toSubcategoryDomain(sub),
        ),
      }),
    );
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    return category ? CategoryEntity.create(category) : null;
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({ where: { name } });
    return category ? CategoryEntity.create(category) : null;
  }

  async create(data: CreateCategoryData): Promise<CategoryEntity> {
    const category = await this.prisma.category.create({ data });
    return CategoryEntity.create(category);
  }

  async update(id: string, data: UpdateCategoryData): Promise<CategoryEntity> {
    const category = await this.prisma.category.update({ where: { id }, data });
    return CategoryEntity.create(category);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  countSubcategories(categoryId: string): Promise<number> {
    return this.prisma.subcategory.count({ where: { categoryId } });
  }

  async findSubcategoryById(id: string): Promise<SubcategoryEntity | null> {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
    });
    return subcategory ? this.toSubcategoryDomain(subcategory) : null;
  }

  async findSubcategoryByName(
    categoryId: string,
    name: string,
  ): Promise<SubcategoryEntity | null> {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { categoryId_name: { categoryId, name } },
    });
    return subcategory ? this.toSubcategoryDomain(subcategory) : null;
  }

  async createSubcategory(
    data: CreateSubcategoryData,
  ): Promise<SubcategoryEntity> {
    const subcategory = await this.prisma.subcategory.create({ data });
    return this.toSubcategoryDomain(subcategory);
  }

  async updateSubcategory(
    id: string,
    data: UpdateSubcategoryData,
  ): Promise<SubcategoryEntity> {
    const subcategory = await this.prisma.subcategory.update({
      where: { id },
      data,
    });
    return this.toSubcategoryDomain(subcategory);
  }

  async deleteSubcategory(id: string): Promise<void> {
    await this.prisma.subcategory.delete({ where: { id } });
  }

  countTicketsForSubcategory(subcategoryId: string): Promise<number> {
    return this.prisma.ticket.count({ where: { subcategoryId } });
  }

  private toSubcategoryDomain(
    subcategory: PrismaSubcategory,
  ): SubcategoryEntity {
    return SubcategoryEntity.create(subcategory);
  }
}

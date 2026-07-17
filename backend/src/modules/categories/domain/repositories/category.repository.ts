import { CategoryEntity } from '../entities/category.entity';
import { SubcategoryEntity } from '../entities/subcategory.entity';

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  name?: string;
}

export interface CreateSubcategoryData {
  categoryId: string;
  name: string;
}

export interface UpdateSubcategoryData {
  name?: string;
}

/**
 * Puerto del dominio Categories. La implementación concreta (Prisma) vive en
 * infrastructure/persistence — ver docs/arquitectura-carpetas.md
 */
export abstract class CategoryRepository {
  abstract findAllWithSubcategories(): Promise<CategoryEntity[]>;
  abstract findById(id: string): Promise<CategoryEntity | null>;
  abstract findByName(name: string): Promise<CategoryEntity | null>;
  abstract create(data: CreateCategoryData): Promise<CategoryEntity>;
  abstract update(
    id: string,
    data: UpdateCategoryData,
  ): Promise<CategoryEntity>;
  abstract delete(id: string): Promise<void>;
  abstract countSubcategories(categoryId: string): Promise<number>;

  abstract findSubcategoryById(id: string): Promise<SubcategoryEntity | null>;
  abstract findSubcategoryByName(
    categoryId: string,
    name: string,
  ): Promise<SubcategoryEntity | null>;
  abstract createSubcategory(
    data: CreateSubcategoryData,
  ): Promise<SubcategoryEntity>;
  abstract updateSubcategory(
    id: string,
    data: UpdateSubcategoryData,
  ): Promise<SubcategoryEntity>;
  abstract deleteSubcategory(id: string): Promise<void>;
  abstract countTicketsForSubcategory(subcategoryId: string): Promise<number>;
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryEntity } from '../domain/entities/category.entity';
import { SubcategoryEntity } from '../domain/entities/subcategory.entity';
import { CategoryRepository } from '../domain/repositories/category.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(name: string): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findByName(name);
    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }
    return this.categoryRepository.create({ name });
  }

  findAll(): Promise<CategoryEntity[]> {
    return this.categoryRepository.findAllWithSubcategories();
  }

  async findById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async update(id: string, name: string): Promise<CategoryEntity> {
    await this.findById(id);

    const existing = await this.categoryRepository.findByName(name);
    if (existing && existing.id !== id) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    return this.categoryRepository.update(id, { name });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    const count = await this.categoryRepository.countSubcategories(id);
    if (count > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría porque tiene ${count} subcategoría(s) asociada(s)`,
      );
    }

    await this.categoryRepository.delete(id);
  }

  async createSubcategory(
    categoryId: string,
    name: string,
  ): Promise<SubcategoryEntity> {
    await this.findById(categoryId);

    const existing = await this.categoryRepository.findSubcategoryByName(
      categoryId,
      name,
    );
    if (existing) {
      throw new ConflictException(
        'Ya existe una subcategoría con ese nombre en esta categoría',
      );
    }

    return this.categoryRepository.createSubcategory({ categoryId, name });
  }

  async findSubcategoryById(id: string): Promise<SubcategoryEntity> {
    const subcategory = await this.categoryRepository.findSubcategoryById(id);
    if (!subcategory) {
      throw new NotFoundException('Subcategoría no encontrada');
    }
    return subcategory;
  }

  async updateSubcategory(
    id: string,
    name: string,
  ): Promise<SubcategoryEntity> {
    const subcategory = await this.findSubcategoryById(id);

    const existing = await this.categoryRepository.findSubcategoryByName(
      subcategory.categoryId,
      name,
    );
    if (existing && existing.id !== id) {
      throw new ConflictException(
        'Ya existe una subcategoría con ese nombre en esta categoría',
      );
    }

    return this.categoryRepository.updateSubcategory(id, { name });
  }

  async deleteSubcategory(id: string): Promise<void> {
    await this.findSubcategoryById(id);

    const ticketCount =
      await this.categoryRepository.countTicketsForSubcategory(id);
    if (ticketCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la subcategoría porque tiene ${ticketCount} ticket(s) asociado(s)`,
      );
    }

    await this.categoryRepository.deleteSubcategory(id);
  }
}

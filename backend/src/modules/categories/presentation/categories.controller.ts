import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { CategoriesService } from '../application/categories.service';
import {
  CategoryResponseDto,
  SubcategoryResponseDto,
} from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@ApiTags('categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('categories')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear una categoría (solo Administrador)' })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(dto.name);
    return new CategoryResponseDto(category);
  }

  @Get('categories')
  @Roles(Role.ADMIN, Role.AGENT, Role.SUPERVISOR, Role.CLIENT)
  @ApiOperation({ summary: 'Listar categorías con sus subcategorías' })
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesService.findAll();
    return categories.map(
      (category) =>
        new CategoryResponseDto({
          ...category,
          subcategories: category.subcategories?.map(
            (sub) => new SubcategoryResponseDto(sub),
          ),
        }),
    );
  }

  @Patch('categories/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Editar una categoría (solo Administrador)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.update(id, dto.name);
    return new CategoryResponseDto(category);
  }

  @Delete('categories/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una categoría (solo Administrador)' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.categoriesService.delete(id);
    return { message: 'Categoría eliminada correctamente' };
  }

  @Post('categories/:categoryId/subcategories')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary:
      'Crear una subcategoría dentro de una categoría (solo Administrador)',
  })
  async createSubcategory(
    @Param('categoryId') categoryId: string,
    @Body() dto: CreateSubcategoryDto,
  ): Promise<SubcategoryResponseDto> {
    const subcategory = await this.categoriesService.createSubcategory(
      categoryId,
      dto.name,
    );
    return new SubcategoryResponseDto(subcategory);
  }

  @Patch('subcategories/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Editar una subcategoría (solo Administrador)' })
  async updateSubcategory(
    @Param('id') id: string,
    @Body() dto: UpdateSubcategoryDto,
  ): Promise<SubcategoryResponseDto> {
    const subcategory = await this.categoriesService.updateSubcategory(
      id,
      dto.name,
    );
    return new SubcategoryResponseDto(subcategory);
  }

  @Delete('subcategories/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una subcategoría (solo Administrador)' })
  async removeSubcategory(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.categoriesService.deleteSubcategory(id);
    return { message: 'Subcategoría eliminada correctamente' };
  }
}

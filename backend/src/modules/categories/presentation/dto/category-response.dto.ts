import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SubcategoryResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  categoryId: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<SubcategoryResponseDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class CategoryResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty({ type: [SubcategoryResponseDto], required: false })
  subcategories?: SubcategoryResponseDto[];

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }
}

import { SubcategoryEntity } from './subcategory.entity';

export class CategoryEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly subcategories?: SubcategoryEntity[],
  ) {}

  static create(props: {
    id: string;
    name: string;
    createdAt: Date;
    subcategories?: SubcategoryEntity[];
  }): CategoryEntity {
    return new CategoryEntity(
      props.id,
      props.name,
      props.createdAt,
      props.subcategories,
    );
  }
}

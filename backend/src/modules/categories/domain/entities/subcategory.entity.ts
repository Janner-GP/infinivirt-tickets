export class SubcategoryEntity {
  constructor(
    public readonly id: string,
    public readonly categoryId: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: string;
    categoryId: string;
    name: string;
    createdAt: Date;
  }): SubcategoryEntity {
    return new SubcategoryEntity(
      props.id,
      props.categoryId,
      props.name,
      props.createdAt,
    );
  }
}

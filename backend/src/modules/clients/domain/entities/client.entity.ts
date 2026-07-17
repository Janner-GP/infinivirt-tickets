export class ClientEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly company: string | null,
    public readonly phone: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
    createdAt: Date;
  }): ClientEntity {
    return new ClientEntity(
      props.id,
      props.name,
      props.email,
      props.company,
      props.phone,
      props.createdAt,
    );
  }
}

import { Role } from '@prisma/client';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: Role,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly clientId: string | null = null,
  ) {}

  static create(props: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    clientId?: string | null;
  }): UserEntity {
    return new UserEntity(
      props.id,
      props.name,
      props.email,
      props.passwordHash,
      props.role,
      props.isActive,
      props.createdAt,
      props.updatedAt,
      props.clientId ?? null,
    );
  }
}

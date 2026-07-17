import { Role } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  clientId?: string | null;
}

/**
 * Puerto del dominio Users. La implementación concreta (Prisma) vive en
 * infrastructure/persistence — ver docs/ADRs/008-backend-architecture-ddd-lite.md
 */
export abstract class UserRepository {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract create(data: CreateUserData): Promise<UserEntity>;
  abstract updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  abstract findAll(): Promise<UserEntity[]>;
  abstract findByClientId(clientId: string): Promise<UserEntity | null>;
}

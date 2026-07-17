import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  CreateUserData,
  UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.user.create({ data });
    return this.toDomain(user);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.toDomain(user));
  }

  async findByClientId(clientId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { clientId } });
    return user ? this.toDomain(user) : null;
  }

  private toDomain(user: PrismaUser): UserEntity {
    return UserEntity.create(user);
  }
}

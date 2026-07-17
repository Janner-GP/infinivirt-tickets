import { Injectable } from '@nestjs/common';
import { RefreshToken as PrismaRefreshToken } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import {
  CreateRefreshTokenData,
  RefreshTokenRepository,
} from '../../domain/repositories/refresh-token.repository';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRefreshTokenData): Promise<RefreshTokenEntity> {
    const record = await this.prisma.refreshToken.create({ data });
    return this.toDomain(record);
  }

  async findValidByUserAndHash(
    userId: string,
    tokenHash: string,
  ): Promise<RefreshTokenEntity | null> {
    const record = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  private toDomain(record: PrismaRefreshToken): RefreshTokenEntity {
    return new RefreshTokenEntity(
      record.id,
      record.userId,
      record.tokenHash,
      record.expiresAt,
      record.revokedAt,
      record.createdAt,
    );
  }
}

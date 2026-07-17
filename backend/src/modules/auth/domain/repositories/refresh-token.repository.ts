import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

/**
 * Puerto del dominio Auth para la persistencia de refresh tokens.
 * Ver docs/logica-negocio-trade-offs.md
 */
export abstract class RefreshTokenRepository {
  abstract create(data: CreateRefreshTokenData): Promise<RefreshTokenEntity>;
  abstract findValidByUserAndHash(
    userId: string,
    tokenHash: string,
  ): Promise<RefreshTokenEntity | null>;
  abstract revoke(id: string): Promise<void>;
}

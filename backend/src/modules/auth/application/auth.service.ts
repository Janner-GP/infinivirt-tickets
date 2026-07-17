import * as crypto from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { UsersService } from '../../users/application/users.service';
import { AuthenticatedUser } from '../domain/authenticated-user';
import { RefreshTokenRepository } from '../domain/repositories/refresh-token.repository';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginUserView {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface RefreshTokenPayload {
  sub: string;
  email: string;
  role: Role;
  clientId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ user: LoginUserView; tokens: TokenPair }> {
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId ?? undefined,
    };
    const tokens = await this.issueTokenPair(authenticatedUser);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const tokenHash = this.hashToken(refreshToken);

    const stored = await this.refreshTokenRepository.findValidByUserAndHash(
      payload.sub,
      tokenHash,
    );
    if (!stored) {
      throw new UnauthorizedException(
        'El refresh token es inválido, expiró o ya fue utilizado',
      );
    }

    // Rotación: el token usado se revoca y se emite un par nuevo.
    await this.refreshTokenRepository.revoke(stored.id);

    const authenticatedUser: AuthenticatedUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      clientId: payload.clientId,
    };
    return this.issueTokenPair(authenticatedUser);
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await this.verifyRefreshToken(refreshToken).catch(
      () => null,
    );
    if (!payload) {
      return;
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.refreshTokenRepository.findValidByUserAndHash(
      payload.sub,
      tokenHash,
    );
    if (stored) {
      await this.refreshTokenRepository.revoke(stored.id);
    }
  }

  private async issueTokenPair(user: AuthenticatedUser): Promise<TokenPair> {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    } as JwtSignOptions);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    } as JwtSignOptions);

    const decoded = this.jwtService.decode(refreshToken);
    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(decoded.exp * 1000),
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('El refresh token es inválido o expiró');
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

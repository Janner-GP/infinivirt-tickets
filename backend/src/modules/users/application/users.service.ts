import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ClientRepository } from '../../clients/domain/repositories/client.repository';
import { UserEntity } from '../domain/entities/user.entity';
import { UserRepository } from '../domain/repositories/user.repository';
import { PasswordHasher } from '../domain/services/password-hasher';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  clientId?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly clientRepository: ClientRepository,
  ) {}

  async createUser(input: CreateUserInput): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException(
        'Ya existe un usuario con ese correo electrónico',
      );
    }

    if (input.role === Role.CLIENT) {
      if (!input.clientId) {
        throw new BadRequestException(
          'Debes indicar a qué cliente se vincula esta cuenta',
        );
      }

      const client = await this.clientRepository.findById(input.clientId);
      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }

      const existingAccount = await this.userRepository.findByClientId(
        input.clientId,
      );
      if (existingAccount) {
        throw new ConflictException(
          'Este cliente ya tiene una cuenta de acceso vinculada',
        );
      }
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    return this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      clientId: input.role === Role.CLIENT ? input.clientId : null,
    });
  }

  findAll(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }

  /**
   * Usado por el módulo Auth para validar credenciales de login.
   * Vive aquí (no en Auth) porque el hashing de contraseñas es responsabilidad del dominio Users.
   */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    const matches = await this.passwordHasher.compare(
      password,
      user.passwordHash,
    );
    return matches ? user : null;
  }

  async changeOwnPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const matches = await this.passwordHasher.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!matches) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    const newHash = await this.passwordHasher.hash(newPassword);
    await this.userRepository.updatePasswordHash(userId, newHash);
  }
}

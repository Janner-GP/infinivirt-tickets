import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { UsersService } from './application/users.service';
import { UserRepository } from './domain/repositories/user.repository';
import { PasswordHasher } from './domain/services/password-hasher';
import { BcryptPasswordHasher } from './infrastructure/hashing/bcrypt-password-hasher';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { UsersController } from './presentation/users.controller';

@Module({
  imports: [ClientsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}

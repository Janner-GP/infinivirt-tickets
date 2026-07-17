import { Module } from '@nestjs/common';
import { ClientsService } from './application/clients.service';
import { ClientRepository } from './domain/repositories/client.repository';
import { PrismaClientRepository } from './infrastructure/persistence/prisma-client.repository';
import { ClientsController } from './presentation/clients.controller';

@Module({
  controllers: [ClientsController],
  providers: [
    ClientsService,
    { provide: ClientRepository, useClass: PrismaClientRepository },
  ],
  exports: [ClientsService, ClientRepository],
})
export class ClientsModule {}

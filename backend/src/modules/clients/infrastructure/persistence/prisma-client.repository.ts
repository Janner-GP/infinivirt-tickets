import { Injectable } from '@nestjs/common';
import { Client as PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ClientEntity } from '../../domain/entities/client.entity';
import {
  ClientRepository,
  CreateClientData,
  UpdateClientData,
} from '../../domain/repositories/client.repository';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findUnique({ where: { id } });
    return client ? this.toDomain(client) : null;
  }

  async findByEmail(email: string): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findUnique({ where: { email } });
    return client ? this.toDomain(client) : null;
  }

  async findAll(): Promise<ClientEntity[]> {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return clients.map((client) => this.toDomain(client));
  }

  async create(data: CreateClientData): Promise<ClientEntity> {
    const client = await this.prisma.client.create({ data });
    return this.toDomain(client);
  }

  async update(id: string, data: UpdateClientData): Promise<ClientEntity> {
    const client = await this.prisma.client.update({ where: { id }, data });
    return this.toDomain(client);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({ where: { id } });
  }

  countTickets(id: string): Promise<number> {
    return this.prisma.ticket.count({ where: { clientId: id } });
  }

  private toDomain(client: PrismaClient): ClientEntity {
    return ClientEntity.create(client);
  }
}

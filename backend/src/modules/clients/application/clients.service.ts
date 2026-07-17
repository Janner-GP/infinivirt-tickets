import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientEntity } from '../domain/entities/client.entity';
import {
  ClientRepository,
  CreateClientData,
  UpdateClientData,
} from '../domain/repositories/client.repository';

@Injectable()
export class ClientsService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async create(data: CreateClientData): Promise<ClientEntity> {
    const existing = await this.clientRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException(
        'Ya existe un cliente con ese correo electrónico',
      );
    }
    return this.clientRepository.create(data);
  }

  findAll(): Promise<ClientEntity[]> {
    return this.clientRepository.findAll();
  }

  async findById(id: string): Promise<ClientEntity> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return client;
  }

  async update(id: string, data: UpdateClientData): Promise<ClientEntity> {
    await this.findById(id);

    if (data.email) {
      const existing = await this.clientRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Ya existe un cliente con ese correo electrónico',
        );
      }
    }

    return this.clientRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    const ticketCount = await this.clientRepository.countTickets(id);
    if (ticketCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el cliente porque tiene ${ticketCount} ticket(s) asociado(s)`,
      );
    }

    await this.clientRepository.delete(id);
  }
}

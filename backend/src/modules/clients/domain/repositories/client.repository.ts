import { ClientEntity } from '../entities/client.entity';

export interface CreateClientData {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  company?: string | null;
  phone?: string | null;
}

/**
 * Puerto del dominio Clients. La implementación concreta (Prisma) vive en
 * infrastructure/persistence — ver docs/arquitectura-carpetas.md
 */
export abstract class ClientRepository {
  abstract findById(id: string): Promise<ClientEntity | null>;
  abstract findByEmail(email: string): Promise<ClientEntity | null>;
  abstract findAll(): Promise<ClientEntity[]>;
  abstract create(data: CreateClientData): Promise<ClientEntity>;
  abstract update(id: string, data: UpdateClientData): Promise<ClientEntity>;
  abstract delete(id: string): Promise<void>;
  abstract countTickets(id: string): Promise<number>;
}

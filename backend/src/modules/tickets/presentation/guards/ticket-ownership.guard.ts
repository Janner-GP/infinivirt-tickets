import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../../../auth/domain/authenticated-user';
import { TicketRepository } from '../../domain/repositories/ticket.repository';

/**
 * Autorización a nivel de fila: un Agente solo puede operar sobre tickets que
 * tiene asignados; un Cliente solo sobre tickets de su propia cuenta.
 * Complementa a RolesGuard — ver docs/ADRs/003-authentication.md
 */
@Injectable()
export class TicketOwnershipGuard implements CanActivate {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (user.role !== Role.AGENT && user.role !== Role.CLIENT) {
      return true;
    }

    const ticket = await this.ticketRepository.findById(request.params.id);
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (user.role === Role.AGENT && !ticket.isAssignedTo(user.id)) {
      throw new ForbiddenException(
        'Solo puedes operar sobre tickets asignados a ti',
      );
    }

    if (
      user.role === Role.CLIENT &&
      (!user.clientId || !ticket.belongsToClient(user.clientId))
    ) {
      throw new ForbiddenException(
        'Solo puedes operar sobre tus propios tickets',
      );
    }

    return true;
  }
}

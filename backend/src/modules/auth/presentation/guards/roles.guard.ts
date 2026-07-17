import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../../domain/authenticated-user';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Autorización por rol. Complementa (no reemplaza) los guards de ownership
 * que se agregarán en el módulo de tickets — ver docs/logica-negocio-trade-offs.md
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    return !!user && requiredRoles.includes(user.role);
  }
}

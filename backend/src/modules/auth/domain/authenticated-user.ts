import { Role } from '@prisma/client';

/**
 * Forma mínima del usuario que viaja en el payload del access token y en
 * request.user tras pasar por JwtAuthGuard. No es la entidad completa de Users.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  /** Solo presente cuando role = CLIENT: vincula con su registro de negocio Client. */
  clientId?: string;
}

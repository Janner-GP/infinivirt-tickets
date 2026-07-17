/**
 * Puerto para el hashing de contraseñas. La implementación concreta (bcrypt)
 * vive en infrastructure/hashing — mantiene el dominio libre de detalles de librería.
 */
export abstract class PasswordHasher {
  abstract hash(plain: string): Promise<string>;
  abstract compare(plain: string, hash: string): Promise<boolean>;
}

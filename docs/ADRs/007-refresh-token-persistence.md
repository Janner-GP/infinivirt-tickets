# ADR 007: Persistencia de refresh tokens (supersede parcialmente ADR 003)

## Estado
Aceptado — reemplaza la sección de "Consecuencias" del [ADR 003](003-authentication.md) sobre logout/revocación.

## Contexto
El ADR 003 había optado por JWT 100% stateless, aceptando como limitación que un logout no invalida el access token del lado servidor y que no hay forma de revocar una sesión antes de que expire. Al construir el módulo de Auth real, se decidió que sí vale la pena poder revocar sesiones (logout real, invalidar tokens robados).

## Decisión
Se agrega una tabla `RefreshToken` (`aut_refresh_tokens`) para persistir los refresh tokens emitidos:

```
model RefreshToken {
  id         String    @id @default(uuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id])
  tokenHash  String     // hash del refresh token, nunca el valor plano
  expiresAt  DateTime
  revokedAt  DateTime?
  createdAt  DateTime  @default(now())

  @@index([userId])
  @@map("aut_refresh_tokens")
}
```

- El **access token** sigue siendo 100% stateless (JWT corto, ~15 min, sin persistencia) — el ADR 003 no cambia en ese punto.
- El **refresh token** sí se persiste, pero solo su **hash** (igual que una contraseña) — nunca el valor en texto plano, para que un volcado de la base de datos no permita reutilizar sesiones directamente.
- **Rotación en cada uso**: al llamar `POST /auth/refresh`, el refresh token usado se marca `revokedAt = now()` y se emite un refresh token nuevo. Si alguien reutiliza un refresh token ya rotado, se rechaza — señal de posible robo de token.
- **Logout real**: `POST /auth/logout` marca el refresh token recibido como revocado. El access token vigente sigue siendo válido hasta su expiración natural (15 min) — se documenta como limitación aceptada, igual que en el ADR 003 original.

## Razones
- Permite un logout que realmente invalida la sesión del lado servidor, y revocar acceso si un refresh token se filtra — algo que el ADR 003 había descartado por simplicidad, pero que el candidato decidió sí vale la pena para esta versión.
- Hashear el refresh token (no guardarlo en claro) sigue el mismo principio que ya se aplica a las contraseñas de usuario.
- La rotación con detección de reuso es el patrón estándar recomendado por la especificación OAuth 2.0 para refresh tokens de un solo uso.

## Consecuencias
- Se agrega una tabla más al modelo de datos (`aut_refresh_tokens`), con su propio prefijo de módulo de 3 letras (`aut`) siguiendo el ADR 004, ya que pertenece al dominio de Auth y no al de Users.
- Se requiere una tarea de limpieza (cron o query manual) para purgar refresh tokens expirados/revocados a futuro — se documenta como trabajo pendiente, no se implementa en esta versión.
- El access token sigue sin poder revocarse antes de expirar — si se necesitara revocación inmediata de access tokens, el siguiente paso sería una blacklist en caché (Redis), fuera de alcance de esta prueba.

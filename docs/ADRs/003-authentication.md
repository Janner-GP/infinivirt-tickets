# ADR 003: Autenticación y autorización

## Estado
Aceptado — la sección "Consecuencias" sobre revocación fue actualizada por el [ADR 007](007-refresh-token-persistence.md) (se agregó persistencia de refresh tokens).

## Contexto
La prueba exige autenticación de usuarios y tres roles con permisos distintos (Administrador, Agente de soporte, Supervisor), incluyendo una regla de autorización a nivel de fila: un Agente solo puede actualizar los tickets que tiene asignados.

## Decisión
- Autenticación: **JWT stateless**, con access token de corta duración y refresh token de mayor duración.
- Autorización por rol: **Guard de roles** de NestJS (`RolesGuard` + decorador `@Roles(...)`) sobre los endpoints.
- Autorización por fila (ownership): **Guard adicional** (`TicketOwnershipGuard`) que compara el usuario autenticado contra el `assignedToId` del ticket antes de permitir modificaciones, para los casos en que el rol por sí solo no basta (ej. Agente actualizando solo sus propios tickets).

## Razones
- JWT es stateless: no requiere almacenar sesión en el servidor ni una dependencia adicional (Redis), lo que simplifica el despliegue y escala horizontalmente sin sesión compartida.
- Es el mecanismo esperado por defecto al separar un frontend SPA de una API REST, y es el más natural de defender en una entrevista de Tech Lead.
- Separar "rol" (autenticación + autorización de alto nivel) de "ownership" (autorización a nivel de fila) evita el error común de asumir que un usuario autenticado con el rol correcto puede operar sobre cualquier recurso — el enunciado pide explícitamente esta distinción para el rol Agente.

## Alternativas consideradas
- **Sesiones + Redis**: permiten revocar acceso al instante, pero añaden infraestructura (Redis) y estado compartido que complican el CI/CD y el despliegue para el alcance de esta prueba.

## Consecuencias
- El logout no invalida el access token del lado servidor (es stateless) hasta que expira; solo se invalida el refresh token. Esto se documenta como una limitación conocida y aceptable para esta versión — una blacklist de tokens (ej. en Redis) sería el siguiente paso si se requiere revocación inmediata.

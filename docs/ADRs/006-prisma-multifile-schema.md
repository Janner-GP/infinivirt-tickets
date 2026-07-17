# ADR 006: Schema de Prisma dividido por modelo

## Estado
Aceptado

## Contexto
El schema de Prisma empezó como un único archivo `prisma/schema.prisma`. A medida que el proyecto crece (nuevos módulos, integraciones, reportes, como anticipa el enunciado), un archivo único se vuelve difícil de navegar y de revisar en PRs (diffs grandes y ruidosos).

## Decisión
El schema se organiza en **múltiples archivos `.prisma`, uno por modelo**, dentro de `backend/prisma/schema/`:

```
prisma/schema/
├── schema.prisma                    # solo generator + datasource
├── enums.prisma                     # Role, TicketStatus, TicketPriority
├── User.prisma
├── Client.prisma
├── Ticket.prisma
├── TicketComment.prisma
├── TicketAssignmentHistory.prisma
└── TicketStatusHistory.prisma
```

Prisma soporta esto de forma nativa (sin *preview feature* en esta versión): basta con apuntar `schema` en `prisma.config.ts` a la carpeta en vez de a un archivo, y Prisma combina todos los `.prisma` de esa carpeta en un solo schema lógico al validar/generar/migrar.

## Razones
- Cada archivo corresponde a una entidad y es fácil de encontrar por nombre (`Ticket.prisma`, `User.prisma`), igual que ya se hace con los DTOs y entidades en el código NestJS.
- Los diffs de Pull Request quedan acotados al modelo que realmente cambió, en vez de tocar un archivo monolítico compartido por todos.
- No cambia nada del comportamiento en tiempo de ejecución ni de las migraciones — es puramente organizativo. Las tablas generadas (`usr_users`, `tkt_tickets`, etc., ver ADR 004) son idénticas antes y después de la división.

## Consecuencias
- `prisma.config.ts` apunta a `prisma/schema` (carpeta) en vez de `prisma/schema.prisma` (archivo).
- Al agregar un modelo nuevo, se crea su propio archivo `NombreModelo.prisma` en esa carpeta — no se edita un archivo compartido.

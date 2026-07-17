# ADR 004: Convenciones de nombres

## Estado
Aceptado

## Contexto
El proyecto usa TypeScript de punta a punta (backend y frontend) y PostgreSQL como base de datos. Se necesita una convención de nombres única y consistente para minimizar fricción entre capas y facilitar el crecimiento futuro (nuevos módulos, nuevos desarrolladores).

## Decisión
**camelCase en todas las capas**: modelos y campos en el `schema.prisma`, cliente de Prisma, código TypeScript (backend y frontend), y el JSON que viaja por la API REST (request y response) — todo en camelCase, sin capa de transformación entre capas.

En PostgreSQL, los **nombres de tabla** (no los de columna) siguen una convención propia:
- **Singular en el modelo de Prisma**, **plural y snake_case en la tabla real**.
- Prefijo de **3 letras del módulo de dominio al que pertenece**, en todas las tablas de ese módulo sin excepción.

| Módulo | Prefijo | Modelo Prisma (singular) | Tabla en Postgres |
|---|---|---|---|
| Users | `usr` | `User` | `usr_users` |
| Clients | `cli` | `Client` | `cli_clients` |
| Tickets | `tkt` | `Ticket` | `tkt_tickets` |
| Tickets | `tkt` | `TicketComment` | `tkt_comments` |
| Tickets | `tkt` | `TicketAssignmentHistory` | `tkt_assignment_history` |
| Tickets | `tkt` | `TicketStatusHistory` | `tkt_status_history` |

Las columnas dentro de cada tabla permanecen en camelCase tal cual el campo del modelo Prisma (sin `@map` por campo, solo `@@map` a nivel de tabla) — Prisma genera SQL con identificadores entrecomillados, por lo que el camelCase se preserva sin pérdida en Postgres.

## Razones
- **Una sola convención de código (camelCase)** elimina la necesidad de un interceptor/pipe de transformación snake_case ↔ camelCase entre la API y el código TypeScript — menos superficie de código, menos que explicar en la sustentación.
- **Prefijo de módulo en las tablas** deja explícito, con solo mirar el nombre de la tabla en cualquier herramienta de administración de base de datos (pgAdmin, DBeaver, etc.), a qué dominio/módulo de la aplicación pertenece — útil desde ya con pocas tablas, y crítico cuando el sistema crezca a más áreas/módulos como anticipa el enunciado (integraciones, reportes, múltiples equipos).
- **Singular en Prisma / plural en la tabla real** sigue la convención más extendida en ORMs (el modelo representa una entidad individual; la tabla contiene una colección de filas).

## Alternativas consideradas
- **snake_case en DB y en el JSON de la API, camelCase solo en el código**: se consideró y se descartó en favor de una única convención, para reducir la complejidad de una capa de transformación (interceptor de salida + pipe de entrada) que no aporta valor suficiente para el alcance de esta prueba.

## Consecuencias
- Cualquier consulta SQL manual (incluyendo `queries.sql`) debe usar los nombres de tabla reales (`usr_users`, `tkt_tickets`, etc.) y las columnas en camelCase entre comillas dobles, ej.: `SELECT "assignedToId" FROM "tkt_tickets"`.

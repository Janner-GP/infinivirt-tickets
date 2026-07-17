# Arquitectura a nivel de carpetas

## Estructura general del repositorio

```
infinivirt_test/
├── backend/          # API REST — NestJS + Prisma + PostgreSQL
├── frontend/         # SPA — React + Vite + Tailwind
├── docs/             # Este documento + los otros 3 + el PDF del enunciado
├── queries.sql        # Las 8 consultas SQL pedidas por el enunciado
└── docker-compose.yml # Postgres local para desarrollo
```

Es un monorepo simple (npm plano, sin workspaces): `backend/` y `frontend/` son dos proyectos Node independientes que solo comparten el repositorio Git y, eventualmente, el pipeline de CI. Se descartó un monorepo con workspaces (npm/pnpm workspaces, Nx, Turborepo) porque backend y frontend no comparten código entre sí (ni tipos, ni utilidades) — el overhead de tooling de un monorepo "real" no se justifica para dos proyectos que solo comparten el repositorio como contenedor. El precio de esa decisión es que los tipos de la API (`Ticket`, `Client`, `Category`...) están duplicados a mano en `frontend/src/types/`, en vez de compartir un paquete `@infinivirt/types`; se documenta como deuda aceptada, no como descuido — ver `mejoras.md`.

## Backend: un módulo, cuatro carpetas (DDD-lite)

Cada dominio de negocio (`auth`, `users`, `clients`, `categories`, `assignment-rules`, `tickets`) vive en `backend/src/modules/<dominio>/` y sigue siempre la misma convención de 4 carpetas:

```
backend/src/modules/tickets/
├── domain/
│   ├── entities/              # Clases de dominio simples (TicketEntity) — no son el modelo de Prisma
│   ├── repositories/          # Interfaces (abstract class) — el "puerto"
│   └── constants/             # Reglas de negocio puras (p. ej. la máquina de estados)
├── application/
│   └── tickets.service.ts     # Casos de uso: orquesta repositorios + reglas de negocio
├── infrastructure/
│   └── persistence/
│       └── prisma-ticket.repository.ts   # Implementación concreta del repositorio con Prisma
├── presentation/
│   ├── tickets.controller.ts
│   ├── guards/                # Guards específicos del dominio (TicketOwnershipGuard)
│   └── dto/
└── tickets.module.ts
```

**Reglas del patrón, sin excepción en los 6 módulos:**
- El **controller** solo valida entrada (DTOs con `class-validator`) y delega al **service** — nunca importa Prisma directamente.
- El **service** solo conoce la **interfaz** del repositorio, inyectada por token de clase abstracta (`{ provide: TicketRepository, useClass: PrismaTicketRepository }`) — nunca importa `PrismaService`.
- El **repositorio de infraestructura** es el único lugar que toca Prisma, y traduce entre el modelo de Prisma y la entidad de dominio.
- Las **entidades de dominio** son clases planas (sin decoradores de Prisma/NestJS) que representan el concepto de negocio y pueden llevar métodos propios (`ticket.isAssignedTo(userId)`, `ticket.belongsToClient(clientId)`).

Es el punto intermedio elegido explícitamente entre "todo en el service con Prisma directo" (más rápido, pero acopla la lógica de negocio al ORM) y "hexagonal completo con casos de uso individuales" (más ceremonia de la que se justifica para 6 módulos). Aislar Prisma detrás de una interfaz permite, a futuro, testear los services con un repositorio en memoria (fake) sin tocar controllers ni lógica de negocio, o cambiar de ORM sin reescribir el dominio.

**Dependencias entre módulos** están explícitas vía `imports` del `@Module` de Nest — no hay imports "por la puerta trasera":
- `UsersModule` importa `ClientsModule` (necesita `ClientRepository` para validar el `clientId` al crear una cuenta `CLIENT`).
- `AssignmentRulesModule` importa `UsersModule` y `CategoriesModule` (valida que el agente exista y tenga rol `AGENT`, y que la subcategoría exista).
- `TicketsModule` importa `AssignmentRulesModule` (consulta la regla de auto-asignación al crear un ticket).

## Prisma: schema multi-archivo

`backend/prisma/schema/` tiene un archivo por modelo (`User.prisma`, `Client.prisma`, `Ticket.prisma`, `Category.prisma`, `Subcategory.prisma`, `AssignmentRule.prisma`, `TicketComment.prisma`, `TicketAssignmentHistory.prisma`, `TicketStatusHistory.prisma`, `RefreshToken.prisma`, `enums.prisma`) más un `schema.prisma` raíz que solo tiene el `generator` y el `datasource`. Se prefirió sobre un único archivo de 300+ líneas porque cada módulo del backend puede abrir "su" modelo sin hacer scroll por los demás, y los diffs de Git quedan acotados al modelo que realmente cambió.

## Convenciones de nombres

Una sola convención de punta a punta: **camelCase en Prisma, TypeScript y el JSON de la API** (sin capa de transformación snake_case ↔ camelCase). En PostgreSQL, los nombres de **tabla** son la única excepción — van en snake_case plural con prefijo de 3 letras por módulo (`usr_users`, `cli_clients`, `cat_categories`, `cat_subcategories`, `tkt_tickets`, `tkt_comments`, `tkt_assignment_history`, `tkt_status_history`, `tkt_assignment_rules`), vía `@@map` a nivel de modelo. Las columnas nunca se mapean individualmente, por eso `queries.sql` usa identificadores entre comillas dobles (`"assignedToId"`, `"createdAt"`) para conservar el camelCase en SQL crudo.

Justificación: una sola convención de código elimina la necesidad de un interceptor/pipe de transformación entre la API y TypeScript. El prefijo de tabla por módulo deja explícito, con solo mirar el nombre en pgAdmin/DBeaver, a qué dominio pertenece — cada vez más útil a medida que el sistema crece a más módulos (ya pasó de 2 a 6 en esta misma prueba).

## Frontend: por tipo de archivo, no por feature

```
frontend/src/
├── api/          # auth.ts, tickets.ts, clients.ts, categories.ts, users.ts — hooks de TanStack Query
├── auth/         # AuthContext (usuario autenticado, login/logout, localStorage)
├── components/   # Layout, StatusBadge, PriorityIndicator, MetricCard, Modal, Toast, RequireRole
├── pages/        # Una página por ruta (LoginPage, DashboardPage, TicketsListPage, ...)
├── routes/       # AppRouter, ProtectedRoute, RequireRole
└── types/        # Ticket, Client, Category, User — duplican a mano los DTOs del backend
```

Es una estructura "por tipo de archivo" (todas las páginas juntas, todos los hooks de API juntos), **no** por feature/dominio (`features/tickets/{components,hooks,api}`, `features/clients/...`). Para el tamaño actual (8 páginas, 5 recursos de API) evita la indirección de una carpeta por feature con 1-2 archivos adentro; el costo aparece cuando el frontend crezca lo suficiente para que "todas las páginas en una carpeta" deje de ser navegable — está documentado como el primer punto a revisar en `mejoras.md`.

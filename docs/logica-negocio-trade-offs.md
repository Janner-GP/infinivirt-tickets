# Lógica de negocio y trade-offs

Este documento consolida todas las decisiones de negocio y arquitectura tomadas durante la prueba, con el porqué de cada una y las alternativas que se descartaron. Es la fuente de verdad para sustentar cualquier "¿por qué lo hiciste así?".

## Roles y permisos

| Rol | Alcance |
|---|---|
| **Administrador** | Ve y edita todos los tickets. CRUD completo de clientes, categorías, subcategorías, reglas de asignación y usuarios (incluye crear cuentas de Agente, Supervisor y Cliente). Único rol que puede cerrar o reabrir un ticket. |
| **Agente de soporte** | Ve y edita únicamente los tickets que tiene asignados (`assignedToId`). Crea tickets (quedan auto-asignados a sí mismo). Cambia el estado de sus tickets, salvo cerrar/reabrir. Solo lectura sobre clientes. |
| **Supervisor** | Ve todos los tickets (lectura). Reasigna tickets entre agentes. Ve métricas y el listado de vencidos. Comenta, incluyendo notas internas. CRUD completo sobre clientes. No cambia el estado de un ticket directamente. |
| **Cliente** | Login propio. Ve y crea únicamente sus propios tickets (`clientId`). Comenta en ellos. Nunca ve comentarios marcados como nota interna. No accede a ninguna pantalla de administración. |

**Por qué un rol `CLIENT` que no pedía el enunciado**: el enunciado original describe una aplicación *interna* (solo Admin/Agente/Supervisor); el rol Cliente con portal propio fue una ampliación de alcance pedida explícitamente durante la prueba. Se evaluaron tres formas de resolverlo — portal con login propio, formulario público sin autenticación, o mantener que solo Agente/Admin registren tickets en nombre del cliente — y se eligió login propio porque era el requisito explícito, aceptando el costo de una superficie de autenticación adicional a cambio de que el cliente pueda hacer seguimiento real de sus solicitudes.

**Ownership como guard, no solo como filtro de UI**: `TicketOwnershipGuard` valida en el backend que un Agente solo opere sobre `assignedToId === user.id` y que un Cliente solo opere sobre `clientId === user.clientId`, en cada endpoint sensible (`GET/PATCH /tickets/:id`, `POST /tickets/:id/comments`). El frontend también oculta las acciones que un rol no puede ejecutar, pero esa ocultación es solo UX — la autorización real vive en el guard, porque un cliente HTTP directo (Postman, curl) nunca debe poder saltarse la regla ocultando o mostrando un botón.

## Autenticación

**JWT stateless** (access token corto + refresh token largo) en vez de sesiones con Redis. Con sesiones se gana revocación inmediata; con JWT se gana no depender de un almacén de sesión compartido, lo que simplifica el despliegue horizontal (cualquier tarea de ECS puede validar cualquier token sin estado compartido). El costo aceptado: el logout no invalida el access token del lado servidor hasta que expira (~15 min) — solo el refresh token se revoca. Se documenta como limitación conocida; una blacklist de tokens en Redis sería el siguiente paso si se necesita revocación inmediata.

**Refresh tokens persistidos y rotados**: cada refresh token se guarda hasheado (SHA-256) en `RefreshToken`, y se revoca al usarse (rotación) — el próximo uso del mismo token ya revocado falla, lo que permite detectar reuso de un token robado. Sin esto, un JWT de refresh robado sería válido indefinidamente hasta su expiración natural (7 días por defecto), sin forma de invalidarlo antes.

**Rol como enum nativo de Postgres** (`Role` en `User.role`) en vez de una tabla `roles` aparte con relación many-to-many. El enunciado no pide roles dinámicos ni permisos configurables por rol — son 4 roles fijos, conocidos en tiempo de diseño. Una tabla de roles habría agregado un join en cada consulta de autorización sin resolver ningún problema real de este alcance.

## Categorías, subcategorías y auto-asignación

**Jerarquía fija de 2 niveles** (`Category` → `Subcategory`), no una jerarquía arbitraria a N niveles. Es suficiente para parametrizar la auto-asignación y no hay ningún requisito de sub-sub-categorías; una jerarquía más profunda habría sido complejidad sin un caso de uso real detrás.

**Regla de auto-asignación fija (1 agente por subcategoría)**, no un pool de agentes con reparto por carga. Es determinista y fácil de explicar y de configurar desde la UI (`CategoriesPage`, un select por subcategoría). Un reparto por round-robin o por menor carga sería más realista operativamente, pero agrega lógica de negocio (¿qué pasa si el agente responsable está inactivo? ¿cómo se define "carga"?) que no se justificaba para el alcance de la prueba.

**La regla de auto-asignación "solo llena huecos"**: si el Agente crea su propio ticket, se auto-asigna a sí mismo y la regla configurada para esa subcategoría **no lo sobrescribe**. La regla solo entra a jugar cuando el creador no tiene un asignado natural — es decir, cuando lo crea un Cliente, o cuando lo crea un Administrador sin elegir un agente explícitamente. La alternativa (la regla siempre gana, incluso sobre la auto-asignación del Agente) se descartó porque violaría la expectativa obvia de que un Agente que registra un caso para sí mismo lo mantenga.

**Categoría y subcategoría obligatorias en todo ticket nuevo** — no opcionales. Garantiza que la auto-asignación y las métricas por categoría (incluidas las de `queries.sql`) siempre tengan datos completos, a costa de que el formulario de creación tenga un campo más obligatorio.

## Máquina de estados del ticket

```
OPEN             → [IN_PROGRESS]
IN_PROGRESS      → [PENDING_CUSTOMER, RESOLVED]
PENDING_CUSTOMER → [IN_PROGRESS, RESOLVED]
RESOLVED         → [CLOSED, IN_PROGRESS]   (reabrir)
CLOSED           → [OPEN]                   (reabrir completo)
```

Cualquier transición fuera de esta tabla se rechaza con `400`. Cerrar (`RESOLVED → CLOSED`) y reabrir (`CLOSED → OPEN`) están reservados a Administrador — coincide literalmente con "Administrador puede cerrar o reabrir tickets" del enunciado. Se consideró una transición libre (cualquier estado a cualquier estado, solo validando el rol) por ser más simple de construir, pero se descartó porque permitiría saltos sin sentido operativo (`OPEN → CLOSED` directo, sin pasar por ningún trabajo real) que una máquina de estados evita por diseño.

`resolvedAt` se setea al entrar a `RESOLVED` y se limpia al salir de `RESOLVED`/`CLOSED` hacia cualquier otro estado (reapertura); `closedAt` se setea solo al entrar a `CLOSED`. Consecuencia documentada: si un ticket se reabre después de resuelto, se pierde el `resolvedAt` original — la consulta 5 de `queries.sql` (tiempo promedio de resolución) solo puede calcularse sobre tickets que actualmente tienen `resolvedAt`, no sobre el historial completo de resoluciones. Un historial de duración por estado sería la mejora natural (ver `mejoras.md`).

## Comentarios y visibilidad de notas internas

Cada comentario tiene `isInternal: boolean`. Solo Administrador y Supervisor pueden marcar un comentario como interno; si un Agente o Cliente intenta marcarlo, el backend lo ignora silenciosamente y lo guarda como público (`false`) — no se rechaza la petición, porque el contenido del comentario sigue siendo válido, solo se corrige el flag que el rol no tiene permiso de setear. Los comentarios internos se filtran completamente de la respuesta cuando quien pide el detalle del ticket es un Cliente — no se envían "ocultos" al frontend para luego no renderizarlos, se excluyen en el backend antes de construir la respuesta, para que no queden expuestos ni siquiera inspeccionando el tráfico de red del navegador.

## Base de datos y ORM

**PostgreSQL + Prisma**, elegido sobre TypeORM o Sequelize por el nivel de tipado end-to-end (el cliente generado por Prisma tipa cada query contra el schema real) y por `prisma migrate`, que da migraciones versionadas y reproducibles sin escribirlas a mano. El costo aceptado: Prisma es más rígido para queries muy dinámicas o SQL crudo complejo — por eso `queries.sql` se entrega como SQL puro en vez de intentar expresar las 8 consultas con el query builder de Prisma, que no está pensado para agregaciones de ese nivel.

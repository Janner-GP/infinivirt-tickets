# ADR 005: Roles como enum, no como tabla

## Estado
Aceptado (reemplaza una decisión previa de modelar `Role` como tabla propia)

## Contexto
El enunciado pide como mínimo tres roles fijos (Administrador, Agente de soporte, Supervisor/Líder operativo), y permite proponer roles adicionales si se considera necesario. Inicialmente se había propuesto una tabla `Role` independiente, pensando en una futura administración de roles por datos en vez de por código.

## Decisión
Los roles se modelan como un **enum nativo de Postgres** (`Role`: `ADMIN`, `AGENT`, `SUPERVISOR`) directamente en el campo `role` de `User`, **no** como una tabla independiente con relación foránea.

## Razones
- Los roles del sistema son un conjunto **fijo y de bajo cambio**: agregar un rol nuevo implica de todas formas escribir código nuevo (nuevos permisos en los Guards, nuevas reglas de negocio en los servicios) — una tabla de roles no evita ese trabajo, porque los *permisos* siguen viviendo en código, no en datos.
- Modelar `Role` como tabla obligaría a construir CRUD, validaciones y semillas (seed data) para una entidad que en la práctica no varía en el ciclo de vida de esta prueba — es complejidad sin beneficio real, y el tiempo estimado de la prueba (8-14h) se aprovecha mejor en los flujos de negocio (tickets, asignaciones, comentarios).
- Un enum de Postgres ya garantiza integridad de datos (valores restringidos) sin necesitar una tabla ni una clave foránea adicional.

## Alternativas consideradas
- **Tabla `Role` independiente** (decisión previa, descartada): tiene sentido únicamente si el objetivo fuese un RBAC completo, donde los *permisos* también son datos administrables (ej. una tabla `Permission` y una tabla puente `RolePermission`) — eso sí justificaría el costo de una tabla. Sin esa necesidad, es una abstracción prematura.

## Consecuencias
- Agregar un rol nuevo en el futuro requiere una migración de Prisma (`ALTER TYPE ... ADD VALUE`) y cambios de código en los Guards — se documenta como el costo aceptado de esta decisión.
- Si en una evolución futura se requiere RBAC con permisos administrables por datos, este ADR queda superado y debe reemplazarse por una tabla `Role`/`Permission` — se deja anotado como trabajo futuro en el README del backend, no se implementa ahora.

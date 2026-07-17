# ADR 001: Base de datos relacional y ORM

## Estado
Aceptado

## Contexto
La prueba técnica exige una base de datos relacional (PostgreSQL, MySQL o SQL Server) y una capa de acceso a datos desde NestJS. Además se requiere un archivo `queries.sql` con 8 consultas analíticas complejas (agregaciones, ventanas de tiempo, porcentajes, conteos por historial), lo que condiciona qué tan expresivo debe ser el motor SQL.

## Decisión
- Motor de base de datos: **PostgreSQL**.
- Capa de acceso a datos: **Prisma** (schema declarativo + Prisma Client + Prisma Migrate).

## Razones
- PostgreSQL tiene soporte nativo y maduro para tipos `ENUM`, CTEs, funciones de ventana (`ROW_NUMBER`, `AVG() OVER`, etc.) y agregaciones — todas necesarias para las 8 consultas del `queries.sql`.
- Es gratuito, ampliamente soportado en AWS (RDS / Aurora Serverless v2), y es el estándar de facto en el ecosistema Node/TypeScript actual.
- Prisma da tipado end-to-end (el modelo del `schema.prisma` genera el cliente TypeScript), migraciones versionadas y legibles, y es más simple de explicar y defender en una entrevista que TypeORM (que mezcla decoradores, Active Record/Data Mapper y una configuración más dispersa).

## Alternativas consideradas
- **MySQL**: viable, pero funciones de ventana con menor madurez histórica y menos expresividad para las consultas analíticas pedidas.
- **SQL Server**: tiene sentido si el stack objetivo real fuese Microsoft, pero añade licenciamiento y costo en AWS sin beneficio para este caso.
- **TypeORM**: es el ORM "oficial" en la documentación de NestJS, pero su tipado y migraciones son menos pulidos que Prisma.

## Consecuencias
- Las 8 consultas de `queries.sql` se escriben en SQL puro (no generado por Prisma), como pide el enunciado — Prisma se usa para las operaciones CRUD normales de la API, no reemplaza el archivo de consultas.
- Se requiere `prisma generate` como paso del pipeline de CI antes de compilar/testear el backend.

## Nota técnica: Prisma 7 y Driver Adapters
Prisma 7 (la versión instalada) eliminó el motor de conexión embebido (el binario Rust "query engine") en favor de un compilador de consultas en WASM más un **Driver Adapter** explícito por motor de base de datos. En la práctica esto significa que `PrismaClient` ya no acepta `datasources`/`datasourceUrl` en su constructor — hay que instanciarlo con un adaptador:

```ts
import { PrismaPg } from '@prisma/adapter-pg';

super({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
```

Esto requiere las dependencias `@prisma/adapter-pg` y `pg` además de `@prisma/client`. Se documenta explícitamente porque casi toda la documentación y tutoriales existentes (incluida la de NestJS) todavía muestran la API anterior, por lo que es un punto de fricción real que vale la pena explicar en la sustentación.

También se descartó el generador `prisma-client` (el nuevo, ESM-first) en favor del clásico `prisma-client-js`: el nuevo generador emite código con `import.meta.url`, incompatible con la compilación CommonJS por defecto de NestJS. `prisma-client-js` sigue siendo estable y 100% compatible.

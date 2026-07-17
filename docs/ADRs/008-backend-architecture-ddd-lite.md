# ADR 008: Arquitectura del backend — DDD-lite (repositorios + entidades de dominio)

## Estado
Aceptado

## Contexto
NestJS no impone una arquitectura interna por módulo — el propio framework permite desde controllers que llaman a Prisma directamente hasta hexagonal completo. Se necesita un criterio único, aplicado consistentemente a todos los módulos (`users`, `auth`, `clients`, `tickets`), que balancee separación de responsabilidades con el tiempo disponible (8-14h).

## Decisión
Cada módulo de dominio sigue la misma convención de 4 carpetas ("DDD-lite"):

```
src/modules/<dominio>/
├── domain/
│   ├── entities/           # clases de dominio simples (no son el modelo de Prisma)
│   └── repositories/       # interfaces (abstract class) — el "puerto"
├── application/
│   └── <dominio>.service.ts   # casos de uso: orquesta repositorios + reglas de negocio
├── infrastructure/
│   └── persistence/
│       └── prisma-<dominio>.repository.ts  # implementación concreta del repositorio con Prisma
├── presentation/
│   ├── <dominio>.controller.ts
│   └── dto/
└── <dominio>.module.ts
```

Reglas del patrón:
- El **controller** (presentation) solo valida entrada (DTOs) y delega al **service** (application) — no conoce Prisma.
- El **service** solo conoce la **interfaz** del repositorio (el "puerto" en `domain/repositories`), inyectada por token de clase abstracta — nunca importa `PrismaService` directamente.
- El **repositorio de infraestructura** es el único lugar que importa `PrismaService` y traduce entre el modelo de Prisma y la entidad de dominio.
- Las **entidades de dominio** son clases simples (no decoradas con nada de Prisma/NestJS) que representan el concepto de negocio y pueden llevar métodos de validación propios cuando aplique.

## Razones
- Es el punto intermedio que el candidato eligió explícitamente entre "todo en el service con Prisma directo" (más rápido pero acopla toda la lógica de negocio al ORM) y "hexagonal completo" (más ceremonia de la necesaria para 4 módulos en 8-14h).
- Aislar Prisma detrás de una interfaz de repositorio permite, a futuro, cambiar de ORM o testear los services con un repositorio en memoria (fake), sin tocar la lógica de negocio ni los controllers.
- Mantiene una convención idéntica y predecible en los 4 módulos, lo cual es más fácil de defender y de razonar en la sustentación que decisiones ad-hoc por módulo.

## Alternativas consideradas
- **Modular estándar (service → Prisma directo)**: más rápido de escribir, pero mezcla reglas de negocio con detalles de Prisma en el mismo archivo.
- **Hexagonal/Clean completo**: agrega casos de uso como clases individuales (un archivo por acción) y mapeadores explícitos en cada frontera — nivel de rigor que no se justifica para el tamaño de este proyecto.

## Consecuencias
- Cada entidad nueva (ej. cuando se construya `tickets`) repite la misma estructura de 4 carpetas — es la plantilla a seguir para todos los módulos futuros.
- Hay algo de "boilerplate" (una interfaz + una implementación por repositorio) comparado con usar Prisma directo en el service — aceptado a cambio de la separación de responsabilidades.

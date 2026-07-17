# ADR 002: Estructura del repositorio

## Estado
Aceptado

## Contexto
Se pidió un único repositorio de GitHub (monorepo) que contenga el frontend (React) y el backend (NestJS), con CI/CD para ambos.

## Decisión
Monorepo "ligero" con **npm plano, sin workspaces y sin paquetes compartidos**: `backend/` y `frontend/` son dos proyectos Node completamente independientes (cada uno con su propio `package.json`, `node_modules` y configuración), que solo comparten el repositorio Git y la carpeta `.github/workflows/`.

```
infinivirt_test/
├── backend/
├── frontend/
├── docs/
│   └── ADRs/
└── .github/workflows/
```

## Razones
- Evita el acoplamiento que traen los workspaces (hoisting de dependencias compartido, versiones de librerías que deben coordinarse entre proyectos).
- Cada proyecto se puede construir, testear y desplegar de forma aislada, lo cual simplifica el CI/CD (workflows separados, activados solo por cambios en su propia carpeta vía `paths:`).
- Es más simple de explicar y de operar dentro del tiempo estimado de la prueba (8-14h) que introducir Nx o Turborepo, cuya curva de configuración no se justifica para dos proyectos.

## Alternativas consideradas
- **Turborepo / Nx**: aportan caché de builds y pipelines declarativos, pero añaden una capa de configuración adicional a justificar sin beneficio claro en un proyecto de este tamaño.
- **npm workspaces con paquete `shared/`**: permitiría compartir tipos TypeScript entre frontend y backend, pero el candidato prefirió mantener ambos proyectos totalmente independientes para esta primera versión.

## Consecuencias
- Cualquier tipo o contrato compartido (por ejemplo, la forma de un `Ticket`) se duplica de forma intencional entre frontend y backend por ahora. Si el proyecto evoluciona, la extracción a un paquete `shared/` (o a un cliente generado desde el contrato OpenAPI del backend) es el siguiente paso natural — se documenta como trabajo futuro, no se implementa ahora.

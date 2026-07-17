# Mejoras

## Angular en vez de React

El enunciado pedía React, así que el frontend de esta prueba está en React — pero si esta aplicación fuera a crecer de verdad (más módulos, más equipos trabajando en paralelo, integraciones externas, reportes, como el propio enunciado anticipa), la recomendación real sería migrar a **Angular**.

La razón no es preferencia de sintaxis, es la naturaleza de esta aplicación específica:
- Es un **sistema interno de gestión** (CRUD sobre tickets, clientes, usuarios, categorías), no un producto de consumo con necesidad de máxima flexibilidad de UI. Ese perfil de aplicación es exactamente el que Angular resuelve mejor: formularios reactivos con validación declarativa (`ReactiveFormsModule`), tablas de datos, navegación por rol, todo con un patrón único impuesto por el framework.
- Angular es **opinado por diseño**: estructura de módulos, inyección de dependencias, un único forma de manejar HTTP (`HttpClient` + interceptors), un único router. React da esa misma flexibilidad que hoy se resolvió a mano en este proyecto (capa de API con TanStack Query, contexto de auth casero, guards de ruta caseros) — cada decisión de estructura queda en manos del equipo, lo cual funciona bien con un desarrollador y se vuelve una fuente de inconsistencia entre 3+ desarrolladores sin un lineamiento fuerte.
- La **inyección de dependencias nativa** de Angular encaja de forma casi directa con el patrón DDD-lite que ya se usa en el backend (servicios inyectables, interfaces como "puertos") — sería razonable espejar la misma disciplina de capas en el frontend sin reinventar el patrón con Context API o un state manager externo.
- **Escala de equipo**: a medida que el sistema crece a más módulos (el enunciado menciona múltiples áreas, integraciones, reportes), Angular impone una estructura de módulos con límites explícitos (`NgModule` / standalone components con imports explícitos) que hace más difícil que un equipo grande introduzca acoplamiento accidental entre features — algo que en React depende enteramente de la disciplina del equipo (como la estructura "por tipo de archivo" que se documentó como deuda en `arquitectura-carpetas.md`).

El trade-off real: Angular tiene una curva de aprendizaje más alta y un boilerplate inicial mayor para una app pequeña como esta prueba — por eso no se recomienda para el alcance actual (8 pantallas, un desarrollador), sino como la elección correcta en el momento en que el equipo y el número de módulos crezcan, que es exactamente el escenario que el propio enunciado plantea a futuro.

## Mejoras ya incorporadas en el proyecto

Estas son decisiones que fueron más allá del mínimo pedido por el enunciado, ya implementadas y verificadas funcionalmente:

- **Rol Cliente con portal propio**: el enunciado solo pedía 3 roles internos; se agregó un cuarto rol (`CLIENT`) con login propio, scoping automático a sus propios tickets, y un layout de UI completamente distinto (sin sidebar administrativa) reutilizando las mismas rutas que el resto de roles — sin duplicar páginas.
- **Categorías y subcategorías parametrizables con auto-asignación real**: no era un requisito explícito del enunciado (que solo mencionaba "categoría" como campo del ticket sin más detalle); se construyó como una jerarquía completa administrable desde la UI, con una regla de negocio real (auto-asignación por subcategoría) en vez de solo un campo de texto libre.
- **Autorización a nivel de fila real, no solo de UI**: `TicketOwnershipGuard` en el backend impide que un Agente o Cliente accedan a tickets ajenos aunque conozcan el ID y ataquen la API directamente — no es solo un botón oculto en el frontend.
- **Máquina de estados validada server-side**: las transiciones de estado del ticket están restringidas explícitamente (ver `logica-negocio-trade-offs.md`), no es un campo `status` libre que acepte cualquier valor del enum en cualquier momento.
- **Refresh tokens persistidos y rotados**, con revocación real al hacer logout — no solo un JWT de refresh de larga duración sin forma de invalidarlo.
- **Respuestas HTTP consistentes y manejo centralizado de errores**: todo endpoint exitoso devuelve el mismo sobre (`{ success, statusCode, data, timestamp }`) vía un interceptor global, y toda excepción (de negocio, de validación, o no controlada) pasa por un único `AllExceptionsFilter` — el frontend nunca tiene que adivinar la forma de una respuesta de error.
- **Seed de datos completo e idempotente**: usuarios de los 4 roles, un cliente vinculado, 5 categorías con subcategorías, y una regla de asignación de ejemplo — se puede correr repetidas veces sin duplicar datos (`upsert` en vez de `create`).
- **Notas internas realmente ocultas para el Cliente**: filtradas en el backend antes de responder, no solo atenuadas visualmente en el frontend.
- **Dirección visual coherente aplicada a las 8 pantallas y 4 roles**, no solo a la pantalla de login — incluye estados vacíos, indicadores de prioridad como severidad (no como categorías sueltas), y un guard de UI (`RequireRole`) que evita el parpadeo de contenido no autorizado antes de redirigir.

## Mejoras futuras recomendadas

- **Tests automatizados**: hoy no existen (ni backend ni frontend, más allá del boilerplate de Nest CLI). Prioridad: tests de integración sobre `TicketsService` (máquina de estados, ownership, auto-asignación) por ser la lógica de negocio más densa del proyecto.
- **CI/CD real hacia AWS**: el pipeline actual (lint/test/build) no incluye el paso de deploy descrito en `arquitectura-aws.md` — es el siguiente paso natural una vez exista una cuenta de AWS de destino.
- **Historial de duración por estado**: `tkt_status_history` ya registra cada transición con timestamp; falta una vista/reporte que calcule tiempo real en cada estado (no solo tiempo total de resolución), útil para medir cuellos de botella operativos.
- **Pool de agentes con reparto por carga** en vez de un único agente responsable fijo por subcategoría, para cuando el volumen de tickets por subcategoría lo justifique (ver trade-off documentado en `logica-negocio-trade-offs.md`).
- **Paquete de tipos compartido entre backend y frontend** (`@infinivirt/types` o similar) para eliminar la duplicación manual de tipos en `frontend/src/types/` — factible incluso sin adoptar un monorepo con workspaces completo.
- **Notificaciones** (correo o in-app) cuando un ticket se asigna, se comenta, o pasa a "Esperando cliente" — el enunciado anticipa este tipo de integración a futuro y el modelo de datos actual (historial de estado y de asignación) ya tiene la información necesaria para disparar esos eventos.
- **Reorganizar el frontend a estructura por feature** (`src/features/tickets/`, `src/features/clients/`, …) en el momento en que el número de páginas haga que la carpeta plana `pages/` deje de ser navegable — documentado como decisión consciente en `arquitectura-carpetas.md`, no como algo pendiente por descuido.
- **Migrar el frontend de ECS Fargate a S3 + CloudFront** cuando el tráfico lo justifique: hoy el frontend corre containerizado detrás del mismo ALB que el backend por simplicidad operativa (un solo patrón de despliegue para los dos servicios, ver `arquitectura-aws.md`), a costa de perder el cacheo en el borde y el costo marginal casi nulo que da CloudFront para contenido estático.

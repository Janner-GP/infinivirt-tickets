# ADR 009: Arquitectura del frontend — feature-based (feature-sliced)

## Estado
Aceptado

## Contexto
La estructura inicial del frontend (`pages/`, `components/`, `api/`, `auth/`, `routes/` a nivel global) funciona para las primeras pantallas, pero mezcla en las mismas carpetas componentes y lógica de dominios distintos (login, tickets, dashboard) a medida que el proyecto crece — justo el escenario que anticipa el enunciado (más áreas, integraciones, reportes a futuro).

## Decisión
El frontend se reorganiza por **feature** (dominio de negocio), no por tipo de archivo:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/       # LoginForm, etc.
│   │   ├── hooks/            # useAuth, useLogin
│   │   ├── api/               # authApi.ts (llamadas a /auth/*)
│   │   ├── types.ts
│   │   └── pages/             # LoginPage
│   ├── tickets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types.ts
│   │   └── pages/              # TicketsListPage, TicketDetailPage, TicketCreatePage
│   └── dashboard/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       └── pages/
├── shared/
│   ├── components/            # UI genérica reutilizada entre features (Button, Layout, etc.)
│   ├── api/                   # cliente Axios base
│   └── lib/                   # utilidades sin estado
└── routes/                    # AppRouter.tsx — solo enruta, no contiene lógica de negocio
```

Regla general: si un componente/hook/tipo solo lo usa un dominio, vive dentro de `features/<dominio>/`. Si lo comparten dos o más dominios (ej. un botón genérico, el cliente Axios base), vive en `shared/`.

## Razones
- Cuando el sistema crezca a más áreas (como anticipa el enunciado), cada feature nueva se agrega como una carpeta autocontenida sin tocar las existentes — bajo acoplamiento entre dominios.
- Facilita borrar o extraer un dominio completo (ej. mover `tickets` a un micro-frontend futuro) porque todo lo que le pertenece vive en un solo lugar.
- Evita el problema típico de las carpetas `components/`/`hooks/` "fuente única" que terminan con decenas de archivos sin relación aparente entre sí.

## Alternativas consideradas
- **Por capas (la estructura previa)**: más simple al inicio, pero no aísla los dominios entre sí — se descarta por no escalar bien con el crecimiento que anticipa el enunciado.
- **Atomic design**: organiza por nivel de composición visual (atoms/molecules/organisms), pensado para design systems/librerías de UI — no aporta claridad para una app operativa orientada a flujos de negocio como esta.

## Consecuencias
- Se migran los archivos ya creados (`LoginPage`, `AuthContext`, `client.ts`, páginas de tickets) a la nueva estructura antes de seguir construyendo el módulo de Auth.
- `routes/AppRouter.tsx` importa las páginas desde `features/*/pages`, pero no contiene lógica de negocio propia — solo mapea rutas a componentes.

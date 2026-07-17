# 🎟️ InfiniVirt Tickets

Sistema de gestión de tickets desarrollado con una arquitectura moderna basada en **React + NestJS + PostgreSQL**, diseñado para administrar solicitudes, categorías, usuarios y autenticación segura mediante JWT y Refresh Tokens.

---

## 📖 Descripción

InfiniVirt Tickets es una plataforma web para la administración de tickets que permite gestionar incidencias o solicitudes de manera organizada y segura.

El proyecto está dividido en dos aplicaciones independientes:

- **Frontend** desarrollado con React + Vite + TypeScript.
- **Backend** desarrollado con NestJS siguiendo una arquitectura modular y utilizando Prisma ORM para el acceso a datos.

Esta separación facilita la escalabilidad, el mantenimiento y el despliegue independiente de cada componente.

---

# ✨ Características

- 🔐 Autenticación mediante JWT.
- 🔄 Refresh Tokens.
- 👤 Gestión de usuarios.
- 🛡️ Control de acceso basado en roles.
- 🎫 Administración de tickets.
- 🏷️ Administración de categorías.
- ✅ Validación de datos.
- ⚡ API REST.
- 🗄️ Persistencia con PostgreSQL.
- 📦 ORM Prisma.
- 🧹 Código tipado con TypeScript.
- 🎨 Frontend moderno con React 19.

---

# 🏗 Arquitectura

```
                React + Vite
                      │
                 Axios / HTTP
                      │
                REST API (NestJS)
                      │
        ┌─────────────┴─────────────┐
        │                           │
 Authentication              Business Modules
        │                           │
        └─────────────┬─────────────┘
                      │
                  Prisma ORM
                      │
                 PostgreSQL
```

---

# 📁 Estructura del proyecto

```
infinivirt-tickets/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── categories/
│   │   ├── ...
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── routes/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# 🚀 Tecnologías

## Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Passport
- bcrypt
- class-validator
- class-transformer

---

## Frontend

- React 19
- TypeScript
- Vite
- React Router
- React Query
- React Hook Form
- Axios
- Zod

---

# 🐳 Levantar todo con Docker (recomendado)

La forma más rápida de tener el sistema completo corriendo — Postgres, backend y frontend — es con un solo comando, sin instalar Node ni Postgres localmente:

```bash
docker compose up --build
```

Esto construye las 3 imágenes y arranca los 3 contenedores en orden (Postgres → backend → frontend), esperando a que cada uno esté realmente listo antes de levantar el siguiente:

1. **postgres** arranca y expone healthcheck (`pg_isready`).
2. **backend** espera a Postgres, corre `prisma migrate deploy`, siembra datos de prueba con `prisma db seed` (ver más abajo) y arranca la API en `http://localhost:3000/api`.
3. **frontend** espera a que el backend esté saludable, sirve el build de producción de React con nginx en `http://localhost` y reenvía internamente `/api/*` hacia el contenedor del backend.

Al terminar, entra a **http://localhost** — ya con datos de prueba cargados y cualquiera de las credenciales de abajo.

**El seed solo puebla datos la primera vez**: corre en cada arranque del contenedor backend, pero es idempotente — usuarios/clientes/categorías usan `upsert` (nunca se duplican) y los tickets de ejemplo solo se crean si la tabla está vacía. Si quieres datos completamente nuevos, borra el volumen de Postgres (`docker compose down -v`) y vuelve a levantar.

## 🔑 Credenciales de prueba

Misma contraseña para las 4 (ya cargadas por el seed):

| Rol                                            | Email                          | Contraseña      |
| ---------------------------------------------- | ------------------------------ | ---------------- |
| Administrador                                  | `admin@infinivirt.test`      | `Sup3r$ecret!` |
| Agente de soporte                              | `agente@infinivirt.test`     | `Sup3r$ecret!` |
| Agente de soporte (2do)                        | `agente2@infinivirt.test`    | `Sup3r$ecret!` |
| Supervisor                                     | `supervisor@infinivirt.test` | `Sup3r$ecret!` |
| Cliente (portal propio, vinculado a Acme Corp) | `cliente@acme.test`          | `Sup3r$ecret!` |

---

# 📦 Requisitos (solo si NO usas Docker)

Antes de comenzar asegúrate de tener instalado:

- Node.js 20+
- npm o pnpm
- PostgreSQL 15+
- Git

---

# ⚙️ Instalación manual (alternativa a Docker)

## Clonar el repositorio

```bash
git clone https://github.com/Janner-GP/infinivirt-tickets.git

cd infinivirt-tickets
```

---

# Backend

Entrar al proyecto

```bash
cd backend
```

Instalar dependencias

```bash
npm install
```

Configurar variables de entorno

```env
DATABASE_URL=

JWT_SECRET=

JWT_REFRESH_SECRET=

PORT=3000
```

Ejecutar migraciones

```bash
npx prisma migrate deploy
```

Generar Prisma Client

```bash
npx prisma generate
```

Ejecutar

```bash
npm run start:dev
```

---

# Frontend

Entrar al proyecto

```bash
cd frontend
```

Instalar dependencias

```bash
npm install
```

Variables de entorno

```env
VITE_API_URL=http://localhost:3000
```

Ejecutar

```bash
npm run dev
```

---

# 📚 Scripts

## Backend

```bash
npm run start
npm run start:dev
npm run build
npm run lint
npm run test
```

## Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

# 🔐 Autenticación

El sistema implementa autenticación basada en JWT.

Flujo:

```
Login

↓

Validación Usuario

↓

Generación Access Token

↓

Generación Refresh Token

↓

Cliente almacena ambos

↓

Cada petición protegida envía:

Authorization: Bearer <token>

↓

Cuando expira:

Refresh Token

↓

Nuevo Access Token
```

---

# 🗄 Base de datos

El backend utiliza Prisma ORM sobre PostgreSQL.

Las migraciones se encuentran dentro de:

```
backend/prisma/migrations
```

La configuración principal está en:

```
backend/prisma/schema.prisma
```

---

# 📡 API

La API REST está organizada por módulos.

Ejemplo:

```
/auth

/users

/categories

/tickets
```

Cada módulo contiene:

- Controller
- Service
- DTOs
- Entities
- Guards
- Validaciones

---

# 🛡 Seguridad

El proyecto incorpora buenas prácticas como:

- Hash de contraseñas.
- JWT.
- Refresh Tokens.
- Validación de DTOs.
- TypeScript estricto.
- Separación por módulos.
- Variables de entorno.

---

# 📈 Escalabilidad

La arquitectura facilita la incorporación de nuevos módulos sin afectar los existentes.

Ejemplos:

- Comentarios de tickets.
- Prioridades.
- Adjuntos.
- Historial de cambios.
- Notificaciones.
- Dashboard.
- Métricas.
- Auditoría.

---

# 👨‍💻 Autor

**Janner González**

**Software Architect | Technical Lead**

Arquitecto de Software y Líder Técnico con experiencia en el diseño e implementación de soluciones escalables, arquitecturas distribuidas y desarrollo Full Stack utilizando tecnologías modernas como React, Angular, Flutter, NestJS, Python, FastAPI, TypeScript y PostgreSQL.

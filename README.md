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

# 📦 Requisitos

Antes de comenzar asegúrate de tener instalado:

- Node.js 20+
- npm o pnpm
- PostgreSQL 15+
- Git

---

# ⚙️ Instalación

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

# 🤝 Contribuciones

1. Crear una rama.

```
feature/nueva-funcionalidad
```

2. Realizar cambios.

3. Ejecutar pruebas.

4. Crear Pull Request.

---

# 📝 Licencia

Este proyecto se distribuye bajo la licencia que defina el propietario del repositorio.

---

# 👨‍💻 Autor

**Janner González**

**Software Architect | Technical Lead**

Arquitecto de Software y Líder Técnico con experiencia en el diseño e implementación de soluciones escalables, arquitecturas distribuidas y desarrollo Full Stack utilizando tecnologías modernas como React, Angular, Flutter, NestJS, Python, FastAPI, TypeScript y PostgreSQL.
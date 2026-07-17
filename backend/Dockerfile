# =========================
# Build Stage
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

# =========================
# Production Stage
# =========================
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache netcat-openbsd

# node_modules ya viene completo (incluye devDependencies: prisma CLI y
# ts-node, necesarios en runtime para `prisma migrate deploy` y `prisma db
# seed`) — no se reinstala aparte, evita un npm ci redundante que solo se
# terminaría descartando.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

COPY docker-entrypoint.sh .

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]

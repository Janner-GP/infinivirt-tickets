#!/bin/sh

set -e

echo "⏳ Esperando a PostgreSQL..."

until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "PostgreSQL aún no está disponible..."
  sleep 2
done

echo "✅ PostgreSQL disponible"

echo "🚀 Ejecutando migraciones..."
npx prisma migrate deploy

echo "🔄 Generando Prisma Client..."
npx prisma generate

echo "▶️ Iniciando aplicación..."

exec node dist/main.js
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

echo "🌱 Sembrando datos de prueba (idempotente — si ya existen, no duplica nada)..."
npx prisma db seed

echo "▶️ Iniciando aplicación..."

exec node dist/src/main.js

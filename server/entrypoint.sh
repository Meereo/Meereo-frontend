#!/bin/sh
set -e

echo "[MEEREO] Running database migrations..."
npx prisma migrate deploy

echo "[MEEREO] Starting API server..."
exec node src/index.js

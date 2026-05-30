#!/bin/sh
set -e

mkdir -p /data/uploads/avatars /data/uploads/clubs

if [ ! -e /app/public/uploads ]; then
  ln -sf /data/uploads /app/public/uploads
fi

export DATABASE_URL="${DATABASE_URL:-file:/data/prod.db}"

if [ -x /app/node_modules/.bin/prisma ]; then
  /app/node_modules/.bin/prisma db push --skip-generate
fi

exec node /app/server.js
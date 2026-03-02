#!/bin/bash
# Build lần đầu trên server (sau git clone). Chạy từ thư mục gốc repo: bash deploy/build-first.sh
set -e
cd "$(dirname "$0")/.."
echo "[NNTM] Build API..."
cd api
npm install
npx prisma generate
npx prisma migrate deploy
cd ..
echo "[NNTM] Build CMS..."
cd cms
npm install
cd ..
echo "[NNTM] Build Web..."
cd web
npm install
npm run build
cd ..
echo "[NNTM] Build xong. Tao api/.env neu chua co (cp api/env.example api/.env). Sau do chay API: cd api && npm start hoac pm2 start src/server.js --name nntm-api"

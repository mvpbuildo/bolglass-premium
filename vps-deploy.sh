#!/bin/bash
# Bolglass VPS Update Script

echo "--- 🚀 STARTING VPS UPDATE ---"

# 1. Pull latest code
echo "📥 Pulling latest code from Git..."
git pull

# 2. Build and start containers (to ensure dependencies and Prisma Client are updated)
echo "🐳 Building and restarting containers..."
docker compose up -d --build

# 3. Wait for DB to be ready and sync schema
echo "🔄 Syncing database schema..."
docker compose exec -T bolglass-web npx prisma db push --schema=packages/database/prisma/schema.prisma

# 4. Initialize settings and update slot capacity
echo "⚙️ Initializing system settings and capacities..."
docker compose exec -T bolglass-web node initialize-settings.js
echo "Updating all slots capacity to 100..."
docker compose exec -T bolglass-web node update-capacity.js

echo "--- ✅ UPDATE COMPLETE ---"
echo "Aplikacja jest już dostępna na test.bolann.cloud"

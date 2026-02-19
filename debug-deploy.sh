#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "🔍 Starting Debug Deployment..."

# 1. Check Git Status
echo "--- Git Status ---"
git status
echo "--- Last Commit ---"
git log -1 --format="%h - %s (%ci)"

# 2. Force Pull
echo "⬇️ Force Pulling latest changes..."
git fetch --all
git reset --hard origin/main # Assuming main branch, change if needed
git pull

# 3. Clean Docker Build
echo "🐳 Rebuilding containers (no cache)..."
docker compose down
docker compose build --no-cache
docker compose up -d

# 4. Verification
echo "✅ Deployment finished."
echo "Current running containers:"
docker compose ps

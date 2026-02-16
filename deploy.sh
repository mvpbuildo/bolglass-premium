#!/bin/bash

# Bolglass Deployment Script
# Automates the update and rebuild process

echo "🚀 Starting deployment..."

# 1. Pull latest changes
echo "🔹 Pulling latest changes from Git..."
git pull

# 2. Rebuild with no cache to ensure fresh dependencies
echo "🔹 Rebuilding Docker containers (no-cache)..."
docker compose build --no-cache

# 3. Start containers in background
echo "🔹 Starting containers..."
docker compose up -d

echo "✅ Deployment finished successfully!"

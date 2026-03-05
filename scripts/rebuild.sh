#!/bin/bash
set -e

echo "🔄 Rebuilding Sipper with clean slate..."

# Stop containers
docker-compose down

# Remove old images to force fresh build
docker rmi sipper-app 2>/dev/null || true

# Build with no cache
docker-compose build --no-cache

# Start containers
docker-compose up -d

# Wait for health
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Verify
curl -s http://localhost:8000/health || echo "❌ Health check failed"

echo "✅ Rebuild complete!"
echo "📱 Access at: http://localhost:8000"

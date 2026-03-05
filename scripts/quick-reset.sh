#!/bin/bash
set -e

echo "🔄 Quick reset (keeps images, clears rate limits)..."

# Stop and remove containers (not images)
docker-compose down

# Start fresh
docker-compose up -d

echo "⏳ Waiting for startup..."
sleep 10

# Test
curl -s http://localhost:8000/health && echo "✅ Ready!" || echo "❌ Failed"

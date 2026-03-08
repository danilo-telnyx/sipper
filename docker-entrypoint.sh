#!/bin/bash
set -e

echo "🚀 Starting SIPPER services..."

# Start SIP Engine in background
echo "▶️  Starting SIP Engine (Node.js)..."
cd /app/backend/sip-engine
node src/api-server.js &
SIP_ENGINE_PID=$!
cd /app/backend

# Wait for SIP Engine to be ready
echo "⏳ Waiting for SIP Engine..."
for i in {1..30}; do
    if curl -sf http://127.0.0.1:5001/health > /dev/null 2>&1; then
        echo "✅ SIP Engine is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ SIP Engine failed to start"
        kill $SIP_ENGINE_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Start FastAPI backend
echo "▶️  Starting FastAPI backend..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

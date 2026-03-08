#!/bin/bash
# Start both Python backend and Node.js SIP Engine

set -e

echo "🚀 Starting SIPPER Backend Services"
echo "===================================="

# Check if in backend directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Must run from backend/ directory"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $SIP_ENGINE_PID $BACKEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start SIP Engine
echo "▶️  Starting SIP Engine (Node.js) on port 5001..."
cd sip-engine
npm start &
SIP_ENGINE_PID=$!
cd ..

# Wait for SIP Engine to be ready
echo "⏳ Waiting for SIP Engine to start..."
for i in {1..10}; do
    if curl -s http://127.0.0.1:5001/health > /dev/null 2>&1; then
        echo "✅ SIP Engine is ready!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ SIP Engine failed to start"
        kill $SIP_ENGINE_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Start FastAPI backend
echo "▶️  Starting FastAPI backend on port 8000..."
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

echo ""
echo "✅ All services started!"
echo "===================================="
echo "  Backend API:  http://localhost:8000"
echo "  SIP Engine:   http://localhost:5001"
echo "  API Docs:     http://localhost:8000/docs"
echo "===================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for any process to exit
wait

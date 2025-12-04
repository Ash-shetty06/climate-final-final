fatal: not a git repository (or any of the parent directories): .git
PS C:\Users\DELL\Downloads\climateee> #!/bin/bash
# Start both backend and frontend

echo "🚀 Starting AtmosView Application..."
echo ""

# Kill any existing processes on ports 5000 and 3001-3002
echo "Cleaning up existing processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

echo "✅ Cleaned up"
echo ""

# Start Backend
echo "📡 Starting Backend on http://localhost:5000..."
cd backend
npm run dev &
BACKEND_PID=$!
sleep 3

echo ""
echo "✅ Backend started (PID: $BACKEND_PID)"
echo ""

# Start Frontend
echo "🎨 Starting Frontend on http://localhost:3001..."
cd ..
npm run dev &
FRONTEND_PID=$!
sleep 3

echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo ""
echo "================================"
echo "🎉 App is running!"
echo "================================"
echo ""
echo "📱 Frontend: http://localhost:3001"
echo "📡 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

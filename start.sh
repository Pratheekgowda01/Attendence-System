#!/bin/bash

# Employee Attendance System - Start Script (Linux/Mac)
# This script starts both backend and frontend servers

echo ""
echo "========================================"
echo "  🚀 Starting Attendance System"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Get script directory (project root)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Check if directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend folder not found!"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend folder not found!"
    exit 1
fi

# Check MongoDB (optional)
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✓ MongoDB is running${NC}\n"
    else
        echo -e "${YELLOW}⚠ MongoDB may not be running${NC}\n"
    fi
fi

# Check if ports are in use
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠ Port 5000 is already in use!${NC}"
    echo "  Backend may already be running"
    echo ""
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠ Port 3000 is already in use!${NC}"
    echo "  Frontend may already be running"
    echo ""
fi

echo -e "${GREEN}Starting Backend Server...${NC}"
echo -e "${GRAY}  Location: $BACKEND_DIR${NC}"
echo -e "${GRAY}  Port: 5000${NC}"
echo ""

# Start Backend in new terminal (works on Linux with xterm, gnome-terminal, etc.)
cd "$BACKEND_DIR"
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd '$BACKEND_DIR'; echo '🔧 Backend Server Starting...'; echo 'Port: 5000'; echo '──────────────────────────────────────'; npm run dev; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -e "cd '$BACKEND_DIR'; echo '🔧 Backend Server Starting...'; echo 'Port: 5000'; npm run dev; exec bash" &
elif command -v osascript &> /dev/null; then
    # Mac OS
    osascript -e "tell app \"Terminal\" to do script \"cd '$BACKEND_DIR' && npm run dev\""
else
    # Fallback: run in background
    npm run dev > backend.log 2>&1 &
    echo "Backend started in background (see backend.log for output)"
fi

# Wait a bit
sleep 3

echo -e "${GREEN}Starting Frontend Server...${NC}"
echo -e "${GRAY}  Location: $FRONTEND_DIR${NC}"
echo -e "${GRAY}  Port: 3000${NC}"
echo ""

# Start Frontend
cd "$FRONTEND_DIR"
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd '$FRONTEND_DIR'; echo '⚛️  Frontend Server Starting...'; echo 'Port: 3000'; echo '──────────────────────────────────────'; npm start; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -e "cd '$FRONTEND_DIR'; echo '⚛️  Frontend Server Starting...'; echo 'Port: 3000'; npm start; exec bash" &
elif command -v osascript &> /dev/null; then
    # Mac OS
    osascript -e "tell app \"Terminal\" to do script \"cd '$FRONTEND_DIR' && npm start\""
else
    # Fallback: run in background
    npm start > frontend.log 2>&1 &
    echo "Frontend started in background (see frontend.log for output)"
fi

echo "════════════════════════════════════════"
echo -e "${GREEN}✅ Servers Starting${NC}"
echo "════════════════════════════════════════"
echo ""
echo -e "${CYAN}Backend:${NC}  http://localhost:5000"
echo -e "${CYAN}Frontend:${NC} http://localhost:3000"
echo ""
echo -e "${YELLOW}Please wait 30-60 seconds for compilation...${NC}"
echo ""
echo -e "${YELLOW}Login Credentials:${NC}"
echo "  Manager: manager@company.com / manager123"
echo "  Employee: alice@company.com / employee123"
echo ""


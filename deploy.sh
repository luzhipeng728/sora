#!/bin/bash

set -e  # Exit on error

echo "🚀 Sora Video Generation Platform - Deployment Script"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check dependencies
echo -e "\n${YELLOW}📦 Checking dependencies...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    echo -e "${RED}❌ Yarn not found. Please install Yarn${NC}"
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing PM2...${NC}"
    npm install -g pm2
fi

# Step 2: Create logs directory
echo -e "\n${YELLOW}📁 Creating logs directory...${NC}"
mkdir -p logs
mkdir -p backend/logs
mkdir -p frontend/logs

# Step 3: Build backend
echo -e "\n${YELLOW}🔨 Building backend...${NC}"
cd backend

# Install dependencies
echo "  Installing dependencies..."
yarn install --frozen-lockfile

# Run database migrations
echo "  Running database migrations..."
npx prisma generate
npx prisma migrate deploy

# Build TypeScript
echo "  Compiling TypeScript..."
yarn build

cd ..

# Step 4: Build frontend
echo -e "\n${YELLOW}🔨 Building frontend...${NC}"
cd frontend

# Install dependencies
echo "  Installing dependencies..."
yarn install --frozen-lockfile

# Build Vite app
echo "  Building Vite app..."
yarn build

cd ..

# Step 5: Stop existing PM2 processes
echo -e "\n${YELLOW}🛑 Stopping existing processes...${NC}"
pm2 delete sora-backend sora-frontend 2>/dev/null || true

# Step 6: Start with PM2
echo -e "\n${YELLOW}▶️  Starting services with PM2...${NC}"
pm2 start ecosystem.config.js

# Step 7: Save PM2 configuration
echo -e "\n${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save

# Step 8: Setup PM2 startup
echo -e "\n${YELLOW}🔧 Setting up PM2 startup...${NC}"
pm2 startup

echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "\n${GREEN}📊 PM2 Status:${NC}"
pm2 status

echo -e "\n${GREEN}📝 Useful PM2 commands:${NC}"
echo "  pm2 status              - View all processes"
echo "  pm2 logs                - View all logs"
echo "  pm2 logs sora-backend   - View backend logs"
echo "  pm2 logs sora-frontend  - View frontend logs"
echo "  pm2 restart all         - Restart all services"
echo "  pm2 stop all            - Stop all services"
echo "  pm2 monit               - Monitor processes"

echo -e "\n${GREEN}🌐 Services:${NC}"
echo "  Backend:  http://localhost:3000"
echo "  Frontend: http://localhost:5173"

#!/bin/bash

set -e

echo "🐳 Sora Video Platform - Docker Deployment"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  Please edit .env file with your configuration before proceeding!${NC}"
    echo -e "${YELLOW}Required settings:${NC}"
    echo "  - SORA_API_URL"
    echo "  - SORA_API_TOKEN"
    echo "  - JWT_SECRET (change default)"
    echo "  - POSTGRES_PASSWORD (change default)"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo -e "\n${BLUE}📋 Configuration:${NC}"
echo "  Database: postgres:${POSTGRES_PORT:-5432}"
echo "  Backend:  http://localhost:${BACKEND_PORT:-3000}"
echo "  Frontend: http://localhost:${FRONTEND_PORT:-80}"
echo ""

# Ask for confirmation
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Stop existing containers
echo -e "\n${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Build images
echo -e "\n${YELLOW}🔨 Building Docker images...${NC}"
docker-compose build --no-cache

# Start services
echo -e "\n${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "\n${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 5

# Check service status
echo -e "\n${BLUE}📊 Service Status:${NC}"
docker-compose ps

# Show logs
echo -e "\n${BLUE}📝 Recent Logs:${NC}"
docker-compose logs --tail=20

echo -e "\n${GREEN}✅ Deployment completed!${NC}"
echo -e "\n${GREEN}🌐 Access your application:${NC}"
echo "  Frontend: http://localhost:${FRONTEND_PORT:-80}"
echo "  Backend:  http://localhost:${BACKEND_PORT:-3000}"
echo "  Health:   http://localhost:${BACKEND_PORT:-3000}/health"

echo -e "\n${GREEN}📝 Useful Docker commands:${NC}"
echo "  docker-compose ps              - View service status"
echo "  docker-compose logs -f         - Follow all logs"
echo "  docker-compose logs -f backend - Follow backend logs"
echo "  docker-compose restart         - Restart all services"
echo "  docker-compose stop            - Stop all services"
echo "  docker-compose down            - Stop and remove containers"
echo "  docker-compose down -v         - Stop and remove containers + volumes"

echo -e "\n${YELLOW}💡 Tip: Run 'docker-compose logs -f' to monitor logs${NC}"

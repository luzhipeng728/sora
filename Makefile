.PHONY: help docker-build docker-up docker-down docker-logs docker-restart docker-clean pm2-deploy pm2-start pm2-stop pm2-logs pm2-restart dev-backend dev-frontend dev

# Default target
.DEFAULT_GOAL := help

# Colors
YELLOW := \033[1;33m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m

help: ## Show this help message
	@echo "$(GREEN)Sora Video Platform - Available Commands$(NC)"
	@echo "============================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

## Docker Commands

docker-build: ## Build Docker images
	@echo "$(YELLOW)Building Docker images...$(NC)"
	docker-compose build

docker-up: ## Start Docker containers
	@echo "$(YELLOW)Starting Docker containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Containers started!$(NC)"
	@echo "Frontend: http://localhost:80"
	@echo "Backend:  http://localhost:3000"

docker-down: ## Stop Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Containers stopped!$(NC)"

docker-logs: ## View Docker logs
	docker-compose logs -f

docker-restart: ## Restart Docker containers
	@echo "$(YELLOW)Restarting Docker containers...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Containers restarted!$(NC)"

docker-ps: ## Show Docker container status
	docker-compose ps

docker-clean: ## Remove Docker containers and volumes
	@echo "$(RED)⚠️  This will remove all containers and volumes!$(NC)"
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)✅ Cleanup complete!$(NC)"; \
	fi

docker-deploy: ## Full Docker deployment (build + up)
	./docker-start.sh

## PM2 Commands

pm2-deploy: ## Deploy with PM2 (production)
	@echo "$(YELLOW)Deploying with PM2...$(NC)"
	./deploy.sh

pm2-start: ## Start PM2 services
	pm2 start ecosystem.config.js

pm2-stop: ## Stop PM2 services
	pm2 stop all

pm2-restart: ## Restart PM2 services
	pm2 restart all

pm2-logs: ## View PM2 logs
	pm2 logs

pm2-status: ## Show PM2 status
	pm2 status

pm2-monit: ## Monitor PM2 processes
	pm2 monit

## Development Commands

dev-backend: ## Start backend in dev mode
	cd backend && yarn dev

dev-frontend: ## Start frontend in dev mode
	cd frontend && yarn dev

dev: ## Start both backend and frontend in dev mode (requires tmux or run in separate terminals)
	@echo "$(YELLOW)Starting development servers...$(NC)"
	@echo "Run these commands in separate terminals:"
	@echo "  Terminal 1: make dev-backend"
	@echo "  Terminal 2: make dev-frontend"

## Database Commands

db-migrate: ## Run database migrations
	cd backend && npx prisma migrate deploy

db-studio: ## Open Prisma Studio
	cd backend && npx prisma studio

db-reset: ## Reset database (⚠️ destroys all data)
	@echo "$(RED)⚠️  This will destroy all database data!$(NC)"
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cd backend && npx prisma migrate reset; \
		echo "$(GREEN)✅ Database reset complete!$(NC)"; \
	fi

## Build Commands

build-backend: ## Build backend
	cd backend && yarn build

build-frontend: ## Build frontend
	cd frontend && yarn build

build: build-backend build-frontend ## Build both backend and frontend

## Install Commands

install-backend: ## Install backend dependencies
	cd backend && yarn install

install-frontend: ## Install frontend dependencies
	cd frontend && yarn install

install: install-backend install-frontend ## Install all dependencies

## Utility Commands

clean: ## Clean build artifacts and node_modules
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf backend/dist backend/node_modules
	rm -rf frontend/dist frontend/node_modules
	@echo "$(GREEN)✅ Cleanup complete!$(NC)"

setup: ## Initial project setup
	@echo "$(GREEN)Setting up Sora Video Platform...$(NC)"
	@echo ""
	@echo "1. Installing dependencies..."
	$(MAKE) install
	@echo ""
	@echo "2. Setting up environment files..."
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env 2>/dev/null || true; fi
	@if [ ! -f frontend/.env ]; then cp frontend/.env.example frontend/.env 2>/dev/null || true; fi
	@echo ""
	@echo "$(GREEN)✅ Setup complete!$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Edit .env files with your configuration"
	@echo "  2. Run: make db-migrate"
	@echo "  3. Run: make docker-up (or make dev)"

logs: ## View all logs (alias for docker-logs)
	$(MAKE) docker-logs

status: ## Show service status
	@echo "$(YELLOW)Checking service status...$(NC)"
	@if [ -f /.dockerenv ]; then \
		docker-compose ps; \
	else \
		pm2 status 2>/dev/null || echo "PM2 not running"; \
	fi

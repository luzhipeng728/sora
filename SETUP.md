# Sora Video Generation Platform - Setup Guide

Complete setup instructions to get the platform running locally.

## 🎯 Quick Start (5 minutes)

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git (for version control)

### Step 1: Database Setup

Create the PostgreSQL database:

```bash
# Create database
createdb sora_db

# Or using psql
psql -U postgres
CREATE DATABASE sora_db;
\q
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# The .env file is already created with default values
# Edit if needed:
# - DATABASE_URL (if using different postgres credentials)
# - JWT_SECRET (change in production!)

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

Backend will run on **http://localhost:3000**

### Step 3: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# The .env file is already created
# Start frontend dev server
npm run dev
```

Frontend will run on **http://localhost:5173**

### Step 4: Open Browser

Navigate to **http://localhost:5173**

You should see the login/register page!

---

## 📖 Detailed Setup

### Database Configuration

#### Option 1: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Default connection (already in backend/.env):
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sora_db?schema=public"
```

#### Option 2: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name sora-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sora_db \
  -p 5432:5432 \
  -d postgres:15

# Then use the same DATABASE_URL as Option 1
```

#### Option 3: Cloud Database (Supabase, Railway, etc.)

1. Create a PostgreSQL database on your platform
2. Copy the connection string
3. Update `backend/.env`:
   ```env
   DATABASE_URL="your-cloud-database-url"
   ```

### Backend Configuration

The `backend/.env` file is pre-configured with:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sora_db?schema=public"
JWT_SECRET="sora-video-platform-super-secret-jwt-key-change-in-production-min-32-chars"
SORA_API_URL="http://172.93.101.237:9800/sora/v1/chat/completions"
SORA_API_TOKEN="31243dca-83b9-44dd-8181-6162430ae845"
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

**⚠️ IMPORTANT for Production:**
- Change `JWT_SECRET` to a strong random string (32+ characters)
- Use HTTPS for production deployments
- Store API tokens securely (environment variables, not in code)

### Running Migrations

```bash
cd backend

# Create and run migration
npm run migrate

# View database in Prisma Studio
npm run prisma:studio
# Opens http://localhost:5555
```

### Verifying Setup

#### Check Backend:

```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

#### Check Frontend:

Open http://localhost:5173 in your browser. You should see the login page.

---

## 🧪 Testing the Platform

### 1. Create an Account

1. Go to http://localhost:5173
2. Click "Sign up"
3. Enter:
   - Email: test@example.com
   - Username: testuser
   - Password: password123
4. Click "Sign Up"

You'll be automatically logged in and redirected to video creation page.

### 2. Generate a Video

1. Enter a prompt: `"A cat playing piano in a jazz club"`
2. Select orientation: Portrait or Landscape
3. Click "Generate Video"
4. Watch real-time progress updates (⌛️ → 🏃 36% → 99% → ✅)

**Note:** Video generation takes 2-5 minutes depending on the API.

### 3. View Your Videos

1. Click your profile or navigate to `/profile`
2. See all generated videos in a grid
3. Click any video to play it
4. Videos are paginated (20 per page)

---

## 🔧 Troubleshooting

### Backend Issues

#### "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# If not running:
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Docker:
docker start sora-postgres
```

#### "PORT 3000 is already in use"

**Solution:**
Change port in `backend/.env`:
```env
PORT=3001
```

Also update `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

#### "Prisma Client not generated"

**Solution:**
```bash
cd backend
npm run prisma:generate
```

### Frontend Issues

#### "Network Error" or "Failed to fetch"

**Causes:**
1. Backend not running
2. Wrong API URL
3. CORS issues

**Solutions:**
```bash
# 1. Ensure backend is running
cd backend
npm run dev

# 2. Check frontend/.env
cat frontend/.env
# Should show: VITE_API_URL=http://localhost:3000

# 3. Check backend CORS (backend/src/middleware/cors.ts)
# frontendUrl should match your frontend URL
```

#### "Module not found" errors

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Video Generation Issues

#### "invite_full" error

This means the Sora API invitation code has reached its limit. The error will be displayed in the UI. This is an external API limitation.

#### Progress stuck at certain percentage

The external API may be experiencing issues. Wait a few minutes or try again.

#### SSE connection drops

**Solution:**
- Check network connection
- Ensure backend is running
- Check browser console for errors
- Try refreshing the page

---

## 📁 Project Structure Reference

```
sora/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── api/         # Auth & Video endpoints
│   │   ├── models/      # User, Video, VideoJob
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth, CORS, validation
│   │   └── db/          # Prisma client
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env             # ✅ Already created
│   └── package.json
│
├── frontend/            # React app
│   ├── src/
│   │   ├── components/  # Reusable UI
│   │   ├── pages/       # Routes
│   │   ├── services/    # API clients
│   │   ├── stores/      # State management
│   │   └── styles/      # CSS
│   ├── .env             # ✅ Already created
│   └── package.json
│
├── shared/
│   └── types/           # TypeScript types
│
└── README.md            # Main documentation
```

---

## 🚀 Deployment

### Backend Deployment (Railway, Render, etc.)

1. Push code to GitHub
2. Connect to deployment platform
3. Set environment variables:
   ```
   DATABASE_URL=<production-db-url>
   JWT_SECRET=<strong-random-string>
   SORA_API_URL=http://172.93.101.237:9800/sora/v1/chat/completions
   SORA_API_TOKEN=31243dca-83b9-44dd-8181-6162430ae845
   FRONTEND_URL=<your-frontend-url>
   NODE_ENV=production
   ```
4. Run build command: `npm run build`
5. Start command: `npm start`
6. Run migrations: `npm run migrate:deploy`

### Frontend Deployment (Vercel, Netlify)

1. Push code to GitHub
2. Connect to deployment platform
3. Set build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `frontend`
4. Set environment variable:
   ```
   VITE_API_URL=<your-backend-url>
   ```
5. Deploy!

---

## 📊 Database Schema

### Users Table
- id, email (unique), passwordHash
- username, avatarUrl
- createdAt, updatedAt

### Videos Table
- id, userId, prompt, orientation
- videoUrl, thumbnailUrl, modelUsed
- status, duration, metadata
- createdAt, updatedAt

### VideoJobs Table
- id, userId, prompt, orientation
- status (pending → processing → completed/failed)
- progress (0-100)
- videoId (links to completed video)
- createdAt, updatedAt, completedAt

---

## 🎨 Key Features

✅ User registration & authentication (JWT)
✅ Video generation with text prompts
✅ Real-time progress (Server-Sent Events)
✅ Portrait (default) & landscape orientation
✅ Video gallery with pagination
✅ Video playback modal
✅ Secure API design (token server-side only)
✅ Responsive dark theme UI

---

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Verify all prerequisites are installed
3. Check browser console for errors
4. Check backend logs for API errors
5. Ensure database is accessible

---

## ✅ Success Checklist

- [ ] PostgreSQL database created
- [ ] Backend dependencies installed
- [ ] Prisma client generated
- [ ] Database migrations run
- [ ] Backend server running on port 3000
- [ ] Frontend dependencies installed
- [ ] Frontend server running on port 5173
- [ ] Can access login page at localhost:5173
- [ ] Can register a new account
- [ ] Can create a video generation job
- [ ] Can see real-time progress updates
- [ ] Can view generated videos in profile

**All checked?** You're ready to start generating videos! 🎉

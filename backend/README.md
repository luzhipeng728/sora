# Sora Video Generation Platform - Backend

RESTful API backend for the Sora video generation platform with streaming support.

## Features

- ✅ User authentication (register, login, JWT)
- ✅ Video generation job management
- ✅ Server-Sent Events (SSE) for real-time progress updates
- ✅ PostgreSQL database with Prisma ORM
- ✅ Type-safe API with TypeScript
- ✅ Secure password hashing with bcrypt
- ✅ Video orientation support (portrait/landscape)

## Prerequisites

- Node.js 18+ or compatible version
- PostgreSQL database
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sora_db"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
SORA_API_URL="http://172.93.101.237:9800/sora/v1/chat/completions"
SORA_API_TOKEN="31243dca-83b9-44dd-8181-6162430ae845"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Setup

Generate Prisma client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Videos

- `GET /api/videos` - Get user's videos (with pagination)
- `POST /api/videos` - Create video generation job
- `GET /api/videos/:videoId` - Get video details
- `GET /api/videos/jobs/:jobId` - Get job status
- `GET /api/videos/jobs/:jobId/stream` - SSE stream for progress updates

### Health Check

- `GET /health` - Server health check

## Database Schema

- **users** - User accounts with authentication
- **videos** - Generated video records
- **video_jobs** - Video generation job tracking

## Architecture

```
backend/
├── src/
│   ├── api/          # API route handlers
│   ├── models/       # Data models (User, Video, VideoJob)
│   ├── services/     # Business logic (Auth, VideoGeneration)
│   ├── middleware/   # Express middleware (auth, CORS, validation)
│   ├── db/           # Database client
│   ├── config.ts     # Environment configuration
│   └── index.ts      # Express app entry point
├── prisma/
│   └── schema.prisma # Database schema
└── tests/
    ├── contract/     # API contract tests
    ├── integration/  # Integration tests
    └── unit/         # Unit tests
```

## Development

### Running Tests

```bash
npm test
```

### Database Migrations

Create a new migration:

```bash
npx prisma migrate dev --name migration_name
```

Reset database:

```bash
npx prisma migrate reset
```

### Debugging

Enable query logging by setting in `.env`:

```env
NODE_ENV=development
```

This will log all database queries to the console.

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens for authentication (7-day expiration)
- CORS configured for frontend origin only
- API token for Sora API stored server-side only
- Input validation with Zod schemas

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Run migrations on production database:
   ```bash
   npm run migrate:deploy
   ```

3. Start production server:
   ```bash
   npm start
   ```

## Troubleshooting

### Database Connection Error

Ensure PostgreSQL is running and `DATABASE_URL` is correct.

### JWT Secret Error

Make sure `JWT_SECRET` is at least 32 characters long.

### CORS Error

Check that `FRONTEND_URL` matches your frontend development URL.

## License

MIT

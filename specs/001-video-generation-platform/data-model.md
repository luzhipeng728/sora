# Data Model: Video Generation Platform

## Entities

### User
Represents a registered user account.

**Fields**:
- `id`: UUID (primary key)
- `email`: String (unique, required, validated)
- `passwordHash`: String (bcrypt hashed, required)
- `username`: String (optional, display name)
- `avatarUrl`: String (optional, URL to profile image)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**Relationships**:
- One-to-Many with Video (user can have multiple videos)
- One-to-Many with VideoJob (user can have multiple generation jobs)

**Validation Rules**:
- Email must be valid format and unique
- Password minimum 8 characters, must be hashed with bcrypt
- Username max 50 characters if provided

**Indexes**:
- Unique index on `email`
- Index on `createdAt` for user metrics

---

### Video
Represents a successfully generated video.

**Fields**:
- `id`: UUID (primary key)
- `userId`: UUID (foreign key → User, required)
- `prompt`: Text (required, user's input prompt)
- `orientation`: Enum('portrait', 'landscape') (required)
- `modelUsed`: String (e.g., 'sora_video2-hd-portrait')
- `videoUrl`: String (required, URL from API response)
- `thumbnailUrl`: String (optional, extracted or generated)
- `duration`: Integer (optional, seconds)
- `status`: Enum('completed', 'failed') (default: 'completed')
- `metadata`: JSON (optional, stores API response data)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**Relationships**:
- Many-to-One with User (video belongs to one user)
- One-to-One with VideoJob (video created from one job)

**Validation Rules**:
- Prompt minimum 1 character, max 1000 characters
- Orientation must be 'portrait' or 'landscape'
- VideoUrl must be valid URL format
- Status can only be 'completed' or 'failed'

**Indexes**:
- Index on `userId` for querying user's videos
- Index on `createdAt` for chronological sorting
- Composite index on `(userId, createdAt)` for pagination

---

### VideoJob
Represents a video generation request/job (in progress or completed).

**Fields**:
- `id`: UUID (primary key)
- `userId`: UUID (foreign key → User, required)
- `prompt`: Text (required)
- `orientation`: Enum('portrait', 'landscape') (required)
- `status`: Enum('pending', 'processing', 'completed', 'failed') (default: 'pending')
- `progress`: Integer (0-100, default: 0)
- `errorMessage`: Text (optional, if failed)
- `externalJobId`: String (optional, ID from Sora API if provided)
- `videoId`: UUID (foreign key → Video, optional, set when completed)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `completedAt`: Timestamp (optional)

**Relationships**:
- Many-to-One with User (job belongs to one user)
- One-to-One with Video (job creates one video when successful)

**Validation Rules**:
- Status must be one of: pending, processing, completed, failed
- Progress must be 0-100
- CompletedAt only set when status is 'completed' or 'failed'

**State Transitions**:
```
pending → processing → completed → (creates Video)
                    ↓
                  failed
```

**Indexes**:
- Index on `userId` for querying user's jobs
- Index on `status` for finding active jobs
- Composite index on `(userId, status, createdAt)` for filtering user's active jobs

---

## Relationships Diagram

```
User (1) ─────< (N) Video
  │
  └─────< (N) VideoJob ────> (1) Video
                            (when completed)
```

## Database Schema (PostgreSQL)

```sql
CREATE TYPE orientation_type AS ENUM ('portrait', 'landscape');
CREATE TYPE video_status_type AS ENUM ('completed', 'failed');
CREATE TYPE job_status_type AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  orientation orientation_type NOT NULL,
  model_used VARCHAR(100),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  status video_status_type DEFAULT 'completed',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_created_at ON videos(created_at);
CREATE INDEX idx_videos_user_created ON videos(user_id, created_at);

CREATE TABLE video_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  orientation orientation_type NOT NULL,
  status job_status_type DEFAULT 'pending',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  external_job_id VARCHAR(255),
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_jobs_user_id ON video_jobs(user_id);
CREATE INDEX idx_jobs_status ON video_jobs(status);
CREATE INDEX idx_jobs_user_status_created ON video_jobs(user_id, status, created_at);
```

## ORM Models (Prisma Schema Example)

```prisma
model User {
  id           String      @id @default(uuid())
  email        String      @unique
  passwordHash String      @map("password_hash")
  username     String?
  avatarUrl    String?     @map("avatar_url")
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")

  videos       Video[]
  videoJobs    VideoJob[]

  @@index([email])
  @@index([createdAt])
  @@map("users")
}

model Video {
  id           String          @id @default(uuid())
  userId       String          @map("user_id")
  prompt       String
  orientation  OrientationType
  modelUsed    String?         @map("model_used")
  videoUrl     String          @map("video_url")
  thumbnailUrl String?         @map("thumbnail_url")
  duration     Int?
  status       VideoStatus     @default(completed)
  metadata     Json?
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")

  user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  videoJob     VideoJob?

  @@index([userId])
  @@index([createdAt])
  @@index([userId, createdAt])
  @@map("videos")
}

model VideoJob {
  id            String         @id @default(uuid())
  userId        String         @map("user_id")
  prompt        String
  orientation   OrientationType
  status        JobStatus      @default(pending)
  progress      Int            @default(0)
  errorMessage  String?        @map("error_message")
  externalJobId String?        @map("external_job_id")
  videoId       String?        @unique @map("video_id")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")
  completedAt   DateTime?      @map("completed_at")

  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  video         Video?         @relation(fields: [videoId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([status])
  @@index([userId, status, createdAt])
  @@map("video_jobs")
}

enum OrientationType {
  portrait
  landscape
}

enum VideoStatus {
  completed
  failed
}

enum JobStatus {
  pending
  processing
  completed
  failed
}
```

## Data Access Patterns

### User Registration
1. Validate email uniqueness
2. Hash password with bcrypt
3. Create User record
4. Return user (without password hash)

### User Login
1. Find user by email
2. Compare password with bcrypt
3. Generate JWT token
4. Return token + user info

### Create Video Generation Job
1. Validate user is authenticated
2. Create VideoJob (status: pending, progress: 0)
3. Return job ID immediately
4. Trigger async worker to process job

### Stream Video Generation Progress
1. Find VideoJob by ID and verify ownership
2. Open SSE connection
3. Update VideoJob.progress as streaming updates arrive
4. When complete: create Video record, update VideoJob.status
5. Close SSE connection

### Get User's Videos
1. Query Videos where userId = current user
2. Order by createdAt DESC
3. Paginate (20 per page)
4. Return video list with metadata

### Get Active Jobs
1. Query VideoJobs where userId = current user AND status IN ('pending', 'processing')
2. Order by createdAt DESC
3. Return jobs with current progress

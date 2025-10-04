-- CreateEnum
CREATE TYPE "Orientation" AS ENUM ('portrait', 'landscape');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('completed', 'failed');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "username" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "orientation" "Orientation" NOT NULL,
    "model_used" TEXT,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration" INTEGER,
    "status" "VideoStatus" NOT NULL DEFAULT 'completed',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_jobs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "orientation" "Orientation" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "external_job_id" TEXT,
    "video_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "video_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "videos_user_id_idx" ON "videos"("user_id");

-- CreateIndex
CREATE INDEX "videos_created_at_idx" ON "videos"("created_at");

-- CreateIndex
CREATE INDEX "videos_user_id_created_at_idx" ON "videos"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "video_jobs_video_id_key" ON "video_jobs"("video_id");

-- CreateIndex
CREATE INDEX "video_jobs_user_id_idx" ON "video_jobs"("user_id");

-- CreateIndex
CREATE INDEX "video_jobs_status_idx" ON "video_jobs"("status");

-- CreateIndex
CREATE INDEX "video_jobs_user_id_status_created_at_idx" ON "video_jobs"("user_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_jobs" ADD CONSTRAINT "video_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_jobs" ADD CONSTRAINT "video_jobs_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

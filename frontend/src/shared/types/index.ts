// Shared TypeScript types for Sora Video Generation Platform

export type OrientationType = 'portrait' | 'landscape';
export type VideoStatus = 'completed' | 'failed';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// User Entity
export interface User {
  id: string;
  email: string;
  username?: string | null;
  avatarUrl?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Video Entity
export interface Video {
  id: string;
  userId: string;
  prompt: string;
  orientation: OrientationType;
  modelUsed?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  status: VideoStatus;
  metadata?: Record<string, any> | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// VideoJob Entity
export interface VideoJob {
  id: string;
  userId: string;
  prompt: string;
  orientation: OrientationType;
  status: JobStatus;
  progress: number;
  errorMessage?: string | null;
  externalJobId?: string | null;
  videoId?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  completedAt?: Date | string | null;
}

// API Request/Response Types

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Videos
export interface CreateVideoRequest {
  prompt: string;
  orientation?: OrientationType;
}

export interface CreateVideoResponse {
  job: VideoJob;
  streamUrl: string;
}

export interface GetVideosParams {
  page?: number;
  limit?: number;
  status?: VideoStatus;
}

export interface PaginatedVideosResponse {
  videos: Video[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// SSE Event Types
export interface SSEProgressEvent {
  progress: number;
  status: JobStatus;
}

export interface SSECompleteEvent {
  videoId: string;
  videoUrl: string;
}

export interface SSEErrorEvent {
  error: string;
}

// API Error Response
export interface APIError {
  error: string;
  code?: string;
}

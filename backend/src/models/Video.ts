import { prisma } from '../db/client';
import type { Video, Orientation, VideoStatus, Prisma } from '@prisma/client';

export interface CreateVideoData {
  userId: string;
  prompt: string;
  orientation: Orientation;
  modelUsed?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  status?: VideoStatus;
  metadata?: Prisma.JsonValue;
}

export interface VideoPaginationOptions {
  page?: number;
  limit?: number;
  status?: VideoStatus;
}

export interface PaginatedVideos {
  videos: Video[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class VideoModel {
  /**
   * Create a new video
   */
  static async create(data: CreateVideoData): Promise<Video> {
    // Validate prompt
    if (!data.prompt || data.prompt.length < 1 || data.prompt.length > 1000) {
      throw new Error('Prompt must be between 1 and 1000 characters');
    }

    // Validate orientation
    if (!['portrait', 'landscape'].includes(data.orientation)) {
      throw new Error('Orientation must be either portrait or landscape');
    }

    // Validate video URL
    if (!data.videoUrl || !this.isValidUrl(data.videoUrl)) {
      throw new Error('Invalid video URL');
    }

    return prisma.video.create({
      data: {
        userId: data.userId,
        prompt: data.prompt,
        orientation: data.orientation,
        modelUsed: data.modelUsed,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration,
        status: data.status || 'completed',
        metadata: data.metadata,
      },
    });
  }

  /**
   * Find video by ID
   */
  static async findById(id: string): Promise<Video | null> {
    return prisma.video.findUnique({
      where: { id },
    });
  }

  /**
   * Find videos by user ID with pagination
   */
  static async findByUserId(
    userId: string,
    options: VideoPaginationOptions = {}
  ): Promise<PaginatedVideos> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const where: Prisma.VideoWhereInput = {
      userId,
      ...(options.status && { status: options.status }),
    };

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update video
   */
  static async update(
    id: string,
    data: Partial<Omit<CreateVideoData, 'userId'>>
  ): Promise<Video> {
    return prisma.video.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete video
   */
  static async delete(id: string): Promise<void> {
    await prisma.video.delete({
      where: { id },
    });
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export default VideoModel;

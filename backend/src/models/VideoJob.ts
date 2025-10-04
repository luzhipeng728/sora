import { prisma } from '../db/client';
import type { VideoJob, Orientation, JobStatus } from '@prisma/client';

export interface CreateJobData {
  userId: string;
  prompt: string;
  orientation: Orientation;
}

export class VideoJobModel {
  /**
   * Create a new video generation job
   */
  static async create(data: CreateJobData): Promise<VideoJob> {
    return prisma.videoJob.create({
      data: {
        userId: data.userId,
        prompt: data.prompt,
        orientation: data.orientation,
        status: 'pending',
        progress: 0,
      },
    });
  }

  /**
   * Find job by ID
   */
  static async findById(id: string): Promise<VideoJob | null> {
    return prisma.videoJob.findUnique({
      where: { id },
      include: {
        video: true,
      },
    });
  }

  /**
   * Find jobs by user ID
   */
  static async findByUserId(userId: string, status?: JobStatus): Promise<VideoJob[]> {
    return prisma.videoJob.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        video: true,
      },
    });
  }

  /**
   * Update job progress
   */
  static async updateProgress(id: string, progress: number): Promise<VideoJob> {
    // Validate progress is between 0-100
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    return prisma.videoJob.update({
      where: { id },
      data: {
        progress,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update job status with state transition validation
   */
  static async updateStatus(
    id: string,
    status: JobStatus,
    errorMessage?: string
  ): Promise<VideoJob> {
    const job = await this.findById(id);
    if (!job) {
      throw new Error('Job not found');
    }

    // Validate state transitions
    this.validateStateTransition(job.status, status);

    const updateData: {
      status: JobStatus;
      errorMessage?: string | null;
      completedAt?: Date;
      updatedAt: Date;
    } = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date();
    }

    if (status === 'failed' && errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    return prisma.videoJob.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Link job to completed video
   */
  static async linkVideo(jobId: string, videoId: string): Promise<VideoJob> {
    return prisma.videoJob.update({
      where: { id: jobId },
      data: {
        videoId,
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Mark job as processing
   */
  static async markProcessing(id: string, externalJobId?: string): Promise<VideoJob> {
    return prisma.videoJob.update({
      where: { id },
      data: {
        status: 'processing',
        externalJobId,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Mark job as failed
   */
  static async markFailed(id: string, errorMessage: string): Promise<VideoJob> {
    return this.updateStatus(id, 'failed', errorMessage);
  }

  /**
   * Validate state transitions
   * pending → processing → completed
   *                     ↓
   *                   failed
   */
  private static validateStateTransition(currentStatus: JobStatus, newStatus: JobStatus): void {
    const validTransitions: Record<JobStatus, JobStatus[]> = {
      pending: ['processing', 'failed'],
      processing: ['completed', 'failed'],
      completed: [], // Terminal state
      failed: [], // Terminal state
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `Invalid state transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  /**
   * Get active jobs (pending or processing)
   */
  static async getActiveJobs(userId: string): Promise<VideoJob[]> {
    return prisma.videoJob.findMany({
      where: {
        userId,
        status: {
          in: ['pending', 'processing'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Clean up stuck jobs from server restarts
   * Marks jobs stuck in 'processing' state as failed
   */
  static async cleanupStuckJobs(): Promise<{ count: number }> {
    // Find jobs that were processing but server was restarted
    // Jobs stuck for more than 5 minutes are considered failed
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const result = await prisma.videoJob.updateMany({
      where: {
        status: 'processing',
        updatedAt: {
          lt: fiveMinutesAgo,
        },
      },
      data: {
        status: 'failed',
        errorMessage: 'Job was interrupted by server restart',
        completedAt: new Date(),
      },
    });

    return { count: result.count };
  }

  /**
   * Clean up old completed/failed jobs (optional maintenance)
   */
  static async cleanupOldJobs(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.videoJob.deleteMany({
      where: {
        status: {
          in: ['completed', 'failed'],
        },
        completedAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

export default VideoJobModel;

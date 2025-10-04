import { Router, Request, Response } from 'express';
import { VideoModel } from '../models/Video';
import { VideoJobModel } from '../models/VideoJob';
import { VideoGenerationService } from '../services/VideoGenerationService';
import { authMiddleware } from '../middleware/auth';
import { validate, createVideoSchema } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/videos
 * Get user's videos with pagination
 */
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as 'completed' | 'failed' | undefined;

    const result = await VideoModel.findByUserId(userId, { page, limit, status });

    res.status(200).json(result);
  })
);

/**
 * POST /api/videos
 * Create a new video generation job and start processing in background
 */
router.post(
  '/',
  authMiddleware,
  validate(createVideoSchema),
  asyncHandler(async (req, res) => {
    const userId = req.userId!;
    const { prompt, orientation } = req.body;

    console.log(`[API] POST /api/videos - User: ${userId}, Prompt: "${prompt}", Orientation: ${orientation}`);

    // Create job
    const job = await VideoGenerationService.createJob(userId, prompt, orientation);

    console.log(`[API] Job created: ${job.id}`);

    // Start background processing (fire and forget)
    VideoGenerationService.startBackgroundProcessing(job.id).catch((error) => {
      console.error(`[API] Background processing failed for job ${job.id}:`, error);
    });

    // Return immediately
    res.status(202).json({
      job,
      message: 'Video generation started',
    });
  })
);

/**
 * GET /api/videos/jobs
 * Get user's active jobs (pending or processing)
 */
router.get(
  '/jobs',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.userId!;

    console.log(`[API] GET /api/videos/jobs - User: ${userId}`);

    const jobs = await VideoJobModel.getActiveJobs(userId);

    console.log(`[API] Found ${jobs.length} active jobs for user ${userId}`);

    res.status(200).json(jobs);
  })
);

/**
 * GET /api/videos/jobs/:jobId
 * Get video job status and progress (for polling)
 */
router.get(
  '/jobs/:jobId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.userId!;
    const { jobId } = req.params;

    console.log(`[API] GET /api/videos/jobs/${jobId} - User: ${userId}`);

    const job = await VideoJobModel.findById(jobId);

    if (!job) {
      res.status(404).json({
        error: 'Job not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    // Check ownership
    if (job.userId !== userId) {
      res.status(403).json({
        error: 'You do not have permission to access this job',
        code: 'FORBIDDEN',
      });
      return;
    }

    console.log(`[API] Job ${jobId} status: ${job.status}, progress: ${job.progress}%`);

    res.status(200).json(job);
  })
);

/**
 * GET /api/videos/:videoId
 * Get specific video details
 */
router.get(
  '/:videoId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.userId!;
    const { videoId } = req.params;

    const video = await VideoModel.findById(videoId);

    if (!video) {
      res.status(404).json({
        error: 'Video not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    // Check ownership
    if (video.userId !== userId) {
      res.status(403).json({
        error: 'You do not have permission to access this video',
        code: 'FORBIDDEN',
      });
      return;
    }

    res.status(200).json(video);
  })
);

export default router;

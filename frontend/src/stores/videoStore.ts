import { create } from 'zustand';
import { VideoService } from '../services/videoService';
import { AuthService } from '../services/authService';
import type {
  Video,
  VideoJob,
  CreateVideoRequest,
  GetVideosParams,
  OrientationType,
} from '../../../shared/types';

interface ActiveJob {
  job: VideoJob;
  progress: number;
  cleanup?: () => void;
}

interface VideoState {
  videos: Video[];
  currentVideo: Video | null;
  activeJobs: Map<string, ActiveJob>; // jobId -> ActiveJob
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  createVideo: (prompt: string, orientation?: OrientationType) => Promise<VideoJob>;
  fetchVideos: (params?: GetVideosParams) => Promise<void>;
  fetchVideo: (videoId: string) => Promise<void>;
  addActiveJob: (job: VideoJob) => void;
  startPolling: (jobId: string) => void;
  updateJobProgress: (jobId: string, progress: number) => void;
  completeJob: (jobId: string, videoId: string, videoUrl: string) => void;
  failJob: (jobId: string, error: string) => void;
  setJobCleanup: (jobId: string, cleanup: () => void) => void;
  removeJob: (jobId: string) => void;
  setCurrentVideo: (video: Video | null) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videos: [],
  currentVideo: null,
  activeJobs: new Map(),
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  createVideo: async (prompt: string, orientation: OrientationType = 'portrait') => {
    set({ error: null });
    try {
      const data: CreateVideoRequest = { prompt, orientation };
      const response = await VideoService.createVideo(data);

      // Add to active jobs
      get().addActiveJob(response.job);

      // Start polling for this job
      get().startPolling(response.job.id);

      return response.job;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create video',
      });
      throw error;
    }
  },

  startPolling: (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const token = AuthService.getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/videos/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          clearInterval(pollInterval);
          return;
        }

        const job: VideoJob = await response.json();
        const activeJob = get().activeJobs.get(jobId);

        if (!activeJob) {
          clearInterval(pollInterval);
          return;
        }

        // Update progress
        if (job.progress !== activeJob.progress) {
          get().updateJobProgress(jobId, job.progress);
        }

        // Handle completion
        if (job.status === 'completed' && job.videoId) {
          clearInterval(pollInterval);

          // Fetch the video to get the videoUrl
          const token = AuthService.getToken();
          const videoResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/videos/${job.videoId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (videoResponse.ok) {
            const video = await videoResponse.json();
            get().completeJob(jobId, video.id, video.videoUrl);
          }
        }

        // Handle failure
        if (job.status === 'failed') {
          clearInterval(pollInterval);
          get().failJob(jobId, job.errorMessage || 'Video generation failed');
        }
      } catch (error) {
        console.error(`Polling error for job ${jobId}:`, error);
      }
    }, 2000); // Poll every 2 seconds

    // Store cleanup function
    get().setJobCleanup(jobId, () => clearInterval(pollInterval));
  },

  addActiveJob: (job: VideoJob) => {
    set((state) => {
      const newActiveJobs = new Map(state.activeJobs);
      newActiveJobs.set(job.id, { job, progress: 0 });
      return { activeJobs: newActiveJobs };
    });
  },

  updateJobProgress: (jobId: string, progress: number) => {
    set((state) => {
      const newActiveJobs = new Map(state.activeJobs);
      const activeJob = newActiveJobs.get(jobId);
      if (activeJob) {
        newActiveJobs.set(jobId, { ...activeJob, progress });
      }
      return { activeJobs: newActiveJobs };
    });
  },

  completeJob: (jobId: string, videoId: string, videoUrl: string) => {
    const activeJob = get().activeJobs.get(jobId);
    if (!activeJob) return;

    // Create video object
    const newVideo: Video = {
      id: videoId,
      userId: '',
      prompt: activeJob.job.prompt,
      orientation: activeJob.job.orientation,
      modelUsed: '',
      videoUrl,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    // Clean up and remove job from activeJobs
    if (activeJob.cleanup) {
      activeJob.cleanup();
    }

    set((state) => {
      const newActiveJobs = new Map(state.activeJobs);
      // Remove completed job from activeJobs
      newActiveJobs.delete(jobId);

      return {
        activeJobs: newActiveJobs,
        videos: [newVideo, ...state.videos],
      };
    });
  },

  failJob: (jobId: string, error: string) => {
    set((state) => {
      const newActiveJobs = new Map(state.activeJobs);
      const activeJob = newActiveJobs.get(jobId);
      if (activeJob) {
        newActiveJobs.set(jobId, {
          ...activeJob,
          job: { ...activeJob.job, status: 'failed', errorMessage: error },
        });
      }
      return { activeJobs: newActiveJobs };
    });
  },

  setJobCleanup: (jobId: string, cleanup: () => void) => {
    set((state) => {
      const newActiveJobs = new Map(state.activeJobs);
      const activeJob = newActiveJobs.get(jobId);
      if (activeJob) {
        newActiveJobs.set(jobId, { ...activeJob, cleanup });
      }
      return { activeJobs: newActiveJobs };
    });
  },

  removeJob: (jobId: string) => {
    const activeJob = get().activeJobs.get(jobId);
    if (activeJob?.cleanup) {
      activeJob.cleanup();
    }

    set((state) => {
      const newActiveJobs = new Map(state.activeJobs);
      newActiveJobs.delete(jobId);
      return { activeJobs: newActiveJobs };
    });
  },

  fetchVideos: async (params?: GetVideosParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await VideoService.getVideos(params);
      set({
        videos: response.videos,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || 'Failed to fetch videos',
      });
    }
  },

  fetchVideo: async (videoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const video = await VideoService.getVideo(videoId);
      set({
        currentVideo: video,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || 'Failed to fetch video',
      });
    }
  },

  setCurrentVideo: (video: Video | null) => {
    set({ currentVideo: video });
  },

  setError: (error: string) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useVideoStore;

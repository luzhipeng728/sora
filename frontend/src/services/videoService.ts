import api from './api';
import type {
  CreateVideoRequest,
  CreateVideoResponse,
  PaginatedVideosResponse,
  Video,
  VideoJob,
  GetVideosParams,
} from '../../../shared/types';

export class VideoService {
  /**
   * Create a new video generation job
   */
  static async createVideo(data: CreateVideoRequest): Promise<CreateVideoResponse> {
    const response = await api.post<CreateVideoResponse>('/api/videos', data);
    return response.data;
  }

  /**
   * Get user's videos with pagination
   */
  static async getVideos(params: GetVideosParams = {}): Promise<PaginatedVideosResponse> {
    const response = await api.get<PaginatedVideosResponse>('/api/videos', {
      params,
    });
    return response.data;
  }

  /**
   * Get specific video by ID
   */
  static async getVideo(videoId: string): Promise<Video> {
    const response = await api.get<Video>(`/api/videos/${videoId}`);
    return response.data;
  }

  /**
   * Get job status
   */
  static async getJobStatus(jobId: string): Promise<VideoJob> {
    const response = await api.get<VideoJob>(`/api/videos/jobs/${jobId}`);
    return response.data;
  }
}

export default VideoService;

import fetch, { Response as FetchResponse } from 'node-fetch';
import { VideoJobModel } from '../models/VideoJob';
import { VideoModel } from '../models/Video';
import { config } from '../config';
import type { Orientation } from '@prisma/client';

interface SoraAPIMessage {
  role: string;
  content: string;
}

interface SoraAPIRequest {
  messages: SoraAPIMessage[];
  model: string;
  stream: boolean;
}

interface SoraStreamChunk {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class VideoGenerationService {
  /**
   * Create a new video generation job
   */
  static async createJob(
    userId: string,
    prompt: string,
    orientation: Orientation = 'portrait'
  ) {
    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 1000) {
      throw new Error('Prompt must be less than 1000 characters');
    }

    // Create job in database
    const job = await VideoJobModel.create({
      userId,
      prompt: prompt.trim(),
      orientation,
    });

    return job;
  }

  /**
   * Start background processing for a job
   * This method returns immediately and processes the stream in the background
   */
  static async startBackgroundProcessing(jobId: string): Promise<void> {
    console.log(`[Background] Starting processing for job ${jobId}`);

    // Process in background without blocking
    this.processJob(jobId).catch((error) => {
      console.error(`[Background] Job ${jobId} processing error:`, error);
    });
  }

  /**
   * Process a job (internal method)
   */
  private static async processJob(jobId: string): Promise<void> {
    try {
      const job = await VideoJobModel.findById(jobId);
      if (!job) {
        console.error(`[Background] Job ${jobId} not found`);
        return;
      }

      console.log(`[Background] Processing job ${jobId} - Prompt: "${job.prompt}"`);

      // Mark job as processing
      await VideoJobModel.markProcessing(jobId);

      // Determine which model to use based on orientation
      const model =
        job.orientation === 'portrait'
          ? 'sora_video2-hd-portrait-15s'
          : 'sora_video2-hd-landscape-15s';

      console.log(`[Background] Job ${jobId} using model: ${model}`);

      // Call Sora API with retry logic for 500/503 errors
      let response: FetchResponse;
      let retries = 0;
      const maxRetries = 5; // Retry up to 5 times for 500/503

      while (true) {
        console.log(`[Background] Job ${jobId} calling Sora API (attempt ${retries + 1}/${maxRetries + 1})`);

        response = await fetch(config.soraApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.soraApiToken}`,
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: job.prompt }],
            model,
            stream: true,
          } as SoraAPIRequest),
        });

        console.log(`[Background] Job ${jobId} API response status: ${response.status}`);

        // Retry on 500/503 errors
        if ((response.status === 500 || response.status === 503) && retries < maxRetries) {
          retries++;
          console.log(`[Background] Job ${jobId} API returned ${response.status}, retrying... (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          continue;
        }

        // Exit retry loop
        break;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body from API');
      }

      // Process streaming response
      let buffer = '';
      let videoUrl: string | null = null;

      const decoder = new TextDecoder();

      // Use async iterator for Node.js streams
      console.log(`[Background] Job ${jobId} Starting to read stream...`);
      try {
        for await (const chunk of response.body as any) {
          buffer += decoder.decode(chunk, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || line.trim() === 'data: [DONE]') {
              continue;
            }

            if (line.startsWith('data: ')) {
              try {
                const jsonData = line.slice(6);
                const data: SoraStreamChunk = JSON.parse(jsonData);

                if (data.choices && data.choices[0]?.delta?.content) {
                  const content = data.choices[0].delta.content;

                  // Extract progress from content
                  const progressMatch = content.match(/进度[：:]\s*(\d+(?:\.\d+)?)\s*%/);
                  if (progressMatch) {
                    const progress = Math.round(parseFloat(progressMatch[1]));
                    console.log(`[Background] Job ${jobId} Progress: ${progress}%`);
                    await VideoJobModel.updateProgress(jobId, progress);
                  }

                  // Extract video URL from completion message
                  const urlMatch = content.match(/\[点击这里\]\((https?:\/\/[^\)]+)\)/);
                  if (urlMatch) {
                    videoUrl = urlMatch[1];
                    console.log(`[Background] Job ${jobId} Video URL extracted: ${videoUrl}`);
                  }

                  // Check for success message
                  if (content.includes('✅') && content.includes('视频生成成功')) {
                    if (videoUrl) {
                      console.log(`[Background] Job ${jobId} Video generation successful`);
                      // Create video record
                      const video = await VideoModel.create({
                        userId: job.userId,
                        prompt: job.prompt,
                        orientation: job.orientation,
                        modelUsed: model,
                        videoUrl,
                        status: 'completed',
                      });

                      // Link job to video
                      await VideoJobModel.linkVideo(jobId, video.id);
                      console.log(`[Background] Job ${jobId} completed - Video ID: ${video.id}`);
                    }
                  }
                }

                // Check for finish_reason
                if (data.choices && data.choices[0]?.finish_reason === 'stop') {
                  if (videoUrl) {
                    console.log(`[Background] Job ${jobId} Stream finished with video URL`);
                    // Ensure video is created and linked
                    const video = await VideoModel.create({
                      userId: job.userId,
                      prompt: job.prompt,
                      orientation: job.orientation,
                      modelUsed: model,
                      videoUrl,
                      status: 'completed',
                    });

                    await VideoJobModel.linkVideo(jobId, video.id);
                    console.log(`[Background] Job ${jobId} completed - Video ID: ${video.id}`);
                  }
                  break;
                }
              } catch (parseError) {
                console.error(`[Background] Job ${jobId} Error parsing SSE data:`, parseError);
                // Continue processing other lines
              }
            }
          }
        }
        console.log(`[Background] Job ${jobId} Stream reading completed`);
      } catch (streamError: any) {
        console.error(`[Background] Job ${jobId} Stream reading error:`, streamError);
        throw new Error(`Stream reading failed: ${streamError.message}`);
      }

      // If we finished but no video was created, mark as failed
      const updatedJob = await VideoJobModel.findById(jobId);
      if (updatedJob && updatedJob.status !== 'completed') {
        console.log(`[Background] Job ${jobId} Stream finished but no video URL received`);
        await VideoJobModel.markFailed(jobId, 'Video generation completed but no video URL was received');
      }
    } catch (error: any) {
      console.error(`[Background] Job ${jobId} processing error:`, error);
      await VideoJobModel.markFailed(jobId, error.message);
    }
  }

  /**
   * Get job status
   */
  static async getJobStatus(jobId: string) {
    const job = await VideoJobModel.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }
}

export default VideoGenerationService;

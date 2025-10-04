import React from 'react';
import type { Video } from '../../../shared/types';

interface VideoCardProps {
  video: Video;
  onPlay?: (video: Video) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay }) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncatePrompt = (prompt: string, maxLength: number = 100) => {
    if (prompt.length <= maxLength) return prompt;
    return prompt.substring(0, maxLength) + '...';
  };

  return (
    <div className="video-card">
      <div className="video-thumbnail">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.prompt} />
        ) : (
          <div className="thumbnail-placeholder">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}
        <div className="video-overlay">
          <button
            className="play-button"
            onClick={() => onPlay?.(video)}
            aria-label="Play video"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        </div>
        <span className={`orientation-badge ${video.orientation}`}>
          {video.orientation === 'portrait' ? '📱' : '🖥️'}
          {video.orientation}
        </span>
      </div>
      <div className="video-info">
        <p className="video-prompt" title={video.prompt}>
          {truncatePrompt(video.prompt)}
        </p>
        <div className="video-meta">
          <span className="video-date">{formatDate(video.createdAt)}</span>
          {video.duration && (
            <span className="video-duration">{video.duration}s</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

import React, { useRef, useEffect } from 'react';
import type { Video } from '../shared/types';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onClose,
  autoPlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Auto-play failed:', error);
      });
    }
  }, [autoPlay]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="video-player-modal" onClick={handleBackdropClick}>
      <div className="video-player-container">
        <div className="video-player-header">
          <h3 className="video-player-title">{video.prompt}</h3>
          <button
            className="video-player-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="video-player-content">
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            className={`video-element ${video.orientation}`}
            poster={video.thumbnailUrl || undefined}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="video-player-info">
          <span className="orientation-indicator">
            {video.orientation === 'portrait' ? '📱 Portrait' : '🖥️ Landscape'}
          </span>
          {video.modelUsed && (
            <span className="model-indicator">Model: {video.modelUsed}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

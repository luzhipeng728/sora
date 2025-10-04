import React, { useState, useEffect, useRef } from 'react';
import { useVideoStore } from '../stores/videoStore';
import { useUserStore } from '../stores/userStore';
import { OrientationSelector } from '../components/OrientationSelector';
import type { OrientationType, Video } from '../shared/types';
import cameoData from '../data/composer_profiles.json';

interface CameoProfile {
  username: string;
  display_name: string | null;
  profile_picture_url: string;
  verified: boolean;
}

export const VideoCreationPage: React.FC = () => {
  const { user } = useUserStore();
  const {
    createVideo,
    activeJobs,
    videos,
    fetchVideos,
  } = useVideoStore();

  const [prompt, setPrompt] = useState('');
  const [orientation, setOrientation] = useState<OrientationType>('portrait');
  const [showCameos, setShowCameos] = useState(false);
  const [selectedCameos, setSelectedCameos] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const cameos: CameoProfile[] = cameoData.composer_profiles.map((p: any) => ({
    username: p.username,
    display_name: p.display_name,
    profile_picture_url: p.profile_picture_url,
    verified: p.verified,
  }));

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    return () => {
      activeJobs.forEach((activeJob) => {
        if (activeJob.cleanup) {
          activeJob.cleanup();
        }
      });
    };
  }, []);

  const handleInputFocus = () => {
    setShowCameos(true);
  };

  const handleCameoSelect = (username: string) => {
    if (selectedCameos.includes(username)) {
      setSelectedCameos(prev => prev.filter(u => u !== username));
    } else if (selectedCameos.length < 3) {
      setSelectedCameos(prev => [...prev, username]);

      const textarea = inputRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = prompt;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const tag = `@${username} `;

        setPrompt(before + tag + after);

        setTimeout(() => {
          const newPos = start + tag.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    try {
      await createVideo(prompt, orientation);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

      setPrompt('');
      setSelectedCameos([]);
    } catch (error: any) {
      console.error('Failed to create video:', error);
    }
  };

  // Combine active jobs and videos
  const allItems = [
    ...Array.from(activeJobs.values()).map(aj => ({
      id: aj.job.id,
      type: 'job' as const,
      job: aj.job,
      progress: aj.progress,
    })),
    ...videos.map(v => ({
      id: v.id,
      type: 'video' as const,
      video: v,
    })),
  ];

  return (
    <div className="simple-video-page">
      {/* Toast notification */}
      {showToast && (
        <div className="toast-notification">
          ✓ Added to queue
        </div>
      )}

      {/* Full screen video modal */}
      {selectedVideo && (
        <div className="video-modal-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedVideo(null)}>
              ×
            </button>

            <div className="modal-header">
              <div className="modal-logo">⚪ Sora</div>
            </div>

            <div className="modal-video-container">
              <video
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                loop
                className="modal-video"
              />
            </div>

            <div className="modal-info">
              <div className="modal-user">
                <div className="user-avatar-small">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username || user.email} />
                  ) : (
                    <div className="avatar-placeholder-small">
                      {(user?.username || user?.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <span>{user?.username || 'luzhipeng'}</span>
              </div>
              <p className="modal-prompt">{selectedVideo.prompt}</p>
              <button className="post-btn">Post</button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="page-container-simple">
        {/* Video row */}
        <div className="video-row">
          {allItems.map((item) => {
            if (item.type === 'job') {
              const { job, progress } = item;
              const isFailed = job.status === 'failed';

              return (
                <div key={item.id} className="video-thumbnail-item">
                  <div className="video-thumb-wrapper">
                    {isFailed ? (
                      <div className="video-error-state">
                        <div className="error-icon">✕</div>
                        <div className="error-message">
                          {job.errorMessage || 'Generation failed'}
                        </div>
                        <div className="error-prompt">{job.prompt}</div>
                      </div>
                    ) : (
                      <div className="video-loading-state">
                        <div className="loading-spinner"></div>
                        <div className="loading-progress">{progress}%</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              const video = item.video;
              return (
                <div
                  key={item.id}
                  className="video-thumbnail-item"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="video-thumb-wrapper">
                    <video
                      src={video.videoUrl}
                      className="video-thumb"
                      loop
                      muted
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* Input section */}
        <div className="input-section-bottom">
          <form onSubmit={handleSubmit} className="prompt-form">
            {/* Horizontal cameo selector */}
            {showCameos && (
              <div className="cameo-selector-horizontal">
                <button
                  type="button"
                  className="add-cameo-btn"
                  onClick={() => setShowCameos(true)}
                >
                  <span className="plus-icon">+</span>
                  <span>Add cameo</span>
                </button>

                <div className="cameo-avatars-scroll">
                  {cameos.map((cameo) => (
                    <button
                      key={cameo.username}
                      type="button"
                      className={`cameo-avatar-btn ${selectedCameos.includes(cameo.username) ? 'selected' : ''}`}
                      onClick={() => handleCameoSelect(cameo.username)}
                      disabled={!selectedCameos.includes(cameo.username) && selectedCameos.length >= 3}
                    >
                      <div className="cameo-avatar-circle">
                        <img src={cameo.profile_picture_url} alt={cameo.username} />
                        {cameo.verified && <span className="verified-icon">✓</span>}
                      </div>
                      <span className="cameo-name">{cameo.display_name || cameo.username}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="prompt-input-wrapper">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={handleInputFocus}
                placeholder="Describe your video..."
                className="prompt-input"
                rows={2}
                maxLength={1000}
              />

              <div className="input-controls">
                <div className="left-controls">
                  <button type="button" className="icon-btn">
                    <span>📷</span>
                  </button>
                  <OrientationSelector
                    value={orientation}
                    onChange={setOrientation}
                    disabled={false}
                  />
                </div>

                <div className="right-controls">
                  <button type="submit" className="submit-btn" disabled={!prompt.trim()}>
                    <span>↑</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoCreationPage;

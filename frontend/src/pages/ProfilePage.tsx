import React, { useEffect, useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useVideoStore } from '../stores/videoStore';
import { VideoCard } from '../components/VideoCard';
import { VideoPlayer } from '../components/VideoPlayer';
import type { Video } from '../../../shared/types';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useUserStore();
  const { videos, fetchVideos, isLoading, pagination } = useVideoStore();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchVideos({ page: currentPage, limit: 20 });
  }, [currentPage, fetchVideos]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username || user.email} />
            ) : (
              <div className="avatar-placeholder">
                {(user?.username || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-details">
            <h1 className="profile-name">{user?.username || 'User'}</h1>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{pagination.total}</span>
            <span className="stat-label">Videos</span>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={logout}>
          Sign Out
        </button>
      </div>

      <div className="content-wrapper">
        <div className="section-header">
          <h2>My Videos</h2>
          {videos.length > 0 && (
            <span className="video-count">{pagination.total} total</span>
          )}
        </div>

        {isLoading && currentPage === 1 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
              <polyline points="23 7 12 13 1 7" />
            </svg>
            <h3>No videos yet</h3>
            <p>Start creating amazing videos from text prompts!</p>
            <a href="/videos/create" className="btn btn-primary">
              Create Your First Video
            </a>
          </div>
        ) : (
          <>
            <div className="video-grid">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={handlePlayVideo}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages || isLoading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={handleClosePlayer} />
      )}
    </div>
  );
};

export default ProfilePage;

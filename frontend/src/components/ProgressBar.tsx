import React from 'react';

interface ProgressBarProps {
  progress: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status = 'processing',
  showPercentage = true,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return '⌛️';
      case 'processing':
        return '🏃';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Task queued, please wait...';
      case 'processing':
        return `Progress: ${progress}%`;
      case 'completed':
        return 'Video generated successfully!';
      case 'failed':
        return 'Generation failed';
      default:
        return '';
    }
  };

  return (
    <div className="progress-container">
      <div className="progress-status">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
      </div>
      <div className="progress-bar-wrapper">
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {showPercentage && status === 'processing' && (
          <span className="progress-percentage">{progress}%</span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;

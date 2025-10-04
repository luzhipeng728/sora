import React from 'react';
import type { OrientationType } from '../../../shared/types';

interface OrientationSelectorProps {
  value: OrientationType;
  onChange: (orientation: OrientationType) => void;
  disabled?: boolean;
}

export const OrientationSelector: React.FC<OrientationSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="orientation-selector">
      <label className="orientation-label">Orientation</label>
      <div className="orientation-buttons">
        <button
          type="button"
          className={`orientation-btn ${value === 'portrait' ? 'active' : ''}`}
          onClick={() => onChange('portrait')}
          disabled={disabled}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="7" y="4" width="10" height="16" rx="2" />
          </svg>
          <span>Portrait</span>
        </button>
        <button
          type="button"
          className={`orientation-btn ${value === 'landscape' ? 'active' : ''}`}
          onClick={() => onChange('landscape')}
          disabled={disabled}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="4" y="7" width="16" height="10" rx="2" />
          </svg>
          <span>Landscape</span>
        </button>
      </div>
    </div>
  );
};

export default OrientationSelector;

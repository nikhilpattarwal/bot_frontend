import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
    const percentage = Math.min((value / max) * 100, 100); 
  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{ width: `${percentage}%` }}
      >
        {percentage === 100 && (
          <span className="progress-bar-message">
            You have reached the daily limit of coins
          </span>
        )}

      </div>
    </div>
  );
};

export default ProgressBar;

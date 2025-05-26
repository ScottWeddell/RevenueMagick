import React from 'react';

interface ReadinessScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ReadinessScore: React.FC<ReadinessScoreProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const getScoreColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 border-green-500';
      case 'medium':
        return 'text-yellow-600 border-yellow-500';
      default:
        return 'text-red-600 border-red-500';
    }
  };

  const getScoreLabel = (level: string) => {
    switch (level) {
      case 'high':
        return 'Ready to Convert';
      case 'medium':
        return 'Warming Up';
      default:
        return 'Early Stage';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12 text-sm';
      case 'lg':
        return 'w-20 h-20 text-xl';
      default:
        return 'w-16 h-16 text-base';
    }
  };

  const level = getScoreLevel(score);
  const colorClasses = getScoreColor(level);
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`readiness-score ${level} ${sizeClasses} ${colorClasses} font-bold`}>
        {score.toFixed(1)}
      </div>
      {showLabel && (
        <div className="mt-2 text-center">
          <div className="text-sm font-medium text-gray-900">{getScoreLabel(level)}</div>
          <div className="text-xs text-gray-500">Readiness Score™</div>
        </div>
      )}
    </div>
  );
};

export default ReadinessScore; 
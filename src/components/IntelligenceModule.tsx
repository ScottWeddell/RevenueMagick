import React from 'react';
import NeuralGlyph from './NeuralGlyph';

interface IntelligenceModuleProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    period: string;
  };
  icon?: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const IntelligenceModule: React.FC<IntelligenceModuleProps> = ({
  title,
  value,
  trend,
  icon,
  description,
  children,
  className = ''
}) => {
  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  const getTrendClass = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      default:
        return 'trend-neutral';
    }
  };

  return (
    <div className={`intelligence-card ${className}`}>
      <div className="intelligence-card-header">
        <div className="intelligence-title">
          {icon || <NeuralGlyph size={20} />}
          <span>{title}</span>
        </div>
        {trend && (
          <div className={`intelligence-trend ${getTrendClass(trend.direction)}`}>
            {getTrendIcon(trend.direction)}
            <span>{trend.percentage}%</span>
          </div>
        )}
      </div>
      
      <div className="intelligence-value">
        {value}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      )}
      
      {trend && (
        <p className="text-xs text-gray-500 mt-1">
          vs. {trend.period}
        </p>
      )}
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default IntelligenceModule; 
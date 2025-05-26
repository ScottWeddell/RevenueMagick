import React from 'react';

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
          {icon || (
            <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
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
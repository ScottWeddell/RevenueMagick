import React from 'react';

interface StructuralTensionProps {
  currentValue: number;
  goalValue: number;
  metric: string;
  unit?: string;
  description?: string;
  actionItems?: string[];
  className?: string;
}

const StructuralTension: React.FC<StructuralTensionProps> = ({
  currentValue,
  goalValue,
  metric,
  unit = '',
  description,
  actionItems = [],
  className = ''
}) => {
  const gap = goalValue - currentValue;
  const gapPercentage = ((gap / goalValue) * 100).toFixed(1);
  const progressPercentage = ((currentValue / goalValue) * 100).toFixed(1);
  
  const isPositiveGap = gap > 0;
  
  // Format values for better display
  const formatValue = (value: number, unit: string): string => {
    if (unit === '$') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M$`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k$`;
      } else {
        return `${value.toFixed(0)}$`;
      }
    } else if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else {
      return `${value.toLocaleString()}${unit}`;
    }
  };
  
  return (
    <div className={`tension-container ${className}`}>
      <div className="tension-header">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-brand-ice flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="leading-tight">Structural Tension: {metric}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4">
        <div className="text-center min-w-0">
          <div className="text-xs sm:text-sm text-brand-ice opacity-75 mb-1">Current</div>
          <div className="text-xs sm:text-sm text-brand-ice opacity-75 mb-1">Reality</div>
          <div className="text-lg sm:text-xl font-bold break-words overflow-hidden">
            {formatValue(currentValue, unit)}
          </div>
        </div>
        
        <div className="text-center min-w-0">
          <div className="text-xs sm:text-sm text-brand-ice opacity-75 mb-1">Gap</div>
          <div className={`text-lg sm:text-xl font-bold break-words overflow-hidden ${isPositiveGap ? 'text-yellow-300' : 'text-green-300'}`}>
            {isPositiveGap ? '+' : ''}{formatValue(Math.abs(gap), unit)}
          </div>
          <div className="text-xs text-brand-ice opacity-60">
            {Math.abs(parseFloat(gapPercentage))}% to goal
          </div>
        </div>
        
        <div className="text-center min-w-0">
          <div className="text-xs sm:text-sm text-brand-ice opacity-75 mb-1">Goal</div>
          <div className="text-lg sm:text-xl font-bold break-words overflow-hidden">
            {formatValue(goalValue, unit)}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-brand-ice opacity-75 mb-1">
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-brand-indigo bg-opacity-50 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, parseFloat(progressPercentage))}%` }}
          />
        </div>
      </div>
      
      {description && (
        <div className="tension-description mb-4">
          {description}
        </div>
      )}
      
      {actionItems.length > 0 && (
        <div>
          <div className="text-sm font-medium text-brand-ice mb-2">
            Strategic Actions:
          </div>
          <ul className="space-y-1">
            {actionItems.map((action, index) => (
              <li key={index} className="text-sm text-brand-ice opacity-90 flex items-start gap-2">
                <span className="text-white mt-1">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StructuralTension; 
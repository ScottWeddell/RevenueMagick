import React from 'react';

interface NeuralGlyphProps {
  size?: number;
  animated?: boolean;
  variant?: 'default' | 'minimal' | 'complex';
  className?: string;
}

const NeuralGlyph: React.FC<NeuralGlyphProps> = ({ 
  size = 24, 
  animated = false, 
  variant = 'default',
  className = '' 
}) => {
  const baseClasses = `neural-glyph ${animated ? 'signal-pulse' : ''} ${className}`;
  
  if (variant === 'minimal') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={baseClasses}
      >
        <circle cx="12" cy="12" r="10" fill="#2673EC" />
        <path d="M8 12L12 7L16 12L12 17L8 12Z" fill="white" />
      </svg>
    );
  }
  
  if (variant === 'complex') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={baseClasses}
      >
        <circle cx="16" cy="16" r="14" fill="#2673EC" />
        <path d="M10 16L16 9L22 16L16 23L10 16Z" fill="white" />
        <circle cx="16" cy="9" r="1.5" fill="#D8E8FF" />
        <circle cx="16" cy="23" r="1.5" fill="#D8E8FF" />
        <circle cx="10" cy="16" r="1.5" fill="#D8E8FF" />
        <circle cx="22" cy="16" r="1.5" fill="#D8E8FF" />
        <path d="M16 12L18 14L16 16L14 14L16 12Z" fill="#D8E8FF" opacity="0.7" />
      </svg>
    );
  }
  
  // Default variant
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={baseClasses}
    >
      <circle cx="12" cy="12" r="10" fill="#2673EC" />
      <path d="M8 12L12 7L16 12L12 17L8 12Z" fill="white" strokeWidth="0.5" stroke="#D8E8FF" />
      <circle cx="12" cy="7" r="1" fill="#D8E8FF" />
      <circle cx="12" cy="17" r="1" fill="#D8E8FF" />
      <circle cx="8" cy="12" r="1" fill="#D8E8FF" />
      <circle cx="16" cy="12" r="1" fill="#D8E8FF" />
    </svg>
  );
};

export default NeuralGlyph; 
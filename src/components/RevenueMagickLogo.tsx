import React from 'react';

interface RevenueMagickLogoProps {
  size?: number;
  variant?: 'full' | 'icon' | 'text';
  theme?: 'light' | 'dark';
  className?: string;
}

const RevenueMagickLogo: React.FC<RevenueMagickLogoProps> = ({ 
  size = 240, 
  variant = 'full',
  theme = 'light',
  className = '' 
}) => {
  const iconSize = variant === 'full' ? size * 0.25 : size;
  const textSize = variant === 'full' ? size * 0.15 : 0;
  
  // Color scheme based on theme
  const colors = theme === 'light' ? {
    primary: '#2673EC',
    secondary: '#1F2B59',
    accent: '#D8E8FF',
    text: '#1F2B59'
  } : {
    primary: '#D8E8FF',
    secondary: '#2673EC',
    accent: '#D8E8FF',
    text: '#D8E8FF'
  };

  const NeuralGlyph = () => (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="neural-glyph">
        {/* Central node */}
        <circle cx="32" cy="32" r="3" fill={colors.primary}/>
        
        {/* Neural pathways */}
        <path 
          d="M32 32 Q20 20 14 26 Q8 32 14 38 Q20 44 32 32" 
          stroke={colors.primary} 
          strokeWidth="2" 
          fill="none" 
          opacity="0.8"
        />
        <path 
          d="M32 32 Q44 20 50 26 Q56 32 50 38 Q44 44 32 32" 
          stroke={colors.primary} 
          strokeWidth="2" 
          fill="none" 
          opacity="0.8"
        />
        <path 
          d="M32 32 Q26 14 32 8 Q38 14 32 32" 
          stroke={colors.primary} 
          strokeWidth="2" 
          fill="none" 
          opacity="0.6"
        />
        <path 
          d="M32 32 Q26 50 32 56 Q38 50 32 32" 
          stroke={colors.primary} 
          strokeWidth="2" 
          fill="none" 
          opacity="0.6"
        />
        
        {/* Signal nodes */}
        <circle cx="14" cy="32" r="2" fill={colors.primary} opacity="0.7"/>
        <circle cx="50" cy="32" r="2" fill={colors.primary} opacity="0.7"/>
        <circle cx="32" cy="14" r="2" fill={colors.primary} opacity="0.5"/>
        <circle cx="32" cy="50" r="2" fill={colors.primary} opacity="0.5"/>
        
        {/* Inner spark */}
        <circle cx="32" cy="32" r="1" fill={colors.accent}/>
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={className}>
        <NeuralGlyph />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <span 
          style={{ 
            fontSize: `${textSize}px`,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            color: colors.text
          }}
        >
          Revenue M<span style={{ color: colors.primary }}>∆</span>gick
        </span>
      </div>
    );
  }

  // Full logo with icon and text
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <NeuralGlyph />
      <div>
        <div 
          style={{ 
            fontSize: `${textSize}px`,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            color: colors.text,
            lineHeight: 1.2
          }}
        >
          Revenue M<span style={{ color: colors.primary }}>∆</span>gick
        </div>
        {size >= 200 && (
          <div 
            style={{ 
              fontSize: `${textSize * 0.4}px`,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 300,
              color: colors.primary,
              opacity: 0.8,
              marginTop: '2px'
            }}
          >
            Decode the invisible. Unlock your profit.
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueMagickLogo; 
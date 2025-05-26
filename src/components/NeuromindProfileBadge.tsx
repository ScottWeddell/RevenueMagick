import React from 'react';

type ProfileType = 
  | 'Fast-Mover' 
  | 'Proof-Driven' 
  | 'Reassurer' 
  | 'Skeptic' 
  | 'Optimizer' 
  | 'Authority-Seeker' 
  | 'Experience-First';

interface NeuromindProfileBadgeProps {
  profileType: ProfileType;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

const NeuromindProfileBadge: React.FC<NeuromindProfileBadgeProps> = ({
  profileType,
  size = 'md',
  showDescription = false,
  className = ''
}) => {
  const getProfileClasses = (type: ProfileType) => {
    const baseClasses = 'profile-badge';
    switch (type) {
      case 'Fast-Mover':
        return `${baseClasses} profile-fast-mover`;
      case 'Proof-Driven':
        return `${baseClasses} profile-proof-driven`;
      case 'Reassurer':
        return `${baseClasses} profile-reassurer`;
      case 'Skeptic':
        return `${baseClasses} profile-skeptic`;
      case 'Optimizer':
        return `${baseClasses} profile-optimizer`;
      case 'Authority-Seeker':
        return `${baseClasses} profile-authority-seeker`;
      case 'Experience-First':
        return `${baseClasses} profile-experience-first`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-2 text-sm';
      default:
        return 'px-3 py-1 text-xs';
    }
  };

  const getProfileDescription = (type: ProfileType) => {
    switch (type) {
      case 'Fast-Mover':
        return 'Quick decision maker, values speed and efficiency';
      case 'Proof-Driven':
        return 'Needs evidence and data before making decisions';
      case 'Reassurer':
        return 'Seeks comfort and low-risk options';
      case 'Skeptic':
        return 'Questions claims and needs convincing';
      case 'Optimizer':
        return 'Compares options to find the best value';
      case 'Authority-Seeker':
        return 'Influenced by expert opinions and credentials';
      case 'Experience-First':
        return 'Values hands-on experience and trials';
      default:
        return '';
    }
  };

  const profileClasses = getProfileClasses(profileType);
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span className={`${profileClasses} ${sizeClasses} font-medium`}>
        {profileType}
      </span>
      {showDescription && (
        <span className="text-xs text-gray-500 mt-1 max-w-xs">
          {getProfileDescription(profileType)}
        </span>
      )}
    </div>
  );
};

export default NeuromindProfileBadge; 
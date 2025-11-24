import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin ${className}`} />
  );
};

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <LoadingSpinner size={size} className="mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <LoadingState message="Loading page..." size="lg" />
    </div>
  );
};

import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from './icons';

interface ApiErrorBannerProps {
  onDismiss: () => void;
}

export const ApiErrorBanner: React.FC<ApiErrorBannerProps> = ({ onDismiss }) => {
  return (
    <div className="bg-red-900/50 border-t border-b border-red-accent/30 text-red-200" role="alert">
      <div className="container mx-auto flex items-center justify-between p-3">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-accent mr-3 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-bold">
              Live Market Data Unavailable
            </p>
            <p className="text-red-300">
                The app couldn't connect to the live data service and is using sample data as a fallback.
            </p>
          </div>
        </div>
        <button 
            onClick={onDismiss} 
            aria-label="Dismiss" 
            className="text-red-200 hover:text-white p-1 rounded-full hover:bg-red-400/20 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until after hydration to prevent mismatch
  if (!mounted || isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2">
      <div className="max-w-lg mx-auto flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">
          You're offline. Some features may not work.
        </span>
      </div>
    </div>
  );
};

export const OnlineIndicator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isOnline = useOnlineStatus();

  return (
    <>
      <OfflineIndicator />
      <div className={!isOnline ? 'pt-10' : ''}>
        {children}
      </div>
    </>
  );
};

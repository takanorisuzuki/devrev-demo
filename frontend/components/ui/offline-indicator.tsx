"use client";

import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOffline } from '@/lib/hooks/useOffline';

interface OfflineIndicatorProps {
  className?: string;
}

export default function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const { isOffline, wasOffline } = useOffline();

  if (!isOffline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isOffline ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      } ${className}`}
    >
      <div
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg ${
          isOffline
            ? 'bg-red-100 border border-red-200 text-red-800'
            : 'bg-green-100 border border-green-200 text-green-800'
        }`}
      >
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">オフライン</span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">オンラインに復帰</span>
          </>
        )}
      </div>
    </div>
  );
}

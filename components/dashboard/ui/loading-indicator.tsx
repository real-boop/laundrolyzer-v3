import React from 'react';

export function LoadingIndicator() {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg">Loading data...</p>
      </div>
    </div>
  );
} 
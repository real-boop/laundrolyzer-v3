import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 p-6 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
      <p className="text-red-600">{message}</p>
    </div>
  );
} 
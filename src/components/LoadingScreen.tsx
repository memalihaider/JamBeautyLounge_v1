import React from 'react';
import { Activity, Database, BarChart3, Zap } from 'lucide-react';

export function LoadingScreen({ title = "Loading Dashboard", subtitle = "Fetching real-time data from database..." }) {
  return (
    <div className="flex items-center justify-center h-screen bg-linear-to-br from-gray-900 via-primary/20 to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 text-center space-y-8 px-4">
        {/* Main loading animation */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/50 animate-spin"></div>
            
            {/* Middle rotating ring (slower) */}
            <div className="absolute inset-2 rounded-full border-3 border-transparent border-b-secondary border-l-secondary/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
            
            {/* Inner circle with icon */}
            <div className="absolute inset-4 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Database className="w-8 h-8 text-primary animate-pulse" />
            </div>

            {/* Floating icons around */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ animationDelay: '0s' }}>
              <BarChart3 className="w-6 h-6 text-primary/60" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Activity className="w-6 h-6 text-secondary/60" />
            </div>
            <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.4s' }}>
              <Zap className="w-6 h-6 text-amber-500/60" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-3">
          <h2 className="text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent font-serif">
            {title}
          </h2>
          <p className="text-gray-400 text-lg">
            {subtitle}
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="flex items-center justify-center gap-2 h-8">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-linear-to-r from-primary to-secondary"
                style={{
                  animation: 'scale-bounce 1.4s infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar with shimmer */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden shadow-lg">
            <div 
              className="h-full bg-linear-to-r from-primary via-secondary to-primary bg-size-[200%_100%] animate-shimmer"
              style={{ width: '65%' }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Syncing with database...</p>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes scale-bounce {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

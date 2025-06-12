interface CircularTimerProps {
  currentTime: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  formatTime: (seconds: number) => string;
  activityName: string;
}

export function CircularTimer({
  currentTime,
  isRunning,
  onStart,
  onPause,
  onResume,
  onStop,
  formatTime,
  activityName,
}: CircularTimerProps) {
  const hasSession = currentTime > 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  
  // Progress based on a 2-hour session (7200 seconds)
  const maxSessionTime = 7200;
  const progress = Math.min(currentTime / maxSessionTime, 1);
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Activity Name */}
      {activityName && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Currently working on:</h3>
          <p className="text-xl text-blue-600 font-medium">{activityName}</p>
        </div>
      )}

      {/* Circular Progress */}
      <div className="relative">
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke={isRunning ? "#10b981" : "#3b82f6"}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        
        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-gray-500">
            {isRunning ? "Running" : hasSession ? "Paused" : "Ready"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {!hasSession ? (
          <button
            onClick={onStart}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Start</span>
          </button>
        ) : (
          <>
            {isRunning ? (
              <button
                onClick={onPause}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={onResume}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Resume</span>
              </button>
            )}
            
            <button
              onClick={onStop}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              <span>Stop</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

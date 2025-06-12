import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ProgressOverview() {
  const totalProgress = useQuery(api.sessions.getTotalProgress);

  if (!totalProgress) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const { totalHours, progressPercentage, remainingHours } = totalProgress;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Progress</h2>
      
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{totalHours.toFixed(1)} hours completed</span>
            <span>{progressPercentage.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-emerald-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalHours.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">
              {remainingHours.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Hours Remaining</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {totalProgress.sessionCount}
            </div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Next Milestone</h3>
          <div className="text-sm text-gray-600">
            {totalHours < 1000 ? (
              <>You're {(1000 - totalHours).toFixed(1)} hours away from your first 1,000 hours!</>
            ) : totalHours < 5000 ? (
              <>You're {(5000 - totalHours).toFixed(1)} hours away from 5,000 hours!</>
            ) : totalHours < 10000 ? (
              <>You're {(10000 - totalHours).toFixed(1)} hours away from mastery!</>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">🏆 I WON 🏆</div>
                <div className="text-lg text-gray-800">Congratulations! You've achieved mastery with 10,000+ hours!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

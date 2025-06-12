import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function DailyGoals() {
  const todayProgress = useQuery(api.sessions.getTodayProgress);

  if (!todayProgress) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const {
    totalHours,
    sessionCount,
    dailyGoalHours,
    progressPercentage,
    goalAchieved,
  } = todayProgress;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Progress</h2>
      
      <div className="space-y-4">
        {/* Daily Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{totalHours.toFixed(1)} / {dailyGoalHours} hours</span>
            <span>{Math.min(progressPercentage, 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                goalAchieved
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  : "bg-gradient-to-r from-blue-500 to-blue-600"
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Goal Status */}
        <div className={`p-3 rounded-lg ${
          goalAchieved ? "bg-emerald-50 text-emerald-800" : "bg-blue-50 text-blue-800"
        }`}>
          <div className="flex items-center space-x-2">
            {goalAchieved ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">
              {goalAchieved ? "Daily goal achieved!" : "Keep going!"}
            </span>
          </div>
          <div className="text-sm mt-1">
            {goalAchieved
              ? "Great work! You've reached your daily practice goal."
              : `${(dailyGoalHours - totalHours).toFixed(1)} hours remaining to reach your goal.`
            }
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {totalHours.toFixed(1)}h
            </div>
            <div className="text-xs text-gray-600">Hours Today</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {sessionCount}
            </div>
            <div className="text-xs text-gray-600">Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

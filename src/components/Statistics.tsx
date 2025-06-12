import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Statistics() {
  const weeklyStats = useQuery(api.sessions.getWeeklyStats);
  const monthlyStats = useQuery(api.sessions.getMonthlyStats);
  const streak = useQuery(api.sessions.getStreak);

  if (!weeklyStats || !monthlyStats || streak === undefined) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
      
      <div className="space-y-4">
        {/* Streak */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-lg font-bold text-orange-800">{streak} days</div>
              <div className="text-sm text-orange-600">Current streak</div>
            </div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">This Week</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-800">
                {weeklyStats.totalHours.toFixed(1)}h
              </div>
              <div className="text-xs text-blue-600">Total Hours</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-800">
                {weeklyStats.dailyAverage.toFixed(1)}h
              </div>
              <div className="text-xs text-blue-600">Daily Average</div>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">This Month</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <div className="text-lg font-bold text-emerald-800">
                {monthlyStats.totalHours.toFixed(1)}h
              </div>
              <div className="text-xs text-emerald-600">Total Hours</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <div className="text-lg font-bold text-emerald-800">
                {monthlyStats.dailyAverage.toFixed(1)}h
              </div>
              <div className="text-xs text-emerald-600">Daily Average</div>
            </div>
          </div>
        </div>

        {/* Session Counts */}
        <div className="pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {weeklyStats.sessionCount}
              </div>
              <div className="text-xs text-gray-600">Weekly Sessions</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {monthlyStats.sessionCount}
              </div>
              <div className="text-xs text-gray-600">Monthly Sessions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

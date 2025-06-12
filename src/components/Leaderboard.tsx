import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Leaderboard() {
  const leaderboard = useQuery(api.sessions.getLeaderboard);

  if (!leaderboard) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Leaderboard</h2>
      
      <div className="space-y-4">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users on the leaderboard yet. Start practicing to be the first!
          </div>
        ) : (
          leaderboard.map((user, index) => (
            <div
              key={user.userId}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                index === 0
                  ? "bg-yellow-50 border-yellow-200"
                  : index === 1
                  ? "bg-gray-50 border-gray-200"
                  : index === 2
                  ? "bg-orange-50 border-orange-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0
                    ? "bg-yellow-500 text-white"
                    : index === 1
                    ? "bg-gray-400 text-white"
                    : index === 2
                    ? "bg-orange-500 text-white"
                    : "bg-blue-500 text-white"
                }`}>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user.userName}</div>
                  <div className="text-sm text-gray-600">
                    {user.totalSessions} sessions • {user.currentStreak} day streak
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {user.totalHours.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">
                  {((user.totalHours / 10000) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {leaderboard.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Competition Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Top performer:</span>
              <div className="font-medium">{leaderboard[0]?.userName}</div>
            </div>
            <div>
              <span className="text-blue-700">Total participants:</span>
              <div className="font-medium">{leaderboard.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

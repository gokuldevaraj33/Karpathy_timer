import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Activities() {
  const activities = useQuery(api.sessions.getUserActivities);

  if (!activities) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatTimeWithUnits = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
    
    return parts.join(' ');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Activities</h2>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No activities recorded yet. Start a session to track your practice!
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{activity.name}</h3>
                <div className="text-sm text-gray-600">
                  {activity.sessionCount} sessions • Last practiced: {formatDate(activity.lastPracticed)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {formatTimeWithUnits(activity.totalSeconds)}
                </div>
                <div className="text-sm text-gray-600">
                  {(activity.totalSeconds / 3600).toFixed(1)} hours total
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Activity Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total activities:</span>
              <div className="font-medium">{activities.length}</div>
            </div>
            <div>
              <span className="text-blue-700">Most practiced:</span>
              <div className="font-medium">
                {activities.length > 0 
                  ? activities.reduce((prev, current) => 
                      prev.totalSeconds > current.totalSeconds ? prev : current
                    ).name
                  : "None"
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

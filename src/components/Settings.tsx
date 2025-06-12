import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function Settings() {
  const settings = useQuery(api.settings.getUserSettings);
  const updateSettings = useMutation(api.settings.updateSettings);
  
  const [dailyGoalHours, setDailyGoalHours] = useState(4);
  const [breakReminderMinutes, setBreakReminderMinutes] = useState(60);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with current settings
  useEffect(() => {
    if (settings) {
      setDailyGoalHours(settings.dailyGoalHours);
      setBreakReminderMinutes(settings.breakReminderMinutes);
      setSoundNotifications(settings.soundNotifications);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings({
        dailyGoalHours,
        breakReminderMinutes,
        soundNotifications,
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Daily Goal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Daily Goal (hours)
        </label>
        <select
          value={dailyGoalHours}
          onChange={(e) => setDailyGoalHours(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={2}>2 hours</option>
          <option value={3}>3 hours</option>
          <option value={4}>4 hours</option>
          <option value={5}>5 hours</option>
          <option value={6}>6 hours</option>
          <option value={7}>7 hours</option>
          <option value={8}>8 hours</option>
        </select>
      </div>

      {/* Break Reminder */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Break Reminder
        </label>
        <select
          value={breakReminderMinutes}
          onChange={(e) => setBreakReminderMinutes(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={30}>Every 30 minutes</option>
          <option value={60}>Every 1 hour</option>
          <option value={90}>Every 90 minutes</option>
          <option value={120}>Every 2 hours</option>
        </select>
      </div>

      {/* Sound Notifications */}
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={soundNotifications}
            onChange={(e) => setSoundNotifications(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-700">
            Enable sound notifications
          </span>
        </label>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

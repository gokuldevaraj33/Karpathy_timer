import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { CircularTimer } from "./CircularTimer";
import { ProgressOverview } from "./ProgressOverview";
import { DailyGoals } from "./DailyGoals";
import { Statistics } from "./Statistics";
import { Settings } from "./Settings";
import { Leaderboard } from "./Leaderboard";
import { Activities } from "./Activities";
import { SessionCompleteModal } from "./SessionCompleteModal";
import { UsernameModal } from "./UsernameModal";
import { Confetti } from "./Confetti";
import { toast } from "sonner";

export function TimerApp() {
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [activityName, setActivityName] = useState("");
  const [showActivityInput, setShowActivityInput] = useState(false);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [completedSessionTime, setCompletedSessionTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);

  const currentSession = useQuery(api.sessions.getCurrentSession);
  const startSession = useMutation(api.sessions.startSession);
  const updateSession = useMutation(api.sessions.updateSession);
  const completeSession = useMutation(api.sessions.completeSession);
  const settings = useQuery(api.settings.getUserSettings);
  const todayProgress = useQuery(api.sessions.getTodayProgress);
  const user = useQuery(api.auth.loggedInUser);
  const initializeUser = useMutation(api.users.initializeUser);

  // Initialize user with random username if needed
  useEffect(() => {
    if (user && !user.name) {
      initializeUser();
    }
  }, [user, initializeUser]);

  // Set sessionId and activityName from current session
  useEffect(() => {
    if (currentSession) {
      setSessionId(currentSession._id);
      if (!currentSession.isCompleted) {
        setActivityName(currentSession.activityName || "");
      }
    } else {
      setSessionId(null);
      setActivityName("");
    }
  }, [currentSession]);

  // Robust timer sync: always recalculate from Convex session state
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    function recalcTime() {
      if (!currentSession) {
        setDisplayTime(0);
        return;
      }
      if (currentSession.isCompleted) {
        setDisplayTime(currentSession.currentDuration || currentSession.duration || 0);
        return;
      }
      if (currentSession.isPaused) {
        setDisplayTime(currentSession.currentDuration);
        return;
      }
      // If running, calculate elapsed
      const elapsed = Math.floor((Date.now() - currentSession.startTime) / 1000);
      setDisplayTime(currentSession.duration + elapsed);
    }
    recalcTime();
    if (currentSession && !currentSession.isPaused && !currentSession.isCompleted) {
      interval = setInterval(recalcTime, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession]);

  // Check for daily goal achievement
  useEffect(() => {
    if (todayProgress?.goalAchieved && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [todayProgress?.goalAchieved, showConfetti]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Always require a new project name before starting
  const handleStart = () => {
    if (!activityName.trim()) {
      setShowActivityInput(true);
      return;
    }
    startNewSession();
  };

  const startNewSession = async () => {
    try {
      const newSessionId = await startSession({ activityName: activityName.trim() });
      setSessionId(newSessionId);
      setShowActivityInput(false);
      toast.success("Timer started!");
    } catch (error) {
      toast.error("Failed to start session");
    }
  };

  // Pause should update Convex and UI will reflect via polling
  const handlePause = async () => {
    if (!sessionId || !currentSession) {
      return;
    }
    
    // Type guard to ensure currentSession is not paused or completed
    if (currentSession.isPaused === true || currentSession.isCompleted === true) {
      return;
    }
    
    try {
      // Optimistically update UI
      const currentDisplayTime = displayTime;
      setDisplayTime(currentDisplayTime);
      
      // Call the mutation with retry logic
      let retries = 3;
      while (retries > 0) {
        try {
          await updateSession({ 
            sessionId, 
            duration: currentDisplayTime, 
            isPaused: true 
          });
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
      
      toast.info("Timer paused");
    } catch (error) {
      console.error("Failed to pause timer:", error);
      toast.error("Failed to pause timer. Please try again.");
      
      // Revert optimistic update if the mutation failed
      if (currentSession) {
        setDisplayTime(currentSession.currentDuration);
      }
    }
  };

  // Resume should update Convex and UI will reflect via polling
  const handleResume = () => {
    if (sessionId && currentSession && currentSession.isPaused && !currentSession.isCompleted) {
      updateSession({ sessionId, duration: displayTime, isPaused: false });
      toast.success("Timer resumed");
    }
  };

  // Stop should complete session in Convex and reset UI everywhere
  const handleStop = async () => {
    const finalTime = displayTime;
    setCompletedSessionTime(finalTime);
    if (sessionId && finalTime > 0 && !currentSession?.isCompleted) {
      try {
        await completeSession({ sessionId, duration: finalTime });
        setShowSessionComplete(true);
      } catch (error) {
        toast.error("Failed to save session");
      }
    }
    setSessionId(null);
    setActivityName(""); // Clear project name so next start always prompts
  };

  // When session is completed, always clear activityName for next start
  useEffect(() => {
    if (currentSession?.isCompleted) {
      setActivityName("");
    }
  }, [currentSession?.isCompleted]);

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti />}
      
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Jesse, we need to cook
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Ready to start your 10,000 hour journey?
              </p>
              {user?.name && (
                <p className="text-sm text-gray-500 mb-4">
                  Welcome, <span className="font-semibold text-blue-600">{user.name}</span>!
                  <button
                    onClick={() => setShowUsernameModal(true)}
                    className="ml-2 text-blue-500 hover:text-blue-700 underline text-xs"
                  >
                    Change username
                  </button>
                </p>
              )}
            </div>
            
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Let's cook Mr. White
            </button>
          </div>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => {
              setShowLeaderboard(false);
              setShowActivities(false);
            }}
            className={`px-6 py-3 font-medium transition-colors ${
              !showLeaderboard && !showActivities
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => {
              setShowLeaderboard(true);
              setShowActivities(false);
            }}
            className={`px-6 py-3 font-medium transition-colors ${
              showLeaderboard
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => {
              setShowActivities(true);
              setShowLeaderboard(false);
            }}
            className={`px-6 py-3 font-medium transition-colors ${
              showActivities
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Activities
          </button>
          
          {/* Username display and edit button */}
          <div className="ml-auto flex items-center px-6 py-3">
            <span className="text-sm text-gray-600 mr-2">
              {user?.name || "Loading..."}
            </span>
            <button
              onClick={() => setShowUsernameModal(true)}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showLeaderboard ? (
        <Leaderboard />
      ) : showActivities ? (
        <Activities />
      ) : (
        <>
          {/* Timer Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <CircularTimer
              currentTime={displayTime}
              isRunning={currentSession && !currentSession.isPaused && !currentSession.isCompleted}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              formatTime={formatTime}
              activityName={activityName}
            />
          </div>

          {/* Progress Overview */}
          <ProgressOverview />

          {/* Daily Goals and Statistics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyGoals />
            <Statistics />
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full p-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              Settings
              <svg
                className={`w-5 h-5 transition-transform ${showSettings ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showSettings && (
              <div className="border-t">
                <Settings />
              </div>
            )}
          </div>
        </>
      )}

      {/* Activity Input Modal */}
      {showActivityInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">What are you working on?</h3>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="e.g., Guitar practice, Coding, Drawing..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && activityName.trim()) {
                  startNewSession();
                }
              }}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowActivityInput(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startNewSession}
                disabled={!activityName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                Start Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Username Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        currentUsername={user?.name || ""}
      />

      {/* Session Complete Modal */}
      <SessionCompleteModal
        isOpen={showSessionComplete}
        onClose={() => setShowSessionComplete(false)}
        sessionTime={formatTimeWithUnits(completedSessionTime)}
        activityName={activityName}
      />
    </div>
  );
}

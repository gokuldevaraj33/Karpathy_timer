interface SessionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTime: string;
  activityName: string;
}

export function SessionCompleteModal({
  isOpen,
  onClose,
  sessionTime,
  activityName,
}: SessionCompleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            "Why Mr. Anderson, why, why do you persist?"
          </h2>
          <div className="text-gray-600 mb-4">
            You completed a <span className="font-semibold text-blue-600">{sessionTime}</span> session of <span className="font-semibold">{activityName}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-green-800 font-semibold">Session Complete!</div>
            <div className="text-green-600 text-sm">Great work on your practice session</div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Because I choose to
          </button>
        </div>
      </div>
    </div>
  );
}

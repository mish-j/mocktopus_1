import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import FeedbackModal from "../components/FeedbackModal";
import VideoCall from "../components/VideoCall";
import DraggableContainer from "../components/DraggableContainer";
import { authenticatedFetch, checkAndRefreshToken, clearAuthData, isAuthenticated } from "../utils/auth";
import { API_BASE_URL } from '../utils/config';

const InterviewRoom = () => {
  const { room_id } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState(null);
  
  // Initialize timer with backend synchronization (no localStorage)
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // Default, will be synced from backend
  const [timerStarted, setTimerStarted] = useState(false);
  const [lastTimerSync, setLastTimerSync] = useState(null);
  const [currentInterviewer, setCurrentInterviewer] = useState(() => {
    return localStorage.getItem(`interviewer_${room_id}`) || 'user1';
  });
  const [isRoleSwitched, setIsRoleSwitched] = useState(() => {
    return localStorage.getItem(`role_switched_${room_id}`) === 'true';
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(true);
  
  // Ref for VideoCall component to access its cleanup methods
  const videoCallRef = useRef(null);

  // Partner connection status
  const [partnerConnected, setPartnerConnected] = useState(false);
  const [bothUsersJoined, setBothUsersJoined] = useState(false);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to fetch shared question from room
  const fetchSharedQuestion = useCallback(async () => {
    try {
      setQuestionLoading(true);
      setQuestionError(null);
      
      // Get the current shared question for the room using authenticated fetch
      const res = await authenticatedFetch(`${API_BASE_URL}/api/interviews/room-question/${room_id}/`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.question) {
          setCurrentQuestion(data.question);
          console.log("📋 Loaded shared question from room");
        } else {
          console.log("📋 No shared question found, will fetch new one");
          await fetchAndSetNewQuestion();
        }
      } else {
        throw new Error(`HTTP ${res.status}: Failed to fetch shared question`);
      }
      
    } catch (err) {
      console.error("Fetch shared question error:", err);
      setQuestionError(`Failed to load shared question: ${err.message}`);
    } finally {
      setQuestionLoading(false);
    }
  }, [room_id]);

  // Function to fetch new question and set it for the room
  const fetchAndSetNewQuestion = useCallback(async () => {
    try {
      // Fetch a new random question using authenticated fetch
      const res = await authenticatedFetch(`${API_BASE_URL}/api/random-question/`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch question`);
      }
      
      const data = await res.json();
      setCurrentQuestion(data.question);
      
      // Set this question for the room so both users see the same
      await authenticatedFetch(`${API_BASE_URL}/api/interviews/room-question/${room_id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: data.question }),
      });
      
      console.log("📋 Set new shared question for room");
      
    } catch (err) {
      console.error("Fetch and set question error:", err);
      setQuestionError(`Failed to set shared question: ${err.message}`);
    }
  }, [room_id]);

  // Handle role switching
  const handleRoleSwitch = useCallback(async () => {
    try {
      // Call backend to switch roles (synced across both users) using authenticated fetch
      const response = await authenticatedFetch(`${API_BASE_URL}/api/interviews/switch-roles/${room_id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to switch roles`);
      }

      const data = await response.json();
      console.log('🔄 Backend role switch response:', data);

      // Update local state based on backend response
      const newInterviewer = data.current_interviewer;
      const newRoleSwitched = !isRoleSwitched;
      
      setCurrentInterviewer(newInterviewer);
      setIsRoleSwitched(newRoleSwitched);
      
      // Save role state to localStorage
      localStorage.setItem(`interviewer_${room_id}`, newInterviewer);
      localStorage.setItem(`role_switched_${room_id}`, newRoleSwitched.toString());
      
      // Show role switch notification
      const newRole = newInterviewer === 'user1' ? 'Interviewer' : 'Interviewee';
      console.log(`🔄 Role switched! You are now the ${newRole}`);
      
      // Fetch new question when roles switch and sync it across the room
      await fetchAndSetNewQuestion();
      
      // Note: Timer continues running - no reset on role switch
      console.log('⏰ Timer continues without reset:', data.timer_continues);

    } catch (error) {
      console.error('Error switching roles:', error);
      // Fallback to local switch if backend fails
      const newInterviewer = currentInterviewer === 'user1' ? 'user2' : 'user1';
      const newRoleSwitched = !isRoleSwitched;
      
      setCurrentInterviewer(newInterviewer);
      setIsRoleSwitched(newRoleSwitched);
      
      localStorage.setItem(`interviewer_${room_id}`, newInterviewer);
      localStorage.setItem(`role_switched_${room_id}`, newRoleSwitched.toString());
      
      await fetchAndSetNewQuestion();
    }
  }, [currentInterviewer, isRoleSwitched, room_id, fetchAndSetNewQuestion]);

  // Function to get next random question
  const getNextQuestion = () => {
    fetchAndSetNewQuestion();
  };

  // Authentication check and token refresh on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (!isAuthenticated()) {
        console.log("❌ Not authenticated, redirecting to login");
        navigate("/login");
        return;
      }

      try {
        await checkAndRefreshToken();
        console.log("✅ Authentication check completed");
      } catch (error) {
        console.error("❌ Authentication failed:", error);
        clearAuthData();
        navigate("/login");
      }
    };

    initializeAuth();

    // Set up periodic token refresh check (every 10 minutes)
    const tokenCheckInterval = setInterval(async () => {
      try {
        await checkAndRefreshToken();
      } catch (error) {
        console.error("❌ Periodic token refresh failed:", error);
        clearAuthData();
        navigate("/login");
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(tokenCheckInterval);
  }, [navigate]);

  useEffect(() => {
    const fetchRoom = async () => {
      console.log("Fetching room with ID:", room_id);
      
      try {
        setLoading(true);
        setError(null);
        
        const res = await authenticatedFetch(`${API_BASE_URL}/api/interviews/interview-room/${room_id}/`);
        
        console.log("Response status:", res.status);
        
        if (res.status === 404) {
          setError("Room not found. The interview room may not be ready yet or the link is invalid.");
          return;
        }
        
        if (res.status === 403) {
          setError("Access denied. You are not authorized to join this room.");
          return;
        }
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error Response:", errorText);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        console.log("Room data received:", data);
        console.log("Partner username:", data.partner_username);
        setRoomData(data);
        
        // Update connection status
        setPartnerConnected(data.partner_joined || false);
        setBothUsersJoined(data.both_users_joined || false);
        
        // Update timer from backend - this ensures sync across users
        if (data.time_remaining !== undefined && data.time_remaining !== null) {
          console.log('⏰ Initial timer sync from backend:', data.time_remaining);
          setTimeRemaining(data.time_remaining);
          setTimerStarted(data.interview_started || false);
          setLastTimerSync(new Date());
        }
        
        if (data.both_users_joined) {
          console.log("✅ Both users have joined the room");
          // Timer should already be started by backend when both users join
        } else {
          console.log("⏳ Waiting for partner to join...");
        }
        
      } catch (err) {
        console.error("Fetch room error:", err);
        setError(`Failed to load room: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (room_id) {
      fetchRoom();
      fetchSharedQuestion(); // Fetch the shared question when room loads
    } else {
      setError("No room ID provided");
      setLoading(false);
    }
  }, [room_id, fetchSharedQuestion]);

  // Poll for partner connection status and timer sync
  useEffect(() => {
    if (!roomData) return;

    const pollForUpdates = async () => {
      try {
        const res = await authenticatedFetch(`${API_BASE_URL}/api/interviews/interview-room/${room_id}/`);
        
        if (res.ok) {
          const data = await res.json();
          
          // Update room data
          setRoomData(prevData => ({
            ...prevData,
            both_users_joined: data.both_users_joined,
            partner_joined: data.partner_joined,
            interview_started: data.interview_started,
            time_remaining: data.time_remaining,
            current_interviewer: data.current_interviewer
          }));
          
          // Update connection status
          setPartnerConnected(data.partner_joined || false);
          setBothUsersJoined(data.both_users_joined || false);
          
          // Sync current interviewer from backend (for role switching sync)
          if (data.current_interviewer && data.current_interviewer !== currentInterviewer) {
            console.log('🔄 Syncing interviewer role from backend:', data.current_interviewer);
            setCurrentInterviewer(data.current_interviewer);
            localStorage.setItem(`interviewer_${room_id}`, data.current_interviewer);
          }
          
          // Sync timer from backend to prevent desync on refresh
          if (data.time_remaining !== undefined && data.time_remaining !== null) {
            // Only update if significantly different to avoid jitter
            const timeDifference = Math.abs(data.time_remaining - timeRemaining);
            if (timeDifference > 2 || !timerStarted) {
              console.log('⏰ Syncing timer from backend:', data.time_remaining, '(was:', timeRemaining, ')');
              setTimeRemaining(data.time_remaining);
              setLastTimerSync(new Date());
            }
            setTimerStarted(data.interview_started || false);
          }
          
          console.log("Status update - Partner:", data.partner_joined ? "Connected" : "Not connected", "Timer:", data.time_remaining);
        }
      } catch (err) {
        console.error("Error polling for updates:", err);
        // Don't show error for polling - it's happening in background
      }
    };

    // Poll every 1 second for real-time sync (especially for timer)
    const interval = setInterval(pollForUpdates, 1000);

    return () => clearInterval(interval);
  }, [room_id, bothUsersJoined]);

  // Poll for question changes (sync questions between users)
  useEffect(() => {
    if (!bothUsersJoined) return;

    const pollForQuestion = async () => {
      try {
        const res = await authenticatedFetch(`${API_BASE_URL}/api/interviews/room-question/${room_id}/`);
        
        if (res.ok) {
          const data = await res.json();
          if (data.question && data.question.id !== currentQuestion?.id) {
            setCurrentQuestion(data.question);
            console.log("🔄 Question synchronized from partner");
          }
        }
      } catch (err) {
        console.error("Error polling for question:", err);
        // Don't show error for polling - it's happening in background
      }
    };

    // Poll every 3 seconds for question changes
    const interval = setInterval(pollForQuestion, 3000);

    return () => clearInterval(interval);
  }, [room_id, bothUsersJoined, currentQuestion?.id]);

  // Timer useEffect - Only syncs from backend, no local countdown
  useEffect(() => {
    if (!bothUsersJoined || !timerStarted) return; 
    
    // Only show notifications based on backend time, no local countdown
    // The timer updates will come from the polling useEffect
    
    // Show warning notifications based on current backend time
    if (timeRemaining === 300) { // 5 minutes left
      alert('⚠️ 5 minutes remaining for this round!');
    } else if (timeRemaining === 60) { // 1 minute left
      alert('⚠️ 1 minute remaining!');
    } else if (timeRemaining === 0) {
      alert('⏰ Time is up! The interview round has ended.');
    }
    
  }, [timeRemaining, bothUsersJoined, timerStarted]); // React to backend time changes

  // Auto-enable full screen on component mount (commented out - requires user gesture)
  useEffect(() => {
    // Note: Fullscreen API requires user gesture, so we can't auto-enable it
    // Users can manually enable fullscreen using F11 or browser controls
    
    const handleFullscreenChange = () => {
      // Handle fullscreen change events if needed
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Cleanup video/audio streams on page unload (refresh/close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🚪 Page unloading, cleaning up video streams...');
      if (videoCallRef.current) {
        try {
          videoCallRef.current.stopAllStreams();
          console.log('✅ Video cleanup on page unload completed');
        } catch (error) {
          console.error('❌ Error during video cleanup on page unload:', error);
        }
      }
    };

    // Add event listener for when user closes tab, refreshes, or navigates away
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup on component unmount (normal navigation)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also clean up streams when component unmounts
      if (videoCallRef.current) {
        try {
          videoCallRef.current.stopAllStreams();
          console.log('✅ Video cleanup on component unmount completed');
        } catch (error) {
          console.error('❌ Error during video cleanup on component unmount:', error);
        }
      }
    };
  }, []);

  const handleExitInterview = () => {
    // Check if feedback has been submitted
    if (!feedbackSubmitted) {
      setShowFeedbackModal(true);
    } else {
      setShowExitConfirm(true);
    }
  };

  const handleSkipFeedback = () => {
    // Emergency exit without feedback (only if really needed)
    console.log('⚠️ User chose to skip feedback and exit immediately');
    setShowFeedbackModal(false);
    setFeedbackSubmitted(true); // Mark as submitted to skip feedback check
    setShowExitConfirm(true);
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/api/interviews/feedback/${room_id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to submit feedback`);
      }

      const data = await res.json();
      setFeedbackSubmitted(true);
      setShowFeedbackModal(false);
      
      // Now show exit confirmation
      setShowExitConfirm(true);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const confirmExit = () => {
    console.log('🚪 Exiting interview room, cleaning up...');
    
    // Clean up video call streams and connections
    if (videoCallRef.current) {
      try {
        videoCallRef.current.stopAllStreams();
        console.log('✅ Video call cleanup completed');
      } catch (error) {
        console.error('❌ Error during video call cleanup:', error);
      }
    }
    
    // Clean up localStorage when exiting the interview
    localStorage.removeItem(`timer_${room_id}`);
    localStorage.removeItem(`timer_timestamp_${room_id}`);
    localStorage.removeItem(`interviewer_${room_id}`);
    localStorage.removeItem(`role_switched_${room_id}`);
    
    console.log('🧹 LocalStorage cleaned up');
    
    // You can add any cleanup logic here (like notifying the backend)
    navigate('/Practise1');
    
    console.log('🎉 Interview room exit completed');
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const handleViewDetails = () => {
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
  };

  const toggleVideoMinimize = () => {
    setIsVideoMinimized(!isVideoMinimized);
  };

  const toggleVideoCall = () => {
    setShowVideoCall(!showVideoCall);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading interview room...</p>
          <p className="text-sm text-gray-500">Room ID: {room_id}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Room Access Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </button>
          </div>
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Debug Info:</strong><br />
              Room ID: {room_id}<br />
              Time: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Full screen layout
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col overflow-hidden z-50 border-4 border-blue-500">
      {/* Top Header Bar */}
      <div className="bg-white shadow-sm border-b p-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          {/* View Details Button */}
          <button
            onClick={handleViewDetails}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            View Details
          </button>

          {/* Video Call Toggle */}
          <button
            onClick={toggleVideoCall}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showVideoCall 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📹 {showVideoCall ? 'Hide Video' : 'Show Video'}
          </button>
          
          <div>
            <h1 className="text-lg font-bold text-gray-800">Interview Room</h1>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-600">Room ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{room_id}</code></p>
              {/* Partner Connection Status */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${partnerConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600">
                  Partner: <span className={partnerConnected ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {partnerConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Simple Interviewer Display with Capsule Switch */}
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${roomData?.both_users_joined ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-base font-medium text-gray-800">
              Interviewer: <span className="font-semibold text-indigo-700">
                {currentInterviewer === 'user1' ? (localStorage.getItem('username') || 'You') : (roomData?.partner_username || 'Partner')}
              </span>
            </span>
            
            {/* Partner Status */}
            <span className="text-xs text-gray-600">
              Partner: {roomData?.partner_joined ? '🟢' : '🔴'} {roomData?.partner_username || 'Unknown'}
            </span>
            
            {/* Capsule Switch Button */}
            <button
              onClick={handleRoleSwitch}
              className="px-3 py-1 bg-indigo-500 text-white rounded-full text-xs font-medium hover:bg-indigo-600 transition-colors shadow-sm"
            >
              Switch
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Timer Display */}
          <div className="text-center bg-gray-50 px-4 py-2 rounded-lg border relative">
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-b-lg transition-all duration-1000" 
                 style={{width: `${((60 * 60 - timeRemaining) / (60 * 60)) * 100}%`}}>
            </div>
            <div className={`text-xl font-mono font-bold ${
              timeRemaining <= 300 ? 'text-red-600 animate-pulse' : timeRemaining <= 600 ? 'text-yellow-600' : 'text-indigo-600'
            }`}>
              {formatTime(timeRemaining)}
            </div>
            <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
              <span>{timeRemaining <= 300 ? '⚠️ Time critical!' : 'Time remaining'}</span>
              {lastTimerSync && (
                <span className="text-green-500 text-xs">🔄</span>
              )}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleExitInterview}
            className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shadow-md"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border-2 border-blue-400">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">📋 Room Details</h3>
              <button
                onClick={closeDetails}
                className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                <span className="text-sm">✕</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-800 mb-3">Interview Information</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Room ID:</strong> {room_id}</p>
                  <p><strong>Type:</strong> {roomData.interview_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p><strong>Date:</strong> {roomData.date}</p>
                  <p><strong>Time:</strong> {roomData.slot}</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-semibold text-green-800 mb-3">Participant Status</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Interview Partner:</strong> {roomData.partner_username}</p>
                  <p><strong>Partner Status:</strong> 
                    {roomData.partner_joined ? (
                      <span className="text-green-600 font-medium ml-1">🟢 Connected</span>
                    ) : (
                      <span className="text-yellow-600 font-medium ml-1">🟡 Waiting to join...</span>
                    )}
                  </p>
                  <p><strong>Both Users:</strong> 
                    {roomData.both_users_joined ? (
                      <span className="text-green-600 font-medium ml-1">✅ Both Connected</span>
                    ) : (
                      <span className="text-yellow-600 font-medium ml-1">⏳ Waiting for both...</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={handleSkipFeedback} // Emergency skip option
          onSubmit={handleFeedbackSubmit}
          partnerName={roomData?.partner_username || 'Your Partner'}
          roomId={room_id}
        />
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Exit Interview Room?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to leave the interview? This action cannot be undone and you may not be able to rejoin.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelExit}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Yes, Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Half - Questions Section (full height) */}
        <div className="w-1/2 bg-white border-r flex flex-col">
          <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Interview Questions</h2>
              <p className="text-sm text-gray-600">
                Focus: {roomData?.interview_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <p className="text-xs text-indigo-600 font-medium mt-1">
                📝 {currentInterviewer === 'user1' ? 'You are interviewing' : 'You are being interviewed'}
              </p>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {!bothUsersJoined ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Waiting for Interview Partner</h3>
                <p className="text-gray-600 mb-4">
                  {partnerConnected 
                    ? `Your partner ${roomData?.partner_username} is connecting...` 
                    : `Your partner ${roomData?.partner_username} hasn't joined yet.`}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <span>Partner Status:</span>
                    <div className={`w-2 h-2 rounded-full ${partnerConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${partnerConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {partnerConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  The interview will begin once both participants are connected.
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Share the room link with your partner or ensure they have the correct room ID.
                  </p>
                </div>
              </div>
            ) : questionLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading question...</p>
              </div>
            ) : questionError ? (
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                <h3 className="font-medium text-red-800 mb-2">Error Loading Question</h3>
                <p className="text-red-700 text-sm">{questionError}</p>
                <button
                  onClick={getNextQuestion}
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-6">
                {/* Question Header */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-blue-900">{currentQuestion.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        currentQuestion.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-800' 
                          : currentQuestion.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {currentQuestion.difficulty.toUpperCase()}
                      </span>
                      {/* Role indicator on question */}
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {currentInterviewer === 'user1' ? '👨‍💼 You Ask' : '👨‍💻 You Solve'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-blue-700">Category: {currentQuestion.category_name}</p>
                    <p className="text-xs text-gray-600">
                      Round {isRoleSwitched ? '2' : '1'} • 
                      {currentInterviewer === 'user1' ? ' Interviewing Mode' : ' Solving Mode'}
                    </p>
                  </div>
                </div>

                {/* Question Description */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Problem Description</h4>
                  <div className="text-gray-700 whitespace-pre-line">{currentQuestion.question_text}</div>
                </div>

                {/* Examples */}
                {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Examples</h4>
                    {currentQuestion.examples.map((example, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-2">Example {index + 1}:</p>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Input:</span> <code className="bg-white px-2 py-1 rounded text-blue-700">{example.input}</code></p>
                          <p><span className="font-medium">Output:</span> <code className="bg-white px-2 py-1 rounded text-green-700">{example.output}</code></p>
                          {example.explanation && (
                            <p><span className="font-medium">Explanation:</span> {example.explanation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {currentQuestion.constraints && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-3">Constraints</h4>
                    <div className="text-sm text-orange-700 whitespace-pre-line">{currentQuestion.constraints}</div>
                  </div>
                )}

                {/* Hints */}
                {currentQuestion.hints && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">💡 Hints</h4>
                    <div className="text-sm text-green-700 whitespace-pre-line">{currentQuestion.hints}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                <h3 className="font-medium text-gray-800 mb-2">No Question Loaded</h3>
                <p className="text-gray-700 text-sm mb-3">Switch roles to load a new coding problem automatically.</p>
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
                  💡 Tip: Questions automatically change when you switch interviewer/interviewee roles
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Half - Code Editor (w/2 width, full height) */}
        <div className="w-1/2 flex flex-col">
          <div className="p-3 border-b bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Code Editor</h2>
            <p className="text-xs text-gray-600">Write your solution with full IDE features</p>
          </div>
          <div className="flex-1">
            <CodeEditor roomId={room_id} bothUsersJoined={bothUsersJoined} />
          </div>
        </div>
      </div>

      {/* Draggable Video Call */}
      {showVideoCall && (
        <DraggableContainer 
          initialPosition={{ x: 20, y: 100 }}
          className="w-80"
        >
          <VideoCall
            ref={videoCallRef}
            roomId={room_id}
            isMinimized={isVideoMinimized}
            onToggleMinimize={toggleVideoMinimize}
          />
        </DraggableContainer>
      )}
    </div>
  );
};

export default InterviewRoom;

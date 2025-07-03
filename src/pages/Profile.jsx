import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { authenticatedFetch } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetchInterviewHistory();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Fetch user profile data
      const response = await authenticatedFetch(`${API_BASE_URL}/api/accounts/profile/`);
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const fetchInterviewHistory = async () => {
    try {
      // Fetch user's interview history
      const response = await authenticatedFetch(`${API_BASE_URL}/api/interviews/finished-interviews/`);
      if (response.ok) {
        const data = await response.json();
        setInterviewHistory(data.finished_interviews || []);
      }
    } catch (error) {
      console.error('Error fetching interview history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (roomId) => {
    setLoadingFeedback(true);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/interviews/get-feedback/${roomId}/`);
      if (response.ok) {
        const data = await response.json();
        setFeedbackData(data);
        setSelectedFeedback(roomId);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800',
      'scheduled': 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ').toUpperCase() || 'COMPLETED'}
      </span>
    );
  };

  const getInterviewTypeIcon = (type) => {
    const icons = {
      'technical': '💻',
      'behavioral': '🗣️',
      'system_design': '🏗️',
      'coding': '⌨️',
      'data_science': '📊'
    };
    return icons[type] || '📝';
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ⭐
        </span>
      );
    }
    return stars;
  };

  const closeFeedbackModal = () => {
    setSelectedFeedback(null);
    setFeedbackData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-6">
            {/* User Avatar */}
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* User Info */}
            <div className="text-white">
              <h1 className="text-3xl font-bold">{user?.username || localStorage.getItem('username') || 'User'}</h1>
              <p className="text-purple-100 text-lg">Interview Candidate</p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                  <span className="text-sm font-medium">
                    📅 Joined {profileData?.date_joined ? formatDate(profileData.date_joined) : 'Recently'}
                  </span>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                  <span className="text-sm font-medium">
                    🎯 {interviewHistory.length} Interviews Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👤 Profile Information
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📚 Interview History
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'feedback'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💬 Feedback & Reviews
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Username</label>
                        <p className="text-gray-900 font-medium">{user?.username || localStorage.getItem('username') || 'Not available'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900">{profileData?.email || 'Not available'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Member Since</label>
                        <p className="text-gray-900">
                          {profileData?.date_joined ? formatDate(profileData.date_joined) : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Statistics with Hover Effects */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Interview Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 hover:bg-purple-50 cursor-pointer">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {interviewHistory.length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Total Interviews</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 hover:bg-green-50 cursor-pointer">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {interviewHistory.length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Completed</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-50 cursor-pointer">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {interviewHistory.filter(i => i.type === 'technical').length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Technical</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 hover:bg-yellow-50 cursor-pointer">
                        <div className="text-3xl font-bold text-yellow-600 mb-1">
                          {interviewHistory.filter(i => i.type === 'behavioral').length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Behavioral</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  {interviewHistory.length > 0 ? (
                    <div className="space-y-3">
                      {interviewHistory.slice(0, 3).map((interview, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getInterviewTypeIcon(interview.type)}</span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {interview.type?.replace('_', ' ').toUpperCase() || 'GENERAL'} Interview
                              </p>
                              <p className="text-sm text-gray-600">
                                {interview.date ? formatDate(interview.date) : 'Date not available'}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge('completed')}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No recent activity</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Interview History</h2>
                  <div className="text-sm text-gray-600">
                    Total: {interviewHistory.length} interviews
                  </div>
                </div>

                {interviewHistory.length > 0 ? (
                  <div className="space-y-4">
                    {interviewHistory.map((interview, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="text-2xl">
                              {getInterviewTypeIcon(interview.type)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {interview.type?.replace('_', ' ').toUpperCase() || 'GENERAL'} Interview
                              </h3>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Date:</span> {interview.date ? formatDate(interview.date) : 'Not specified'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Time Slot:</span> {interview.slot || 'Not specified'}
                                </p>
                                {interview.partner_username && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Partner:</span> {interview.partner_username}
                                  </p>
                                )}
                                {interview.room_id && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Room ID:</span> {interview.room_id}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            {getStatusBadge('completed')}
                            <div className="text-xs text-green-600 font-medium">
                              ✅ Completed
                            </div>
                            {interview.room_id && interview.both_feedback_completed && (
                              <button
                                onClick={() => fetchFeedback(interview.room_id)}
                                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                              >
                                💬 View Feedback
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {interview.feedback && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Feedback:</h4>
                            <p className="text-sm text-gray-700">{interview.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Interview History</h3>
                    <p className="text-gray-600 mb-6">You haven't completed any interviews yet.</p>
                    <button 
                      onClick={() => window.location.href = '/Practise1'}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Start Your First Interview
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Feedback & Reviews</h2>
                
                {interviewHistory.filter(i => i.both_feedback_completed).length > 0 ? (
                  <div className="grid gap-4">
                    {interviewHistory
                      .filter(i => i.both_feedback_completed)
                      .map((interview, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                {getInterviewTypeIcon(interview.type)}
                                <span className="ml-2">
                                  {interview.type?.replace('_', ' ').toUpperCase() || 'GENERAL'} Interview
                                </span>
                              </h3>
                              <p className="text-sm text-gray-600">
                                {interview.date ? formatDate(interview.date) : 'Date not available'} • 
                                Partner: {interview.partner_username}
                              </p>
                            </div>
                            <button
                              onClick={() => fetchFeedback(interview.room_id)}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Available</h3>
                    <p className="text-gray-600">Complete interviews to receive feedback from your partners.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feedback Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Interview Feedback</h3>
                  <button
                    onClick={closeFeedbackModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {loadingFeedback ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p>Loading feedback...</p>
                  </div>
                ) : feedbackData ? (
                  <div className="space-y-6">
                    {/* Feedback about current user */}
                    {feedbackData.feedback_about_me && (
                      <div className="bg-green-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-green-800 mb-4">
                          💚 Feedback from {feedbackData.partner_username}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Overall Rating:</span>
                            <div className="flex items-center space-x-1">
                              {renderRatingStars(feedbackData.feedback_about_me.overall_rating)}
                              <span className="ml-2 text-sm text-gray-600">
                                ({feedbackData.feedback_about_me.overall_rating}/5)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Communication:</span>
                            <div className="flex items-center space-x-1">
                              {renderRatingStars(feedbackData.feedback_about_me.communication)}
                              <span className="ml-2 text-sm text-gray-600">
                                ({feedbackData.feedback_about_me.communication}/5)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Technical Skills:</span>
                            <div className="flex items-center space-x-1">
                              {renderRatingStars(feedbackData.feedback_about_me.technical_skills)}
                              <span className="ml-2 text-sm text-gray-600">
                                ({feedbackData.feedback_about_me.technical_skills}/5)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Problem Solving:</span>
                            <div className="flex items-center space-x-1">
                              {renderRatingStars(feedbackData.feedback_about_me.problem_solving)}
                              <span className="ml-2 text-sm text-gray-600">
                                ({feedbackData.feedback_about_me.problem_solving}/5)
                              </span>
                            </div>
                          </div>
                          {feedbackData.feedback_about_me.comments && (
                            <div>
                              <span className="font-medium">Comments:</span>
                              <p className="mt-1 text-gray-700">{feedbackData.feedback_about_me.comments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Current user's feedback */}
                    {feedbackData.my_feedback && (
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-blue-800 mb-4">
                          📝 Your Feedback for {feedbackData.partner_username}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Overall Rating:</span>
                            <div className="flex items-center space-x-1">
                              {renderRatingStars(feedbackData.my_feedback.overall_rating)}
                              <span className="ml-2 text-sm text-gray-600">
                                ({feedbackData.my_feedback.overall_rating}/5)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Communication:</span>
                            <div className="flex items-center space-x-1">
                              {renderRatingStars(feedbackData.my_feedback.communication)}
                              <span className="ml-2 text-sm text-gray-600">
                                ({feedbackData.my_feedback.communication}/5)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Technical Skills:</span>
                            <div className="flex items-center space-x-1">
                              {renderRatingStars(feedbackData.my_feedback.technical_skills)}
                              <span className="ml-2 text-sm text-gray-600">
                                ({feedbackData.my_feedback.technical_skills}/5)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Problem Solving:</span>
                            <div className="flex items-center space-x-1">
                              {renderRatingStars(feedbackData.my_feedback.problem_solving)}
                              <span className="ml-2 text-sm text-gray-600">
                                ({feedbackData.my_feedback.problem_solving}/5)
                              </span>
                            </div>
                          </div>
                          {feedbackData.my_feedback.comments && (
                            <div>
                              <span className="font-medium">Comments:</span>
                              <p className="mt-1 text-gray-700">{feedbackData.my_feedback.comments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No feedback available for this interview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

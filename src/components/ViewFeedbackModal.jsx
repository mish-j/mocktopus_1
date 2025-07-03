import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/config';

const ViewFeedbackModal = ({ isOpen, onClose, roomId }) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && roomId) {
      fetchFeedback();
    }
  }, [isOpen, roomId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API_BASE_URL}/api/interviews/get-feedback/${roomId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch feedback`);
      }

      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StarDisplay = ({ rating, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Interview Feedback
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading feedback...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={fetchFeedback}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : feedback ? (
          <div className="space-y-6">
            {/* Interview Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Interview Details</h3>
              <p><strong>Partner:</strong> {feedback.partner_username}</p>
              <p><strong>Type:</strong> {feedback.interview_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p><strong>Date:</strong> {feedback.date}</p>
            </div>

            {/* Feedback About Me */}
            {feedback.feedback_about_me ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-4">📝 Feedback About You</h3>
                
                <StarDisplay rating={feedback.feedback_about_me.overall_rating} label="Overall Rating" />
                <StarDisplay rating={feedback.feedback_about_me.communication} label="Communication Skills" />
                <StarDisplay rating={feedback.feedback_about_me.technical_skills} label="Technical Knowledge" />
                <StarDisplay rating={feedback.feedback_about_me.problem_solving} label="Problem Solving" />
                <StarDisplay rating={feedback.feedback_about_me.professionalism} label="Professionalism" />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Would Interview Again</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    feedback.feedback_about_me.would_interview_again 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {feedback.feedback_about_me.would_interview_again ? '👍 Yes' : '👎 No'}
                  </span>
                </div>

                {feedback.feedback_about_me.comments && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-gray-700">{feedback.feedback_about_me.comments}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600">Your partner hasn't submitted feedback yet.</p>
              </div>
            )}

            {/* My Feedback Given */}
            {feedback.my_feedback ? (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-4">📤 Your Feedback Given</h3>
                
                <StarDisplay rating={feedback.my_feedback.overall_rating} label="Overall Rating" />
                <StarDisplay rating={feedback.my_feedback.communication} label="Communication Skills" />
                <StarDisplay rating={feedback.my_feedback.technical_skills} label="Technical Knowledge" />
                <StarDisplay rating={feedback.my_feedback.problem_solving} label="Problem Solving" />
                <StarDisplay rating={feedback.my_feedback.professionalism} label="Professionalism" />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Would Interview Again</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    feedback.my_feedback.would_interview_again 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {feedback.my_feedback.would_interview_again ? '👍 Yes' : '👎 No'}
                  </span>
                </div>

                {feedback.my_feedback.comments && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Comments</label>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-gray-700">{feedback.my_feedback.comments}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600">You haven't submitted feedback yet.</p>
              </div>
            )}

            {/* Status */}
            <div className="text-center">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                feedback.both_completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {feedback.both_completed ? '✅ Both feedbacks completed' : '⏳ Waiting for all feedback'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No feedback data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewFeedbackModal;

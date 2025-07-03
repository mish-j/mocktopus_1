import React, { useState } from 'react';

const FeedbackModal = ({ isOpen, onClose, onSubmit, partnerName, roomId }) => {
  const [feedback, setFeedback] = useState({
    overall_rating: 5,
    communication: 5,
    technical_skills: 5,
    problem_solving: 5,
    professionalism: 5,
    comments: '',
    would_interview_again: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (category, rating) => {
    setFeedback(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(feedback);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onChange, label }) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`text-2xl ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </p>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📝 Interview Feedback
          </h2>
          <div className="text-sm text-gray-600">
            Partner: <span className="font-medium">{partnerName}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Overall Rating */}
            <StarRating
              rating={feedback.overall_rating}
              onChange={(rating) => handleRatingChange('overall_rating', rating)}
              label="Overall Interview Experience"
            />

            {/* Communication */}
            <StarRating
              rating={feedback.communication}
              onChange={(rating) => handleRatingChange('communication', rating)}
              label="Communication Skills"
            />

            {/* Technical Skills */}
            <StarRating
              rating={feedback.technical_skills}
              onChange={(rating) => handleRatingChange('technical_skills', rating)}
              label="Technical Knowledge"
            />

            {/* Problem Solving */}
            <StarRating
              rating={feedback.problem_solving}
              onChange={(rating) => handleRatingChange('problem_solving', rating)}
              label="Problem Solving Approach"
            />

            {/* Professionalism */}
            <StarRating
              rating={feedback.professionalism}
              onChange={(rating) => handleRatingChange('professionalism', rating)}
              label="Professionalism"
            />

            {/* Would Interview Again */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Would you interview with this person again?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFeedback(prev => ({ ...prev, would_interview_again: true }))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    feedback.would_interview_again
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  👍 Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFeedback(prev => ({ ...prev, would_interview_again: false }))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !feedback.would_interview_again
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  👎 No
                </button>
              </div>
            </div>

            {/* Comments */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Share any specific feedback, strengths, or areas for improvement..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Skip & Exit
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>📋 Note:</strong> Feedback is highly encouraged and will be shared with your interview partner. 
            Your feedback helps improve the interview experience for everyone. Use "Skip & Exit" only in emergency situations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

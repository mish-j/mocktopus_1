import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';

const Coaching = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/coaching/videos/`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      } else {
        throw new Error('Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Using offline data - backend not available');
      // Use fallback data when backend is not available
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Fallback video data in case backend is not available
  const fallbackVideos = [
    {
      id: 1,
      title: "Technical Interview Preparation - Data Structures",
      description: "Master the fundamentals of data structures for technical interviews",
      thumbnail: "https://img.youtube.com/vi/RBSGKlAvoiM/maxresdefault.jpg",
      duration: "15:30",
      category: "technical",
      views: "12.5K",
      instructor: "Sarah Johnson",
      level: "Intermediate"
    },
    {
      id: 2,
      title: "Behavioral Interview Questions & Answers",
      description: "Learn how to answer common behavioral interview questions effectively",
      thumbnail: "https://img.youtube.com/vi/PJKYqLP6MRE/maxresdefault.jpg",
      duration: "22:45",
      category: "behavioral",
      views: "8.2K",
      instructor: "Mike Chen",
      level: "Beginner"
    },
    {
      id: 3,
      title: "System Design Interview - Scalable Applications",
      description: "Design scalable systems and architecture for senior-level interviews",
      thumbnail: "https://img.youtube.com/vi/xpDnVSmNFX0/maxresdefault.jpg",
      duration: "35:20",
      category: "system-design",
      views: "15.7K",
      instructor: "Alex Rodriguez",
      level: "Advanced"
    },
    {
      id: 4,
      title: "Coding Interview Patterns - Two Pointers",
      description: "Master the two-pointer technique for coding interviews",
      thumbnail: "https://img.youtube.com/vi/jzZsG8n2R9A/maxresdefault.jpg",
      duration: "18:15",
      category: "technical",
      views: "9.8K",
      instructor: "Emma Davis",
      level: "Intermediate"
    },
    {
      id: 5,
      title: "Mock Interview: Google Software Engineer",
      description: "Real mock interview session with detailed feedback",
      thumbnail: "https://img.youtube.com/vi/uQdy914JRKQ/maxresdefault.jpg",
      duration: "45:30",
      category: "mock-interview",
      views: "20.1K",
      instructor: "David Kim",
      level: "Advanced"
    },
    {
      id: 6,
      title: "Resume Building for Tech Interviews",
      description: "Create a standout resume that gets you interviews",
      thumbnail: "https://img.youtube.com/vi/ciIkiWwZnlc/maxresdefault.jpg",
      duration: "12:40",
      category: "career",
      views: "6.3K",
      instructor: "Lisa Wang",
      level: "Beginner"
    },
    {
      id: 7,
      title: "Dynamic Programming Interview Questions",
      description: "Solve complex DP problems step by step",
      thumbnail: "https://img.youtube.com/vi/oBt53YbR9Kk/maxresdefault.jpg",
      duration: "28:55",
      category: "technical",
      views: "11.2K",
      instructor: "Robert Brown",
      level: "Advanced"
    },
    {
      id: 8,
      title: "Salary Negotiation for Software Engineers",
      description: "Learn how to negotiate your salary effectively",
      thumbnail: "https://img.youtube.com/vi/fyn0CKPuPlA/maxresdefault.jpg",
      duration: "16:20",
      category: "career",
      views: "14.6K",
      instructor: "Jennifer Lee",
      level: "Intermediate"
    }
  ];

  // Use backend data if available, otherwise fallback to static data
  const videoData = videos.length > 0 ? videos : fallbackVideos;

  const categories = [
    { id: 'all', name: 'All Videos', icon: '📺' },
    { id: 'technical', name: 'Technical', icon: '💻' },
    { id: 'behavioral', name: 'Behavioral', icon: '🗣️' },
    { id: 'system-design', name: 'System Design', icon: '🏗️' },
    { id: 'mock-interview', name: 'Mock Interviews', icon: '🎤' },
    { id: 'career', name: 'Career Tips', icon: '📈' }
  ];

  const handleVideoClick = async (videoId) => {
    try {
      // Increment view count
      await fetch(`${API_BASE_URL}/api/coaching/videos/${videoId}/view/`, {
        method: 'POST',
      });
      
      // You can add navigation to video player or modal here
      console.log(`Playing video ${videoId}`);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleLikeVideo = async (videoId) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/coaching/videos/${videoId}/like/`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh videos to get updated like count
        fetchVideos();
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVideos = videoData.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading coaching videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Videos</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchVideos}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🎓 Interview Coaching Videos
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Master your interview skills with our comprehensive video library. 
              From technical concepts to behavioral questions, we've got you covered.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-purple-300 rounded-xl leading-5 bg-white bg-opacity-20 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-all duration-300"
                  placeholder="Search for videos, topics, or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Offline Notice */}
        {error && error.includes('offline') && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-yellow-800">
                <span className="font-medium">Offline Mode:</span> Showing sample videos. Start the backend server to access the full video library.
              </p>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 shadow-md hover:shadow-lg'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map(video => (
            <div
              key={video.id}
              onClick={() => handleVideoClick(video.id)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2 overflow-hidden group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-purple-600 bg-opacity-90 rounded-full p-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {video.description}
                </p>
                
                {/* Instructor and Level */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {video.instructor.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{video.instructor}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(video.level)}`}>
                    {video.level}
                  </span>
                </div>

                {/* Views and Like */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{video.views || video.view_count || 0} views</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeVideo(video.id);
                    }}
                    className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span>{video.likes || video.like_count || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or category filter</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Practice?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Put your knowledge to the test with our interactive mock interviews
          </p>
          <button
            onClick={() => window.location.href = '/Practise1'}
            className="bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-colors transform hover:scale-105 duration-300 shadow-lg"
          >
            Start Mock Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coaching;

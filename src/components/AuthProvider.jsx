import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  isAuthenticated, 
  checkAndRefreshToken, 
  clearAuthData
} from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check authentication status and refresh token if needed
  const checkAuth = async () => {
    try {
      if (!isAuthenticated()) {
        setIsAuth(false);
        setUser(null);
        return false;
      }

      // Try to refresh token if needed
      await checkAndRefreshToken();
      
      // Get user info from localStorage
      const username = localStorage.getItem('username');
      setUser({ username });
      setIsAuth(true);
      return true;
      
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      clearAuthData();
      setIsAuth(false);
      setUser(null);
      return false;
    }
  };

  // Initialize authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await checkAuth();
      setIsLoading(false);
    };

    initAuth();

    // Set up periodic token refresh (every 15 minutes)
    const interval = setInterval(async () => {
      if (isAuthenticated()) {
        try {
          await checkAndRefreshToken();
          console.log('🔄 Periodic token refresh completed');
        } catch (error) {
          console.error('❌ Periodic token refresh failed:', error);
          logout();
        }
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, []);

  const login = (accessToken, refreshToken, username) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('username', username);
    setIsAuth(true);
    setUser({ username });
    console.log('✅ User logged in via AuthProvider');
  };

  const logout = () => {
    clearAuthData();
    setIsAuth(false);
    setUser(null);
    navigate('/login');
    console.log('🚪 User logged out via AuthProvider');
  };

  const value = {
    isAuthenticated: isAuth,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

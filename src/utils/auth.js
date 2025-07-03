// utils/auth.js
import { API_BASE_URL } from './config';

// Check if user is authenticated (has access token)
export const isAuthenticated = () => {
  return localStorage.getItem("access_token") !== null;  
};

// Get access token from localStorage
export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

// Get refresh token from localStorage
export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

// Save tokens to localStorage
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem("access_token", accessToken);
  if (refreshToken) {
    localStorage.setItem("refresh_token", refreshToken);
  }
};

// Clear all authentication data
export const clearAuthData = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
};

// Refresh the access token using refresh token
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    saveTokens(data.access, null); // Only update access token
    console.log("🔄 Access token refreshed successfully");
    return data.access;
    
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    clearAuthData(); // Clear invalid tokens
    throw error;
  }
};

// Make authenticated API request with automatic token refresh
export const authenticatedFetch = async (url, options = {}) => {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Prepare the request with authorization header
  const requestOptions = {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${accessToken}`,
    },
  };

  try {
    // Make the initial request
    let response = await fetch(url, requestOptions);
    
    // If token is expired (401), try to refresh it
    if (response.status === 401) {
      console.log("🔄 Access token expired, attempting refresh...");
      
      try {
        const newAccessToken = await refreshAccessToken();
        
        // Retry the request with new token
        requestOptions.headers["Authorization"] = `Bearer ${newAccessToken}`;
        response = await fetch(url, requestOptions);
        
        if (response.status === 401) {
          throw new Error("Authentication failed even after token refresh");
        }
        
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error("❌ Token refresh failed, redirecting to login");
        clearAuthData();
        window.location.href = "/login";
        throw refreshError;
      }
    }
    
    return response;
    
  } catch (error) {
    console.error("❌ Authenticated fetch error:", error);
    throw error;
  }
};

// Check if token is expired (optional: for proactive refresh)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

// Proactively refresh token if it's about to expire (within 5 minutes)
export const checkAndRefreshToken = async () => {
  const accessToken = getAccessToken();
  
  if (!accessToken) return false;
  
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const expiryTime = payload.exp;
    const timeUntilExpiry = expiryTime - currentTime;
    
    // Refresh if token expires within 5 minutes (300 seconds)
    if (timeUntilExpiry < 300) {
      console.log("🔄 Token expires soon, refreshing proactively...");
      await refreshAccessToken();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("❌ Error checking token expiry:", error);
    return false;
  }
};

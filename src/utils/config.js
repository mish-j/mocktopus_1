// API Configuration
let baseUrl = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://mocktopus-1.onrender.com'
  : 'http://localhost:8000';

// Remove trailing /api if it exists to avoid double /api/api
if (baseUrl.endsWith('/api')) {
  baseUrl = baseUrl.slice(0, -4);
}

export const API_BASE_URL = baseUrl;

export const config = {
  apiUrl: API_BASE_URL,
  environment: process.env.NODE_ENV,
};

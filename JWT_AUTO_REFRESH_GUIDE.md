# JWT Token Auto-Refresh Implementation

## Overview
This implementation adds automatic JWT token refresh functionality to prevent users from having to log in repeatedly. The system automatically refreshes access tokens when they're about to expire or when API calls return 401 errors.

## Key Features

### 1. Enhanced Authentication Utilities (`src/utils/auth.js`)
- **`authenticatedFetch()`**: Wrapper around fetch that automatically handles token refresh
- **`refreshAccessToken()`**: Refreshes access token using refresh token
- **`checkAndRefreshToken()`**: Proactively checks and refreshes tokens before expiration
- **`isTokenExpired()`**: Checks if a token is expired by parsing JWT payload

### 2. Authentication Context (`src/components/AuthProvider.jsx`)
- Provides global authentication state management
- Automatic periodic token refresh every 15 minutes
- Centralized login/logout functionality
- User state management

### 3. Protected Routes (`src/components/ProtectedRoute.jsx`)
- Wraps protected components to ensure authentication
- Shows loading state while checking authentication
- Automatically redirects to login if not authenticated

### 4. Updated API Calls
- All API calls in `InterviewRoom.jsx` now use `authenticatedFetch()`
- Automatic token refresh on 401 errors
- Better error handling and user experience

## Token Refresh Flow

### Automatic Refresh Scenarios:
1. **On API Call 401**: When any API call returns 401, the system automatically tries to refresh the token and retry the request
2. **Proactive Refresh**: Tokens are refreshed if they expire within 5 minutes (300 seconds)
3. **Periodic Check**: Every 15 minutes, the system checks if tokens need refreshing

### Token Expiration Settings (Backend):
- **Access Token**: 60 minutes lifetime
- **Refresh Token**: 7 days lifetime

## Implementation Details

### 1. Automatic Token Refresh on 401 Errors:
```javascript
// If API call returns 401, automatically refresh token and retry
if (response.status === 401) {
  const newAccessToken = await refreshAccessToken();
  // Retry request with new token
  response = await fetch(url, requestOptionsWithNewToken);
}
```

### 2. Proactive Token Refresh:
```javascript
// Check if token expires within 5 minutes and refresh proactively
const timeUntilExpiry = expiryTime - currentTime;
if (timeUntilExpiry < 300) {
  await refreshAccessToken();
}
```

### 3. Periodic Background Refresh:
```javascript
// Check every 15 minutes for token refresh needs
setInterval(async () => {
  await checkAndRefreshToken();
}, 15 * 60 * 1000);
```

## Usage

### For New Components:
```javascript
import { authenticatedFetch } from '../utils/auth';

// Use instead of regular fetch
const response = await authenticatedFetch('/api/endpoint');
```

### For Protected Routes:
```javascript
import ProtectedRoute from '../components/ProtectedRoute';

<Route path="/protected" element={
  <ProtectedRoute>
    <YourComponent />
  </ProtectedRoute>
} />
```

### For Authentication State:
```javascript
import { useAuth } from '../components/AuthProvider';

const { isAuthenticated, user, logout } = useAuth();
```

## Benefits

1. **Seamless User Experience**: Users stay logged in without interruption
2. **Automatic Token Management**: No manual token refresh needed
3. **Security**: Tokens are refreshed securely using refresh tokens
4. **Error Resilience**: Automatic retry on authentication failures
5. **Centralized State**: Single source of truth for authentication state

## Files Modified

- `src/utils/auth.js` - Enhanced with token refresh utilities
- `src/components/AuthProvider.jsx` - New authentication context
- `src/components/ProtectedRoute.jsx` - New protected route component
- `src/pages/InterviewRoom.jsx` - Updated to use authenticated fetch
- `src/pages/Login.jsx` - Updated to use AuthProvider
- `src/components/Navbar.jsx` - Updated to use AuthProvider for logout
- `src/App.js` - Wrapped with AuthProvider and updated routes

## Testing

1. Login to the application
2. Wait for 60 minutes or manually expire the token
3. Navigate to interview room or make API calls
4. Verify that the system automatically refreshes the token without requiring re-login
5. Check browser console for refresh logs (marked with 🔄 emoji)

## Console Logs

The system provides detailed logging:
- `🔄 Access token refreshed successfully`
- `✅ Authentication check completed`
- `❌ Token refresh failed, redirecting to login`
- `🚪 User logged out via AuthProvider`

This implementation ensures users have a smooth experience without having to log in repeatedly, while maintaining security through proper JWT token management.

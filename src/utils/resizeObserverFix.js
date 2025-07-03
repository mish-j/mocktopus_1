// Fix for ResizeObserver loop limit exceeded error
// This is a common issue with Monaco Editor and other components that use ResizeObserver

// Store the original error handler
const originalError = console.error;

// Override console.error to filter out ResizeObserver errors
console.error = (...args) => {
  // Check if the error is related to ResizeObserver
  if (
    args.length > 0 &&
    typeof args[0] === 'string' &&
    args[0].includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    // Suppress this specific error
    return;
  }
  
  // For all other errors, use the original console.error
  originalError.apply(console, args);
};

// Alternative approach: Add a global error handler
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
});

// Debounce function for resize operations
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for frequent operations
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export default {
  debounce,
  throttle
};

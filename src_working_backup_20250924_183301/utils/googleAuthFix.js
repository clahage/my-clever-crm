// Fix for Google Auth popup blocked issue
export const initGoogleAuthFix = () => {
  // Pre-open a window reference to avoid popup blockers
  window.googleAuthWindow = null;
  
  // Add to window object for Google Auth to use
  window.openGoogleAuth = (url) => {
    if (window.googleAuthWindow && !window.googleAuthWindow.closed) {
      window.googleAuthWindow.location.href = url;
    } else {
      window.googleAuthWindow = window.open(url, 'google-auth', 'width=500,height=600');
    }
    return window.googleAuthWindow;
  };
};

// Call this on app initialization
initGoogleAuthFix();
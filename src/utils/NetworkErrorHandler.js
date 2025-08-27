// NetworkErrorHandler.js - Network failure management for SpeedyCRM

const NetworkErrorHandler = {
  async fetchWithRetry(url, options = {}, retries = 3, backoff = 500) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Network response was not ok');
        return response;
      } catch (err) {
        if (i < retries - 1) {
          await new Promise(res => setTimeout(res, backoff * Math.pow(2, i)));
        } else {
          throw err;
        }
      }
    }
  },
  isOffline() {
    return !navigator.onLine;
  },
  onOffline(callback) {
    window.addEventListener('offline', callback);
  },
  onOnline(callback) {
    window.addEventListener('online', callback);
  },
};

export default NetworkErrorHandler;

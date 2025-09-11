// PerformanceOptimizer.js - Advanced performance utilities for SpeedyCRM

const PerformanceOptimizer = {
  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },
  throttle(fn, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
      if (!lastRan) {
        fn(...args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function() {
          if ((Date.now() - lastRan) >= limit) {
            fn(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  },
  memoize(fn) {
    const cache = {};
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache[key]) return cache[key];
      cache[key] = fn(...args);
      return cache[key];
    };
  },
};

export default PerformanceOptimizer;

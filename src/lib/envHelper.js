// src/lib/envHelper.js
// Universal environment variable loader for Node.js and browser (Vite)

/**
 * Universal environment variable getter
 * Works in both Node.js (for testing) and browser (Vite) environments
 * @param {string} key - Environment variable key
 * @returns {string} - Environment variable value
 */
export function getEnv(key) {
  // In browser with Vite
  if (typeof window !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  
  // In Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  
  // Fallback - warn if not found
  console.warn(`Environment variable ${key} not found`);
  return '';
}

export default getEnv;
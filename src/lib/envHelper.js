/**
 * Universal Environment Variable Loader
 * Works in both Vite (Browser) and Node.js (Test Scripts/Server)
 * * @param {string} key - The name of the environment variable (e.g., 'VITE_OPENAI_API_KEY')
 * @returns {string} - The value of the variable or an empty string if not found
 */
export const getEnv = (key) => {
  // 1. Try Vite (Browser)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }

  // 2. Try Node.js (Server/Test Script)
  // We check for 'process' safely to avoid reference errors in browsers
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  // 3. Fallback
  console.warn(`[EnvHelper] Warning: Environment variable ${key} is missing.`);
  return '';
};
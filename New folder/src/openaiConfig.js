// OpenAI Configuration
// Usage: import { getApiKey, setApiKey } from './openaiConfig';


// OpenAI API key management using environment variable fallback
let apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

export function getApiKey() {
  return apiKey;
}

export function setApiKey(key) {
  apiKey = key;
}

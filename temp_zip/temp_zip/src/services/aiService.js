/**
 * src/services/aiService.js
 * 
 * Client-Side AI Service Wrapper
 * Calls secure Firebase Cloud Functions
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

const functions = getFunctions();

class AIServiceError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.details = details;
  }
}

function handleError(error) {
  console.error('AI Service Error:', error);

  if (error.code === 'unauthenticated') {
    throw new AIServiceError(
      'You must be logged in to use AI features.',
      'AUTH_REQUIRED',
      error
    );
  }

  if (error.code === 'resource-exhausted') {
    throw new AIServiceError(
      'Rate limit exceeded. Please try again in an hour.',
      'RATE_LIMIT',
      error
    );
  }

  throw new AIServiceError(
    error.message || 'An error occurred with the AI service.',
    'UNKNOWN',
    error
  );
}

class AIService {
  async complete(options) {
    try {
      const aiComplete = httpsCallable(functions, 'aiComplete');
      const result = await aiComplete(options);
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  async analyzeCreditReport(reportData, clientInfo = {}) {
    try {
      const analyzeCreditReport = httpsCallable(functions, 'analyzeCreditReport');
      const result = await analyzeCreditReport({ reportData, clientInfo });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  async generateDisputeLetter(options) {
    try {
      const generateDisputeLetter = httpsCallable(functions, 'generateDisputeLetter');
      const result = await generateDisputeLetter(options);
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  async scoreLead(leadId, leadData) {
    try {
      const scoreLead = httpsCallable(functions, 'scoreLead');
      const result = await scoreLead({ leadId, leadData });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  async parseCreditReport(reportText, bureau = null) {
    try {
      const parseCreditReport = httpsCallable(functions, 'parseCreditReport');
      const result = await parseCreditReport({ reportText, bureau });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getUsageStats() {
    try {
      const getAIUsageStats = httpsCallable(functions, 'getAIUsageStats');
      const result = await getAIUsageStats();
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  async getAllUsage(days = 30) {
    try {
      const getAllAIUsage = httpsCallable(functions, 'getAllAIUsage');
      const result = await getAllAIUsage({ days });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  isAuthenticated() {
    const auth = getAuth();
    return !!auth.currentUser;
  }

  getCurrentUserId() {
    const auth = getAuth();
    return auth.currentUser?.uid || null;
  }
}

const aiService = new AIService();
export default aiService;
export { AIService, AIServiceError };
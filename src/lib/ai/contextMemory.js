/**
 * AI CONTEXT MEMORY SYSTEM
 *
 * Purpose:
 * Remembers conversation history, testing sessions, user preferences, and
 * learned patterns to provide increasingly personalized and relevant AI guidance.
 *
 * What It Does:
 * - Stores conversation history with AI Workflow Consultant
 * - Remembers which features user has used/tested
 * - Learns user preferences (communication style, priorities, common questions)
 * - Persists testing session state (can resume where left off)
 * - Tracks what AI has already suggested (avoids repetition)
 * - Remembers decisions user made (approved/rejected suggestions)
 * - Cross-references similar situations from past sessions
 *
 * Why It's Important:
 * - AI assistant becomes smarter over time, not starting from scratch each session
 * - Prevents repetitive suggestions user already rejected
 * - Allows resuming testing sessions after interruption
 * - Provides context-aware guidance based on user's history
 * - Christopher can ask "What did we decide last time about X?"
 * - Builds a knowledge base of company-specific patterns and preferences
 *
 * Example Use Cases:
 * - "Last week you mentioned wanting to focus on Premium tier first"
 * - "You previously rejected this suggestion because of compliance concerns"
 * - "Based on your testing patterns, you typically check email sends first"
 * - "You haven't tested the IDIQ lapse workflow yet - want to try it now?"
 * - "Resuming your Standard tier test from Step 5 where you paused yesterday"
 *
 * Storage Structure:
 * - conversations: Full chat history with AI consultant
 * - sessions: Testing session snapshots (can resume)
 * - preferences: Learned user preferences
 * - suggestions: History of AI suggestions and outcomes
 * - patterns: Detected behavioral patterns
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// MEMORY TYPES
// ============================================================================

/**
 * Categories of information stored in context memory
 */
const MEMORY_TYPES = {
  CONVERSATION: 'conversation',       // Chat messages with AI
  SESSION: 'session',                 // Testing session snapshots
  PREFERENCE: 'preference',           // User preferences
  SUGGESTION: 'suggestion',           // AI suggestions and outcomes
  PATTERN: 'pattern',                 // Learned behavioral patterns
  DECISION: 'decision',               // Important decisions user made
  NOTE: 'note'                        // User's manual notes
};

/**
 * Importance levels for memory prioritization
 */
const IMPORTANCE_LEVELS = {
  CRITICAL: 'critical',     // Must never forget (company policies, legal requirements)
  HIGH: 'high',             // Important decisions and preferences
  MEDIUM: 'medium',         // Useful context and patterns
  LOW: 'low'                // Nice to have, can be cleaned up over time
};

// ============================================================================
// CONTEXT MEMORY CLASS
// ============================================================================

/**
 * Main context memory manager
 * Handles all persistence and retrieval of AI context
 */
export class ContextMemory {
  constructor(userId = 'christopher') {
    this.userId = userId;
    this.sessionId = null;
    this.memoryCache = new Map(); // In-memory cache for performance
  }

  // --------------------------------------------------------------------------
  // SESSION MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Starts a new testing session or resumes an existing one
   *
   * @param {Object} options - Session options
   * @param {string} options.workflowId - Workflow being tested
   * @param {string} options.contactId - Test contact ID
   * @param {string} options.resumeSessionId - ID of session to resume (optional)
   *
   * @returns {Object} Session data
   */
  async startSession(options = {}) {
    const { workflowId, contactId, resumeSessionId } = options;

    // Resume existing session
    if (resumeSessionId) {
      const session = await this.getSession(resumeSessionId);
      if (session) {
        console.log(`[ContextMemory] Resuming session: ${resumeSessionId}`);
        this.sessionId = resumeSessionId;

        // Update session with resume timestamp
        await updateDoc(doc(db, 'contextMemory', resumeSessionId), {
          resumedAt: Timestamp.now(),
          resumeCount: (session.resumeCount || 0) + 1
        });

        return session;
      }
    }

    // Create new session
    const newSession = {
      userId: this.userId,
      workflowId,
      contactId,
      startedAt: Timestamp.now(),
      status: 'active',
      currentStep: 0,
      notes: [],
      suggestions: [],
      decisions: [],
      pausedAt: null,
      resumeCount: 0,
      type: MEMORY_TYPES.SESSION,
      importance: IMPORTANCE_LEVELS.HIGH
    };

    const sessionRef = await addDoc(collection(db, 'contextMemory'), newSession);
    this.sessionId = sessionRef.id;

    console.log(`[ContextMemory] Started new session: ${this.sessionId}`);
    return { id: this.sessionId, ...newSession };
  }

  /**
   * Saves current session state (for pause/resume)
   */
  async saveSessionState(state) {
    if (!this.sessionId) {
      console.warn('[ContextMemory] No active session to save');
      return;
    }

    await updateDoc(doc(db, 'contextMemory', this.sessionId), {
      currentStep: state.currentStep,
      executionState: state.executionState,
      contactState: state.contactState,
      lastSavedAt: Timestamp.now(),
      status: state.isPaused ? 'paused' : 'active',
      pausedAt: state.isPaused ? Timestamp.now() : null
    });

    console.log(`[ContextMemory] Saved session state at step ${state.currentStep}`);
  }

  /**
   * Completes a session
   */
  async completeSession(outcome) {
    if (!this.sessionId) return;

    await updateDoc(doc(db, 'contextMemory', this.sessionId), {
      status: 'completed',
      completedAt: Timestamp.now(),
      outcome,
      finalStep: outcome.finalStep,
      wasSuccessful: outcome.wasSuccessful
    });

    console.log(`[ContextMemory] Session completed: ${outcome.wasSuccessful ? 'success' : 'incomplete'}`);

    // Learn from this session
    await this.learnFromSession(this.sessionId);

    this.sessionId = null;
  }

  /**
   * Retrieves a session by ID
   */
  async getSession(sessionId) {
    const sessionDoc = await getDoc(doc(db, 'contextMemory', sessionId));

    if (!sessionDoc.exists()) {
      return null;
    }

    return { id: sessionDoc.id, ...sessionDoc.data() };
  }

  /**
   * Gets all sessions for a workflow
   */
  async getWorkflowSessions(workflowId, limitCount = 10) {
    const q = query(
      collection(db, 'contextMemory'),
      where('type', '==', MEMORY_TYPES.SESSION),
      where('workflowId', '==', workflowId),
      where('userId', '==', this.userId),
      orderBy('startedAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Finds incomplete sessions that can be resumed
   */
  async findResumableSessions() {
    const q = query(
      collection(db, 'contextMemory'),
      where('type', '==', MEMORY_TYPES.SESSION),
      where('userId', '==', this.userId),
      where('status', 'in', ['active', 'paused']),
      orderBy('startedAt', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // --------------------------------------------------------------------------
  // CONVERSATION HISTORY
  // --------------------------------------------------------------------------

  /**
   * Saves a conversation message
   *
   * @param {Object} message - Message data
   * @param {string} message.role - 'user' or 'assistant'
   * @param {string} message.content - Message content
   * @param {Object} message.context - Additional context
   */
  async saveMessage(message) {
    const messageDoc = {
      userId: this.userId,
      sessionId: this.sessionId,
      role: message.role,
      content: message.content,
      context: message.context || {},
      timestamp: Timestamp.now(),
      type: MEMORY_TYPES.CONVERSATION,
      importance: IMPORTANCE_LEVELS.MEDIUM
    };

    await addDoc(collection(db, 'contextMemory'), messageDoc);
  }

  /**
   * Retrieves conversation history
   *
   * @param {Object} options - Query options
   * @param {string} options.sessionId - Filter by session (optional)
   * @param {number} options.limit - Max messages to retrieve (default: 50)
   * @param {number} options.daysBack - Only get messages from last N days (optional)
   *
   * @returns {Array} Array of messages
   */
  async getConversationHistory(options = {}) {
    const { sessionId, limit: limitCount = 50, daysBack } = options;

    let q = query(
      collection(db, 'contextMemory'),
      where('type', '==', MEMORY_TYPES.CONVERSATION),
      where('userId', '==', this.userId)
    );

    if (sessionId) {
      q = query(q, where('sessionId', '==', sessionId));
    }

    if (daysBack) {
      const startDate = Timestamp.fromDate(
        new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
      );
      q = query(q, where('timestamp', '>=', startDate));
    }

    q = query(q, orderBy('timestamp', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Return in chronological order (oldest first)
    return messages.reverse();
  }

  /**
   * Searches conversation history for specific topics
   */
  async searchConversations(searchTerm, limitCount = 20) {
    // Get recent messages
    const messages = await this.getConversationHistory({ limit: 500 });

    // Simple text search (in production, use full-text search)
    const matches = messages.filter(msg =>
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matches.slice(0, limitCount);
  }

  // --------------------------------------------------------------------------
  // PREFERENCES
  // --------------------------------------------------------------------------

  /**
   * Saves a user preference
   *
   * @param {string} key - Preference key
   * @param {any} value - Preference value
   * @param {string} importance - Importance level
   */
  async savePreference(key, value, importance = IMPORTANCE_LEVELS.MEDIUM) {
    const prefId = `pref_${this.userId}_${key}`;

    const preferenceDoc = {
      userId: this.userId,
      key,
      value,
      importance,
      updatedAt: Timestamp.now(),
      type: MEMORY_TYPES.PREFERENCE
    };

    await setDoc(doc(db, 'contextMemory', prefId), preferenceDoc);

    // Update cache
    this.memoryCache.set(key, value);

    console.log(`[ContextMemory] Saved preference: ${key} = ${JSON.stringify(value)}`);
  }

  /**
   * Gets a user preference
   */
  async getPreference(key, defaultValue = null) {
    // Check cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Query Firestore
    const prefId = `pref_${this.userId}_${key}`;
    const prefDoc = await getDoc(doc(db, 'contextMemory', prefId));

    if (!prefDoc.exists()) {
      return defaultValue;
    }

    const value = prefDoc.data().value;
    this.memoryCache.set(key, value);

    return value;
  }

  /**
   * Gets all user preferences
   */
  async getAllPreferences() {
    const q = query(
      collection(db, 'contextMemory'),
      where('type', '==', MEMORY_TYPES.PREFERENCE),
      where('userId', '==', this.userId)
    );

    const snapshot = await getDocs(q);
    const preferences = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      preferences[data.key] = data.value;
      this.memoryCache.set(data.key, data.value);
    });

    return preferences;
  }

  // --------------------------------------------------------------------------
  // SUGGESTIONS & DECISIONS
  // --------------------------------------------------------------------------

  /**
   * Records an AI suggestion and its outcome
   *
   * @param {Object} suggestion - The suggestion data
   * @param {string} outcome - 'accepted', 'rejected', 'deferred', 'applied'
   * @param {string} userFeedback - Optional feedback from user
   */
  async recordSuggestion(suggestion, outcome, userFeedback = null) {
    const suggestionDoc = {
      userId: this.userId,
      sessionId: this.sessionId,
      suggestionType: suggestion.type,
      suggestionContent: suggestion.suggestion,
      outcome,
      userFeedback,
      confidence: suggestion.confidence,
      priority: suggestion.priority,
      timestamp: Timestamp.now(),
      type: MEMORY_TYPES.SUGGESTION,
      importance: outcome === 'rejected' ? IMPORTANCE_LEVELS.HIGH : IMPORTANCE_LEVELS.MEDIUM
    };

    await addDoc(collection(db, 'contextMemory'), suggestionDoc);

    // If rejected, learn to avoid similar suggestions
    if (outcome === 'rejected' && userFeedback) {
      await this.learnFromRejection(suggestion, userFeedback);
    }

    console.log(`[ContextMemory] Recorded suggestion: ${outcome}`);
  }

  /**
   * Checks if a similar suggestion was previously rejected
   */
  async wasSimilarSuggestionRejected(suggestion) {
    const q = query(
      collection(db, 'contextMemory'),
      where('type', '==', MEMORY_TYPES.SUGGESTION),
      where('userId', '==', this.userId),
      where('suggestionType', '==', suggestion.type),
      where('outcome', '==', 'rejected'),
      limit(10)
    );

    const snapshot = await getDocs(q);

    // Simple similarity check (in production, use embedding similarity)
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const similarity = this.calculateSimilarity(
        suggestion.suggestion,
        data.suggestionContent
      );

      if (similarity > 0.8) {
        return {
          wasRejected: true,
          previousRejection: data,
          reason: data.userFeedback
        };
      }
    }

    return { wasRejected: false };
  }

  /**
   * Records an important decision
   */
  async recordDecision(decision) {
    const decisionDoc = {
      userId: this.userId,
      sessionId: this.sessionId,
      decision: decision.decision,
      context: decision.context,
      reasoning: decision.reasoning,
      timestamp: Timestamp.now(),
      type: MEMORY_TYPES.DECISION,
      importance: IMPORTANCE_LEVELS.HIGH
    };

    await addDoc(collection(db, 'contextMemory'), decisionDoc);

    console.log(`[ContextMemory] Recorded decision: ${decision.decision}`);
  }

  /**
   * Retrieves relevant past decisions
   */
  async getRelevantDecisions(topic, limitCount = 5) {
    const decisions = await this.searchMemory(topic, MEMORY_TYPES.DECISION, limitCount);
    return decisions;
  }

  // --------------------------------------------------------------------------
  // PATTERN LEARNING
  // --------------------------------------------------------------------------

  /**
   * Learns patterns from completed session
   */
  async learnFromSession(sessionId) {
    const session = await this.getSession(sessionId);
    if (!session) return;

    const patterns = [];

    // Detect testing patterns
    if (session.notes && session.notes.length > 0) {
      patterns.push({
        pattern: 'note_taking',
        description: 'User actively takes notes during testing',
        confidence: 0.9
      });
    }

    if (session.resumeCount > 0) {
      patterns.push({
        pattern: 'resume_sessions',
        description: 'User prefers to pause and resume testing sessions',
        confidence: 0.8
      });
    }

    // Analyze step progression
    if (session.executionState) {
      const avgTimePerStep = session.executionState.avgStepDuration || 0;

      if (avgTimePerStep > 120) { // 2 minutes
        patterns.push({
          pattern: 'thorough_testing',
          description: 'User takes time to thoroughly review each step',
          confidence: 0.85
        });
      }
    }

    // Save detected patterns
    for (const pattern of patterns) {
      await this.savePattern(pattern);
    }
  }

  /**
   * Saves a detected behavioral pattern
   */
  async savePattern(pattern) {
    const patternId = `pattern_${this.userId}_${pattern.pattern}`;

    const existingDoc = await getDoc(doc(db, 'contextMemory', patternId));

    if (existingDoc.exists()) {
      // Update confidence based on repeated observations
      const currentConfidence = existingDoc.data().confidence;
      const newConfidence = Math.min(currentConfidence * 1.1, 0.99);

      await updateDoc(doc(db, 'contextMemory', patternId), {
        confidence: newConfidence,
        observationCount: (existingDoc.data().observationCount || 1) + 1,
        lastObservedAt: Timestamp.now()
      });
    } else {
      // Create new pattern
      await setDoc(doc(db, 'contextMemory', patternId), {
        userId: this.userId,
        pattern: pattern.pattern,
        description: pattern.description,
        confidence: pattern.confidence,
        observationCount: 1,
        lastObservedAt: Timestamp.now(),
        type: MEMORY_TYPES.PATTERN,
        importance: IMPORTANCE_LEVELS.MEDIUM
      });
    }
  }

  /**
   * Gets learned patterns for user
   */
  async getPatterns(minConfidence = 0.7) {
    const q = query(
      collection(db, 'contextMemory'),
      where('type', '==', MEMORY_TYPES.PATTERN),
      where('userId', '==', this.userId),
      where('confidence', '>=', minConfidence)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Learns from rejected suggestions to avoid repeating them
   */
  async learnFromRejection(suggestion, feedback) {
    const rejectionPattern = {
      pattern: `avoid_${suggestion.type}_suggestion`,
      description: `User rejected ${suggestion.type} suggestion: ${feedback}`,
      confidence: 0.8
    };

    await this.savePattern(rejectionPattern);
  }

  // --------------------------------------------------------------------------
  // CONTEXT RETRIEVAL
  // --------------------------------------------------------------------------

  /**
   * Gets relevant context for AI to use in current session
   *
   * @param {Object} options - Context options
   * @param {string} options.workflowId - Current workflow
   * @param {number} options.currentStep - Current step in workflow
   * @param {string} options.query - Specific query for context (optional)
   *
   * @returns {Object} Compiled context
   */
  async getRelevantContext(options = {}) {
    const { workflowId, currentStep, query } = options;

    const context = {
      preferences: {},
      patterns: [],
      recentConversations: [],
      previousSessions: [],
      relevantDecisions: [],
      rejectedSuggestions: []
    };

    // Get user preferences
    context.preferences = await this.getAllPreferences();

    // Get learned patterns
    context.patterns = await this.getPatterns(0.7);

    // Get recent conversation history
    context.recentConversations = await this.getConversationHistory({
      sessionId: this.sessionId,
      limit: 20
    });

    // Get previous sessions for this workflow
    if (workflowId) {
      context.previousSessions = await this.getWorkflowSessions(workflowId, 3);
    }

    // Get relevant decisions
    if (query) {
      context.relevantDecisions = await this.getRelevantDecisions(query, 3);
    }

    // Get rejected suggestions to avoid repeating
    const rejectedQ = query(
      collection(db, 'contextMemory'),
      where('type', '==', MEMORY_TYPES.SUGGESTION),
      where('userId', '==', this.userId),
      where('outcome', '==', 'rejected'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const rejectedSnapshot = await getDocs(rejectedQ);
    context.rejectedSuggestions = rejectedSnapshot.docs.map(doc => doc.data());

    return context;
  }

  /**
   * Searches memory for specific information
   */
  async searchMemory(searchTerm, memoryType = null, limitCount = 10) {
    let q = query(
      collection(db, 'contextMemory'),
      where('userId', '==', this.userId)
    );

    if (memoryType) {
      q = query(q, where('type', '==', memoryType));
    }

    q = query(q, orderBy('timestamp', 'desc'), limit(500));

    const snapshot = await getDocs(q);

    // Simple text search
    const matches = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        const searchableText = JSON.stringify(data).toLowerCase();
        return searchableText.includes(searchTerm.toLowerCase());
      })
      .slice(0, limitCount)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    return matches;
  }

  // --------------------------------------------------------------------------
  // NOTES
  // --------------------------------------------------------------------------

  /**
   * Saves a user note
   */
  async saveNote(note, context = {}) {
    const noteDoc = {
      userId: this.userId,
      sessionId: this.sessionId,
      note,
      context,
      timestamp: Timestamp.now(),
      type: MEMORY_TYPES.NOTE,
      importance: IMPORTANCE_LEVELS.MEDIUM
    };

    await addDoc(collection(db, 'contextMemory'), noteDoc);

    // Also add to current session if active
    if (this.sessionId) {
      const sessionDoc = await getDoc(doc(db, 'contextMemory', this.sessionId));
      if (sessionDoc.exists()) {
        const currentNotes = sessionDoc.data().notes || [];
        currentNotes.push({
          note,
          context,
          timestamp: new Date()
        });

        await updateDoc(doc(db, 'contextMemory', this.sessionId), {
          notes: currentNotes
        });
      }
    }

    console.log(`[ContextMemory] Saved note: ${note.substring(0, 50)}...`);
  }

  /**
   * Gets all notes for a session
   */
  async getSessionNotes(sessionId) {
    const session = await getSession(sessionId);
    return session?.notes || [];
  }

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------

  /**
   * Calculates similarity between two strings (simple Jaccard similarity)
   */
  calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Clears memory cache
   */
  clearCache() {
    this.memoryCache.clear();
  }

  /**
   * Exports all memory for backup/analysis
   */
  async exportMemory() {
    const q = query(
      collection(db, 'contextMemory'),
      where('userId', '==', this.userId)
    );

    const snapshot = await getDocs(q);
    const memory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
      userId: this.userId,
      exportedAt: new Date().toISOString(),
      totalRecords: memory.length,
      memory
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Global context memory instance
 * Use this for consistent memory access across the app
 */
export const globalContextMemory = new ContextMemory('christopher');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick access function to save a preference
 */
export async function saveUserPreference(key, value, importance) {
  return await globalContextMemory.savePreference(key, value, importance);
}

/**
 * Quick access function to get a preference
 */
export async function getUserPreference(key, defaultValue) {
  return await globalContextMemory.getPreference(key, defaultValue);
}

/**
 * Quick access function to save a note
 */
export async function saveUserNote(note, context) {
  return await globalContextMemory.saveNote(note, context);
}

/**
 * Quick access function to get relevant context
 */
export async function getAIContext(options) {
  return await globalContextMemory.getRelevantContext(options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  MEMORY_TYPES,
  IMPORTANCE_LEVELS
};

/**
 * Example Usage:
 *
 * // Start a testing session
 * const memory = new ContextMemory('christopher');
 * const session = await memory.startSession({
 *   workflowId: 'standard-tier-onboarding',
 *   contactId: 'test-contact-123'
 * });
 *
 * // Save conversation messages
 * await memory.saveMessage({
 *   role: 'user',
 *   content: 'Why did this email get low open rate?'
 * });
 *
 * await memory.saveMessage({
 *   role: 'assistant',
 *   content: 'The subject line lacks urgency. Try adding...',
 *   context: { stepIndex: 3, analysisType: 'email_optimization' }
 * });
 *
 * // Save user preferences
 * await memory.savePreference('preferred_test_speed', 'fast');
 * await memory.savePreference('focus_areas', ['compliance', 'conversion'], 'high');
 *
 * // Record a suggestion outcome
 * await memory.recordSuggestion(
 *   { type: 'timing', suggestion: 'Send emails at 9am' },
 *   'accepted',
 *   'Good idea, will test this'
 * );
 *
 * // Save session state (for pause/resume)
 * await memory.saveSessionState({
 *   currentStep: 5,
 *   executionState: execution,
 *   contactState: contact,
 *   isPaused: true
 * });
 *
 * // Resume session later
 * const resumedSession = await memory.startSession({
 *   resumeSessionId: 'session-123'
 * });
 *
 * // Get relevant context for AI
 * const context = await memory.getRelevantContext({
 *   workflowId: 'standard-tier-onboarding',
 *   currentStep: 5,
 *   query: 'email optimization'
 * });
 *
 * // Context includes:
 * // - User preferences
 * // - Learned patterns
 * // - Recent conversations
 * // - Previous sessions
 * // - Relevant decisions
 * // - Rejected suggestions to avoid
 *
 * // Save a note
 * await memory.saveNote('Email subject line needs A/B testing', {
 *   stepIndex: 3,
 *   priority: 'high'
 * });
 *
 * // Complete session
 * await memory.completeSession({
 *   finalStep: 12,
 *   wasSuccessful: true,
 *   outcome: 'All steps tested, workflow approved for production'
 * });
 *
 * // Find resumable sessions
 * const resumable = await memory.findResumableSessions();
 * // Returns sessions that were paused or interrupted
 *
 * // Search memory
 * const results = await memory.searchMemory('compliance', null, 10);
 * // Finds all memory items mentioning "compliance"
 *
 * // Export all memory for backup
 * const backup = await memory.exportMemory();
 * // Returns complete memory dump for the user
 */

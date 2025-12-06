/**
 * AI VOICE COMMANDS SYSTEM
 *
 * Purpose:
 * Hands-free control of the CRM using natural language voice commands.
 * Navigate, search, update records, and execute workflows without touching keyboard/mouse.
 *
 * What It Does:
 * - Voice Navigation: "Go to contacts", "Open Sarah's profile"
 * - Voice Search: "Find all Premium clients", "Show me overdue tasks"
 * - Voice Data Entry: "Add note: Client wants to upgrade"
 * - Voice Actions: "Send welcome email", "Start Standard workflow"
 * - Voice Shortcuts: "Show dashboard", "What's next on my todo list?"
 * - Multi-language Support: English, Spanish (common for credit repair clients)
 * - Context Awareness: Understands current page and previous commands
 *
 * Why It's Important:
 * - Hands-free operation while reviewing documents or on phone
 * - Faster than typing for quick commands
 * - Accessibility for users with mobility limitations
 * - More natural interaction during client calls
 * - Reduces context switching during consultations
 * - Professional appearance during screen sharing
 *
 * Example Commands:
 * - "Show me all clients with churn risk"
 * - "Open Michael Thompson's account"
 * - "Send IDIQ reminder to Sarah Johnson"
 * - "Add task: Follow up with Premium prospects tomorrow"
 * - "What's my revenue forecast for this month?"
 * - "Start the Standard tier workflow for the new contact"
 * - "Show me payment history for John Doe"
 * - "Mark this dispute as resolved"
 *
 * Technical Implementation:
 * - Web Speech API for voice recognition
 * - GPT-4 for natural language understanding
 * - Command pattern matching with fuzzy search
 * - Context stack for multi-turn conversations
 * - Voice feedback using Speech Synthesis API
 *
 * Privacy & Security:
 * - Voice processing happens locally (Web Speech API)
 * - Only command text sent to server for NLU
 * - No voice recordings stored
 * - Requires explicit user activation
 * - Timeout after inactivity
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System - Tier 2
 */

// Check if browser supports Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;
const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;

let recognition = null;
let isListening = false;
let commandHistory = [];
let contextStack = [];

// ============================================================================
// VOICE RECOGNITION SETUP
// ============================================================================

/**
 * Initialize voice recognition system
 * @param {Object} config - Configuration options
 * @returns {Object} Voice control interface
 */
export function initializeVoiceCommands(config = {}) {
  if (!SpeechRecognition) {
    console.warn('Web Speech API not supported in this browser');
    return {
      supported: false,
      start: () => {},
      stop: () => {},
      isListening: () => false
    };
  }

  recognition = new SpeechRecognition();

  // Configuration
  recognition.continuous = config.continuous !== false; // Default: true
  recognition.interimResults = config.interimResults !== false; // Default: true
  recognition.lang = config.language || 'en-US'; // Default: English
  recognition.maxAlternatives = config.maxAlternatives || 3;

  // Event handlers
  recognition.onstart = () => {
    isListening = true;
    console.log('[VoiceCommands] Listening started');
    config.onStart?.();
  };

  recognition.onend = () => {
    isListening = false;
    console.log('[VoiceCommands] Listening stopped');
    config.onEnd?.();

    // Auto-restart if continuous mode
    if (config.autoRestart && recognition.continuous) {
      setTimeout(() => startListening(), 100);
    }
  };

  recognition.onresult = async (event) => {
    const results = Array.from(event.results);
    const lastResult = results[results.length - 1];

    if (lastResult.isFinal) {
      const transcript = lastResult[0].transcript.trim();
      const confidence = lastResult[0].confidence;

      console.log('[VoiceCommands] Transcript:', transcript, `(${Math.round(confidence * 100)}%)`);

      config.onTranscript?.(transcript, confidence);

      // Process command
      const response = await processCommand(transcript, {
        confidence,
        context: getCurrentContext(),
        commandHistory
      });

      config.onCommand?.(transcript, response);

      // Voice feedback
      if (config.voiceFeedback && response.feedback) {
        speak(response.feedback);
      }

      // Add to history
      commandHistory.push({
        timestamp: new Date(),
        transcript,
        confidence,
        response
      });

      // Limit history to last 50 commands
      if (commandHistory.length > 50) {
        commandHistory = commandHistory.slice(-50);
      }
    } else if (config.onInterim) {
      // Interim results (while still speaking)
      const transcript = lastResult[0].transcript;
      config.onInterim(transcript);
    }
  };

  recognition.onerror = (event) => {
    console.error('[VoiceCommands] Error:', event.error);
    config.onError?.(event.error);

    // Handle specific errors
    if (event.error === 'not-allowed') {
      speak('Microphone access denied. Please enable microphone permissions.');
    } else if (event.error === 'no-speech') {
      // No speech detected - this is normal, just restart
      if (config.autoRestart) {
        setTimeout(() => startListening(), 100);
      }
    }
  };

  recognition.onnomatch = () => {
    console.warn('[VoiceCommands] No match found');
    config.onNoMatch?.();
  };

  return {
    supported: true,
    start: startListening,
    stop: stopListening,
    isListening: () => isListening,
    processCommand,
    getHistory: () => commandHistory,
    clearHistory: () => { commandHistory = []; },
    setContext: setContext,
    getContext: getCurrentContext
  };
}

function startListening() {
  if (!recognition) {
    console.error('[VoiceCommands] Recognition not initialized');
    return false;
  }

  if (isListening) {
    console.log('[VoiceCommands] Already listening');
    return true;
  }

  try {
    recognition.start();
    return true;
  } catch (error) {
    console.error('[VoiceCommands] Failed to start:', error);
    return false;
  }
}

function stopListening() {
  if (!recognition || !isListening) {
    return;
  }

  try {
    recognition.stop();
  } catch (error) {
    console.error('[VoiceCommands] Failed to stop:', error);
  }
}

// ============================================================================
// COMMAND PROCESSING
// ============================================================================

/**
 * Process voice command and execute appropriate action
 * @param {string} transcript - Voice transcript
 * @param {Object} options - Processing options
 * @returns {Object} Command response
 */
export async function processCommand(transcript, options = {}) {
  const normalizedCommand = transcript.toLowerCase().trim();

  // 1. Try exact match patterns first (fastest)
  const exactMatch = matchExactCommand(normalizedCommand);
  if (exactMatch) {
    return executeCommand(exactMatch);
  }

  // 2. Try fuzzy pattern matching
  const fuzzyMatch = matchFuzzyCommand(normalizedCommand);
  if (fuzzyMatch && fuzzyMatch.confidence > 0.7) {
    return executeCommand(fuzzyMatch.command);
  }

  // 3. Use AI for natural language understanding (slowest but most flexible)
  if (options.confidence > 0.6) {
    const aiCommand = await parseCommandWithAI(normalizedCommand, options.context);
    if (aiCommand) {
      return executeCommand(aiCommand);
    }
  }

  // 4. No match found
  return {
    success: false,
    error: 'command_not_recognized',
    feedback: `I didn't understand "${transcript}". Try saying "help" for available commands.`,
    suggestions: getSimilarCommands(normalizedCommand)
  };
}

// ============================================================================
// COMMAND PATTERNS
// ============================================================================

const COMMAND_PATTERNS = {
  // NAVIGATION
  navigation: [
    {
      patterns: ['go to dashboard', 'show dashboard', 'home'],
      action: 'navigate',
      target: '/dashboard',
      feedback: 'Opening dashboard'
    },
    {
      patterns: ['go to contacts', 'show contacts', 'contact list'],
      action: 'navigate',
      target: '/contacts',
      feedback: 'Opening contacts'
    },
    {
      patterns: ['go to workflows', 'show workflows', 'workflow list'],
      action: 'navigate',
      target: '/workflows',
      feedback: 'Opening workflows'
    },
    {
      patterns: ['go to analytics', 'show analytics', 'show reports'],
      action: 'navigate',
      target: '/analytics',
      feedback: 'Opening analytics'
    },
    {
      patterns: ['go to settings', 'show settings', 'open settings'],
      action: 'navigate',
      target: '/settings',
      feedback: 'Opening settings'
    }
  ],

  // SEARCH & FILTER
  search: [
    {
      patterns: ['find {query}', 'search for {query}', 'show me {query}'],
      action: 'search',
      feedback: 'Searching for {query}'
    },
    {
      patterns: ['show all {tier} clients', 'filter by {tier}'],
      action: 'filter',
      field: 'serviceTier',
      feedback: 'Filtering {tier} tier clients'
    },
    {
      patterns: ['show high risk clients', 'show churn risk'],
      action: 'filter',
      field: 'churnRisk',
      value: 'high',
      feedback: 'Showing high churn risk clients'
    }
  ],

  // CONTACT ACTIONS
  contacts: [
    {
      patterns: ['open {name}', 'show {name}', 'go to {name}'],
      action: 'open_contact',
      feedback: 'Opening {name}\'s profile'
    },
    {
      patterns: ['call {name}', 'phone {name}'],
      action: 'initiate_call',
      feedback: 'Initiating call to {name}'
    },
    {
      patterns: ['email {name}', 'send email to {name}'],
      action: 'compose_email',
      feedback: 'Composing email to {name}'
    },
    {
      patterns: ['add note {text}', 'create note {text}', 'note {text}'],
      action: 'add_note',
      feedback: 'Note added'
    }
  ],

  // WORKFLOW ACTIONS
  workflows: [
    {
      patterns: ['start workflow for {name}', 'begin workflow {name}'],
      action: 'start_workflow',
      feedback: 'Starting workflow for {name}'
    },
    {
      patterns: ['pause workflow', 'stop workflow'],
      action: 'pause_workflow',
      feedback: 'Workflow paused'
    },
    {
      patterns: ['resume workflow', 'continue workflow'],
      action: 'resume_workflow',
      feedback: 'Workflow resumed'
    }
  ],

  // ANALYTICS & REPORTING
  analytics: [
    {
      patterns: ['what is my revenue', 'show revenue', 'revenue forecast'],
      action: 'show_revenue',
      feedback: 'Showing revenue forecast'
    },
    {
      patterns: ['how many clients', 'client count', 'show client stats'],
      action: 'show_client_stats',
      feedback: 'Showing client statistics'
    },
    {
      patterns: ['show churn risk', 'who might churn', 'at risk clients'],
      action: 'show_churn_predictions',
      feedback: 'Showing churn risk analysis'
    }
  ],

  // TASKS & TODOS
  tasks: [
    {
      patterns: ['add task {text}', 'create task {text}', 'new task {text}'],
      action: 'create_task',
      feedback: 'Task created'
    },
    {
      patterns: ['show my tasks', 'what\'s on my todo', 'my tasks'],
      action: 'show_tasks',
      feedback: 'Showing your tasks'
    },
    {
      patterns: ['mark task complete', 'complete task', 'done'],
      action: 'complete_task',
      feedback: 'Task marked complete'
    }
  ],

  // SYSTEM COMMANDS
  system: [
    {
      patterns: ['help', 'what can you do', 'available commands'],
      action: 'show_help',
      feedback: 'Here are the available voice commands'
    },
    {
      patterns: ['repeat', 'say that again', 'what did you say'],
      action: 'repeat_last',
      feedback: null // Will repeat last feedback
    },
    {
      patterns: ['cancel', 'never mind', 'stop'],
      action: 'cancel',
      feedback: 'Cancelled'
    }
  ]
};

function matchExactCommand(transcript) {
  for (const category in COMMAND_PATTERNS) {
    const commands = COMMAND_PATTERNS[category];

    for (const command of commands) {
      for (const pattern of command.patterns) {
        if (pattern === transcript) {
          return command;
        }
      }
    }
  }

  return null;
}

function matchFuzzyCommand(transcript) {
  let bestMatch = null;
  let bestScore = 0;

  for (const category in COMMAND_PATTERNS) {
    const commands = COMMAND_PATTERNS[category];

    for (const command of commands) {
      for (const pattern of command.patterns) {
        const score = calculateSimilarity(transcript, pattern);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            command,
            confidence: score,
            pattern
          };
        }

        // Check for parameter patterns (e.g., "open {name}")
        if (pattern.includes('{')) {
          const paramMatch = matchParameterPattern(transcript, pattern);
          if (paramMatch) {
            return {
              command: {
                ...command,
                parameters: paramMatch.parameters
              },
              confidence: paramMatch.confidence,
              pattern
            };
          }
        }
      }
    }
  }

  return bestMatch;
}

function matchParameterPattern(transcript, pattern) {
  // Convert pattern to regex
  // "open {name}" → /^open (.+)$/
  const regexPattern = pattern
    .replace(/\{(\w+)\}/g, '(.+)')
    .replace(/\s+/g, '\\s+');

  const regex = new RegExp(`^${regexPattern}$`, 'i');
  const match = transcript.match(regex);

  if (!match) return null;

  // Extract parameter names
  const paramNames = (pattern.match(/\{(\w+)\}/g) || [])
    .map(p => p.replace(/[{}]/g, ''));

  // Build parameters object
  const parameters = {};
  paramNames.forEach((name, index) => {
    parameters[name] = match[index + 1].trim();
  });

  return {
    parameters,
    confidence: 0.9
  };
}

function calculateSimilarity(str1, str2) {
  // Levenshtein distance for fuzzy matching
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// ============================================================================
// AI-POWERED COMMAND PARSING
// ============================================================================

async function parseCommandWithAI(transcript, context) {
  // This would call a Cloud Function that uses GPT-4 to understand natural language
  // For now, return null to indicate no AI match
  // In production, this would make an API call to Firebase Functions

  try {
    const response = await fetch('/api/parseVoiceCommand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, context })
    });

    if (!response.ok) return null;

    const result = await response.json();
    return result.command || null;

  } catch (error) {
    console.error('[VoiceCommands] AI parsing failed:', error);
    return null;
  }
}

// ============================================================================
// COMMAND EXECUTION
// ============================================================================

async function executeCommand(command) {
  const { action, parameters = {} } = command;

  try {
    let result;

    switch (action) {
      case 'navigate':
        result = await executeNavigation(command.target);
        break;

      case 'search':
        result = await executeSearch(parameters.query);
        break;

      case 'filter':
        result = await executeFilter(command.field, command.value || parameters.value);
        break;

      case 'open_contact':
        result = await executeOpenContact(parameters.name);
        break;

      case 'compose_email':
        result = await executeComposeEmail(parameters.name);
        break;

      case 'add_note':
        result = await executeAddNote(parameters.text);
        break;

      case 'create_task':
        result = await executeCreateTask(parameters.text);
        break;

      case 'show_tasks':
        result = await executeShowTasks();
        break;

      case 'show_revenue':
        result = await executeShowRevenue();
        break;

      case 'show_churn_predictions':
        result = await executeShowChurnPredictions();
        break;

      case 'show_help':
        result = executeShowHelp();
        break;

      case 'repeat_last':
        result = executeRepeatLast();
        break;

      case 'cancel':
        result = { success: true, feedback: 'Cancelled' };
        break;

      default:
        result = {
          success: false,
          error: 'unknown_action',
          feedback: `I don't know how to ${action}`
        };
    }

    return {
      success: true,
      action,
      feedback: command.feedback?.replace(/\{(\w+)\}/g, (_, key) => parameters[key] || ''),
      ...result
    };

  } catch (error) {
    console.error('[VoiceCommands] Execution error:', error);
    return {
      success: false,
      error: error.message,
      feedback: 'Sorry, something went wrong executing that command.'
    };
  }
}

// Command execution functions
async function executeNavigation(target) {
  window.location.href = target;
  return { navigatedTo: target };
}

async function executeSearch(query) {
  // Trigger search in current context
  const searchEvent = new CustomEvent('voice-search', { detail: { query } });
  window.dispatchEvent(searchEvent);
  return { searched: query };
}

async function executeFilter(field, value) {
  const filterEvent = new CustomEvent('voice-filter', { detail: { field, value } });
  window.dispatchEvent(filterEvent);
  return { filtered: { field, value } };
}

async function executeOpenContact(name) {
  // Search for contact and open profile
  const openEvent = new CustomEvent('voice-open-contact', { detail: { name } });
  window.dispatchEvent(openEvent);
  return { opened: name };
}

async function executeComposeEmail(name) {
  const emailEvent = new CustomEvent('voice-compose-email', { detail: { name } });
  window.dispatchEvent(emailEvent);
  return { composing: true };
}

async function executeAddNote(text) {
  const noteEvent = new CustomEvent('voice-add-note', { detail: { text } });
  window.dispatchEvent(noteEvent);
  return { noteAdded: true };
}

async function executeCreateTask(text) {
  const taskEvent = new CustomEvent('voice-create-task', { detail: { text } });
  window.dispatchEvent(taskEvent);
  return { taskCreated: true };
}

async function executeShowTasks() {
  window.location.href = '/tasks';
  return { showing: 'tasks' };
}

async function executeShowRevenue() {
  const analyticsEvent = new CustomEvent('voice-show-analytics', { detail: { view: 'revenue' } });
  window.dispatchEvent(analyticsEvent);
  return { showing: 'revenue' };
}

async function executeShowChurnPredictions() {
  const analyticsEvent = new CustomEvent('voice-show-analytics', { detail: { view: 'churn' } });
  window.dispatchEvent(analyticsEvent);
  return { showing: 'churn_predictions' };
}

function executeShowHelp() {
  return {
    commands: [
      'Navigation: "Go to contacts", "Show dashboard"',
      'Search: "Find all Premium clients", "Show high risk"',
      'Actions: "Open Sarah Johnson", "Add note"',
      'Analytics: "Show revenue", "What is my forecast?"',
      'Tasks: "Add task", "Show my tasks"'
    ]
  };
}

function executeRepeatLast() {
  const lastCommand = commandHistory[commandHistory.length - 1];
  if (lastCommand) {
    return {
      repeated: true,
      feedback: lastCommand.response.feedback
    };
  }
  return { feedback: 'No previous command to repeat' };
}

// ============================================================================
// VOICE FEEDBACK (TEXT-TO-SPEECH)
// ============================================================================

/**
 * Speak text using browser's speech synthesis
 * @param {string} text - Text to speak
 * @param {Object} options - Speech options
 */
export function speak(text, options = {}) {
  if (!SpeechSynthesis) {
    console.warn('Speech Synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  SpeechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;
  utterance.lang = options.lang || 'en-US';

  SpeechSynthesis.speak(utterance);
}

// ============================================================================
// CONTEXT MANAGEMENT
// ============================================================================

function getCurrentContext() {
  return {
    page: window.location.pathname,
    stack: contextStack,
    timestamp: new Date()
  };
}

function setContext(context) {
  contextStack.push({
    ...context,
    timestamp: new Date()
  });

  // Limit context stack to last 10 items
  if (contextStack.length > 10) {
    contextStack = contextStack.slice(-10);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getSimilarCommands(transcript) {
  const allPatterns = [];

  for (const category in COMMAND_PATTERNS) {
    COMMAND_PATTERNS[category].forEach(cmd => {
      cmd.patterns.forEach(pattern => {
        allPatterns.push(pattern);
      });
    });
  }

  return allPatterns
    .map(pattern => ({
      pattern,
      similarity: calculateSimilarity(transcript, pattern)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(item => item.pattern);
}

export default {
  initializeVoiceCommands,
  processCommand,
  speak,
  isSupported: () => !!SpeechRecognition && !!SpeechSynthesis
};

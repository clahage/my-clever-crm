// ============================================================================
// VoiceInputService.js - Web Speech API Wrapper
// ============================================================================
// Provides voice-to-text input capabilities for form fields
// Features:
// - Browser compatibility detection
// - Continuous vs single-shot modes
// - Multi-language support (English, Spanish)
// - Confidence scoring
// - Field-specific formatting (phone, SSN, dates, addresses)
// - Auto-extraction of relevant data from natural speech
// ============================================================================

// ============================================================================
// BROWSER COMPATIBILITY CHECK
// ============================================================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

export const isSpeechRecognitionSupported = () => {
  return !!SpeechRecognition;
};

// ============================================================================
// WORD TO NUMBER CONVERSION
// ============================================================================
const WORD_NUMBERS = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3',
  'four': '4', 'for': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8', 'ate': '8',
  'nine': '9',
  'ten': '10',
  'eleven': '11',
  'twelve': '12',
  'thirteen': '13',
  'fourteen': '14',
  'fifteen': '15',
  'sixteen': '16',
  'seventeen': '17',
  'eighteen': '18',
  'nineteen': '19',
  'twenty': '20',
  'thirty': '30',
  'forty': '40',
  'fifty': '50',
  'sixty': '60',
  'seventy': '70',
  'eighty': '80',
  'ninety': '90',
  'hundred': '00',
  'thousand': '000',
};

// Spanish word numbers
const SPANISH_WORD_NUMBERS = {
  'cero': '0',
  'uno': '1', 'una': '1',
  'dos': '2',
  'tres': '3',
  'cuatro': '4',
  'cinco': '5',
  'seis': '6',
  'siete': '7',
  'ocho': '8',
  'nueve': '9',
  'diez': '10',
};

// ============================================================================
// TEXT PROCESSING UTILITIES
// ============================================================================

/**
 * Convert spoken words to numbers
 * "seven one four five five five one two three four" → "7145551234"
 */
const wordsToNumbers = (text, language = 'en-US') => {
  const wordMap = language.startsWith('es') ? { ...WORD_NUMBERS, ...SPANISH_WORD_NUMBERS } : WORD_NUMBERS;

  let result = text.toLowerCase();

  // Replace word numbers with digits
  Object.entries(wordMap).forEach(([word, digit]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, digit);
  });

  // Handle compound numbers like "twenty three" → "23"
  result = result.replace(/(\d)0\s+(\d)/g, '$1$2');

  return result;
};

/**
 * Extract digits only from text
 */
const extractDigits = (text) => {
  return text.replace(/\D/g, '');
};

/**
 * Format phone number
 * "7145551234" → "(714) 555-1234"
 */
const formatPhoneNumber = (digits) => {
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return digits;
};

/**
 * Format SSN
 * "123456789" → "123-45-6789"
 */
const formatSSN = (digits) => {
  if (digits.length === 9) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }
  return digits;
};

/**
 * Format date from spoken text
 * "January 15th 1990" → "01/15/1990"
 */
const formatDate = (text) => {
  const months = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12',
    // Spanish
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
    'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
    'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12',
  };

  let processed = text.toLowerCase();

  // Convert month names to numbers
  Object.entries(months).forEach(([name, num]) => {
    processed = processed.replace(new RegExp(name, 'gi'), num);
  });

  // Remove ordinal suffixes
  processed = processed.replace(/(\d+)(st|nd|rd|th)/gi, '$1');

  // Convert word numbers
  processed = wordsToNumbers(processed);

  // Extract date parts
  const numbers = processed.match(/\d+/g);
  if (numbers && numbers.length >= 3) {
    const [month, day, year] = numbers;
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    const fullYear = year.length === 2 ? (parseInt(year) > 50 ? '19' + year : '20' + year) : year;
    return `${paddedMonth}/${paddedDay}/${fullYear}`;
  }

  return text;
};

/**
 * Extract name from natural speech
 * "My name is John Smith" → "John Smith"
 */
const extractName = (text) => {
  // Common patterns for name introduction
  const patterns = [
    /my name is (.+)/i,
    /i am (.+)/i,
    /i'm (.+)/i,
    /this is (.+)/i,
    /it's (.+)/i,
    /call me (.+)/i,
    /me llamo (.+)/i,  // Spanish
    /soy (.+)/i,       // Spanish
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Clean up the extracted name
      let name = match[1].trim();
      // Remove common trailing words
      name = name.replace(/\s*(speaking|here|calling|from|at|the|um|uh).*$/i, '');
      return name;
    }
  }

  // If no pattern matched, just clean up the text
  return text.trim();
};

/**
 * Extract address from natural speech
 * "I live at one two three Main Street" → "123 Main Street"
 */
const extractAddress = (text) => {
  // Convert word numbers to digits
  let processed = wordsToNumbers(text);

  // Remove common prefixes
  processed = processed.replace(/^(i live at|my address is|it's|i'm at|address is)\s*/i, '');

  // Capitalize first letter of each word
  processed = processed.replace(/\b\w/g, c => c.toUpperCase());

  return processed.trim();
};

/**
 * Extract email from spoken text
 * "john dot smith at gmail dot com" → "john.smith@gmail.com"
 */
const extractEmail = (text) => {
  let processed = text.toLowerCase();

  // Common email speech patterns
  processed = processed
    .replace(/\s*at\s*/g, '@')
    .replace(/\s*dot\s*/g, '.')
    .replace(/\s*dash\s*/g, '-')
    .replace(/\s*underscore\s*/g, '_')
    .replace(/\s+/g, '');

  return processed;
};

// ============================================================================
// FIELD TYPE PROCESSORS
// ============================================================================
const FIELD_PROCESSORS = {
  text: (text) => extractName(text),
  name: (text) => extractName(text),
  firstName: (text) => {
    const name = extractName(text);
    return name.split(' ')[0] || name;
  },
  lastName: (text) => {
    const name = extractName(text);
    const parts = name.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : name;
  },
  phone: (text) => {
    const withNumbers = wordsToNumbers(text);
    const digits = extractDigits(withNumbers);
    return formatPhoneNumber(digits);
  },
  ssn: (text) => {
    const withNumbers = wordsToNumbers(text);
    const digits = extractDigits(withNumbers);
    return formatSSN(digits);
  },
  date: (text) => formatDate(text),
  dob: (text) => formatDate(text),
  address: (text) => extractAddress(text),
  email: (text) => extractEmail(text),
  zip: (text) => {
    const withNumbers = wordsToNumbers(text);
    const digits = extractDigits(withNumbers);
    return digits.slice(0, 5);
  },
  number: (text) => {
    const withNumbers = wordsToNumbers(text);
    return extractDigits(withNumbers);
  },
};

// ============================================================================
// VOICE INPUT SERVICE CLASS
// ============================================================================
class VoiceInputService {
  constructor(options = {}) {
    this.recognition = null;
    this.isListening = false;
    this.language = options.language || 'en-US';
    this.continuous = options.continuous || false;
    this.interimResults = options.interimResults !== false;
    this.maxAlternatives = options.maxAlternatives || 1;

    // Callbacks
    this.onStart = options.onStart || (() => {});
    this.onResult = options.onResult || (() => {});
    this.onError = options.onError || (() => {});
    this.onEnd = options.onEnd || (() => {});
    this.onInterim = options.onInterim || (() => {});

    this._initialize();
  }

  _initialize() {
    if (!isSpeechRecognitionSupported()) {
      console.warn('Speech recognition is not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.continuous;
    this.recognition.interimResults = this.interimResults;
    this.recognition.maxAlternatives = this.maxAlternatives;
    this.recognition.lang = this.language;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStart();
    };

    this.recognition.onresult = (event) => {
      const results = event.results;
      const lastResult = results[results.length - 1];

      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript;
        const confidence = lastResult[0].confidence;

        this.onResult({
          transcript,
          confidence,
          isFinal: true,
          alternatives: Array.from(lastResult).map(alt => ({
            transcript: alt.transcript,
            confidence: alt.confidence,
          })),
        });
      } else {
        // Interim result
        const transcript = lastResult[0].transcript;
        this.onInterim({
          transcript,
          isFinal: false,
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.onError({
        error: event.error,
        message: this._getErrorMessage(event.error),
      });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEnd();
    };
  }

  _getErrorMessage(error) {
    const messages = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'Microphone not available. Please check your microphone.',
      'not-allowed': 'Microphone access denied. Please allow microphone access.',
      'network': 'Network error. Please check your connection.',
      'aborted': 'Speech recognition aborted.',
      'language-not-supported': 'Language not supported.',
    };
    return messages[error] || 'An error occurred with speech recognition.';
  }

  /**
   * Start listening for voice input
   */
  start() {
    if (!this.recognition) {
      this.onError({ error: 'not-supported', message: 'Speech recognition is not supported' });
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.onError({ error: 'start-error', message: error.message });
    }
  }

  /**
   * Stop listening
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Abort listening immediately
   */
  abort() {
    if (this.recognition) {
      this.recognition.abort();
    }
  }

  /**
   * Change language
   */
  setLanguage(language) {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  /**
   * Process transcript based on field type
   */
  processTranscript(transcript, fieldType = 'text') {
    const processor = FIELD_PROCESSORS[fieldType] || FIELD_PROCESSORS.text;
    return processor(transcript);
  }

  /**
   * Check if currently listening
   */
  getIsListening() {
    return this.isListening;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.abort();
    this.recognition = null;
  }
}

// ============================================================================
// SINGLETON INSTANCE FOR GLOBAL USE
// ============================================================================
let globalInstance = null;

export const getVoiceInputService = (options = {}) => {
  if (!globalInstance) {
    globalInstance = new VoiceInputService(options);
  }
  return globalInstance;
};

export const createVoiceInputService = (options = {}) => {
  return new VoiceInputService(options);
};

// ============================================================================
// REACT HOOK HELPER
// ============================================================================
export const useVoiceInput = (options = {}) => {
  const { fieldType = 'text', language = 'en-US', onComplete, onInterimResult } = options;

  const startListening = (callbacks = {}) => {
    const service = createVoiceInputService({
      language,
      continuous: false,
      onResult: (result) => {
        const processed = FIELD_PROCESSORS[fieldType]?.(result.transcript) || result.transcript;
        if (callbacks.onResult) callbacks.onResult(processed, result);
        if (onComplete) onComplete(processed, result);
      },
      onInterim: (result) => {
        if (callbacks.onInterim) callbacks.onInterim(result.transcript);
        if (onInterimResult) onInterimResult(result.transcript);
      },
      onError: callbacks.onError,
      onStart: callbacks.onStart,
      onEnd: callbacks.onEnd,
    });

    service.start();
    return service;
  };

  return {
    startListening,
    isSupported: isSpeechRecognitionSupported(),
    processTranscript: (transcript) => FIELD_PROCESSORS[fieldType]?.(transcript) || transcript,
  };
};

// ============================================================================
// EXPORTS
// ============================================================================
export {
  VoiceInputService,
  wordsToNumbers,
  formatPhoneNumber,
  formatSSN,
  formatDate,
  extractName,
  extractAddress,
  extractEmail,
  FIELD_PROCESSORS,
};

export default VoiceInputService;

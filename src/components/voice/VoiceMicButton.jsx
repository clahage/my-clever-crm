// ============================================================================
// VoiceMicButton.jsx - Reusable Voice Input Button Component
// ============================================================================
// A microphone button that enables voice-to-text input for form fields
//
// Features:
// - Pulse animation when listening
// - Field-specific formatting
// - Multi-language support
// - Configurable sizes
// - Works as TextField InputAdornment
// ============================================================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Box,
  Fade,
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  MicNone as MicNoneIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import {
  createVoiceInputService,
  isSpeechRecognitionSupported,
  FIELD_PROCESSORS,
} from '../../services/VoiceInputService';

// ============================================================================
// ANIMATIONS
// ============================================================================

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
`;

const waveAnimation = keyframes`
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.5);
  }
`;

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZES = {
  small: {
    button: 28,
    icon: 16,
  },
  medium: {
    button: 36,
    icon: 20,
  },
  large: {
    button: 48,
    icon: 24,
  },
};

// ============================================================================
// VOICE MIC BUTTON COMPONENT
// ============================================================================

const VoiceMicButton = ({
  onResult,
  fieldType = 'text',
  language = 'en-US',
  size = 'small',
  tooltip = 'Click to speak',
  disabled = false,
  color = 'primary',
  showInterim = true,
  onInterim,
  onStart,
  onEnd,
  onError,
  autoStop = true,
  maxDuration = 10000, // 10 seconds max
}) => {
  // ===== STATE =====
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);

  // ===== REFS =====
  const voiceServiceRef = useRef(null);
  const timeoutRef = useRef(null);

  // ===== CHECK BROWSER SUPPORT =====
  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);

  // ===== CLEANUP ON UNMOUNT =====
  useEffect(() => {
    return () => {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.destroy();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ===== START LISTENING =====
  const startListening = useCallback(() => {
    if (disabled || !isSupported) return;

    setError(null);
    setInterimText('');

    // Create new voice service instance
    voiceServiceRef.current = createVoiceInputService({
      language,
      continuous: false,
      interimResults: showInterim,

      onStart: () => {
        setIsListening(true);
        if (onStart) onStart();

        // Auto-stop after max duration
        if (autoStop) {
          timeoutRef.current = setTimeout(() => {
            stopListening();
          }, maxDuration);
        }
      },

      onResult: (result) => {
        const processor = FIELD_PROCESSORS[fieldType] || FIELD_PROCESSORS.text;
        const processedText = processor(result.transcript);

        setInterimText('');
        setIsListening(false);

        if (onResult) {
          onResult(processedText, {
            raw: result.transcript,
            confidence: result.confidence,
            alternatives: result.alternatives,
          });
        }

        // Cleanup
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (voiceServiceRef.current) {
          voiceServiceRef.current.destroy();
          voiceServiceRef.current = null;
        }
      },

      onInterim: (result) => {
        setInterimText(result.transcript);
        if (onInterim) onInterim(result.transcript);
      },

      onError: (err) => {
        console.error('Voice input error:', err);
        setError(err.message);
        setIsListening(false);
        setInterimText('');

        if (onError) onError(err);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      },

      onEnd: () => {
        setIsListening(false);
        if (onEnd) onEnd();
      },
    });

    voiceServiceRef.current.start();
  }, [
    disabled,
    isSupported,
    language,
    showInterim,
    fieldType,
    autoStop,
    maxDuration,
    onResult,
    onInterim,
    onStart,
    onEnd,
    onError,
  ]);

  // ===== STOP LISTENING =====
  const stopListening = useCallback(() => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // ===== TOGGLE LISTENING =====
  const handleClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // ===== GET TOOLTIP TEXT =====
  const getTooltipText = () => {
    if (!isSupported) return 'Voice input not supported in this browser';
    if (disabled) return 'Voice input disabled';
    if (isListening) return 'Click to stop';
    if (error) return error;
    return tooltip;
  };

  // ===== GET SIZE CONFIG =====
  const sizeConfig = SIZES[size] || SIZES.medium;

  // ===== RENDER =====
  if (!isSupported) {
    return (
      <Tooltip title="Voice input not supported in this browser">
        <span>
          <IconButton
            size={size}
            disabled
            sx={{
              width: sizeConfig.button,
              height: sizeConfig.button,
              opacity: 0.5,
            }}
          >
            <MicOffIcon sx={{ fontSize: sizeConfig.icon }} />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={getTooltipText()} arrow>
        <span>
          <IconButton
            onClick={handleClick}
            disabled={disabled}
            size={size}
            sx={{
              width: sizeConfig.button,
              height: sizeConfig.button,
              color: isListening ? 'error.main' : `${color}.main`,
              backgroundColor: isListening ? 'error.lighter' : 'transparent',
              animation: isListening ? `${pulseAnimation} 1.5s infinite` : 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: isListening ? 'error.light' : `${color}.lighter`,
              },
              '&.Mui-disabled': {
                opacity: 0.5,
              },
            }}
          >
            {isListening ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.25,
                }}
              >
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 3,
                      height: 12,
                      backgroundColor: 'error.main',
                      borderRadius: 1,
                      animation: `${waveAnimation} 0.5s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </Box>
            ) : (
              <MicIcon sx={{ fontSize: sizeConfig.icon }} />
            )}
          </IconButton>
        </span>
      </Tooltip>

      {/* Interim text display */}
      {showInterim && interimText && (
        <Fade in={Boolean(interimText)}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontStyle: 'italic',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {interimText}...
          </Typography>
        </Fade>
      )}
    </Box>
  );
};

// ============================================================================
// VOICE INPUT ADORNMENT (For TextField)
// ============================================================================

export const VoiceInputAdornment = ({
  onResult,
  fieldType = 'text',
  language = 'en-US',
  disabled = false,
  position = 'end',
}) => {
  return (
    <VoiceMicButton
      onResult={onResult}
      fieldType={fieldType}
      language={language}
      disabled={disabled}
      size="small"
      showInterim={false}
    />
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default VoiceMicButton;

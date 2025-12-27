// ============================================================================
// PronunciationRecorder.jsx - Name Pronunciation Capture Component
// ============================================================================
// Records user speaking their name for future reference
//
// Features:
// - Record button with 3 second max
// - Playback button
// - Re-record option
// - Save as base64 or Firebase Storage URL
// - Phonetic transcription attempt
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Button,
  Typography,
  Tooltip,
  LinearProgress,
  Paper,
  Chip,
  TextField,
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  VolumeUp as VolumeIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// ============================================================================
// ANIMATIONS
// ============================================================================

const recordingPulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_DURATION = 3000; // 3 seconds max
const SAMPLE_RATE = 44100;

// ============================================================================
// PRONUNCIATION RECORDER COMPONENT
// ============================================================================

const PronunciationRecorder = ({
  value,
  onChange,
  name,
  label = 'Pronunciation',
  helperText = 'Record how to pronounce this name (max 3 seconds)',
  disabled = false,
  showPhonetic = true,
  compact = false,
}) => {
  // ===== STATE =====
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [phonetic, setPhonetic] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  // ===== REFS =====
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioElementRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const recordingStartRef = useRef(null);

  // ===== CHECK BROWSER SUPPORT =====
  useEffect(() => {
    const checkSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsSupported(false);
          return;
        }
        // Check if we can access the microphone
        await navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            stream.getTracks().forEach(track => track.stop());
          });
      } catch {
        setIsSupported(false);
      }
    };
    checkSupport();
  }, []);

  // ===== INITIALIZE FROM VALUE =====
  useEffect(() => {
    if (value && typeof value === 'object') {
      if (value.audioData) {
        // Convert base64 to blob and create URL
        try {
          const byteCharacters = atob(value.audioData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'audio/webm' });
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
          setHasRecording(true);
        } catch (e) {
          console.error('Error loading audio data:', e);
        }
      }
      if (value.phonetic) {
        setPhonetic(value.phonetic);
      }
    } else if (typeof value === 'string' && value.startsWith('data:audio')) {
      // Handle data URL format
      setAudioUrl(value);
      setHasRecording(true);
    }
  }, [value]);

  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [audioUrl]);

  // ===== START RECORDING =====
  const startRecording = useCallback(async () => {
    if (disabled || !isSupported) return;

    try {
      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);

        // Clean up old URL
        if (audioUrl && audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setHasRecording(true);

        // Convert to base64 and notify parent
        blobToBase64(blob).then(base64 => {
          if (onChange) {
            onChange({
              audioData: base64,
              phonetic,
              duration: Date.now() - recordingStartRef.current,
              format: 'webm',
            });
          }
        });

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingProgress(0);
      recordingStartRef.current = Date.now();

      // Progress update
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartRef.current;
        const progress = Math.min((elapsed / MAX_DURATION) * 100, 100);
        setRecordingProgress(progress);

        // Auto-stop at max duration
        if (elapsed >= MAX_DURATION) {
          stopRecording();
        }
      }, 50);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  }, [disabled, isSupported, audioUrl, phonetic, onChange]);

  // ===== STOP RECORDING =====
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [isRecording]);

  // ===== PLAY RECORDING =====
  const playRecording = useCallback(() => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    } else {
      audioElementRef.current.src = audioUrl;
    }

    audioElementRef.current.play();
    setIsPlaying(true);
  }, [audioUrl]);

  // ===== PAUSE PLAYBACK =====
  const pausePlayback = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // ===== DELETE RECORDING =====
  const deleteRecording = useCallback(() => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setHasRecording(false);
    setRecordingProgress(0);
    setPhonetic('');

    if (onChange) {
      onChange(null);
    }
  }, [audioUrl, onChange]);

  // ===== UPDATE PHONETIC =====
  const handlePhoneticChange = useCallback((e) => {
    const newPhonetic = e.target.value;
    setPhonetic(newPhonetic);

    if (onChange && audioBlob) {
      blobToBase64(audioBlob).then(base64 => {
        onChange({
          audioData: base64,
          phonetic: newPhonetic,
          duration: Date.now() - (recordingStartRef.current || Date.now()),
          format: 'webm',
        });
      });
    }
  }, [onChange, audioBlob]);

  // ===== HELPER: BLOB TO BASE64 =====
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // ===== RENDER: NOT SUPPORTED =====
  if (!isSupported) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Voice recording not supported in this browser
        </Typography>
      </Box>
    );
  }

  // ===== RENDER: COMPACT MODE =====
  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {!hasRecording ? (
          <Tooltip title="Record pronunciation">
            <IconButton
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled}
              size="small"
              color={isRecording ? 'error' : 'primary'}
              sx={{
                animation: isRecording ? `${recordingPulse} 1s infinite` : 'none',
              }}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Tooltip title="Play pronunciation">
              <IconButton
                onClick={isPlaying ? pausePlayback : playRecording}
                size="small"
                color="primary"
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Re-record">
              <IconButton
                onClick={deleteRecording}
                size="small"
                color="default"
              >
                <ReplayIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    );
  }

  // ===== RENDER: FULL MODE =====
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <VolumeIcon color="action" />
        <Typography variant="subtitle2">{label}</Typography>
        {name && (
          <Chip
            label={name}
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        {helperText}
      </Typography>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
          {error}
        </Typography>
      )}

      {/* Recording Progress */}
      {isRecording && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={recordingProgress}
            color="error"
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Recording... {Math.round((recordingProgress / 100) * 3)}s / 3s
          </Typography>
        </Box>
      )}

      {/* Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {!hasRecording ? (
          <Button
            variant={isRecording ? 'contained' : 'outlined'}
            color={isRecording ? 'error' : 'primary'}
            startIcon={isRecording ? <StopIcon /> : <MicIcon />}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            sx={{
              animation: isRecording ? `${recordingPulse} 1s infinite` : 'none',
            }}
          >
            {isRecording ? 'Stop' : 'Record'}
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              color="primary"
              startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
              onClick={isPlaying ? pausePlayback : playRecording}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            <Button
              variant="outlined"
              color="default"
              startIcon={<ReplayIcon />}
              onClick={deleteRecording}
            >
              Re-record
            </Button>
          </>
        )}
      </Box>

      {/* Phonetic input */}
      {showPhonetic && hasRecording && (
        <TextField
          fullWidth
          size="small"
          label="Phonetic spelling (optional)"
          placeholder="e.g., 'Sha-REEN' or 'MIGH-kul'"
          value={phonetic}
          onChange={handlePhoneticChange}
          disabled={disabled}
          sx={{ mt: 2 }}
          helperText="How would you spell the pronunciation?"
        />
      )}
    </Paper>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default PronunciationRecorder;

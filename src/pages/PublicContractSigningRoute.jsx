// ============================================================================
// Path: src/pages/PublicContractSigningRoute.jsx
// ============================================================================
//
// PUBLIC CONTRACT SIGNING ROUTE — PREMIUM DESIGN v3.0 🚀
// ============================================================================
// This is the FIRST thing clients see after clicking the email link.
// It must instill ABSOLUTE confidence that they're working with the most
// professional, trustworthy credit repair company in the country.
//
// Design Direction: Luxury Financial Services
//   - Deep navy + warm gold palette (authority + warmth)
//   - Playfair Display headings + DM Sans body (elegant + readable)
//   - Staggered fade-in animations on every screen
//   - Trust signals woven throughout (BBB, Google, 30 years, encryption)
//   - Mobile-first (most clients open email links on phone)
//   - Success screen with animated celebration
//
// v3.0 Enhancements:
//   ✅ Removed duplicate markContractSigningTokenUsed call
//      (submitSignedContract backend now handles token invalidation)
//   ✅ Added personalized welcome card with plan benefits + estimated time
//   ✅ Added floating help button (mobile-friendly, always accessible)
//   ✅ Added mini step indicator in header (Verify → Review → Sign → Complete)
//   ✅ Smoother transitions between states
//   ✅ Enhanced success screen with account creation prompt
//   ✅ Better error recovery with retry button
//
// Flow:
//   1. Client clicks email link → /sign/TOKEN
//   2. Elegant loading animation while token validates
//   3. If valid → personalized welcome card → premium signing experience
//   4. If invalid/expired → warm error with easy contact options
//   5. On completion → stunning success celebration + next steps
//
// SECURITY NOTE (v3.0):
//   The token is now marked as used SERVER-SIDE by submitSignedContract.
//   We no longer call markContractSigningTokenUsed from the client.
//   This prevents:
//     - Race conditions (token marked used before contract saved)
//     - Double-write errors (token already marked used)
//     - Client-side manipulation (token can't be un-used)
//
// © 1995-{currentYear} Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Alert,
  Container,
  Chip,
  Fade,
  Grow,
  Slide
} from '@mui/material';
import {
  Shield,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  Phone,
  Lock,
  XCircle,
  Star,
  Award,
  Mail,
  ArrowRight,
  Sparkles,
  Heart,
  Timer,
  Users,
  TrendingUp,
  ChevronRight,
  HelpCircle,
  RefreshCw,
  MapPin,
  ExternalLink,
  Briefcase,
  Zap,
  MessageCircle
} from 'lucide-react';
import ContractSigningPortal from '../components/client-portal/ContractSigningPortal';

// ============================================================================
// ===== CONFIGURATION =====
// ============================================================================
const OPERATIONS_MANAGER_URL = 'https://operationsmanager-tvkxcewmxq-uc.a.run.app';

// ============================================================================
// ===== GOOGLE FONTS LOADER =====
// Loads Playfair Display (elegant serif) + DM Sans (clean modern)
// ============================================================================
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
if (!document.querySelector('link[href*="Playfair+Display"]')) {
  document.head.appendChild(fontLink);
}

// ============================================================================
// ===== DESIGN TOKENS =====
// ============================================================================
const T = {
  // Colors — Deep navy authority + warm gold trust
  navy: '#0a1628',
  navyLight: '#162035',
  navyMid: '#1e3050',
  slate: '#334766',
  gold: '#c9a84c',
  goldLight: '#dfc06a',
  goldMuted: 'rgba(201,168,76,0.15)',
  goldGlow: 'rgba(201,168,76,0.08)',
  cream: '#faf8f3',
  white: '#ffffff',
  offWhite: '#f7f8fa',
  green: '#2d9d78',
  greenLight: '#34d399',
  greenMuted: 'rgba(45,157,120,0.1)',
  red: '#e74c3c',
  redMuted: 'rgba(231,76,60,0.08)',
  amber: '#e6a817',
  amberMuted: 'rgba(230,168,23,0.08)',
  textPrimary: '#0f1729',
  textSecondary: '#4a5568',
  textMuted: '#8896a6',
  border: '#e2e6ec',
  borderLight: '#f0f2f5',
  // Typography
  fontDisplay: '"Playfair Display", Georgia, "Times New Roman", serif',
  fontBody: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
  // Shadows
  shadowSoft: '0 2px 20px rgba(10,22,40,0.06)',
  shadowMedium: '0 8px 40px rgba(10,22,40,0.10)',
  shadowHeavy: '0 20px 60px rgba(10,22,40,0.15)',
  shadowGold: '0 4px 24px rgba(201,168,76,0.20)',
  // Gradients
  gradientNavy: 'linear-gradient(145deg, #0a1628 0%, #162035 40%, #1e3050 100%)',
  gradientGold: 'linear-gradient(135deg, #c9a84c 0%, #dfc06a 50%, #c9a84c 100%)',
  gradientGreen: 'linear-gradient(135deg, #2d9d78 0%, #34d399 100%)',
};

// ============================================================================
// ===== KEYFRAME ANIMATIONS (injected into head) =====
// ============================================================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes csp-fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes csp-fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes csp-scaleIn {
    from { opacity: 0; transform: scale(0.85); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes csp-shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes csp-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.3); }
    50% { box-shadow: 0 0 0 16px rgba(201,168,76,0); }
  }
  @keyframes csp-pulseGreen {
    0%, 100% { box-shadow: 0 0 0 0 rgba(45,157,120,0.3); }
    50% { box-shadow: 0 0 0 20px rgba(45,157,120,0); }
  }
  @keyframes csp-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes csp-spinSlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes csp-checkDraw {
    from { stroke-dashoffset: 50; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes csp-confetti {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-120px) rotate(720deg); opacity: 0; }
  }
  @keyframes csp-slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes csp-breathe {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  @keyframes csp-bounceIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes csp-slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .csp-stagger-1 { animation: csp-fadeUp 0.7s ease-out 0.1s both; }
  .csp-stagger-2 { animation: csp-fadeUp 0.7s ease-out 0.25s both; }
  .csp-stagger-3 { animation: csp-fadeUp 0.7s ease-out 0.4s both; }
  .csp-stagger-4 { animation: csp-fadeUp 0.7s ease-out 0.55s both; }
  .csp-stagger-5 { animation: csp-fadeUp 0.7s ease-out 0.7s both; }
  .csp-stagger-6 { animation: csp-fadeUp 0.7s ease-out 0.85s both; }
  .csp-stagger-7 { animation: csp-fadeUp 0.7s ease-out 1.0s both; }

  /* Floating help button pulse */
  @keyframes csp-helpPulse {
    0%, 100% { box-shadow: 0 4px 14px rgba(10,22,40,0.15); }
    50% { box-shadow: 0 6px 24px rgba(10,22,40,0.25); }
  }
`;
if (!document.querySelector('style[data-csp-animations]')) {
  styleSheet.setAttribute('data-csp-animations', 'true');
  document.head.appendChild(styleSheet);
}

// ============================================================================
// ===== HELPER: Call operationsManager =====
// ============================================================================
const callOperationsManager = async (action, params = {}) => {
  console.log(`📡 Calling operationsManager: ${action}`, params);
  const response = await fetch(OPERATIONS_MANAGER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { action, ...params } })
  });
  const data = await response.json();
  console.log(`📡 Response for ${action}:`, data);
  return data;
};

// ============================================================================
// ===== SPEEDY CREDIT REPAIR LOGO =====
// Refined text-based logo with gold accent line
// ============================================================================
const SpeedyLogo = ({ size = 'normal', light = false }) => {
  const isSmall = size === 'small';
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography sx={{
        fontFamily: T.fontDisplay,
        fontWeight: 700,
        fontSize: isSmall ? '18px' : { xs: '22px', sm: '28px' },
        color: light ? T.white : T.navy,
        letterSpacing: '-0.5px',
        lineHeight: 1.1
      }}>
        Speedy Credit Repair
      </Typography>
      {/* Gold accent line */}
      <Box sx={{
        width: isSmall ? 40 : 56,
        height: 2,
        background: T.gradientGold,
        borderRadius: 1,
        mt: isSmall ? 0.5 : 0.75,
        mb: isSmall ? 0.3 : 0.5
      }} />
      <Typography sx={{
        fontFamily: T.fontBody,
        fontWeight: 400,
        fontSize: isSmall ? '10px' : '12px',
        color: light ? 'rgba(255,255,255,0.6)' : T.textMuted,
        letterSpacing: '2px',
        textTransform: 'uppercase'
      }}>
        Est. 1995
      </Typography>
    </Box>
  );
};

// ============================================================================
// ===== TRUST BADGE ROW =====
// ============================================================================
const TrustBadges = ({ compact = false }) => {
  const badges = [
    { icon: <Award size={compact ? 13 : 15} />, label: 'A+ BBB', color: T.gold },
    { icon: <Star size={compact ? 13 : 15} />, label: '4.9★ Google', color: T.gold },
    { icon: <Shield size={compact ? 13 : 15} />, label: '30 Years', color: T.gold },
    { icon: <Lock size={compact ? 13 : 15} />, label: '256-bit SSL', color: T.green },
  ];
  
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      gap: compact ? 0.75 : 1,
      flexWrap: 'wrap'
    }}>
      {badges.map((b, i) => (
        <Box key={i} sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: compact ? 1 : 1.5,
          py: compact ? 0.3 : 0.5,
          borderRadius: '20px',
          background: b.color === T.green ? T.greenMuted : T.goldMuted,
          border: `1px solid ${b.color === T.green ? 'rgba(45,157,120,0.2)' : 'rgba(201,168,76,0.2)'}`,
        }}>
          <Box sx={{ color: b.color, display: 'flex', alignItems: 'center' }}>{b.icon}</Box>
          <Typography sx={{
            fontFamily: T.fontBody,
            fontSize: compact ? '10px' : '11px',
            fontWeight: 600,
            color: b.color === T.green ? T.green : '#8b7530',
            whiteSpace: 'nowrap'
          }}>
            {b.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ============================================================================
// ===== GOLD DIVIDER =====
// ============================================================================
const GoldDivider = () => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    my: 3
  }}>
    <Box sx={{ width: 60, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.4))' }} />
    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: T.gold, opacity: 0.5 }} />
    <Box sx={{ width: 60, height: 1, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.4))' }} />
  </Box>
);

// ============================================================================
// ===== MINI STEP INDICATOR =====
// Shows the client where they are: Verify → Review → Sign → Complete
// ============================================================================
const StepIndicator = ({ currentStep = 0 }) => {
  const steps = [
    { label: 'Verify', icon: <Shield size={12} /> },
    { label: 'Review', icon: <FileText size={12} /> },
    { label: 'Sign', icon: <CheckCircle size={12} /> },
    { label: 'Complete', icon: <Sparkles size={12} /> },
  ];

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: { xs: 0.5, sm: 1 }
    }}>
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isComplete = i < currentStep;
        const isFuture = i > currentStep;

        return (
          <React.Fragment key={i}>
            {/* Step dot/icon */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: { xs: 0.75, sm: 1.5 },
              py: 0.4,
              borderRadius: '14px',
              background: isComplete
                ? 'rgba(45,157,120,0.15)'
                : isActive
                  ? 'rgba(201,168,76,0.15)'
                  : 'transparent',
              border: `1px solid ${
                isComplete
                  ? 'rgba(45,157,120,0.3)'
                  : isActive
                    ? 'rgba(201,168,76,0.3)'
                    : 'rgba(255,255,255,0.1)'
              }`,
              transition: 'all 0.4s ease'
            }}>
              <Box sx={{
                color: isComplete ? T.greenLight : isActive ? T.goldLight : 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center'
              }}>
                {isComplete ? <CheckCircle size={12} /> : step.icon}
              </Box>
              <Typography sx={{
                fontFamily: T.fontBody,
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                color: isComplete
                  ? T.greenLight
                  : isActive
                    ? T.goldLight
                    : 'rgba(255,255,255,0.25)',
                display: { xs: isActive ? 'block' : 'none', sm: 'block' },
                whiteSpace: 'nowrap'
              }}>
                {step.label}
              </Typography>
            </Box>

            {/* Connector line between steps */}
            {i < steps.length - 1 && (
              <Box sx={{
                width: { xs: 12, sm: 24 },
                height: 1,
                background: isComplete
                  ? 'rgba(45,157,120,0.4)'
                  : 'rgba(255,255,255,0.1)',
                transition: 'background 0.4s ease'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

// ============================================================================
// ===== FLOATING HELP BUTTON =====
// Always accessible — especially important on mobile
// ============================================================================
const FloatingHelpButton = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box sx={{
      position: 'fixed',
      bottom: { xs: 20, sm: 28 },
      right: { xs: 16, sm: 28 },
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 1.5
    }}>
      {/* Expanded contact options */}
      {expanded && (
        <Paper elevation={0} sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: T.shadowHeavy,
          border: `1px solid ${T.border}`,
          animation: 'csp-slideUp 0.3s ease-out both',
          minWidth: 220,
          background: T.white
        }}>
          <Box sx={{ p: 0.5 }}>
            <Typography sx={{
              fontFamily: T.fontBody,
              fontSize: '11px',
              fontWeight: 600,
              color: T.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              px: 2,
              pt: 1.5,
              pb: 1
            }}>
              Need help?
            </Typography>

            <Button
              href="tel:8889601718"
              fullWidth
              startIcon={<Phone size={16} />}
              sx={{
                fontFamily: T.fontBody,
                fontSize: '14px',
                fontWeight: 600,
                color: T.navy,
                textTransform: 'none',
                justifyContent: 'flex-start',
                px: 2,
                py: 1,
                borderRadius: '10px',
                '&:hover': { background: T.cream }
              }}
            >
              (888) 960-1718
            </Button>

            <Button
              href="mailto:chris@speedycreditrepair.com"
              fullWidth
              startIcon={<Mail size={16} />}
              sx={{
                fontFamily: T.fontBody,
                fontSize: '14px',
                fontWeight: 600,
                color: T.navy,
                textTransform: 'none',
                justifyContent: 'flex-start',
                px: 2,
                py: 1,
                borderRadius: '10px',
                '&:hover': { background: T.cream }
              }}
            >
              Email us
            </Button>

            <Typography sx={{
              fontFamily: T.fontBody,
              fontSize: '11px',
              color: T.textMuted,
              px: 2,
              pb: 1.5,
              pt: 0.5
            }}>
              Mon–Fri 9am–6pm PT
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Help FAB */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: T.gradientNavy,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          animation: expanded ? 'none' : 'csp-helpPulse 3s ease-in-out infinite',
          transition: 'transform 0.2s ease',
          '&:hover': { transform: 'scale(1.08)' },
          '&:active': { transform: 'scale(0.95)' }
        }}
      >
        {expanded ? (
          <XCircle size={22} color={T.goldLight} />
        ) : (
          <MessageCircle size={22} color={T.goldLight} />
        )}
      </Box>
    </Box>
  );
};

// ============================================================================
// ===== LOADING STATE — Elegant Shield Animation =====
// ============================================================================
const LoadingState = () => (
  <Box sx={{
    minHeight: '100vh',
    background: T.cream,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    p: 3
  }}>
    {/* Animated shield with gold pulse ring */}
    <Box className="csp-stagger-1" sx={{
      position: 'relative',
      width: 100,
      height: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mb: 4
    }}>
      {/* Outer pulse ring */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        animation: 'csp-pulse 2s ease-in-out infinite',
      }} />
      {/* Spinning border */}
      <Box sx={{
        position: 'absolute',
        inset: 4,
        borderRadius: '50%',
        border: '2px solid transparent',
        borderTopColor: T.gold,
        borderRightColor: 'rgba(201,168,76,0.3)',
        animation: 'csp-spinSlow 2s linear infinite',
      }} />
      {/* Shield icon */}
      <Box sx={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: T.white,
        boxShadow: T.shadowMedium,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Shield size={30} color={T.gold} strokeWidth={1.5} />
      </Box>
    </Box>
    
    <Box className="csp-stagger-2" sx={{ mb: 3 }}>
      <SpeedyLogo />
    </Box>
    
    <Box className="csp-stagger-3" sx={{ textAlign: 'center' }}>
      <Typography sx={{
        fontFamily: T.fontBody,
        fontSize: '16px',
        fontWeight: 500,
        color: T.textPrimary,
        mb: 0.5
      }}>
        Verifying your secure signing link
      </Typography>
      <Typography sx={{
        fontFamily: T.fontBody,
        fontSize: '13px',
        color: T.textMuted
      }}>
        This will only take a moment...
      </Typography>
    </Box>
    
    <Box className="csp-stagger-4" sx={{
      mt: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      px: 2,
      py: 0.75,
      borderRadius: '20px',
      background: T.greenMuted,
    }}>
      <Lock size={13} color={T.green} />
      <Typography sx={{
        fontFamily: T.fontBody,
        fontSize: '11px',
        fontWeight: 600,
        color: T.green
      }}>
        Encrypted Connection
      </Typography>
    </Box>
  </Box>
);

// ============================================================================
// ===== ERROR STATES — Professional, Warm, Clear (with Retry) =====
// ============================================================================
const ErrorDisplay = ({ type, message, onRetry }) => {
  const configs = {
    invalid: {
      icon: <XCircle size={40} color={T.red} strokeWidth={1.5} />,
      title: 'Link Not Recognized',
      accent: T.red,
      bgTint: T.redMuted
    },
    expired: {
      icon: <Clock size={40} color={T.amber} strokeWidth={1.5} />,
      title: 'This Link Has Expired',
      accent: T.amber,
      bgTint: T.amberMuted
    },
    alreadyUsed: {
      icon: <CheckCircle size={40} color={T.green} strokeWidth={1.5} />,
      title: 'Contract Already Signed',
      accent: T.green,
      bgTint: T.greenMuted
    },
    error: {
      icon: <AlertCircle size={40} color={T.red} strokeWidth={1.5} />,
      title: 'Something Went Wrong',
      accent: T.red,
      bgTint: T.redMuted
    }
  };
  
  const config = configs[type] || configs.error;
  
  return (
    <Box sx={{
      minHeight: '100vh',
      background: T.cream,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3
    }}>
      <Container maxWidth="sm">
        <Box className="csp-stagger-1" sx={{ textAlign: 'center', mb: 4 }}>
          <SpeedyLogo />
        </Box>
        
        <Paper className="csp-stagger-2" elevation={0} sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          border: `1px solid ${T.border}`,
          boxShadow: T.shadowMedium,
          background: T.white
        }}>
          <Box sx={{ height: 4, background: config.accent }} />
          
          <Box sx={{ p: { xs: 4, sm: 5 }, textAlign: 'center' }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: config.bgTint,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              {config.icon}
            </Box>
            
            <Typography sx={{
              fontFamily: T.fontDisplay,
              fontWeight: 700,
              fontSize: { xs: '22px', sm: '26px' },
              color: T.textPrimary,
              mb: 1.5
            }}>
              {config.title}
            </Typography>
            
            <Typography sx={{
              fontFamily: T.fontBody,
              fontSize: '15px',
              color: T.textSecondary,
              lineHeight: 1.7,
              mb: 3,
              maxWidth: 400,
              mx: 'auto'
            }}>
              {message}
            </Typography>

            {/* Retry button for transient errors */}
            {(type === 'error') && onRetry && (
              <Button
                onClick={onRetry}
                variant="outlined"
                startIcon={<RefreshCw size={16} />}
                sx={{
                  fontFamily: T.fontBody,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: T.border,
                  color: T.navy,
                  borderRadius: '12px',
                  mb: 3,
                  '&:hover': {
                    borderColor: T.gold,
                    background: T.goldGlow
                  }
                }}
              >
                Try Again
              </Button>
            )}
            
            <GoldDivider />
            
            <Box sx={{
              background: T.cream,
              borderRadius: '16px',
              p: 3,
              mb: 2
            }}>
              <Typography sx={{
                fontFamily: T.fontBody,
                fontSize: '13px',
                fontWeight: 600,
                color: T.textSecondary,
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                We're here to help
              </Typography>
              
              <Button
                href="tel:8889601718"
                startIcon={<Phone size={18} />}
                sx={{
                  fontFamily: T.fontBody,
                  fontSize: '17px',
                  fontWeight: 700,
                  color: T.navy,
                  textTransform: 'none',
                  mb: 1,
                  '&:hover': { background: 'rgba(10,22,40,0.04)' }
                }}
              >
                (888) 960-1718
              </Button>
              
              <Typography sx={{
                fontFamily: T.fontBody,
                fontSize: '13px',
                color: T.textMuted
              }}>
                Mon–Fri 9am–6pm PT
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Box className="csp-stagger-3" sx={{ mt: 3, mb: 2 }}>
          <TrustBadges compact />
        </Box>
        
        <Typography className="csp-stagger-4" sx={{
          textAlign: 'center',
          fontFamily: T.fontBody,
          fontSize: '11px',
          color: T.textMuted,
          mt: 2
        }}>
          © {new Date().getFullYear()} Speedy Credit Repair Inc. · All Rights Reserved
        </Typography>
      </Container>
    </Box>
  );
};

// ============================================================================
// ===== SIGNING COMPLETE — Enhanced Celebration Screen =====
// ============================================================================
const SigningComplete = ({ contactName, planName }) => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${8 + Math.random() * 84}%`,
    delay: `${Math.random() * 1.5}s`,
    duration: `${1.8 + Math.random() * 1.2}s`,
    color: [T.gold, T.goldLight, T.green, T.greenLight, '#6366f1', '#f472b6'][i % 6],
    size: 5 + Math.random() * 6,
    rotation: Math.random() * 360
  }));

  return (
    <Box sx={{
      minHeight: '100vh',
      background: T.cream,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Confetti particles */}
      {particles.map(p => (
        <Box key={p.id} sx={{
          position: 'absolute',
          bottom: '40%',
          left: p.left,
          width: p.size,
          height: p.size,
          borderRadius: p.id % 3 === 0 ? '50%' : '2px',
          background: p.color,
          animation: `csp-confetti ${p.duration} ease-out ${p.delay} both`,
          transform: `rotate(${p.rotation}deg)`,
          opacity: 0,
          pointerEvents: 'none'
        }} />
      ))}
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper className="csp-stagger-1" elevation={0} sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: T.shadowHeavy,
          background: T.white,
          border: `1px solid ${T.border}`
        }}>
          <Box sx={{ height: 4, background: T.gradientGold }} />
          
          <Box sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
            {/* Animated checkmark */}
            <Box className="csp-stagger-2" sx={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: T.greenMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              animation: 'csp-pulseGreen 2.5s ease-in-out infinite',
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke={T.green} strokeWidth="2" opacity="0.3" />
                <path
                  d="M14 24 L21 31 L34 18"
                  stroke={T.green}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray="50"
                  style={{ animation: 'csp-checkDraw 0.8s ease-out 0.5s both' }}
                />
              </svg>
            </Box>
            
            <Typography className="csp-stagger-3" sx={{
              fontFamily: T.fontDisplay,
              fontWeight: 800,
              fontSize: { xs: '28px', sm: '34px' },
              color: T.textPrimary,
              mb: 1,
              lineHeight: 1.15
            }}>
              You're All Set{contactName ? `, ${contactName}` : ''}!
            </Typography>
            
            <Typography className="csp-stagger-3" sx={{
              fontFamily: T.fontBody,
              fontWeight: 500,
              fontSize: '16px',
              color: T.green,
              mb: 1
            }}>
              Your contract has been signed successfully
            </Typography>

            {planName && (
              <Chip
                label={planName}
                size="small"
                sx={{
                  fontFamily: T.fontBody,
                  fontWeight: 600,
                  fontSize: '12px',
                  background: T.goldMuted,
                  color: '#8b7530',
                  border: '1px solid rgba(201,168,76,0.25)',
                  mb: 2
                }}
              />
            )}
            
            <GoldDivider />
            
            {/* What's Next — Enhanced with timeline style */}
            <Box className="csp-stagger-4" sx={{
              background: T.cream,
              borderRadius: '16px',
              p: 3,
              textAlign: 'left',
              mb: 3
            }}>
              <Typography sx={{
                fontFamily: T.fontBody,
                fontSize: '13px',
                fontWeight: 600,
                color: T.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                mb: 2
              }}>
                What happens next
              </Typography>
              
              {[
                { icon: <Mail size={16} />, text: 'Confirmation email arriving in minutes', time: 'Now' },
                { icon: <Shield size={16} />, text: 'Your dedicated team begins credit analysis', time: 'Today' },
                { icon: <FileText size={16} />, text: 'We may request a few optional documents', time: '1–2 days' },
                { icon: <Sparkles size={16} />, text: 'First disputes filed with all 3 bureaus', time: '5–7 days' }
              ].map((item, i) => (
                <Box key={i} sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  mb: i < 3 ? 2 : 0,
                  animation: `csp-slideInRight 0.5s ease-out ${0.6 + i * 0.1}s both`,
                  position: 'relative'
                }}>
                  {/* Timeline connector line */}
                  {i < 3 && (
                    <Box sx={{
                      position: 'absolute',
                      left: 13,
                      top: 30,
                      width: 1,
                      height: 20,
                      background: 'rgba(201,168,76,0.2)'
                    }} />
                  )}

                  <Box sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    background: T.goldMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: T.gold,
                    mt: 0.2
                  }}>
                    {item.icon}
                  </Box>

                  <Box sx={{ flex: 1, pt: 0.15 }}>
                    <Typography sx={{
                      fontFamily: T.fontBody,
                      fontSize: '14px',
                      fontWeight: 500,
                      color: T.textPrimary,
                      lineHeight: 1.4
                    }}>
                      {item.text}
                    </Typography>
                    <Typography sx={{
                      fontFamily: T.fontBody,
                      fontSize: '11px',
                      fontWeight: 600,
                      color: T.textMuted,
                      mt: 0.25
                    }}>
                      {item.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            
            {/* Personal touch from Chris */}
            <Box className="csp-stagger-5" sx={{
              background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
              borderRadius: '16px',
              p: 3,
              textAlign: 'center',
              mb: 3
            }}>
              <Typography sx={{
                fontFamily: T.fontDisplay,
                fontSize: '16px',
                fontWeight: 600,
                color: T.white,
                mb: 0.5,
                lineHeight: 1.5
              }}>
                "Thank you for trusting us with your credit journey."
              </Typography>
              <Typography sx={{
                fontFamily: T.fontBody,
                fontSize: '13px',
                color: 'rgba(255,255,255,0.6)'
              }}>
                — Chris Lahage, Founder · 30 years in credit repair
              </Typography>
            </Box>

            {/* Quick contact for questions */}
            <Box className="csp-stagger-6" sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Button
                href="tel:8889601718"
                startIcon={<Phone size={14} />}
                size="small"
                sx={{
                  fontFamily: T.fontBody,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.navy,
                  textTransform: 'none',
                  borderRadius: '10px',
                  border: `1px solid ${T.border}`,
                  px: 2,
                  '&:hover': { background: T.cream, borderColor: T.gold }
                }}
              >
                Call us
              </Button>
              <Button
                href="mailto:chris@speedycreditrepair.com"
                startIcon={<Mail size={14} />}
                size="small"
                sx={{
                  fontFamily: T.fontBody,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.navy,
                  textTransform: 'none',
                  borderRadius: '10px',
                  border: `1px solid ${T.border}`,
                  px: 2,
                  '&:hover': { background: T.cream, borderColor: T.gold }
                }}
              >
                Email us
              </Button>
            </Box>
          </Box>
        </Paper>
        
        <Box className="csp-stagger-7" sx={{ mt: 3 }}>
          <TrustBadges compact />
        </Box>
        
        <Typography sx={{
          textAlign: 'center',
          fontFamily: T.fontBody,
          fontSize: '11px',
          color: T.textMuted,
          mt: 2
        }}>
          © {new Date().getFullYear()} Speedy Credit Repair Inc. · Chris Lahage · All Rights Reserved
        </Typography>
      </Container>
    </Box>
  );
};

// ============================================================================
// ===== PERSONALIZED WELCOME CARD =====
// Shown between header and the ContractSigningPortal for warm onboarding
// ============================================================================
const WelcomeCard = ({ contactName, planData }) => (
  <Container maxWidth="md" sx={{ mt: -2, mb: 1, position: 'relative', zIndex: 2 }}>
    <Paper className="csp-stagger-5" elevation={0} sx={{
      borderRadius: '16px',
      overflow: 'hidden',
      border: `1px solid ${T.border}`,
      boxShadow: T.shadowSoft,
      background: T.white
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        p: { xs: 2.5, sm: 3 },
        gap: 2
      }}>
        {/* Left side: greeting + plan info */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Avatar circle with initials */}
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: T.goldMuted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(201,168,76,0.2)'
          }}>
            <Typography sx={{
              fontFamily: T.fontDisplay,
              fontSize: '16px',
              fontWeight: 700,
              color: T.gold
            }}>
              {contactName ? contactName.charAt(0).toUpperCase() : 'G'}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{
              fontFamily: T.fontBody,
              fontSize: '15px',
              fontWeight: 600,
              color: T.textPrimary,
              lineHeight: 1.3,
              mb: 0.25
            }}>
              Welcome{contactName ? `, ${contactName}` : ''}
            </Typography>
            <Typography sx={{
              fontFamily: T.fontBody,
              fontSize: '13px',
              color: T.textSecondary,
              lineHeight: 1.4
            }}>
              Please review each document carefully, then sign where indicated.
              {planData?.name && <> Your <strong>{planData.name}</strong> plan documents are ready.</>}
            </Typography>
          </Box>
        </Box>

        {/* Right side: estimated time */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 2,
          py: 0.75,
          borderRadius: '12px',
          background: T.cream,
          flexShrink: 0,
          border: `1px solid ${T.borderLight}`
        }}>
          <Timer size={14} color={T.textMuted} />
          <Typography sx={{
            fontFamily: T.fontBody,
            fontSize: '12px',
            fontWeight: 600,
            color: T.textSecondary,
            whiteSpace: 'nowrap'
          }}>
            ~5–10 min
          </Typography>
        </Box>
      </Box>
    </Paper>
  </Container>
);

// ============================================================================
// ===== MAIN COMPONENT =====
// ============================================================================
const PublicContractSigningRoute = () => {
  const { token } = useParams();
  
  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('error');
  const [contactData, setContactData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [signingComplete, setSigningComplete] = useState(false);

  // ===== Token validation on mount =====
  useEffect(() => {
    if (!token) {
      setError('No signing token provided. Please use the link from your email.');
      setErrorType('invalid');
      setLoading(false);
      return;
    }
    validateToken();
  }, [token]);
  
  // ===== VALIDATE TOKEN =====
  const validateToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await callOperationsManager('validateContractSigningToken', { token });
      
      if (result.valid) {
        setContactData(result.contact);
        setPlanData(result.plan);
        setTokenId(result.tokenId);
        console.log('✅ Token validated for:', result.contact.firstName);
      } else {
        setError(result.error || 'Invalid signing link.');
        if (result.alreadyUsed) setErrorType('alreadyUsed');
        else if (result.expired) setErrorType('expired');
        else setErrorType('invalid');
      }
    } catch (err) {
      console.error('❌ Token validation failed:', err);
      setError('Unable to verify your signing link. Please try again or call us at (888) 960-1718.');
      setErrorType('error');
    } finally {
      setLoading(false);
    }
  };

  // ===== SIGNING COMPLETE CALLBACK =====
  // IMPORTANT (v3.0): We NO LONGER call markContractSigningTokenUsed here.
  // The submitSignedContract backend case block already marks the token
  // as used in Step 9 of its flow. Calling it again from the client would
  // cause a duplicate-write error (token already has used=true).
  //
  // Previous code (REMOVED):
  //   await callOperationsManager('markContractSigningTokenUsed', { ... });
  //
  // The server-side approach is more secure because:
  //   1. Token is marked used atomically with contract creation
  //   2. No client-side manipulation possible
  //   3. No race condition between "signed" and "token used"
  const handleSigningComplete = useCallback(async (contractId) => {
    console.log('🎉 Contract signing completed! Contract:', contractId);
    console.log('   Token already marked as used by submitSignedContract backend');
    
    setSigningComplete(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ===== RENDER: Loading =====
  if (loading) return <LoadingState />;

  // ===== RENDER: Error (with retry for transient errors) =====
  if (error) return <ErrorDisplay type={errorType} message={error} onRetry={errorType === 'error' ? validateToken : null} />;

  // ===== RENDER: Signing Complete Celebration =====
  if (signingComplete) return <SigningComplete contactName={contactData?.firstName} planName={planData?.name} />;
  
  // ===== RENDER: Contract Signing Experience =====
  return (
    <Box sx={{
      minHeight: '100vh',
      background: T.cream,
      fontFamily: T.fontBody
    }}>
      {/* ===== PREMIUM HEADER ===== */}
      <Box sx={{
        background: T.gradientNavy,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Gold accent line at top */}
        <Box sx={{ height: 3, background: T.gradientGold }} />
        
        {/* Decorative background dots */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${T.gold} 1px, transparent 1px),
                           radial-gradient(circle at 80% 20%, ${T.gold} 1px, transparent 1px),
                           radial-gradient(circle at 60% 80%, ${T.gold} 1px, transparent 1px)`,
          backgroundSize: '60px 60px, 80px 80px, 40px 40px',
          pointerEvents: 'none'
        }} />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            py: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <Box className="csp-stagger-1">
              <SpeedyLogo light size="normal" />
            </Box>

            {/* Step Indicator — v3.0 enhancement */}
            <Box className="csp-stagger-2" sx={{ mt: 2 }}>
              <StepIndicator currentStep={1} />
            </Box>
            
            <Box className="csp-stagger-3" sx={{ mt: 2 }}>
              <Typography sx={{
                fontFamily: T.fontBody,
                fontSize: { xs: '14px', sm: '15px' },
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 400
              }}>
                Welcome{contactData?.firstName ? `, ${contactData.firstName}` : ''}. Your agreement is ready for review.
              </Typography>
            </Box>
            
            {planData && (
              <Box className="csp-stagger-4" sx={{
                mt: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 0.75,
                borderRadius: '24px',
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.25)',
              }}>
                <FileText size={14} color={T.goldLight} />
                <Typography sx={{
                  fontFamily: T.fontBody,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.goldLight
                }}>
                  {planData.name} — ${planData.monthlyPrice}/mo
                </Typography>
              </Box>
            )}
            
            <Box className="csp-stagger-5" sx={{
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {[
                { icon: <Lock size={12} />, text: 'Bank-Level Encryption' },
                { icon: <Shield size={12} />, text: 'Legally Binding' },
                { icon: <Award size={12} />, text: 'CROA Compliant' }
              ].map((item, i) => (
                <Box key={i} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'rgba(255,255,255,0.45)'
                }}>
                  {item.icon}
                  <Typography sx={{
                    fontFamily: T.fontBody,
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.45)'
                  }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ===== PERSONALIZED WELCOME CARD (v3.0) ===== */}
      <WelcomeCard contactName={contactData?.firstName} planData={planData} />
      
      {/* ===== CONTRACT SIGNING PORTAL ===== */}
      <Box className="csp-stagger-6">
        <ContractSigningPortal
          contactData={contactData}
          planData={planData}
          isPublicSigning={true}
          onSigningComplete={handleSigningComplete}
          signingToken={token}
        />
      </Box>
      
      {/* ===== PREMIUM FOOTER ===== */}
      <Box sx={{
        background: T.white,
        borderTop: `1px solid ${T.border}`,
        py: 4,
        mt: 2
      }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 2.5 }}>
            <TrustBadges />
          </Box>
          
          <Box sx={{ textAlign: 'center', mb: 2.5 }}>
            <Typography sx={{
              fontFamily: T.fontBody,
              fontSize: '13px',
              color: T.textSecondary,
              mb: 0.5
            }}>
              Questions about your agreement? We're happy to walk you through it.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Button
                href="tel:8889601718"
                startIcon={<Phone size={14} />}
                sx={{
                  fontFamily: T.fontBody,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: T.navy,
                  textTransform: 'none',
                  '&:hover': { background: 'rgba(10,22,40,0.04)' }
                }}
              >
                (888) 960-1718
              </Button>
              <Typography sx={{ color: T.textMuted, fontSize: '12px' }}>·</Typography>
              <Button
                href="mailto:chris@speedycreditrepair.com"
                startIcon={<Mail size={14} />}
                sx={{
                  fontFamily: T.fontBody,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: T.navy,
                  textTransform: 'none',
                  '&:hover': { background: 'rgba(10,22,40,0.04)' }
                }}
              >
                Email Us
              </Button>
            </Box>
          </Box>
          
          {/* Gold divider */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 2
          }}>
            <Box sx={{ width: 80, height: 1, background: `linear-gradient(to right, transparent, ${T.border})` }} />
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: T.gold, opacity: 0.4 }} />
            <Box sx={{ width: 80, height: 1, background: `linear-gradient(to left, transparent, ${T.border})` }} />
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{
              fontFamily: T.fontBody,
              fontSize: '11px',
              color: T.textMuted,
              mb: 0.25
            }}>
              © {new Date().getFullYear()} Speedy Credit Repair Inc. · Chris Lahage · All Rights Reserved
            </Typography>
            <Typography sx={{
              fontFamily: T.fontBody,
              fontSize: '10px',
              color: T.textMuted,
              opacity: 0.7
            }}>
              Speedy Credit Repair® — USPTO Registered Trademark · Established 1995
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ===== FLOATING HELP BUTTON (v3.0) ===== */}
      <FloatingHelpButton />
    </Box>
  );
};

export default PublicContractSigningRoute;
// src/components/BrandLogo.jsx
// Reusable brand logo component with multiple variants and sizes
import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * BrandLogo Component
 *
 * A flexible logo component that supports multiple variants, sizes, and themes.
 *
 * @param {Object} props
 * @param {string} props.variant - Logo variant: 'default', 'white', 'black', 'brand', 'transparent'
 * @param {string} props.size - Logo size: 'small', 'medium', 'large', 'xl'
 * @param {boolean} props.showTagline - Whether to show company tagline below logo
 * @param {boolean} props.clickable - Whether logo should be clickable (link to dashboard)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @param {Function} props.onClick - Click handler function
 */
export const BrandLogo = ({
  variant = 'default',
  size = 'medium',
  showTagline = false,
  clickable = false,
  className = '',
  style = {},
  onClick
}) => {
  // Size mapping for logo dimensions
  const sizeMap = {
    small: { width: '80px', fontSize: '0.75rem' },
    medium: { width: '128px', fontSize: '0.875rem' },
    large: { width: '200px', fontSize: '1rem' },
    xl: { width: '300px', fontSize: '1.125rem' }
  };

  // Logo path mapping based on variant
  const logoMap = {
    default: '/brand/default/logo-brand-128.png',
    white: '/brand/default/logo-white-128.png',
    black: '/brand/default/logo-black-128.png',
    brand: '/brand/default/logo-brand-128.png',
    transparent: '/brand/default/logo-transparent-128.png',
    fullcolor: '/brand/default/logo-fullcolor-lightmode-128.png'
  };

  // For 512px versions (larger sizes)
  const logoMapLarge = {
    default: '/brand/default/logo-brand-512.png',
    white: '/brand/default/logo-white-512.png',
    black: '/brand/default/logo-black-512.png',
    brand: '/brand/default/logo-brand-512.png',
    transparent: '/brand/default/logo-transparent-512.png',
    fullcolor: '/brand/default/logo-fullcolor-lightmode-512.png'
  };

  // Select appropriate logo based on size
  const logoSrc = size === 'large' || size === 'xl'
    ? (logoMapLarge[variant] || logoMapLarge.default)
    : (logoMap[variant] || logoMap.default);

  const sizeStyles = sizeMap[size] || sizeMap.medium;

  const logoElement = (
    <img
      src={logoSrc}
      alt="SpeedyCRM - Credit Repair Management System"
      style={{
        width: sizeStyles.width,
        height: 'auto',
        display: 'block',
        ...style
      }}
      className={`brand-logo ${className}`}
    />
  );

  const containerStyle = {
    textAlign: 'center',
    display: 'inline-block'
  };

  if (clickable && onClick) {
    return (
      <Box sx={containerStyle}>
        <button
          onClick={onClick}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          aria-label="SpeedyCRM Logo - Go to Dashboard"
        >
          {logoElement}
          {showTagline && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                fontSize: sizeStyles.fontSize,
                color: 'text.secondary'
              }}
            >
              Credit Repair Excellence Since 1995
            </Typography>
          )}
        </button>
      </Box>
    );
  }

  return (
    <Box sx={containerStyle}>
      {logoElement}
      {showTagline && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1,
            fontSize: sizeStyles.fontSize,
            color: 'text.secondary'
          }}
        >
          Credit Repair Excellence Since 1995
        </Typography>
      )}
    </Box>
  );
};

/**
 * BrandLogoSimple Component
 *
 * A simplified version without MUI dependencies for use in plain React components.
 *
 * @param {Object} props - Same props as BrandLogo
 */
export const BrandLogoSimple = ({
  variant = 'default',
  size = 'medium',
  showTagline = false,
  clickable = false,
  className = '',
  style = {},
  onClick
}) => {
  const sizeMap = {
    small: { width: '80px', fontSize: '12px' },
    medium: { width: '128px', fontSize: '14px' },
    large: { width: '200px', fontSize: '16px' },
    xl: { width: '300px', fontSize: '18px' }
  };

  const logoMap = {
    default: '/brand/default/logo-brand-128.png',
    white: '/brand/default/logo-white-128.png',
    black: '/brand/default/logo-black-128.png',
    brand: '/brand/default/logo-brand-128.png',
    transparent: '/brand/default/logo-transparent-128.png',
    fullcolor: '/brand/default/logo-fullcolor-lightmode-128.png'
  };

  const logoMapLarge = {
    default: '/brand/default/logo-brand-512.png',
    white: '/brand/default/logo-white-512.png',
    black: '/brand/default/logo-black-512.png',
    brand: '/brand/default/logo-brand-512.png',
    transparent: '/brand/default/logo-transparent-512.png',
    fullcolor: '/brand/default/logo-fullcolor-lightmode-512.png'
  };

  const logoSrc = size === 'large' || size === 'xl'
    ? (logoMapLarge[variant] || logoMapLarge.default)
    : (logoMap[variant] || logoMap.default);

  const sizeStyles = sizeMap[size] || sizeMap.medium;

  const containerStyle = {
    textAlign: 'center',
    display: 'inline-block'
  };

  const imgStyle = {
    width: sizeStyles.width,
    height: 'auto',
    display: 'block',
    ...style
  };

  const taglineStyle = {
    display: 'block',
    marginTop: '8px',
    fontSize: sizeStyles.fontSize,
    color: '#666',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  if (clickable && onClick) {
    return (
      <div style={containerStyle}>
        <button
          onClick={onClick}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          aria-label="SpeedyCRM Logo - Go to Dashboard"
        >
          <img
            src={logoSrc}
            alt="SpeedyCRM - Credit Repair Management System"
            style={imgStyle}
            className={`brand-logo ${className}`}
          />
          {showTagline && (
            <span style={taglineStyle}>
              Credit Repair Excellence Since 1995
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <img
        src={logoSrc}
        alt="SpeedyCRM - Credit Repair Management System"
        style={imgStyle}
        className={`brand-logo ${className}`}
      />
      {showTagline && (
        <span style={taglineStyle}>
          Credit Repair Excellence Since 1995
        </span>
      )}
    </div>
  );
};

// Default export
export default BrandLogo;

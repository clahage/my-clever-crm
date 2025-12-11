// ============================================================================
// GLOBAL FOOTER COMPONENT
// ============================================================================
// Copyright footer that appears on EVERY page of the CRM
// Displays trademark and ownership information
// Dark mode compatible
//
// Usage:
//   import GlobalFooter from './components/common/GlobalFooter';
//   <GlobalFooter />
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import React from 'react';
import { Box, Typography, Link, useTheme } from '@mui/material';

const GlobalFooter = ({ variant = 'default' }) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  // Different footer styles for different contexts
  const styles = {
    default: {
      py: 3,
      px: 3,
      mt: 'auto',
      borderTop: '1px solid',
      borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
      backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
      textAlign: 'center'
    },
    minimal: {
      py: 2,
      px: 2,
      mt: 2,
      textAlign: 'center'
    },
    contract: {
      py: 2,
      px: 3,
      borderTop: '2px solid',
      borderColor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.400',
      backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.100',
      textAlign: 'center'
    }
  };

  const currentStyle = styles[variant] || styles.default;

  return (
    <Box
      component="footer"
      sx={currentStyle}
      className="global-footer dark:bg-gray-900 dark:border-gray-700"
    >
      {/* Primary Copyright Line */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 0.5 }}
        className="dark:text-gray-400"
      >
        © 1995-{currentYear} Speedy Credit Repair Inc. | Created By{' '}
        <Link
          href="mailto:chris@speedycreditrepair.com"
          color="primary"
          underline="hover"
          sx={{ fontWeight: 500 }}
        >
          Chris Lahage
        </Link>
        {' '}| All Rights Reserved
      </Typography>

      {/* Trademark Line */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block' }}
        className="dark:text-gray-500"
      >
        Speedy Credit Repair® is a registered trademark of Speedy Credit Repair Inc.
      </Typography>

      {/* Optional Additional Information */}
      {variant === 'default' && (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
            className="dark:text-gray-500"
          >
            Est. 1995 | 4.9★ Google Rating (580+ Reviews) | A+ BBB Rating
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
            className="dark:text-gray-500"
          >
            Serving all 50 states |{' '}
            <Link
              href="https://myclevercrm.com"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              underline="hover"
              fontSize="inherit"
            >
              myclevercrm.com
            </Link>
          </Typography>
        </>
      )}
    </Box>
  );
};

export default GlobalFooter;

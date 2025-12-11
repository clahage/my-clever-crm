// ============================================================================
// CopyrightFooter.jsx - Universal Copyright Footer Component
// ============================================================================
// Path: /src/components/common/CopyrightFooter.jsx
//
// PURPOSE:
// Displays copyright notice, trademark protection, and company information
// on all pages throughout the application.
//
// COPYRIGHT:
// © 1995-{currentYear} Speedy Credit Repair Inc. | Created by Chris Lahage | All Rights Reserved
// Speedy Credit Repair® is a registered trademark (USPTO). Violations prosecuted.
// ============================================================================

import React from 'react';
import { Box, Typography, Link, Stack } from '@mui/material';
import {
  COMPANY_INFO,
  COPYRIGHT_TEXT,
  TRADEMARK_TEXT,
  TRADEMARK_TEXT_FULL,
  FOOTER_LINKS,
  getCurrentYear
} from '@/config/constants';

const CopyrightFooter = ({ variant = 'standard', className = '' }) => {
  const currentYear = getCurrentYear();

  // Full version for legal documents and contracts
  if (variant === 'legal') {
    return (
      <Box
        className={className}
        sx={{
          mt: 4,
          pt: 2,
          borderTop: 2,
          borderColor: 'divider',
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {COPYRIGHT_TEXT}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {TRADEMARK_TEXT_FULL}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {COMPANY_INFO.address.full} |{' '}
          Phone: {COMPANY_INFO.phone} |{' '}
          {COMPANY_INFO.email}
        </Typography>
      </Box>
    );
  }

  // Minimal version for admin pages
  if (variant === 'minimal') {
    return (
      <Box
        className={className}
        sx={{
          mt: 4,
          pt: 1,
          borderTop: 1,
          borderColor: 'divider',
          textAlign: 'center'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © {COMPANY_INFO.founded}-{currentYear} {COMPANY_INFO.name} | Created by {COMPANY_INFO.creator}
        </Typography>
      </Box>
    );
  }

  // Standard version for UI pages (default)
  return (
    <Box
      component="footer"
      className={`bg-white dark:bg-gray-900 ${className}`}
      sx={{
        mt: 'auto',
        pt: 3,
        pb: 2,
        px: 2,
        borderTop: 1,
        borderColor: 'divider',
        textAlign: 'center',
        backgroundColor: 'background.paper'
      }}
    >
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {COPYRIGHT_TEXT}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {TRADEMARK_TEXT}
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        flexWrap="wrap"
        sx={{ mt: 1 }}
      >
        {FOOTER_LINKS.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            variant="caption"
            color="text.secondary"
            underline="hover"
          >
            {link.label}
          </Link>
        ))}
      </Stack>
    </Box>
  );
};

export default CopyrightFooter;

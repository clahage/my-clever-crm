// src/components/auth/RoleBadge.jsx
// ============================================================================
// ROLE BADGE COMPONENT
// ============================================================================
// Displays user role with appropriate styling and icon
// Version: 1.0
// Date: November 21, 2025

import React from 'react';
import { Box, Chip, Tooltip, Avatar } from '@mui/material';
import { getRoleBadge, getRoleConfig } from '@/config/roleConfig';

/**
 * RoleBadge - Display role with icon and color
 * 
 * @param {string} role - Role ID
 * @param {string} size - Size: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} showIcon - Show role icon (default: true)
 * @param {boolean} showTooltip - Show tooltip with role description (default: true)
 * @param {string} variant - MUI Chip variant (default: 'filled')
 */
const RoleBadge = ({ 
  role, 
  size = 'medium',
  showIcon = true,
  showTooltip = true,
  variant = 'filled'
}) => {
  const roleConfig = getRoleConfig(role);
  
  if (!roleConfig) {
    return null;
  }

  const badge = getRoleBadge(role);
  const Icon = roleConfig.icon;

  const chipComponent = (
    <Chip
      icon={showIcon && Icon ? <Icon size={size === 'small' ? 14 : size === 'large' ? 20 : 16} /> : undefined}
      label={badge.label}
      size={size}
      variant={variant}
      sx={{
        backgroundColor: variant === 'filled' ? badge.bgColor : 'transparent',
        color: badge.color,
        borderColor: badge.color,
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: badge.color
        }
      }}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip title={roleConfig.description} arrow>
        {chipComponent}
      </Tooltip>
    );
  }

  return chipComponent;
};

/**
 * RoleAvatar - Display role as avatar with icon
 */
export const RoleAvatar = ({ role, size = 40 }) => {
  const roleConfig = getRoleConfig(role);
  
  if (!roleConfig) {
    return null;
  }

  const Icon = roleConfig.icon;

  return (
    <Tooltip title={`${roleConfig.label} - ${roleConfig.description}`} arrow>
      <Avatar
        sx={{
          width: size,
          height: size,
          backgroundColor: roleConfig.bgColor,
          color: roleConfig.color,
          border: `2px solid ${roleConfig.color}`
        }}
      >
        <Icon size={size * 0.5} />
      </Avatar>
    </Tooltip>
  );
};

/**
 * RoleIndicator - Compact role indicator for lists/tables
 */
export const RoleIndicator = ({ role }) => {
  const roleConfig = getRoleConfig(role);
  
  if (!roleConfig) {
    return null;
  }

  const Icon = roleConfig.icon;

  return (
    <Tooltip title={roleConfig.label} arrow>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: roleConfig.bgColor,
          color: roleConfig.color
        }}
      >
        <Icon size={14} />
      </Box>
    </Tooltip>
  );
};

export default RoleBadge;

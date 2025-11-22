// src/components/ImpersonationSelector.jsx
// Email Impersonation Component for Office Managers

import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Stack,
  Typography,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import { User, Crown, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleConfig } from '@/config/roleConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ImpersonationSelector = ({ value, onChange, disabled = false }) => {
  const { currentUser, userProfile } = useAuth();
  const [impersonationOptions, setImpersonationOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const roleConfig = getRoleConfig(userProfile?.role);
  const canImpersonate = roleConfig?.canImpersonate || false;

  useEffect(() => {
    const loadImpersonationOptions = async () => {
      if (!canImpersonate) {
        setLoading(false);
        return;
      }

      try {
        // Get owner/admin users that can be impersonated
        const usersQuery = query(
          collection(db, 'userProfiles'),
          where('role', 'in', ['masterAdmin', 'officeManager'])
        );

        const snapshot = await getDocs(usersQuery);
        const options = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => {
            // Office managers can impersonate the owner
            if (userProfile?.role === 'officeManager') {
              return user.role === 'masterAdmin';
            }
            return false;
          });

        setImpersonationOptions(options);
      } catch (error) {
        console.error('Error loading impersonation options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImpersonationOptions();
  }, [canImpersonate, userProfile]);

  if (!canImpersonate) {
    return null; // Don't show anything if user can't impersonate
  }

  if (loading) {
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Loading send options...
        </Typography>
      </Box>
    );
  }

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    if (onChange) {
      onChange(selectedValue);
    }
  };

  const getCurrentOption = () => {
    if (value === 'self' || !value) {
      return {
        id: 'self',
        displayName: userProfile?.displayName || currentUser?.email,
        email: currentUser?.email,
        role: userProfile?.role,
      };
    }

    return impersonationOptions.find((opt) => opt.id === value) || null;
  };

  const currentOption = getCurrentOption();

  return (
    <Box>
      <Stack spacing={2}>
        <FormControl fullWidth size="small" disabled={disabled}>
          <InputLabel id="impersonation-label">Send Email As</InputLabel>
          <Select
            labelId="impersonation-label"
            value={value || 'self'}
            label="Send Email As"
            onChange={handleChange}
            startAdornment={
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                {value && value !== 'self' ? (
                  <Crown size={18} color="#8B5CF6" />
                ) : (
                  <User size={18} />
                )}
              </Box>
            }
          >
            {/* Self Option */}
            <MenuItem value="self">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <User size={16} />
                </Avatar>
                <Box>
                  <Typography variant="body2">
                    {userProfile?.displayName || currentUser?.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser?.email} • {userProfile?.roleLabel || 'Your Account'}
                  </Typography>
                </Box>
              </Stack>
            </MenuItem>

            {/* Impersonation Options */}
            {impersonationOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    <Crown size={16} />
                  </Avatar>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">{option.displayName || option.email}</Typography>
                      <Chip
                        label="Owner"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.625rem',
                          bgcolor: '#8B5CF6',
                          color: 'white',
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Current Selection Display */}
        {value && value !== 'self' && currentOption && (
          <Alert
            severity="warning"
            icon={<AlertTriangle size={20} />}
            action={
              <Tooltip title="When sending as the owner, emails will show their name and email address as the sender">
                <IconButton size="small">
                  <Info size={16} />
                </IconButton>
              </Tooltip>
            }
          >
            <Stack spacing={0.5}>
              <Typography variant="body2" fontWeight="bold">
                Sending as: {currentOption.displayName || currentOption.email}
              </Typography>
              <Typography variant="caption">
                Recipients will see this email as coming from {currentOption.email}. This action
                will be logged in the audit trail.
              </Typography>
            </Stack>
          </Alert>
        )}

        {/* Help Text */}
        {impersonationOptions.length > 0 && (
          <Alert severity="info" icon={<Info size={20} />}>
            <Typography variant="caption">
              You can send emails on behalf of the owner. All impersonated emails are logged for
              security and auditing purposes.
            </Typography>
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

// Hook for using impersonation in email components
export const useImpersonation = () => {
  const { userProfile } = useAuth();
  const [impersonatedUser, setImpersonatedUser] = useState('self');
  const [impersonationData, setImpersonationData] = useState(null);

  const roleConfig = getRoleConfig(userProfile?.role);
  const canImpersonate = roleConfig?.canImpersonate || false;

  useEffect(() => {
    const loadImpersonationData = async () => {
      if (impersonatedUser === 'self' || !impersonatedUser || !canImpersonate) {
        setImpersonationData(null);
        return;
      }

      try {
        // Load the impersonated user's data from Firestore
        const userDoc = await getDocs(
          query(collection(db, 'userProfiles'), where('uid', '==', impersonatedUser))
        );

        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setImpersonationData(userData);
        }
      } catch (error) {
        console.error('Error loading impersonation data:', error);
      }
    };

    loadImpersonationData();
  }, [impersonatedUser, canImpersonate]);

  return {
    canImpersonate,
    impersonatedUser,
    setImpersonatedUser,
    impersonationData,
    isImpersonating: impersonatedUser !== 'self' && impersonatedUser !== null,
  };
};

export default ImpersonationSelector;

// ============================================================================
// GlobalContactAutocomplete.jsx - Reusable Autocomplete Input Wrapper
// ============================================================================
// Wraps any TextField to add contact autosuggest functionality.
// When user types, shows matching contacts in dropdown.
// When contact selected, triggers onAutofill callback with all contact data.
//
// Usage:
// <GlobalContactAutocomplete fieldType="firstName" onAutofill={handleAutofill}>
//   <TextField label="First Name" value={value} onChange={onChange} />
// </GlobalContactAutocomplete>
// ============================================================================

import React, { useState, useCallback, useRef, useEffect, cloneElement } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Fade,
  Popper,
  ClickAwayListener,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AutoAwesome as AutofillIcon,
  Close as CloseIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import useContactAutosuggest from '../hooks/useContactAutosuggest';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_PROPS = {
  fieldType: 'any',
  disabled: false,
  showAvatar: true,
  showScore: false,
  showSecondaryInfo: true,
  maxSuggestions: 5,
  minChars: 2,
  placeholder: 'Type to search contacts...',
  createNewLabel: 'Create new contact',
  noResultsLabel: 'No contacts found',
  autofillLabel: 'Autofill all fields',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getInitials = (firstName, lastName) => {
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return (first + last).toUpperCase() || '?';
};

const formatPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GlobalContactAutocomplete = ({
  children,
  fieldType = DEFAULT_PROPS.fieldType,
  onAutofill,
  onCreateNew,
  disabled = DEFAULT_PROPS.disabled,
  showAvatar = DEFAULT_PROPS.showAvatar,
  showScore = DEFAULT_PROPS.showScore,
  showSecondaryInfo = DEFAULT_PROPS.showSecondaryInfo,
  maxSuggestions = DEFAULT_PROPS.maxSuggestions,
  minChars = DEFAULT_PROPS.minChars,
  noResultsLabel = DEFAULT_PROPS.noResultsLabel,
  createNewLabel = DEFAULT_PROPS.createNewLabel,
  autofillLabel = DEFAULT_PROPS.autofillLabel,
  formName = 'unknown',
}) => {
  // ===== HOOK =====
  const {
    suggestions,
    isLoading,
    isOpen,
    search,
    selectContact,
    clearSuggestions,
    setIsOpen,
    getFieldTypeFromName,
  } = useContactAutosuggest({
    maxSuggestions,
    minChars,
    formName,
  });

  // ===== STATE =====
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');

  // ===== REFS =====
  const anchorRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // ===== RESET HIGHLIGHT WHEN SUGGESTIONS CHANGE =====
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // ===== HANDLE INPUT CHANGE =====
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);

    // Determine field type from prop or input name
    const effectiveFieldType = fieldType || getFieldTypeFromName(e.target.name) || 'any';

    // Search contacts
    search(value, effectiveFieldType);
  }, [fieldType, search, getFieldTypeFromName]);

  // ===== HANDLE AUTOFILL =====
  const handleAutofill = useCallback(async (suggestion) => {
    const autofillData = await selectContact(suggestion.contact);

    if (autofillData && onAutofill) {
      onAutofill(autofillData, suggestion.contact);
    }

    clearSuggestions();
    setInputValue('');
  }, [selectContact, onAutofill, clearSuggestions]);

  // ===== HANDLE CREATE NEW =====
  const handleCreateNew = useCallback(() => {
    if (onCreateNew) {
      onCreateNew(inputValue);
    }
    clearSuggestions();
  }, [inputValue, onCreateNew, clearSuggestions]);

  // ===== KEYBOARD NAVIGATION =====
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    const itemCount = suggestions.length + (onCreateNew ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < itemCount - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : itemCount - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleAutofill(suggestions[highlightedIndex]);
        } else if (highlightedIndex === suggestions.length && onCreateNew) {
          handleCreateNew();
        }
        break;

      case 'Escape':
        e.preventDefault();
        clearSuggestions();
        break;

      case 'Tab':
        clearSuggestions();
        break;

      default:
        break;
    }
  }, [isOpen, suggestions, highlightedIndex, onCreateNew, handleAutofill, handleCreateNew, clearSuggestions]);

  // ===== HANDLE CLICK AWAY =====
  const handleClickAway = useCallback(() => {
    clearSuggestions();
  }, [clearSuggestions]);

  // ===== CLONE CHILD WITH ENHANCED PROPS =====
  const enhancedChild = cloneElement(children, {
    ref: (node) => {
      inputRef.current = node;
      anchorRef.current = node;
      // Forward ref if child had one
      if (children.ref) {
        if (typeof children.ref === 'function') {
          children.ref(node);
        } else {
          children.ref.current = node;
        }
      }
    },
    onChange: (e) => {
      // Call original onChange if exists
      if (children.props.onChange) {
        children.props.onChange(e);
      }
      // Also trigger our handler
      handleInputChange(e);
    },
    onKeyDown: (e) => {
      // Call original onKeyDown if exists
      if (children.props.onKeyDown) {
        children.props.onKeyDown(e);
      }
      // Also trigger our handler
      handleKeyDown(e);
    },
    onFocus: (e) => {
      // Call original onFocus if exists
      if (children.props.onFocus) {
        children.props.onFocus(e);
      }
      // Re-search on focus if there's a value
      const value = e.target.value;
      if (value && value.length >= minChars) {
        search(value, fieldType);
      }
    },
    disabled: disabled || children.props.disabled,
  });

  // ===== RENDER =====
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        {enhancedChild}

        <Popper
          open={isOpen && (suggestions.length > 0 || isLoading || (inputValue.length >= minChars))}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300, width: anchorRef.current?.offsetWidth || 'auto' }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                elevation={8}
                sx={{
                  mt: 0.5,
                  maxHeight: 400,
                  overflow: 'auto',
                  borderRadius: 2,
                }}
              >
                {/* Loading State */}
                {isLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Searching contacts...
                    </Typography>
                  </Box>
                )}

                {/* Suggestions List */}
                {!isLoading && suggestions.length > 0 && (
                  <List ref={listRef} dense disablePadding>
                    {suggestions.map((suggestion, index) => {
                      const contact = suggestion.contact;
                      const isHighlighted = index === highlightedIndex;

                      return (
                        <ListItem
                          key={suggestion.id}
                          button
                          selected={isHighlighted}
                          onClick={() => handleAutofill(suggestion)}
                          sx={{
                            py: 1.5,
                            px: 2,
                            borderBottom: '1px solid',
                            borderBottomColor: 'divider',
                            '&:last-child': {
                              borderBottom: 'none',
                            },
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'action.selected',
                            },
                          }}
                        >
                          {/* Avatar */}
                          {showAvatar && (
                            <ListItemAvatar>
                              <Avatar
                                src={contact.photoURL}
                                sx={{
                                  bgcolor: 'primary.main',
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                {getInitials(contact.firstName, contact.lastName)}
                              </Avatar>
                            </ListItemAvatar>
                          )}

                          {/* Contact Info */}
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant="body1"
                                  fontWeight="medium"
                                  dangerouslySetInnerHTML={{
                                    __html: suggestion.highlightedName ||
                                      `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
                                  }}
                                />
                                {showScore && (
                                  <Chip
                                    label={`${suggestion.score}%`}
                                    size="small"
                                    color={suggestion.score > 80 ? 'success' : 'default'}
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                                {contact.roles?.includes('client') && (
                                  <Chip
                                    label="Client"
                                    size="small"
                                    color="success"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              showSecondaryInfo && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                  {contact.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {contact.email}
                                      </Typography>
                                    </Box>
                                  )}
                                  {contact.phone && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {formatPhone(contact.phone)}
                                      </Typography>
                                    </Box>
                                  )}
                                  {contact.primaryAddress?.city && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {contact.primaryAddress.city}, {contact.primaryAddress.state}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              )
                            }
                          />

                          {/* Autofill Button */}
                          <ListItemSecondaryAction>
                            <Tooltip title={autofillLabel}>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={<AutofillIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAutofill(suggestion);
                                }}
                                sx={{ minWidth: 'auto', px: 1 }}
                              >
                                Autofill
                              </Button>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                  </List>
                )}

                {/* No Results */}
                {!isLoading && suggestions.length === 0 && inputValue.length >= minChars && (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {noResultsLabel}
                    </Typography>
                  </Box>
                )}

                {/* Create New Option */}
                {onCreateNew && inputValue.length >= minChars && (
                  <>
                    {suggestions.length > 0 && <Divider />}
                    <ListItem
                      button
                      selected={highlightedIndex === suggestions.length}
                      onClick={handleCreateNew}
                      sx={{
                        py: 1.5,
                        px: 2,
                        backgroundColor: 'action.hover',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <PersonAddIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color="primary">
                            {createNewLabel} "{inputValue}"
                          </Typography>
                        }
                      />
                    </ListItem>
                  </>
                )}

                {/* Keyboard Navigation Hint */}
                {suggestions.length > 0 && (
                  <Box
                    sx={{
                      p: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 2,
                      backgroundColor: 'grey.50',
                      borderTop: '1px solid',
                      borderTopColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ArrowUpIcon sx={{ fontSize: 14 }} />
                      <ArrowDownIcon sx={{ fontSize: 14 }} />
                      Navigate
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Enter - Select
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Esc - Close
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default GlobalContactAutocomplete;

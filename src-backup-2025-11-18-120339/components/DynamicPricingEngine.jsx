// src/components/DynamicPricingEngine.jsx
// Advanced Dynamic Pricing with AI-powered suggestions

import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, Chip, Switch, Slider,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Alert, ToggleButton, ToggleButtonGroup, IconButton, Tooltip
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Clock, Users, MapPin, Zap,
  DollarSign, Percent, Calendar, Target, Brain, Play,
  Pause, Settings, Info, Save, X, Plus, Edit2, Trash2
} from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';

// ============================================================================
// DYNAMIC PRICING ENGINE
// ============================================================================

export const DynamicPricingEngine = ({ product, onSave }) => {
  const [pricingRules, setPricingRules] = useState({
    enabled: false,
    basePrice: product.pricing?.basePrice || 0,
    rules: []
  });

  const [showAddRule, setShowAddRule] = useState(false);
  const [currentRule, setCurrentRule] = useState({
    type: 'time-based', // time-based, demand-based, segment-based, geo-based
    name: '',
    enabled: true,
    priority: 1,
    conditions: {},
    adjustment: {
      type: 'percentage', // percentage, fixed
      value: 0
    }
  });

  // Pricing Rule Types
  const ruleTypes = [
    {
      id: 'time-based',
      name: 'Time-Based Pricing',
      icon: Clock,
      description: 'Adjust prices based on time of day, day of week, or season',
      color: '#3B82F6'
    },
    {
      id: 'demand-based',
      name: 'Demand Surge Pricing',
      icon: TrendingUp,
      description: 'Increase prices during high demand periods',
      color: '#EF4444'
    },
    {
      id: 'segment-based',
      name: 'Customer Segment Pricing',
      icon: Users,
      description: 'Different prices for different customer segments',
      color: '#8B5CF6'
    },
    {
      id: 'geo-based',
      name: 'Geographic Pricing',
      icon: MapPin,
      description: 'Price variations based on customer location',
      color: '#10B981'
    },
    {
      id: 'inventory-based',
      name: 'Inventory Pricing',
      icon: Target,
      description: 'Adjust based on stock levels',
      color: '#F59E0B'
    }
  ];

  // Calculate effective price based on rules
  const calculateEffectivePrice = (basePrice, rules) => {
    let price = basePrice;
    const activeRules = rules.filter(r => r.enabled).sort((a, b) => b.priority - a.priority);

    activeRules.forEach(rule => {
      if (isRuleActive(rule)) {
        if (rule.adjustment.type === 'percentage') {
          price = price * (1 + rule.adjustment.value / 100);
        } else {
          price = price + rule.adjustment.value;
        }
      }
    });

    return Math.round(price * 100) / 100;
  };

  // Check if rule should be active right now
  const isRuleActive = (rule) => {
    const now = new Date();
    
    switch (rule.type) {
      case 'time-based':
        if (rule.conditions.timeOfDay) {
          const hour = now.getHours();
          const [start, end] = rule.conditions.timeOfDay;
          if (hour < start || hour > end) return false;
        }
        if (rule.conditions.daysOfWeek) {
          const day = now.getDay();
          if (!rule.conditions.daysOfWeek.includes(day)) return false;
        }
        return true;

      case 'demand-based':
        // Would check real-time demand metrics
        return rule.conditions.demandThreshold ? true : false;

      case 'segment-based':
        // Would check customer segment
        return true;

      case 'geo-based':
        // Would check customer location
        return true;

      case 'inventory-based':
        if (rule.conditions.stockLevel) {
          const currentStock = product.inventory?.quantity || 0;
          return currentStock <= rule.conditions.stockLevel;
        }
        return true;

      default:
        return true;
    }
  };

  const handleAddRule = () => {
    setPricingRules(prev => ({
      ...prev,
      rules: [...prev.rules, { ...currentRule, id: Date.now() }]
    }));
    setShowAddRule(false);
    resetCurrentRule();
  };

  const resetCurrentRule = () => {
    setCurrentRule({
      type: 'time-based',
      name: '',
      enabled: true,
      priority: 1,
      conditions: {},
      adjustment: { type: 'percentage', value: 0 }
    });
  };

  const handleDeleteRule = (ruleId) => {
    setPricingRules(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== ruleId)
    }));
  };

  const effectivePrice = calculateEffectivePrice(pricingRules.basePrice, pricingRules.rules);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Zap size={28} style={{ color: '#F59E0B' }} />
            Dynamic Pricing Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Maximize revenue with intelligent, automated pricing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl>
            <Switch
              checked={pricingRules.enabled}
              onChange={(e) => setPricingRules(prev => ({ ...prev, enabled: e.target.checked }))}
            />
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => onSave(pricingRules)}
          >
            Save Rules
          </Button>
        </Box>
      </Box>

      {/* Current Price Display */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Base Price</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              ${pricingRules.basePrice}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Effective Price</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: effectivePrice > pricingRules.basePrice ? '#FCD34D' : '#34D399' }}>
              ${effectivePrice}
            </Typography>
            {effectivePrice !== pricingRules.basePrice && (
              <Chip
                label={`${((effectivePrice - pricingRules.basePrice) / pricingRules.basePrice * 100).toFixed(0)}% ${effectivePrice > pricingRules.basePrice ? 'increase' : 'decrease'}`}
                size="small"
                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Active Rules</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {pricingRules.rules.filter(r => r.enabled && isRuleActive(r)).length}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              of {pricingRules.rules.length} total
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Rule Type Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Add Pricing Rule
        </Typography>
        <Grid container spacing={2}>
          {ruleTypes.map(type => {
            const Icon = type.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={type.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: 2,
                    borderColor: 'transparent',
                    '&:hover': {
                      borderColor: type.color,
                      boxShadow: 3
                    }
                  }}
                  onClick={() => {
                    setCurrentRule(prev => ({ ...prev, type: type.id, name: type.name }));
                    setShowAddRule(true);
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: `${type.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={24} style={{ color: type.color }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {type.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Existing Rules */}
      {pricingRules.rules.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Active Pricing Rules
          </Typography>
          <Grid container spacing={2}>
            {pricingRules.rules.map((rule, index) => {
              const ruleType = ruleTypes.find(t => t.id === rule.type);
              const Icon = ruleType?.icon || Zap;
              const isActive = isRuleActive(rule);

              return (
                <Grid item xs={12} key={rule.id}>
                  <Card sx={{ border: rule.enabled && isActive ? 2 : 1, borderColor: rule.enabled && isActive ? 'success.main' : 'divider' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Icon size={24} style={{ color: ruleType?.color }} />
                            <Box>
                              <Typography variant="h6">{rule.name}</Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip label={ruleType?.name} size="small" sx={{ bgcolor: `${ruleType?.color}20` }} />
                                {rule.enabled && isActive && (
                                  <Chip label="Active Now" size="small" color="success" />
                                )}
                                {rule.enabled && !isActive && (
                                  <Chip label="Scheduled" size="small" variant="outlined" />
                                )}
                                {!rule.enabled && (
                                  <Chip label="Disabled" size="small" />
                                )}
                              </Box>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 3 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Adjustment</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {rule.adjustment.type === 'percentage' ? `${rule.adjustment.value}%` : `$${rule.adjustment.value}`}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Priority</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {rule.priority}
                              </Typography>
                            </Box>
                            {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">Conditions</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {Object.keys(rule.conditions).length} set
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Switch
                            checked={rule.enabled}
                            onChange={(e) => {
                              setPricingRules(prev => ({
                                ...prev,
                                rules: prev.rules.map(r => r.id === rule.id ? { ...r, enabled: e.target.checked } : r)
                              }));
                            }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Add Rule Dialog */}
      <Dialog open={showAddRule} onClose={() => setShowAddRule(false)} maxWidth="md" fullWidth>
        <DialogTitle>Configure Pricing Rule</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rule Name"
                  value={currentRule.name}
                  onChange={(e) => setCurrentRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Weekend Premium Pricing"
                />
              </Grid>

              {/* Time-Based Conditions */}
              {currentRule.type === 'time-based' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Time of Day</Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={currentRule.conditions.timeOfDay || [9, 17]}
                        onChange={(e, val) => setCurrentRule(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, timeOfDay: val }
                        }))}
                        valueLabelDisplay="auto"
                        min={0}
                        max={23}
                        marks={[
                          { value: 0, label: '12 AM' },
                          { value: 6, label: '6 AM' },
                          { value: 12, label: '12 PM' },
                          { value: 18, label: '6 PM' },
                          { value: 23, label: '11 PM' }
                        ]}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Days of Week</Typography>
                    <ToggleButtonGroup
                      value={currentRule.conditions.daysOfWeek || []}
                      onChange={(e, val) => setCurrentRule(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, daysOfWeek: val }
                      }))}
                      multiple
                      fullWidth
                    >
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <ToggleButton key={idx} value={idx}>
                          {day}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                </>
              )}

              {/* Inventory-Based Conditions */}
              {currentRule.type === 'inventory-based' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Trigger when stock below"
                    value={currentRule.conditions.stockLevel || 0}
                    onChange={(e) => setCurrentRule(prev => ({
                      ...prev,
                      conditions: { ...prev.conditions, stockLevel: parseInt(e.target.value) }
                    }))}
                  />
                </Grid>
              )}

              {/* Price Adjustment */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Price Adjustment</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Adjustment Type</InputLabel>
                  <Select
                    value={currentRule.adjustment.type}
                    onChange={(e) => setCurrentRule(prev => ({
                      ...prev,
                      adjustment: { ...prev.adjustment, type: e.target.value }
                    }))}
                    label="Adjustment Type"
                  >
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="fixed">Fixed Amount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={currentRule.adjustment.type === 'percentage' ? 'Percentage Change' : 'Amount Change'}
                  value={currentRule.adjustment.value}
                  onChange={(e) => setCurrentRule(prev => ({
                    ...prev,
                    adjustment: { ...prev.adjustment, value: parseFloat(e.target.value) }
                  }))}
                  InputProps={{
                    endAdornment: currentRule.adjustment.type === 'percentage' ? '%' : '$'
                  }}
                  helperText="Use negative values for discounts"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Priority (1-10)"
                  value={currentRule.priority}
                  onChange={(e) => setCurrentRule(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
            </Grid>

            {/* Preview */}
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Preview:
              </Typography>
              <Typography variant="body2">
                Base Price: ${pricingRules.basePrice} → New Price: $
                {currentRule.adjustment.type === 'percentage'
                  ? (pricingRules.basePrice * (1 + currentRule.adjustment.value / 100)).toFixed(2)
                  : (pricingRules.basePrice + currentRule.adjustment.value).toFixed(2)
                }
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddRule(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRule} disabled={!currentRule.name}>
            Add Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DynamicPricingEngine;
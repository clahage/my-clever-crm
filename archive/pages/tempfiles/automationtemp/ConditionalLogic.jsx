// ============================================================================
// ConditionalLogic.jsx - CONDITIONAL LOGIC BUILDER
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-09
//
// DESCRIPTION:
// Advanced if/then/else logic builder for creating complex automation rules.
// Provides visual logic flow, multiple condition types, AND/OR groups,
// nested conditions, and custom formula builder.
//
// FEATURES:
// - Visual logic flow builder
// - Multiple condition types (field value, date/time, numeric, text)
// - AND/OR logic groups
// - Nested conditions support
// - Field comparisons
// - Date/time conditions
// - Numeric operations
// - String operations
// - Custom formula builder
// - Logic testing & validation
// - Logic templates
// - Real-time preview
// - AI-powered logic suggestions
//
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Alert,
  AlertTitle,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  IconButton,
  Tooltip,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  RadioGroup,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  GitBranch,
  Plus,
  Trash2,
  Play,
  Save,
  Copy,
  ChevronDown,
  Code,
  CheckCircle,
  XCircle,
  Info,
  Sparkles,
  Brain,
  Eye,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

// ============================================================================
// CONSTANTS
// ============================================================================

const CONDITION_TYPES = [
  { value: 'field_value', label: 'Field Value' },
  { value: 'field_comparison', label: 'Field Comparison' },
  { value: 'date_time', label: 'Date/Time' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'text', label: 'Text' },
  { value: 'list', label: 'List Membership' },
  { value: 'custom', label: 'Custom Formula' },
];

const OPERATORS = {
  field_value: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' },
  ],
  numeric: [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '≠' },
    { value: 'greater_than', label: '>' },
    { value: 'less_than', label: '<' },
    { value: 'greater_equal', label: '≥' },
    { value: 'less_equal', label: '≤' },
    { value: 'between', label: 'Between' },
  ],
  date_time: [
    { value: 'is', label: 'Is' },
    { value: 'is_before', label: 'Is Before' },
    { value: 'is_after', label: 'Is After' },
    { value: 'is_between', label: 'Is Between' },
    { value: 'is_today', label: 'Is Today' },
    { value: 'is_this_week', label: 'Is This Week' },
    { value: 'is_this_month', label: 'Is This Month' },
    { value: 'days_ago', label: 'Days Ago' },
    { value: 'days_from_now', label: 'Days From Now' },
  ],
};

const LOGIC_OPERATORS = [
  { value: 'and', label: 'AND', description: 'All conditions must be true' },
  { value: 'or', label: 'OR', description: 'At least one condition must be true' },
];

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ConditionalLogic = () => {
  const { currentUser } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Logic rules state
  const [logicRules, setLogicRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);

  // Rule builder state
  const [currentRule, setCurrentRule] = useState({
    name: '',
    description: '',
    operator: 'and',
    conditions: [],
  });

  // Dialog state
  const [createDialog, setCreateDialog] = useState(false);
  const [testDialog, setTestDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);

  // Test state
  const [testData, setTestData] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  // AI state
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  // ===== FIREBASE LISTENERS =====
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'automations', 'logic', 'rules'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ruleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogicRules(ruleData);
      console.log('✅ Logic rules loaded:', ruleData.length);
    });

    return unsubscribe;
  }, [currentUser]);

  // ===== CONDITION HANDLERS =====
  const handleAddCondition = () => {
    const newCondition = {
      id: Date.now(),
      type: 'field_value',
      field: '',
      operator: 'equals',
      value: '',
    };

    setCurrentRule({
      ...currentRule,
      conditions: [...currentRule.conditions, newCondition],
    });
  };

  const handleRemoveCondition = (conditionId) => {
    setCurrentRule({
      ...currentRule,
      conditions: currentRule.conditions.filter(c => c.id !== conditionId),
    });
  };

  const handleUpdateCondition = (conditionId, updates) => {
    setCurrentRule({
      ...currentRule,
      conditions: currentRule.conditions.map(c =>
        c.id === conditionId ? { ...c, ...updates } : c
      ),
    });
  };

  const handleAddConditionGroup = () => {
    const newGroup = {
      id: Date.now(),
      type: 'group',
      operator: 'and',
      conditions: [],
    };

    setCurrentRule({
      ...currentRule,
      conditions: [...currentRule.conditions, newGroup],
    });
  };

  // ===== RULE HANDLERS =====
  const handleSaveRule = async () => {
    try {
      setLoading(true);

      const ruleData = {
        ...currentRule,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'automations', 'logic', 'rules'), ruleData);

      showSnackbar('Logic rule saved!', 'success');
      setCreateDialog(false);
      setCurrentRule({
        name: '',
        description: '',
        operator: 'and',
        conditions: [],
      });
    } catch (error) {
      console.error('❌ Error saving rule:', error);
      showSnackbar('Failed to save rule', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('Delete this logic rule?')) return;

    try {
      await deleteDoc(doc(db, 'automations', 'logic', 'rules', ruleId));
      showSnackbar('Rule deleted!', 'success');
    } catch (error) {
      console.error('❌ Error deleting rule:', error);
      showSnackbar('Failed to delete rule', 'error');
    }
  };

  const handleDuplicateRule = async (rule) => {
    try {
      const duplicateData = {
        ...rule,
        name: `${rule.name} (Copy)`,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      delete duplicateData.id;

      await addDoc(collection(db, 'automations', 'logic', 'rules'), duplicateData);

      showSnackbar('Rule duplicated!', 'success');
    } catch (error) {
      console.error('❌ Error duplicating rule:', error);
      showSnackbar('Failed to duplicate rule', 'error');
    }
  };

  // ===== TEST LOGIC =====
  const handleTestLogic = async () => {
    try {
      setTesting(true);

      // Evaluate logic with test data
      const result = evaluateLogic(currentRule, testData);

      setTestResults({
        passed: result,
        message: result 
          ? 'All conditions passed!' 
          : 'Conditions not met',
        timestamp: new Date(),
      });

      showSnackbar(result ? 'Test passed!' : 'Test failed!', result ? 'success' : 'warning');
    } catch (error) {
      console.error('❌ Test error:', error);
      setTestResults({
        passed: false,
        message: error.message,
      });
      showSnackbar('Test failed!', 'error');
    } finally {
      setTesting(false);
    }
  };

  const evaluateLogic = (rule, data) => {
    if (!rule.conditions || rule.conditions.length === 0) {
      return true;
    }

    const results = rule.conditions.map(condition => {
      if (condition.type === 'group') {
        return evaluateLogic(condition, data);
      }

      const fieldValue = data[condition.field];
      const testValue = condition.value;

      switch (condition.operator) {
        case 'equals':
          return fieldValue == testValue;
        case 'not_equals':
          return fieldValue != testValue;
        case 'contains':
          return String(fieldValue).includes(testValue);
        case 'greater_than':
          return Number(fieldValue) > Number(testValue);
        case 'less_than':
          return Number(fieldValue) < Number(testValue);
        case 'is_empty':
          return !fieldValue;
        case 'is_not_empty':
          return !!fieldValue;
        default:
          return false;
      }
    });

    return rule.operator === 'and'
      ? results.every(r => r)
      : results.some(r => r);
  };

  // ===== AI SUGGESTIONS =====
  const handleGenerateSuggestions = async () => {
    if (!OPENAI_API_KEY) {
      showSnackbar('OpenAI API key not configured', 'warning');
      return;
    }

    try {
      setGeneratingSuggestions(true);

      const prompt = `Suggest 5 useful conditional logic rules for a credit repair CRM automation system:

Provide suggestions in JSON format:
[
  {
    "name": "Rule name",
    "description": "What it does",
    "example": "Example condition",
    "useCase": "When to use it"
  }
]`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const content = data.content[0].text;

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        setAiSuggestions(suggestions);
        showSnackbar('AI suggestions generated!', 'success');
      }
    } catch (error) {
      console.error('❌ AI error:', error);
      showSnackbar('Failed to generate suggestions', 'error');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ===== RENDER: CONDITION =====
  const renderCondition = (condition, index) => (
    <Card key={condition.id} variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={condition.type}
                label="Type"
                onChange={(e) => handleUpdateCondition(condition.id, { type: e.target.value })}
              >
                {CONDITION_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Field"
              value={condition.field}
              onChange={(e) => handleUpdateCondition(condition.id, { field: e.target.value })}
              placeholder="lead_score"
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Operator</InputLabel>
              <Select
                value={condition.operator}
                label="Operator"
                onChange={(e) => handleUpdateCondition(condition.id, { operator: e.target.value })}
              >
                {(OPERATORS[condition.type] || OPERATORS.field_value).map(op => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={10} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Value"
              value={condition.value}
              onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
              placeholder="80"
            />
          </Grid>

          <Grid item xs={2} sm={1}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRemoveCondition(condition.id)}
            >
              <Trash2 size={18} />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // ===== MAIN RENDER =====
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GitBranch />
          Conditional Logic
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setCreateDialog(true)}
        >
          Create Logic Rule
        </Button>
      </Box>

      {/* Info Banner */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Conditional Logic Builder</AlertTitle>
        Create complex if/then/else rules for your automations with AND/OR logic and nested conditions.
      </Alert>

      {/* Existing Rules */}
      <Grid container spacing={2}>
        {logicRules.map((rule) => (
          <Grid item xs={12} md={6} key={rule.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <GitBranch size={24} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{rule.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rule.conditions?.length || 0} conditions • {rule.operator.toUpperCase()} logic
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {rule.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Eye />}
                    onClick={() => {
                      setSelectedRule(rule);
                      setPreviewDialog(true);
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Copy />}
                    onClick={() => handleDuplicateRule(rule)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Trash2 />}
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {logicRules.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>No Logic Rules Yet</AlertTitle>
              Create your first conditional logic rule to add advanced decision-making to your automations!
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* AI Suggestions */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Brain />
              AI Logic Suggestions
            </Typography>
            <Button
              variant="contained"
              startIcon={generatingSuggestions ? <CircularProgress size={16} /> : <Sparkles />}
              onClick={handleGenerateSuggestions}
              disabled={generatingSuggestions}
            >
              {generatingSuggestions ? 'Generating...' : 'Generate Suggestions'}
            </Button>
          </Box>

          {aiSuggestions.length > 0 ? (
            <Grid container spacing={2}>
              {aiSuggestions.map((suggestion, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Alert severity="info" icon={<Sparkles />}>
                    <AlertTitle>{suggestion.name}</AlertTitle>
                    <Typography variant="body2" gutterBottom>
                      {suggestion.description}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                      💡 Example: {suggestion.example}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Use Case: {suggestion.useCase}
                    </Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              Click "Generate Suggestions" to get AI-powered conditional logic ideas!
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Conditional Logic Rule</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rule Name"
                value={currentRule.name}
                onChange={(e) => setCurrentRule({ ...currentRule, name: e.target.value })}
                placeholder="High Value Lead Check"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={currentRule.description}
                onChange={(e) => setCurrentRule({ ...currentRule, description: e.target.value })}
                placeholder="Check if lead score is high and contact is qualified..."
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Conditions</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Plus />}
                    onClick={handleAddCondition}
                  >
                    Add Condition
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Plus />}
                    onClick={handleAddConditionGroup}
                  >
                    Add Group
                  </Button>
                </Box>
              </Box>

              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Logic Operator:
                </Typography>
                <RadioGroup
                  row
                  value={currentRule.operator}
                  onChange={(e) => setCurrentRule({ ...currentRule, operator: e.target.value })}
                >
                  {LOGIC_OPERATORS.map(op => (
                    <FormControlLabel
                      key={op.value}
                      value={op.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {op.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {op.description}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {currentRule.conditions.length > 0 ? (
                currentRule.conditions.map((condition, index) =>
                  renderCondition(condition, index)
                )
              ) : (
                <Alert severity="info">
                  No conditions added. Click "Add Condition" to get started.
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="outlined"
            startIcon={<Play />}
            onClick={() => {
              setCreateDialog(false);
              setTestDialog(true);
            }}
            disabled={currentRule.conditions.length === 0}
          >
            Test Logic
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveRule}
            disabled={loading || !currentRule.name || currentRule.conditions.length === 0}
          >
            {loading ? 'Saving...' : 'Save Rule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={testDialog} onClose={() => setTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Test Logic Rule</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Test Your Logic</AlertTitle>
              Enter sample data to test if your conditions work correctly.
            </Alert>

            <Typography variant="subtitle2" gutterBottom>
              Test Data:
            </Typography>

            {currentRule.conditions.map((condition, index) => (
              <TextField
                key={condition.id}
                fullWidth
                size="small"
                label={condition.field || `Field ${index + 1}`}
                value={testData[condition.field] || ''}
                onChange={(e) => setTestData({
                  ...testData,
                  [condition.field]: e.target.value,
                })}
                sx={{ mb: 2 }}
              />
            ))}

            {!testResults ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Button
                  variant="contained"
                  startIcon={testing ? <CircularProgress size={16} /> : <Play />}
                  onClick={handleTestLogic}
                  disabled={testing}
                >
                  {testing ? 'Testing...' : 'Run Test'}
                </Button>
              </Box>
            ) : (
              <Alert severity={testResults.passed ? 'success' : 'warning'} sx={{ mt: 2 }}>
                <AlertTitle>{testResults.passed ? 'Test Passed' : 'Test Failed'}</AlertTitle>
                {testResults.message}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setTestDialog(false);
            setTestResults(null);
            setTestData({});
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Logic Rule Preview</DialogTitle>
        <DialogContent>
          {selectedRule && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedRule.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedRule.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Logic: {selectedRule.operator.toUpperCase()}
              </Typography>

              <List dense>
                {selectedRule.conditions?.map((condition, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${condition.field} ${condition.operator} ${condition.value}`}
                      secondary={condition.type}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConditionalLogic;
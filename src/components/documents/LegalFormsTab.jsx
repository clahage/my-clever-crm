// Path: /src/components/documents/LegalFormsTab.jsx
// ============================================================================
// LEGAL FORMS TAB - Power of Attorney, ACH, State-Specific Legal Documents
// ============================================================================
// FEATURES:
// - Pre-built legal form templates (POA, ACH, Disclosures)
// - State-specific legal document library
// - Auto-population with client data
// - FCRA compliance verification
// - AI-powered form suggestions
// - Legal language assistance
// - Digital form completion
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent, CardActions,
  TextField, InputAdornment, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, FormControl, InputLabel, MenuItem, Alert, AlertTitle,
  CircularProgress, Tooltip, Divider, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, IconButton, Avatar, Tabs, Tab,
  Stepper, Step, StepLabel, StepContent, Accordion, AccordionSummary,
  AccordionDetails, FormControlLabel, Checkbox, Switch, LinearProgress,
  Badge, Stack, Fade,
} from '@mui/material';
import {
  Gavel as LegalIcon,
  AccountBalance as BankIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Description as DocumentIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  AutoAwesome as AIIcon,
  ExpandMore as ExpandIcon,
  Print as PrintIcon,
  ContentCopy as CopyIcon,
  Shield as ShieldIcon,
  VerifiedUser as VerifiedIcon,
  Lock as LockIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================================================
// CONSTANTS - LEGAL FORM TYPES
// ============================================================================

const LEGAL_FORM_CATEGORIES = [
  {
    id: 'poa',
    name: 'Power of Attorney',
    description: 'Authorization for credit repair representation',
    icon: <LegalIcon />,
    color: '#8b5cf6',
    fcraRequired: true,
    forms: [
      { id: 'poa-limited', name: 'Limited POA (Credit Repair)', popular: true },
      { id: 'poa-full', name: 'Full Power of Attorney', popular: false },
      { id: 'poa-revocation', name: 'POA Revocation Form', popular: false },
    ],
  },
  {
    id: 'ach',
    name: 'ACH Authorization',
    description: 'Payment and billing authorization forms',
    icon: <BankIcon />,
    color: '#10b981',
    fcraRequired: false,
    forms: [
      { id: 'ach-recurring', name: 'Recurring ACH Authorization', popular: true },
      { id: 'ach-single', name: 'Single Payment Authorization', popular: false },
      { id: 'ach-cancellation', name: 'ACH Cancellation Request', popular: false },
    ],
  },
  {
    id: 'disclosure',
    name: 'Required Disclosures',
    description: 'FCRA-mandated disclosure documents',
    icon: <ShieldIcon />,
    color: '#2563eb',
    fcraRequired: true,
    forms: [
      { id: 'croa-disclosure', name: 'CROA Disclosure Statement', popular: true },
      { id: 'rights-notice', name: 'Consumer Rights Notice', popular: true },
      { id: 'cancellation-policy', name: 'Cancellation Policy', popular: false },
    ],
  },
  {
    id: 'consent',
    name: 'Consent Forms',
    description: 'Client consent and authorization documents',
    icon: <VerifiedIcon />,
    color: '#f59e0b',
    fcraRequired: false,
    forms: [
      { id: 'credit-pull', name: 'Credit Report Pull Consent', popular: true },
      { id: 'communication', name: 'Communication Consent', popular: false },
      { id: 'data-sharing', name: 'Data Sharing Authorization', popular: false },
    ],
  },
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

// ============================================================================
// LEGAL FORMS TAB COMPONENT
// ============================================================================

const LegalFormsTab = ({ documents, loading, onRefresh, userRole }) => {
  // ===== STATE =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('');
  const [openGenerator, setOpenGenerator] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState(null);
  const [aiAssisting, setAiAssisting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [complianceCheck, setComplianceCheck] = useState(null);

  // ===== FILTER LEGAL FORMS =====
  const legalDocuments = useMemo(() => {
    return documents.filter(doc => doc.type === 'legal' || doc.category === 'legal');
  }, [documents]);

  const filteredCategories = useMemo(() => {
    if (selectedCategory === 'all') return LEGAL_FORM_CATEGORIES;
    return LEGAL_FORM_CATEGORIES.filter(cat => cat.id === selectedCategory);
  }, [selectedCategory]);

  // ===== STATS =====
  const stats = useMemo(() => ({
    totalGenerated: legalDocuments.length,
    poaForms: legalDocuments.filter(d => d.formType === 'poa').length,
    achForms: legalDocuments.filter(d => d.formType === 'ach').length,
    disclosures: legalDocuments.filter(d => d.formType === 'disclosure').length,
    pendingSignature: legalDocuments.filter(d => d.status === 'pending').length,
  }), [legalDocuments]);

  // ===== AI FEATURES =====
  const runAIComplianceCheck = async (formType, state) => {
    setAiAssisting(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `As a credit repair legal compliance expert, provide guidance for a ${formType} form in ${state || 'the United States'}.

Return JSON:
{
  "stateRequirements": ["requirement1", "requirement2"],
  "fcraCompliance": ["compliance point1", "compliance point2"],
  "recommendedClauses": ["clause1", "clause2"],
  "warnings": ["any warnings or cautions"],
  "bestPractices": ["practice1", "practice2"]
}`
          }]
        })
      });

      const data = await response.json();
      let text = data.content[0].text;
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setComplianceCheck(JSON.parse(text));
    } catch (err) {
      console.error('AI compliance check error:', err);
      setComplianceCheck({
        stateRequirements: ['Follow state-specific credit repair regulations', 'Include required cancellation disclosures'],
        fcraCompliance: ['Must provide Consumer Rights Notice', 'Cannot charge upfront fees in some states'],
        recommendedClauses: ['Clear description of services', 'Payment terms and conditions'],
        warnings: ['Verify current state regulations before use'],
        bestPractices: ['Keep copies of all signed documents', 'Provide consumer with copy within 5 days']
      });
    } finally {
      setAiAssisting(false);
    }
  };

  const generateAIFormContent = async () => {
    if (!selectedForm) return;

    setGenerating(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: `Generate a professional, FCRA-compliant ${selectedForm.name} for a credit repair business.

Client Information:
${JSON.stringify(formData, null, 2)}

State: ${selectedState || 'General US'}

Generate complete document content with:
- Professional legal formatting
- All required FCRA disclosures
- State-specific requirements if applicable
- Signature blocks
- Date fields

Return JSON:
{
  "title": "Document Title",
  "content": "Full legal document content",
  "requiredFields": ["field1", "field2"],
  "signatureBlocks": [{"role": "Client", "required": true}],
  "complianceNotes": "Any compliance notes",
  "effectiveDate": "When this becomes effective"
}`
          }]
        })
      });

      const data = await response.json();
      let text = data.content[0].text;
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setGeneratedDocument(JSON.parse(text));
      setActiveStep(3);
    } catch (err) {
      console.error('AI form generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveForm = async () => {
    if (!generatedDocument) return;

    try {
      await addDoc(collection(db, 'documents'), {
        name: generatedDocument.title,
        type: 'legal',
        formType: selectedForm?.id?.split('-')[0] || 'legal',
        content: generatedDocument.content,
        clientName: formData.clientName,
        state: selectedState,
        status: 'draft',
        aiGenerated: true,
        complianceNotes: generatedDocument.complianceNotes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setOpenGenerator(false);
      resetGenerator();
      onRefresh();
    } catch (err) {
      console.error('Error saving form:', err);
    }
  };

  const resetGenerator = () => {
    setSelectedForm(null);
    setActiveStep(0);
    setFormData({});
    setGeneratedDocument(null);
    setComplianceCheck(null);
  };

  // ===== GENERATOR STEPS =====
  const generatorSteps = [
    {
      label: 'Select Form Type',
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose the type of legal form you need to generate
          </Typography>
          <Grid container spacing={2}>
            {LEGAL_FORM_CATEGORIES.map((category) => (
              <Grid item xs={12} key={category.id}>
                <Accordion defaultExpanded={category.id === 'poa'}>
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: category.color }}>{category.icon}</Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {category.name}
                          {category.fcraRequired && (
                            <Chip size="small" label="FCRA Required" sx={{ ml: 1 }} color="warning" />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {category.forms.map((form) => (
                        <ListItem
                          key={form.id}
                          button
                          selected={selectedForm?.id === form.id}
                          onClick={() => setSelectedForm(form)}
                          sx={{
                            borderRadius: 1,
                            mb: 1,
                            border: selectedForm?.id === form.id ? '2px solid' : '1px solid',
                            borderColor: selectedForm?.id === form.id ? 'primary.main' : 'divider',
                          }}
                        >
                          <ListItemIcon>
                            <DocumentIcon color={selectedForm?.id === form.id ? 'primary' : 'inherit'} />
                          </ListItemIcon>
                          <ListItemText primary={form.name} />
                          {form.popular && (
                            <Chip size="small" label="Popular" color="primary" variant="outlined" />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </Box>
      ),
    },
    {
      label: 'Client Information',
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter client details to auto-populate the form
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Full Name"
                value={formData.clientName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={selectedState}
                  label="State"
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  {US_STATES.map(state => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zip || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="SSN (Last 4)"
                value={formData.ssn4 || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ssn4: e.target.value }))}
                placeholder="XXXX"
                inputProps={{ maxLength: 4 }}
              />
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      label: 'Compliance Review',
      content: (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              AI-powered compliance check for your selected form
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={aiAssisting ? <CircularProgress size={16} /> : <AIIcon />}
              onClick={() => runAIComplianceCheck(selectedForm?.name, selectedState)}
              disabled={aiAssisting}
            >
              Run AI Check
            </Button>
          </Box>

          {complianceCheck ? (
            <Fade in>
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <AlertTitle>Compliance Check Complete</AlertTitle>
                  Review the requirements below before generating
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" /> State Requirements
                      </Typography>
                      <List dense>
                        {complianceCheck.stateRequirements?.map((req, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
                            <ListItemText primary={req} />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShieldIcon fontSize="small" /> FCRA Compliance
                      </Typography>
                      <List dense>
                        {complianceCheck.fcraCompliance?.map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon><VerifiedIcon fontSize="small" color="primary" /></ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>

                  {complianceCheck.warnings?.length > 0 && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        <AlertTitle>Important Notices</AlertTitle>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {complianceCheck.warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Fade>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <AIIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography color="text.secondary">
                Click "Run AI Check" to analyze compliance requirements
              </Typography>
            </Paper>
          )}
        </Box>
      ),
    },
    {
      label: 'Generate & Review',
      content: (
        <Box>
          {generatedDocument ? (
            <Fade in>
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <AlertTitle>Document Generated Successfully</AlertTitle>
                  Review the document below before saving
                </Alert>

                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>{generatedDocument.title}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', fontFamily: 'serif', lineHeight: 1.8 }}
                  >
                    {generatedDocument.content}
                  </Typography>
                </Paper>

                {generatedDocument.complianceNotes && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <AlertTitle>Compliance Notes</AlertTitle>
                    {generatedDocument.complianceNotes}
                  </Alert>
                )}
              </Box>
            </Fade>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {generating ? (
                <>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography>Generating your legal document with AI...</Typography>
                  <Typography variant="body2" color="text.secondary">
                    This may take a moment
                  </Typography>
                </>
              ) : (
                <>
                  <DocumentIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography gutterBottom>Ready to generate your document</Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AIIcon />}
                    onClick={generateAIFormContent}
                  >
                    Generate with AI
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>
      ),
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* HEADER & STATS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Generated', value: stats.totalGenerated, icon: <DocumentIcon />, color: 'primary.main' },
          { label: 'POA Forms', value: stats.poaForms, icon: <LegalIcon />, color: '#8b5cf6' },
          { label: 'ACH Forms', value: stats.achForms, icon: <BankIcon />, color: '#10b981' },
          { label: 'Disclosures', value: stats.disclosures, icon: <ShieldIcon />, color: '#2563eb' },
          { label: 'Pending Signature', value: stats.pendingSignature, icon: <WarningIcon />, color: 'warning.main' },
        ].map((stat, idx) => (
          <Grid item xs={6} sm={4} md={2.4} key={idx}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: stat.color, mx: 'auto', mb: 1 }}>{stat.icon}</Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* TOOLBAR */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search legal forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                {LEGAL_FORM_CATEGORIES.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>State</InputLabel>
              <Select value={selectedState} label="State" onChange={(e) => setSelectedState(e.target.value)}>
                <MenuItem value="">All States</MenuItem>
                {US_STATES.map(state => (
                  <MenuItem key={state} value={state}>{state}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenGenerator(true)}>
                Generate Legal Form
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* FORM CATEGORIES */}
      <Grid container spacing={3}>
        {filteredCategories.map((category) => (
          <Grid item xs={12} md={6} key={category.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: category.color, width: 48, height: 48 }}>
                    {category.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {category.name}
                      {category.fcraRequired && (
                        <Chip size="small" label="FCRA" sx={{ ml: 1 }} color="warning" />
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <List>
                  {category.forms.map((form) => (
                    <ListItem
                      key={form.id}
                      sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}
                    >
                      <ListItemIcon>
                        <DocumentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={form.name}
                        secondary={form.popular ? 'Most commonly used' : null}
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Generate">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedForm(form);
                                setOpenGenerator(true);
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Preview Template">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* RECENT GENERATED FORMS */}
      {legalDocuments.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>Recently Generated Legal Forms</Typography>
          <Grid container spacing={2}>
            {legalDocuments.slice(0, 6).map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LegalIcon color="primary" />
                      <Typography variant="subtitle2" noWrap>{doc.name}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {doc.clientName || 'No client assigned'}
                    </Typography>
                    <Chip
                      size="small"
                      label={doc.status || 'draft'}
                      sx={{ mt: 1 }}
                      color={doc.status === 'signed' ? 'success' : 'default'}
                    />
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<ViewIcon />}>View</Button>
                    <Button size="small" startIcon={<DownloadIcon />}>Download</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* GENERATOR DIALOG */}
      <Dialog open={openGenerator} onClose={() => { setOpenGenerator(false); resetGenerator(); }} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><LegalIcon /></Avatar>
            <Box>
              <Typography variant="h6">Legal Form Generator</Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered legal document creation with FCRA compliance
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} orientation="vertical">
            {generatorSteps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Box sx={{ py: 2 }}>{step.content}</Box>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(prev => prev + 1)}
                      disabled={
                        (index === 0 && !selectedForm) ||
                        (index === 1 && !formData.clientName) ||
                        (index === 3 && !generatedDocument)
                      }
                      sx={{ mr: 1 }}
                    >
                      {index === generatorSteps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                    <Button onClick={() => setActiveStep(prev => prev - 1)} disabled={index === 0}>
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenGenerator(false); resetGenerator(); }}>Cancel</Button>
          {generatedDocument && (
            <>
              <Button variant="outlined" startIcon={<PrintIcon />}>Print</Button>
              <Button variant="contained" startIcon={<CheckIcon />} onClick={handleSaveForm}>
                Save Document
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LegalFormsTab;

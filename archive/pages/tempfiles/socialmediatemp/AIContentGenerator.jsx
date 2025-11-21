// ============================================================================
// AIContentGenerator.jsx - AI CONTENT GENERATOR
// ============================================================================

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Sparkles,
  Copy,
  RefreshCw,
  Save,
  Send,
  Wand2,
  FileText,
  Hash,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const CONTENT_TYPES = [
  { value: 'post', label: 'Social Media Post' },
  { value: 'caption', label: 'Image Caption' },
  { value: 'hashtags', label: 'Hashtags' },
  { value: 'thread', label: 'Twitter Thread' },
  { value: 'story', label: 'Story Copy' },
];

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'informative', label: 'Informative' },
  { value: 'motivational', label: 'Motivational' },
];

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const AIContentGenerator = () => {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [contentType, setContentType] = useState('post');
  const [tone, setTone] = useState('professional');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentHistory, setContentHistory] = useState([]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showSnackbar('Please enter a topic', 'warning');
      return;
    }

    if (!OPENAI_API_KEY) {
      showSnackbar('OpenAI API key not configured', 'warning');
      return;
    }

    try {
      setLoading(true);

      const prompt = `Create a ${contentType} about ${topic} for a credit repair business.
Tone: ${tone}
${keywords ? `Keywords to include: ${keywords}` : ''}

Requirements:
- Professional and engaging
- Credit repair industry appropriate
- ${contentType === 'post' ? '2-3 paragraphs' : ''}
- ${contentType === 'hashtags' ? 'Generate 10-15 relevant hashtags' : ''}
- ${contentType === 'thread' ? 'Create 5-7 connected tweets' : ''}

Generate compelling content that will engage the audience.`;

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

      setGeneratedContent(content);
      setContentHistory([{ topic, content, timestamp: new Date() }, ...contentHistory.slice(0, 4)]);
      showSnackbar('Content generated successfully!', 'success');
    } catch (error) {
      console.error('❌ AI error:', error);
      showSnackbar('Failed to generate content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    showSnackbar('Content copied to clipboard!', 'success');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        AI Content Generator
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>AI-Powered Content Creation</AlertTitle>
        Generate engaging social media content using artificial intelligence.
      </Alert>

      <Grid container spacing={3}>
        {/* Generator Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Content Generator
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Content Type</InputLabel>
                    <Select
                      value={contentType}
                      label="Content Type"
                      onChange={(e) => setContentType(e.target.value)}
                    >
                      {CONTENT_TYPES.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tone</InputLabel>
                    <Select
                      value={tone}
                      label="Tone"
                      onChange={(e) => setTone(e.target.value)}
                    >
                      {TONES.map(t => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Tips for improving credit score"
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Keywords (optional)"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., credit repair, financial health"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} /> : <Sparkles />}
                    onClick={handleGenerate}
                    disabled={loading || !topic.trim()}
                  >
                    {loading ? 'Generating...' : 'Generate Content'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Quick Start Templates
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  'Credit score tips',
                  'Debt management advice',
                  'Financial wellness',
                  'Success story',
                  'Credit myths',
                ].map((template) => (
                  <Chip
                    key={template}
                    label={template}
                    onClick={() => setTopic(template)}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Generated Content */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Generated Content</Typography>
                {generatedContent && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Copy">
                      <IconButton size="small" onClick={handleCopy}>
                        <Copy size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Regenerate">
                      <IconButton size="small" onClick={handleGenerate}>
                        <RefreshCw size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Save">
                      <IconButton size="small">
                        <Save size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {generatedContent ? (
                <Paper sx={{ p: 2, bgcolor: 'action.hover', minHeight: 300 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {generatedContent}
                  </Typography>
                </Paper>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', minHeight: 300 }}>
                  <Wand2 size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    Your AI-generated content will appear here
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>

          {/* History */}
          {contentHistory.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Recent Generations
                </Typography>
                {contentHistory.map((item, index) => (
                  <Box key={index}>
                    <Paper
                      sx={{ p: 1.5, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => setGeneratedContent(item.content)}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {item.topic}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

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

export default AIContentGenerator;
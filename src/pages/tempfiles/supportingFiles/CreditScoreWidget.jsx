// ============================================
// CREDIT SCORE WIDGET
// Path: /src/components/widgets/CreditScoreWidget.jsx
// ============================================
// Reusable credit score display component
// 3-bureau tracking with trend indicators
// ============================================

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

// ============================================
// CONSTANTS
// ============================================

const SCORE_RANGES = {
  excellent: { min: 750, max: 850, color: '#10b981', label: 'Excellent', icon: Award },
  good: { min: 700, max: 749, color: '#3b82f6', label: 'Good', icon: CheckCircle },
  fair: { min: 650, max: 699, color: '#f59e0b', label: 'Fair', icon: AlertCircle },
  poor: { min: 300, max: 649, color: '#ef4444', label: 'Poor', icon: AlertCircle },
};

const BUREAUS = [
  { key: 'experian', label: 'Experian', color: '#ef4444' },
  { key: 'equifax', label: 'Equifax', color: '#3b82f6' },
  { key: 'transunion', label: 'TransUnion', color: '#10b981' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const getScoreRange = (score) => {
  for (const [key, range] of Object.entries(SCORE_RANGES)) {
    if (score >= range.min && score <= range.max) {
      return { ...range, key };
    }
  }
  return SCORE_RANGES.poor;
};

const calculateImprovement = (current, previous) => {
  if (!previous) return null;
  const diff = current - previous;
  const percentage = ((diff / previous) * 100).toFixed(1);
  return { diff, percentage };
};

const getScoreColor = (score) => {
  return getScoreRange(score).color;
};

// ============================================
// MAIN COMPONENT
// ============================================

const CreditScoreWidget = ({ 
  scores, 
  previousScores = null,
  showTrend = true,
  showBreakdown = true,
  compact = false,
  onClick = null,
}) => {
  // Calculate average score
  const avgScore = scores ? 
    Math.round((scores.experian + scores.equifax + scores.transunion) / 3) : 0;
  
  const prevAvgScore = previousScores ?
    Math.round((previousScores.experian + previousScores.equifax + previousScores.transunion) / 3) : 0;

  const improvement = previousScores ? calculateImprovement(avgScore, prevAvgScore) : null;
  const scoreRange = getScoreRange(avgScore);
  const ScoreIcon = scoreRange.icon;

  // Prepare chart data
  const chartData = BUREAUS.map(bureau => ({
    name: bureau.label,
    value: scores?.[bureau.key] || 0,
    color: bureau.color,
  }));

  // ============================================
  // COMPACT VIEW
  // ============================================

  if (compact) {
    return (
      <Card 
        elevation={2} 
        sx={{ cursor: onClick ? 'pointer' : 'default' }}
        onClick={onClick}
      >
        <CardContent>
          <Box className="flex items-center justify-between">
            <Box>
              <Typography variant="caption" className="text-gray-600">
                Average Score
              </Typography>
              <Typography 
                variant="h4" 
                className="font-bold"
                style={{ color: scoreRange.color }}
              >
                {avgScore}
              </Typography>
              <Chip
                label={scoreRange.label}
                size="small"
                sx={{
                  bgcolor: scoreRange.color,
                  color: 'white',
                  mt: 1,
                }}
              />
            </Box>
            {improvement && (
              <Box className="text-right">
                {improvement.diff > 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-600" />
                ) : improvement.diff < 0 ? (
                  <TrendingDown className="w-8 h-8 text-red-600" />
                ) : (
                  <Minus className="w-8 h-8 text-gray-600" />
                )}
                <Typography 
                  variant="body2" 
                  className="font-semibold"
                  style={{ 
                    color: improvement.diff > 0 ? '#10b981' : 
                           improvement.diff < 0 ? '#ef4444' : '#6b7280'
                  }}
                >
                  {improvement.diff > 0 ? '+' : ''}{improvement.diff}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  // ============================================
  // FULL VIEW
  // ============================================

  return (
    <Card 
      elevation={3}
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <CardContent>
        {/* ===== HEADER ===== */}
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-semibold">
            Credit Score Overview
          </Typography>
          <ScoreIcon className="w-6 h-6" style={{ color: scoreRange.color }} />
        </Box>

        {/* ===== AVERAGE SCORE DISPLAY ===== */}
        <Box className="text-center mb-4">
          <Typography variant="caption" className="text-gray-600">
            Average Score
          </Typography>
          <Typography 
            variant="h1" 
            className="font-bold my-2"
            style={{ color: scoreRange.color }}
          >
            {avgScore}
          </Typography>
          <Chip
            label={scoreRange.label}
            sx={{
              bgcolor: scoreRange.color,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          />

          {/* ===== IMPROVEMENT INDICATOR ===== */}
          {improvement && showTrend && (
            <Box className="flex items-center justify-center gap-2 mt-3">
              {improvement.diff > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : improvement.diff < 0 ? (
                <TrendingDown className="w-5 h-5 text-red-600" />
              ) : (
                <Minus className="w-5 h-5 text-gray-600" />
              )}
              <Typography 
                variant="body2" 
                className="font-semibold"
                style={{ 
                  color: improvement.diff > 0 ? '#10b981' : 
                         improvement.diff < 0 ? '#ef4444' : '#6b7280'
                }}
              >
                {improvement.diff > 0 ? '+' : ''}{improvement.diff} points
                {improvement.percentage !== '0.0' && (
                  <span className="text-gray-600 ml-1">
                    ({improvement.diff > 0 ? '+' : ''}{improvement.percentage}%)
                  </span>
                )}
              </Typography>
            </Box>
          )}
        </Box>

        {/* ===== SCORE RANGE INDICATOR ===== */}
        <Box className="mb-4">
          <Box className="flex items-center justify-between mb-1">
            <Typography variant="caption" className="text-gray-600">
              Score Range
            </Typography>
            <Typography variant="caption" className="font-semibold">
              {scoreRange.min} - {scoreRange.max}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((avgScore - 300) / 550) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e5e7eb',
              '& .MuiLinearProgress-bar': {
                backgroundColor: scoreRange.color,
              },
            }}
          />
          <Box className="flex justify-between mt-1">
            <Typography variant="caption" className="text-gray-600">300</Typography>
            <Typography variant="caption" className="text-gray-600">850</Typography>
          </Box>
        </Box>

        {/* ===== BUREAU BREAKDOWN ===== */}
        {showBreakdown && scores && (
          <>
            <Typography variant="subtitle2" className="font-semibold mb-2">
              By Bureau
            </Typography>
            <Grid container spacing={2}>
              {BUREAUS.map(bureau => {
                const score = scores[bureau.key];
                const prevScore = previousScores?.[bureau.key];
                const bureauImprovement = prevScore ? calculateImprovement(score, prevScore) : null;
                const bureauRange = getScoreRange(score);

                return (
                  <Grid item xs={4} key={bureau.key}>
                    <Box className="text-center">
                      <Typography variant="caption" className="text-gray-600">
                        {bureau.label}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        className="font-bold"
                        style={{ color: bureau.color }}
                      >
                        {score}
                      </Typography>
                      {bureauImprovement && (
                        <Typography 
                          variant="caption"
                          style={{ 
                            color: bureauImprovement.diff > 0 ? '#10b981' : 
                                   bureauImprovement.diff < 0 ? '#ef4444' : '#6b7280'
                          }}
                        >
                          {bureauImprovement.diff > 0 ? '+' : ''}{bureauImprovement.diff}
                        </Typography>
                      )}
                      <Chip
                        label={bureauRange.label}
                        size="small"
                        sx={{
                          bgcolor: bureauRange.color,
                          color: 'white',
                          fontSize: '0.65rem',
                          height: 20,
                          mt: 0.5,
                        }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}

        {/* ===== PIE CHART (OPTIONAL) ===== */}
        {showBreakdown && scores && (
          <Box className="mt-4">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* ===== LAST UPDATED ===== */}
        {scores?.pulledDate && (
          <Typography variant="caption" className="text-gray-600 block text-center mt-3">
            Last updated: {new Date(scores.pulledDate).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// SCORE COMPARISON COMPONENT
// ============================================

export const CreditScoreComparison = ({ currentScores, previousScores }) => {
  if (!currentScores || !previousScores) return null;

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          Score Comparison
        </Typography>
        <Grid container spacing={2}>
          {BUREAUS.map(bureau => {
            const current = currentScores[bureau.key];
            const previous = previousScores[bureau.key];
            const improvement = calculateImprovement(current, previous);

            return (
              <Grid item xs={12} md={4} key={bureau.key}>
                <Box className="text-center p-3 border rounded-lg">
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    {bureau.label}
                  </Typography>
                  <Box className="flex items-center justify-center gap-4">
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Before
                      </Typography>
                      <Typography variant="h6" className="font-bold text-gray-600">
                        {previous}
                      </Typography>
                    </Box>
                    <Box>
                      {improvement.diff > 0 ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : improvement.diff < 0 ? (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      ) : (
                        <Minus className="w-6 h-6 text-gray-600" />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        After
                      </Typography>
                      <Typography 
                        variant="h6" 
                        className="font-bold"
                        style={{ color: bureau.color }}
                      >
                        {current}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography 
                    variant="body2" 
                    className="font-semibold mt-2"
                    style={{ 
                      color: improvement.diff > 0 ? '#10b981' : 
                             improvement.diff < 0 ? '#ef4444' : '#6b7280'
                    }}
                  >
                    {improvement.diff > 0 ? '+' : ''}{improvement.diff} points
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

// ============================================
// SCORE GOAL TRACKER
// ============================================

export const CreditScoreGoalTracker = ({ currentScore, goalScore }) => {
  const pointsNeeded = goalScore - currentScore;
  const progress = ((currentScore - 300) / (goalScore - 300)) * 100;
  const goalRange = getScoreRange(goalScore);

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-3">
          Goal Tracker
        </Typography>
        <Box className="text-center mb-3">
          <Typography variant="caption" className="text-gray-600">
            Goal: {goalScore} ({goalRange.label})
          </Typography>
          <Typography variant="h4" className="font-bold my-2">
            {pointsNeeded} points to go
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, progress)}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: '#e5e7eb',
            '& .MuiLinearProgress-bar': {
              backgroundColor: goalRange.color,
            },
          }}
        />
        <Box className="flex justify-between mt-2">
          <Typography variant="caption" className="text-gray-600">
            Current: {currentScore}
          </Typography>
          <Typography variant="caption" className="text-gray-600">
            Goal: {goalScore}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreditScoreWidget;
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardActions,
  Button, Radio, RadioGroup, FormControlLabel, FormControl, Alert,
  CircularProgress, Chip, LinearProgress, Divider
} from '@mui/material';
import { CheckSquare, Award, TrendingUp } from 'lucide-react';
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const QuizzesTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError('');

      const quizzesRef = collection(db, 'quizzes');
      const quizzesSnap = await getDocs(query(quizzesRef, orderBy('createdAt', 'desc')));
      const quizzesData = quizzesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuizzes(quizzesData);

    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setResults(null);
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      setError('');

      const questions = activeQuiz.questions || [];
      let correctCount = 0;

      questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= (activeQuiz.passingScore || 70);

      setResults({
        score,
        correctCount,
        totalQuestions: questions.length,
        passed
      });

      // Save result to Firebase
      await addDoc(collection(db, 'quizResults'), {
        userId: currentUser.uid,
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        score,
        passed,
        completedAt: serverTimestamp()
      });

      setSuccess(`Quiz completed! You scored ${score}%`);

    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (activeQuiz && !results) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {activeQuiz.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeQuiz.description}
          </Typography>
          <Chip
            label={`${Object.keys(answers).length}/${activeQuiz.questions?.length || 0} answered`}
            sx={{ mt: 1 }}
          />
        </Box>

        {activeQuiz.questions?.map((question, index) => (
          <Paper key={index} sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Question {index + 1}: {question.question}
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              >
                {question.options?.map((option, optIndex) => (
                  <FormControlLabel
                    key={optIndex}
                    value={optIndex.toString()}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Paper>
        ))}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={() => setActiveQuiz(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitQuiz}
            disabled={submitting || Object.keys(answers).length !== activeQuiz.questions?.length}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </Box>
      </Box>
    );
  }

  if (results) {
    return (
      <Box>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Award size={64} color={results.passed ? '#4CAF50' : '#FF9800'} />
          <Typography variant="h4" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
            {results.passed ? 'Congratulations!' : 'Keep Trying!'}
          </Typography>
          <Typography variant="h2" color="primary" fontWeight="bold">
            {results.score}%
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You got {results.correctCount} out of {results.totalQuestions} questions correct
          </Typography>
          <LinearProgress
            variant="determinate"
            value={results.score}
            sx={{ height: 10, borderRadius: 1, mb: 3 }}
          />
          <Chip
            label={results.passed ? 'Passed' : 'Failed'}
            color={results.passed ? 'success' : 'warning'}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={() => { setActiveQuiz(null); setResults(null); }}>
              Back to Quizzes
            </Button>
            {!results.passed && (
              <Button variant="contained" sx={{ ml: 2 }} onClick={() => { setResults(null); setAnswers({}); }}>
                Retry
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CheckSquare size={24} />
        <Typography variant="h5" fontWeight="bold">
          Quizzes & Assessments
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {quizzes.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              No quizzes available at this time.
            </Alert>
          </Grid>
        ) : (
          quizzes.map((quiz) => (
            <Grid item xs={12} md={6} key={quiz.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    {quiz.title || 'Untitled Quiz'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {quiz.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`${quiz.questions?.length || 0} questions`} size="small" />
                    <Chip label={`${quiz.duration || 30} min`} size="small" />
                    <Chip label={quiz.difficulty || 'Medium'} size="small" color="primary" />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => startQuiz(quiz)}
                  >
                    Start Quiz
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default QuizzesTab;

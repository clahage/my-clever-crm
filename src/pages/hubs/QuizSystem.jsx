// ===================================================================
// QuizSystem.jsx - Interactive Quiz & Assessment System
// ===================================================================
// Purpose: Take quizzes, track scores, and assess knowledge
// Features:
// - Multiple choice and true/false questions
// - Timed assessments
// - Instant feedback
// - Score tracking and history
// - Quiz creation for admins
// - Certificate generation on passing
// - Retake functionality
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Stack
} from '@mui/material';
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  BarChart3,
  PlayCircle,
  RotateCcw,
  Download,
  Star,
  AlertCircle,
  Target,
  Zap,
  Trophy
} from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

// ===================================================================
// SAMPLE QUIZZES DATA
// ===================================================================

const SAMPLE_QUIZZES = [
  {
    id: 'quiz-1',
    title: 'Credit Report Basics',
    description: 'Test your knowledge of credit report fundamentals',
    category: 'credit-repair',
    difficulty: 'Beginner',
    questionCount: 10,
    timeLimit: 15, // minutes
    passingScore: 80,
    attempts: 0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q1',
        text: 'How many major credit bureaus are there in the United States?',
        type: 'multiple-choice',
        options: ['One', 'Two', 'Three', 'Four'],
        correctAnswer: 2,
        explanation: 'There are three major credit bureaus: Equifax, Experian, and TransUnion.'
      },
      {
        id: 'q2',
        text: 'How long do most negative items remain on a credit report?',
        type: 'multiple-choice',
        options: ['3 years', '5 years', '7 years', '10 years'],
        correctAnswer: 2,
        explanation: 'Most negative items remain on credit reports for 7 years, though bankruptcies can remain for 10 years.'
      },
      {
        id: 'q3',
        text: 'Payment history is the most important factor in your credit score.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'True. Payment history accounts for about 35% of your FICO score, making it the most important factor.'
      },
      {
        id: 'q4',
        text: 'What does FCRA stand for?',
        type: 'multiple-choice',
        options: [
          'Federal Credit Repair Act',
          'Fair Credit Reporting Act',
          'Federal Consumer Rights Act',
          'Fair Credit Resolution Act'
        ],
        correctAnswer: 1,
        explanation: 'FCRA stands for Fair Credit Reporting Act, which regulates credit reporting agencies.'
      },
      {
        id: 'q5',
        text: 'Closing old credit cards always improves your credit score.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: 'False. Closing old credit cards can hurt your credit score by reducing your available credit and shortening your credit history.'
      },
      {
        id: 'q6',
        text: 'What is the ideal credit utilization ratio?',
        type: 'multiple-choice',
        options: ['Below 10%', 'Below 30%', 'Below 50%', 'Below 70%'],
        correctAnswer: 1,
        explanation: 'Experts recommend keeping credit utilization below 30%, though below 10% is even better.'
      },
      {
        id: 'q7',
        text: 'Checking your own credit report counts as a hard inquiry.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: 'False. Checking your own credit is a soft inquiry and does not affect your credit score.'
      },
      {
        id: 'q8',
        text: 'How often can you get a free credit report from each bureau?',
        type: 'multiple-choice',
        options: ['Monthly', 'Quarterly', 'Annually', 'Every 2 years'],
        correctAnswer: 2,
        explanation: 'You can get a free credit report from each bureau once per year at AnnualCreditReport.com.'
      },
      {
        id: 'q9',
        text: 'Credit scores range from 300 to 850.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'True. FICO scores range from 300 (poor) to 850 (excellent).'
      },
      {
        id: 'q10',
        text: 'What percentage of your credit score is based on payment history?',
        type: 'multiple-choice',
        options: ['15%', '25%', '35%', '45%'],
        correctAnswer: 2,
        explanation: 'Payment history accounts for 35% of your FICO credit score.'
      }
    ]
  },
  {
    id: 'quiz-2',
    title: 'FCRA Compliance',
    description: 'Test your understanding of FCRA regulations',
    category: 'compliance',
    difficulty: 'Intermediate',
    questions: 15,
    timeLimit: 20,
    passingScore: 85,
    attempts: 0,
    maxAttempts: 2
  },
  {
    id: 'quiz-3',
    title: 'Customer Service Excellence',
    description: 'Assess your customer service skills',
    category: 'customer-service',
    difficulty: 'Beginner',
    questions: 12,
    timeLimit: 15,
    passingScore: 80,
    attempts: 0,
    maxAttempts: 3
  }
];

// ===================================================================
// MAIN QUIZ SYSTEM COMPONENT
// ===================================================================

const QuizSystem = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [quizzes, setQuizzes] = useState(SAMPLE_QUIZZES);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // ===============================================================
  // LOAD DATA
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    console.log('📝 QuizSystem: Loading data');

    const unsubscribers = [];

    // Listen to quiz attempts
    const attemptsRef = collection(db, 'quizAttempts');
    const attemptsQuery = query(
      attemptsRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('completedAt', 'desc')
    );
    const unsubAttempts = onSnapshot(attemptsQuery, (snapshot) => {
      const attempts = [];
      snapshot.forEach((doc) => {
        attempts.push({ id: doc.id, ...doc.data() });
      });
      setQuizAttempts(attempts);
      console.log('📊 Quiz attempts loaded:', attempts.length);
    }, (err) => {
      console.error('❌ Error loading attempts:', err);
    });
    unsubscribers.push(unsubAttempts);

    setLoading(false);

    return () => {
      console.log('🧹 Cleaning up QuizSystem listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // ===============================================================
  // QUIZ TIMER
  // ===============================================================

  useEffect(() => {
    if (!isQuizActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isQuizActive, timeRemaining]);

  // ===============================================================
  // QUIZ ACTIONS
  // ===============================================================

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setIsQuizActive(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeRemaining(quiz.timeLimit * 60);
    setQuizCompleted(false);
    setShowResults(false);
    console.log('🚀 Starting quiz:', quiz.title);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz || !auth.currentUser) return;

    // Calculate score
    let correctAnswers = 0;
    selectedQuiz.questions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / selectedQuiz.questions.length) * 100);
    const passed = finalScore >= selectedQuiz.passingScore;

    setScore(finalScore);
    setQuizCompleted(true);
    setIsQuizActive(false);
    setShowResults(true);

    // Save attempt to Firebase
    try {
      await setDoc(doc(collection(db, 'quizAttempts')), {
        userId: auth.currentUser.uid,
        quizId: selectedQuiz.id,
        score: finalScore,
        passed: passed,
        correctAnswers: correctAnswers,
        totalQuestions: selectedQuiz.questions.length,
        answers: userAnswers,
        completedAt: serverTimestamp()
      });

      // Log activity
      await setDoc(doc(collection(db, 'trainingActivity')), {
        userId: auth.currentUser.uid,
        type: 'quiz-completed',
        quizId: selectedQuiz.id,
        score: finalScore,
        passed: passed,
        timestamp: serverTimestamp()
      });

      console.log('✅ Quiz attempt saved:', finalScore);
    } catch (err) {
      console.error('❌ Error saving quiz attempt:', err);
    }
  };

  const handleRetakeQuiz = () => {
    handleStartQuiz(selectedQuiz);
  };

  // ===============================================================
  // HELPER FUNCTIONS
  // ===============================================================

  const getQuizStats = (quizId) => {
    const attempts = quizAttempts.filter(a => a.quizId === quizId);
    if (attempts.length === 0) return null;

    const bestScore = Math.max(...attempts.map(a => a.score));
    const lastAttempt = attempts[0];
    const passed = attempts.some(a => a.passed);

    return {
      attempts: attempts.length,
      bestScore,
      lastScore: lastAttempt.score,
      passed
    };
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // ===============================================================
  // RENDER QUIZ CARD
  // ===============================================================

  const renderQuizCard = (quiz) => {
    const stats = getQuizStats(quiz.id);

    return (
      <Grid item xs={12} md={6} key={quiz.id}>
        <Card className="h-full">
          <CardContent>
            <Box className="flex items-start justify-between mb-2">
              <Box className="flex-1">
                <Typography variant="h6" className="font-bold mb-1 text-gray-900 dark:text-white">
                  {quiz.title}
                </Typography>
                <Chip
                  label={quiz.difficulty}
                  size="small"
                  color={quiz.difficulty === 'Beginner' ? 'success' : quiz.difficulty === 'Advanced' ? 'error' : 'primary'}
                  className="mb-2"
                />
              </Box>
              {stats?.passed && (
                <CheckCircle className="text-green-600" size={32} />
              )}
            </Box>

            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-3">
              {quiz.description}
            </Typography>

            <Grid container spacing={2} className="mb-3">
              <Grid item xs={6}>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                  Questions
                </Typography>
                <Typography variant="body2" className="font-semibold flex items-center gap-1">
                  <Target size={14} />
                  {quiz.questions}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                  Time Limit
                </Typography>
                <Typography variant="body2" className="font-semibold flex items-center gap-1">
                  <Clock size={14} />
                  {quiz.timeLimit} min
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                  Passing Score
                </Typography>
                <Typography variant="body2" className="font-semibold flex items-center gap-1">
                  <Award size={14} />
                  {quiz.passingScore}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                  Attempts
                </Typography>
                <Typography variant="body2" className="font-semibold">
                  {stats ? `${stats.attempts}/${quiz.maxAttempts}` : `0/${quiz.maxAttempts}`}
                </Typography>
              </Grid>
            </Grid>

            {stats && (
              <Box className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <Typography variant="caption" className="text-blue-800 dark:text-blue-200 font-semibold">
                  Best Score: {stats.bestScore}% {stats.passed && '✓ Passed'}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant={stats?.passed ? 'outlined' : 'contained'}
              startIcon={stats?.passed ? <RotateCcw /> : <PlayCircle />}
              onClick={() => handleStartQuiz(quiz)}
              disabled={stats && stats.attempts >= quiz.maxAttempts && !stats.passed}
            >
              {stats?.passed ? 'Retake Quiz' : stats ? 'Try Again' : 'Start Quiz'}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // ===============================================================
  // RENDER ACTIVE QUIZ
  // ===============================================================

  if (isQuizActive && selectedQuiz) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

    return (
      <Paper className="p-6">
        {/* Quiz Header */}
        <Box className="mb-6">
          <Box className="flex items-center justify-between mb-4">
            <Typography variant="h5" className="font-bold text-gray-900 dark:text-white">
              {selectedQuiz.title}
            </Typography>
            <Chip
              label={formatTime(timeRemaining)}
              icon={<Clock size={16} />}
              color={timeRemaining < 60 ? 'error' : 'primary'}
              className="font-mono text-lg px-4"
            />
          </Box>

          <Box className="mb-2">
            <Box className="flex justify-between items-center mb-1">
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
              </Typography>
              <Typography variant="body2" className="font-semibold">
                {Math.round(progress)}% Complete
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} className="h-2 rounded" />
          </Box>
        </Box>

        {/* Question */}
        <Card className="mb-6">
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4 text-gray-900 dark:text-white">
              {currentQuestion.text}
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={userAnswers[currentQuestion.id] ?? ''}
                onChange={(e) => handleAnswerSelect(currentQuestion.id, parseInt(e.target.value))}
              >
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={option}
                    className="mb-2 p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Box className="flex items-center justify-between">
          <Button
            variant="outlined"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
            {Object.keys(userAnswers).length} of {selectedQuiz.questions.length} answered
          </Typography>

          {currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNextQuestion}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(userAnswers).length < selectedQuiz.questions.length}
            >
              Submit Quiz
            </Button>
          )}
        </Box>
      </Paper>
    );
  }

  // ===============================================================
  // RENDER RESULTS DIALOG
  // ===============================================================

  if (showResults && selectedQuiz) {
    const passed = score >= selectedQuiz.passingScore;

    return (
      <Box>
        <Paper className="p-8 text-center">
          <Box className={`inline-flex p-6 rounded-full mb-4 ${passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {passed ? (
              <Trophy className="text-green-600 dark:text-green-400" size={64} />
            ) : (
              <XCircle className="text-red-600 dark:text-red-400" size={64} />
            )}
          </Box>

          <Typography variant="h4" className="font-bold mb-2 text-gray-900 dark:text-white">
            {passed ? 'Congratulations!' : 'Keep Practicing'}
          </Typography>

          <Typography className="text-gray-600 dark:text-gray-400 mb-6">
            {passed 
              ? 'You passed the quiz! Great job!'
              : `You need ${selectedQuiz.passingScore}% to pass. Review the material and try again.`}
          </Typography>

          <Card className="max-w-md mx-auto mb-6">
            <CardContent>
              <Typography variant="h2" className="font-bold mb-2 text-gray-900 dark:text-white">
                {score}%
              </Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Your Score
              </Typography>
              <Divider className="my-3" />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                    Correct
                  </Typography>
                  <Typography variant="h6" className="font-bold text-green-600">
                    {Object.keys(userAnswers).filter(qId => 
                      userAnswers[qId] === selectedQuiz.questions.find(q => q.id === qId).correctAnswer
                    ).length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                    Incorrect
                  </Typography>
                  <Typography variant="h6" className="font-bold text-red-600">
                    {selectedQuiz.questions.length - Object.keys(userAnswers).filter(qId => 
                      userAnswers[qId] === selectedQuiz.questions.find(q => q.id === qId).correctAnswer
                    ).length}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Paper className="max-w-2xl mx-auto mb-6 text-left">
            <Box className="p-4 bg-gray-50 dark:bg-gray-800">
              <Typography variant="h6" className="font-semibold">
                Detailed Results
              </Typography>
            </Box>
            <List>
              {selectedQuiz.questions.map((question, index) => {
                const userAnswer = userAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <React.Fragment key={question.id}>
                    <ListItem>
                      <ListItemIcon>
                        {isCorrect ? (
                          <CheckCircle className="text-green-600" />
                        ) : (
                          <XCircle className="text-red-600" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${index + 1}. ${question.text}`}
                        secondary={
                          <>
                            <Typography variant="body2" color={isCorrect ? 'success' : 'error'}>
                              Your answer: {question.options[userAnswer]}
                            </Typography>
                            {!isCorrect && (
                              <Typography variant="body2" color="success">
                                Correct answer: {question.options[question.correctAnswer]}
                              </Typography>
                            )}
                            <Typography variant="caption" className="block mt-1">
                              {question.explanation}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < selectedQuiz.questions.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => {
                setShowResults(false);
                setSelectedQuiz(null);
              }}
            >
              Back to Quizzes
            </Button>
            {!passed && (
              <Button
                variant="contained"
                startIcon={<RotateCcw />}
                onClick={handleRetakeQuiz}
              >
                Retake Quiz
              </Button>
            )}
            {passed && (
              <Button
                variant="contained"
                startIcon={<Download />}
                color="success"
              >
                Download Certificate
              </Button>
            )}
          </Stack>
        </Paper>
      </Box>
    );
  }

  // ===============================================================
  // RENDER LOADING STATE
  // ===============================================================

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-96">
        <Box className="text-center">
          <CircularProgress size={60} />
          <Typography className="mt-4 text-gray-600 dark:text-gray-400">
            Loading quizzes...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ===============================================================
  // MAIN RENDER
  // ===============================================================

  return (
    <Box>
      {/* Stats Overview */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={4}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent>
              <Typography variant="body2" className="opacity-90 mb-1">
                Quizzes Completed
              </Typography>
              <Typography variant="h4" className="font-bold">
                {quizAttempts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent>
              <Typography variant="body2" className="opacity-90 mb-1">
                Passed Quizzes
              </Typography>
              <Typography variant="h4" className="font-bold">
                {quizAttempts.filter(a => a.passed).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent>
              <Typography variant="body2" className="opacity-90 mb-1">
                Average Score
              </Typography>
              <Typography variant="h4" className="font-bold">
                {quizAttempts.length > 0 
                  ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper className="mb-4">
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
        >
          <Tab label="Available Quizzes" value="available" />
          <Tab label="My Results" value="results" />
        </Tabs>
      </Paper>

      {/* Content */}
      {activeTab === 'available' && (
        <Grid container spacing={3}>
          {quizzes.map(quiz => renderQuizCard(quiz))}
        </Grid>
      )}

      {activeTab === 'results' && (
        <Paper>
          {quizAttempts.length > 0 ? (
            <List>
              {quizAttempts.map((attempt, index) => {
                const quiz = quizzes.find(q => q.id === attempt.quizId);
                return (
                  <React.Fragment key={attempt.id}>
                    <ListItem>
                      <ListItemIcon>
                        {attempt.passed ? (
                          <CheckCircle className="text-green-600" />
                        ) : (
                          <XCircle className="text-red-600" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={quiz?.title || 'Unknown Quiz'}
                        secondary={`Score: ${attempt.score}% • ${attempt.passed ? 'Passed' : 'Failed'} • ${new Date(attempt.completedAt?.toDate()).toLocaleDateString()}`}
                      />
                      <Chip
                        label={`${attempt.score}%`}
                        color={attempt.passed ? 'success' : 'error'}
                      />
                    </ListItem>
                    {index < quizAttempts.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Box className="p-12 text-center">
              <BarChart3 size={64} className="mx-auto mb-4 text-gray-400" />
              <Typography variant="h6" className="mb-2">
                No Quiz Results Yet
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-400 mb-4">
                Take your first quiz to see your results here
              </Typography>
              <Button
                variant="contained"
                onClick={() => setActiveTab('available')}
              >
                Browse Quizzes
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default QuizSystem;
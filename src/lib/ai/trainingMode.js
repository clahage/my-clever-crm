/**
 * AI TRAINING MODE SYSTEM
 *
 * Purpose:
 * Interactive training system that teaches staff how to use the CRM effectively
 * through tutorials, simulations, quizzes, and hands-on practice scenarios.
 *
 * What It Teaches:
 * - System Navigation: How to find and use features
 * - Workflow Management: Creating and monitoring workflows
 * - Client Communication: Best practices for emails/SMS
 * - Compliance Rules: CROA, TCPA, CAN-SPAM requirements
 * - AI Features: How to leverage AI tools effectively
 * - Reporting: Understanding analytics and metrics
 * - Troubleshooting: Common issues and solutions
 * - Best Practices: Credit repair industry standards
 *
 * Training Formats:
 * - Interactive Tutorials: Step-by-step guided tours
 * - Video Lessons: Screen recordings with narration
 * - Practice Scenarios: Hands-on exercises with fake data
 * - Quizzes: Knowledge assessments
 * - Simulations: Real-world scenario practice
 * - Reference Docs: Searchable help documentation
 * - Certifications: Completion tracking and badges
 *
 * Why It's Important:
 * - Faster onboarding for new staff
 * - Consistent training across team
 * - Reduce mistakes and compliance violations
 * - Self-service learning (no Christopher time required)
 * - Track who's trained on what
 * - Refresh knowledge for existing staff
 * - Ensure proper use of AI features
 *
 * Training Tracks:
 * - New User Onboarding (2 hours)
 * - Compliance Officer Track (1 hour)
 * - Sales/Growth Track (1.5 hours)
 * - Client Success Track (2 hours)
 * - Admin/Power User Track (3 hours)
 *
 * Example Modules:
 * - "How to start a Standard tier workflow" (5 min)
 * - "Understanding churn risk predictions" (10 min)
 * - "Writing CROA-compliant emails" (15 min)
 * - "Using voice commands for faster navigation" (8 min)
 * - "Interpreting sentiment analysis results" (12 min)
 *
 * Progress Tracking:
 * - Modules completed
 * - Quiz scores
 * - Time spent training
 * - Certification earned
 * - Last training date
 * - Proficiency level (Beginner/Intermediate/Advanced)
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System - Tier 2
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// TRAINING MODULES LIBRARY
// ============================================================================

export const TRAINING_MODULES = {
  // ========== NEW USER ONBOARDING ==========
  onboarding: {
    id: 'onboarding',
    title: 'New User Onboarding',
    description: 'Complete introduction to Speedy CRM',
    duration: 120, // minutes
    difficulty: 'beginner',
    required: true,
    modules: [
      {
        id: 'intro',
        title: 'Welcome to Speedy CRM',
        type: 'video',
        duration: 5,
        content: {
          videoUrl: '/training/welcome.mp4',
          transcript: 'Welcome to Speedy Credit Repair CRM...',
          keyPoints: [
            'Overview of credit repair process',
            'How Speedy CRM helps you',
            'Tour of main features'
          ]
        }
      },
      {
        id: 'navigation',
        title: 'System Navigation',
        type: 'interactive',
        duration: 15,
        content: {
          steps: [
            {
              target: '#dashboard',
              title: 'Dashboard',
              description: 'Your daily command center. See active clients, tasks, and key metrics.',
              action: 'Click on Dashboard'
            },
            {
              target: '#contacts',
              title: 'Contacts',
              description: 'Manage all your clients here. View profiles, add notes, track progress.',
              action: 'Click on Contacts'
            },
            {
              target: '#workflows',
              title: 'Workflows',
              description: 'Automated client communication sequences. Monitor and customize.',
              action: 'Click on Workflows'
            },
            {
              target: '#analytics',
              title: 'Analytics',
              description: 'Business insights, revenue forecasts, and performance metrics.',
              action: 'Click on Analytics'
            }
          ]
        }
      },
      {
        id: 'creating-contact',
        title: 'Creating Your First Contact',
        type: 'simulation',
        duration: 10,
        content: {
          scenario: 'New lead Sarah Johnson just called. Add her to the system.',
          testData: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.test@example.com',
            phone: '555-0123',
            creditScore: 620,
            source: 'phone_call'
          },
          validation: [
            { field: 'firstName', required: true },
            { field: 'email', required: true, format: 'email' },
            { field: 'phone', required: true }
          ],
          successMessage: 'Great! You successfully added Sarah to the system.'
        }
      },
      {
        id: 'quiz-basics',
        title: 'Basics Quiz',
        type: 'quiz',
        duration: 10,
        passingScore: 80,
        questions: [
          {
            id: 'q1',
            question: 'Where do you view all active clients?',
            type: 'multiple_choice',
            options: [
              'Dashboard',
              'Contacts page',
              'Analytics',
              'Settings'
            ],
            correctAnswer: 1,
            explanation: 'The Contacts page shows all clients with filtering and search.'
          },
          {
            id: 'q2',
            question: 'What information is required when adding a new contact?',
            type: 'multiple_select',
            options: [
              'First Name',
              'Email',
              'Credit Score',
              'Address'
            ],
            correctAnswers: [0, 1],
            explanation: 'First name and email are required. Credit score and address are optional.'
          },
          {
            id: 'q3',
            question: 'Workflows automate client communication sequences.',
            type: 'true_false',
            correctAnswer: true,
            explanation: 'Workflows automatically send emails, SMS, and create tasks based on triggers.'
          }
        ]
      }
    ]
  },

  // ========== COMPLIANCE TRAINING ==========
  compliance: {
    id: 'compliance',
    title: 'Compliance & Legal Requirements',
    description: 'CROA, TCPA, CAN-SPAM compliance training',
    duration: 60,
    difficulty: 'intermediate',
    required: true,
    modules: [
      {
        id: 'croa-basics',
        title: 'CROA Compliance Basics',
        type: 'lesson',
        duration: 20,
        content: {
          sections: [
            {
              title: 'What is CROA?',
              text: 'Credit Repair Organizations Act (CROA) is federal law protecting consumers from fraudulent credit repair companies.',
              keyPoints: [
                'Cannot charge fees before services performed',
                'Must provide written contract before services',
                '3-day right to cancel',
                'Cannot make false claims about results'
              ]
            },
            {
              title: 'CROA Violations to Avoid',
              text: 'These actions violate CROA and can result in lawsuits and fines:',
              warnings: [
                '⚠️ Charging upfront fees (except DIY tier)',
                '⚠️ Guaranteeing specific credit score improvements',
                '⚠️ Starting work before signed contract',
                '⚠️ Advising clients to create new identity'
              ]
            },
            {
              title: 'Speedy CRM Compliance Features',
              text: 'Our system helps you stay compliant:',
              features: [
                '✅ No payment collection until Month 1 complete (Standard+)',
                '✅ Automated contract generation and e-signature',
                '✅ Email templates pre-approved for compliance',
                '✅ AI monitors communications for violations'
              ]
            }
          ]
        }
      },
      {
        id: 'tcpa-basics',
        title: 'TCPA & SMS Compliance',
        type: 'lesson',
        duration: 15,
        content: {
          sections: [
            {
              title: 'TCPA Requirements',
              text: 'Telephone Consumer Protection Act regulates SMS/phone marketing.',
              keyPoints: [
                'Must have written consent before texting',
                'Must include opt-out language in every SMS',
                'Must honor opt-out requests immediately',
                'Cannot text before 8am or after 9pm local time'
              ]
            },
            {
              title: 'SMS Best Practices',
              examples: [
                {
                  label: 'Good SMS',
                  text: 'Hi Sarah! Your credit score improved 15 points. Reply STOP to unsubscribe.',
                  valid: true
                },
                {
                  label: 'Bad SMS',
                  text: 'Your credit score improved!',
                  valid: false,
                  reason: 'Missing opt-out language'
                }
              ]
            }
          ]
        }
      },
      {
        id: 'quiz-compliance',
        title: 'Compliance Quiz',
        type: 'quiz',
        duration: 15,
        passingScore: 90,
        questions: [
          {
            id: 'q1',
            question: 'Can you charge a client before completing Month 1 of service?',
            type: 'multiple_choice',
            options: [
              'Yes, always',
              'Yes, but only for DIY tier',
              'No, never',
              'Only with written consent'
            ],
            correctAnswer: 1,
            explanation: 'DIY tier is prepaid (not credit repair service). Standard+ tiers cannot charge upfront per CROA.'
          },
          {
            id: 'q2',
            question: 'Which statement violates CROA?',
            type: 'multiple_choice',
            options: [
              '"We can help improve your credit"',
              '"Most clients see improvement in 6 months"',
              '"We guarantee 100-point increase"',
              '"Results vary by individual situation"'
            ],
            correctAnswer: 2,
            explanation: 'Guaranteeing specific results violates CROA. Must use disclaimers and realistic expectations.'
          },
          {
            id: 'q3',
            question: 'Every SMS must include opt-out language.',
            type: 'true_false',
            correctAnswer: true,
            explanation: 'TCPA requires opt-out language in every commercial text message.'
          }
        ]
      }
    ]
  },

  // ========== WORKFLOW MANAGEMENT ==========
  workflows: {
    id: 'workflows',
    title: 'Workflow Management',
    description: 'Master automated client workflows',
    duration: 45,
    difficulty: 'intermediate',
    required: false,
    modules: [
      {
        id: 'workflow-basics',
        title: 'Understanding Workflows',
        type: 'video',
        duration: 10,
        content: {
          videoUrl: '/training/workflows-intro.mp4',
          keyPoints: [
            'What workflows are and why they matter',
            'Types of workflows (onboarding, nurture, retention)',
            'How workflows save you time',
            'Monitoring workflow performance'
          ]
        }
      },
      {
        id: 'starting-workflow',
        title: 'Starting a Workflow',
        type: 'simulation',
        duration: 15,
        content: {
          scenario: 'Sarah Johnson just signed up for Standard tier. Start her onboarding workflow.',
          steps: [
            'Navigate to Sarah\'s contact profile',
            'Click "Start Workflow" button',
            'Select "Standard Tier Onboarding"',
            'Review workflow steps',
            'Click "Start" to begin'
          ],
          validation: {
            workflowStarted: true,
            correctWorkflow: 'standard-tier-onboarding',
            contactId: 'test-sarah-johnson'
          }
        }
      },
      {
        id: 'workflow-testing',
        title: 'Testing Workflows',
        type: 'interactive',
        duration: 20,
        content: {
          description: 'Learn to use the Workflow Testing Simulator',
          practiceWorkflow: 'diy-tier-onboarding',
          tasks: [
            'Open the workflow in test mode',
            'Step through first 5 steps',
            'Inject a test event (email opened)',
            'Observe AI consultant recommendations',
            'Save test session'
          ]
        }
      }
    ]
  },

  // ========== AI FEATURES ==========
  ai_features: {
    id: 'ai_features',
    title: 'AI Features & Tools',
    description: 'Leverage AI for maximum efficiency',
    duration: 90,
    difficulty: 'advanced',
    required: false,
    modules: [
      {
        id: 'ai-overview',
        title: 'AI Features Overview',
        type: 'lesson',
        duration: 15,
        content: {
          intro: 'Speedy CRM includes 14 AI features to help you work smarter.',
          features: [
            {
              name: 'Lead Scoring',
              description: 'AI predicts which leads are most likely to convert',
              useCase: 'Prioritize follow-ups on high-score leads'
            },
            {
              name: 'Churn Prediction',
              description: 'AI identifies clients at risk of canceling',
              useCase: 'Proactive outreach before they churn'
            },
            {
              name: 'Sentiment Analysis',
              description: 'AI reads emotions in emails and SMS',
              useCase: 'Catch frustration early and intervene'
            },
            {
              name: 'Email Optimizer',
              description: 'AI writes and optimizes emails for better open rates',
              useCase: 'Get more responses with AI-generated copy'
            }
          ]
        }
      },
      {
        id: 'using-lead-scoring',
        title: 'Using Lead Scoring',
        type: 'simulation',
        duration: 20,
        content: {
          scenario: 'You have 15 new leads. Use AI lead scoring to prioritize.',
          tasks: [
            'Go to Leads page',
            'Click "Score All Leads" button',
            'Review AI scores (A/B/C/D tiers)',
            'Sort by lead score (highest first)',
            'Contact top 3 A-tier leads first'
          ]
        }
      },
      {
        id: 'churn-prevention',
        title: 'Preventing Churn with AI',
        type: 'case_study',
        duration: 25,
        content: {
          story: 'Real example: How AI caught a churn risk and saved $2,400 in LTV',
          scenario: {
            client: 'Michael Thompson, Premium tier',
            warning: 'AI detected 87% churn risk based on declining sentiment and 14-day inactivity',
            action: 'Christopher called Michael personally, discovered billing confusion',
            resolution: 'Clarified billing, offered 1 free month, client stayed',
            saved: '$2,400 lifetime value'
          },
          lesson: 'AI churn predictions allow proactive intervention before it\'s too late.'
        }
      },
      {
        id: 'quiz-ai',
        title: 'AI Features Quiz',
        type: 'quiz',
        duration: 15,
        passingScore: 80,
        questions: [
          {
            id: 'q1',
            question: 'What does an A-tier lead score mean?',
            type: 'multiple_choice',
            options: [
              'Low quality, ignore',
              'Average quality, follow up eventually',
              'High quality, prioritize immediately',
              'Needs more information'
            ],
            correctAnswer: 2
          },
          {
            id: 'q2',
            question: 'When should you act on a critical churn risk alert?',
            type: 'multiple_choice',
            options: [
              'Within 24 hours',
              'Within 1 week',
              'Immediately (same day)',
              'No action needed - it\'s automatic'
            ],
            correctAnswer: 2,
            explanation: 'Critical churn risks require immediate action - call the client the same day.'
          }
        ]
      }
    ]
  }
};

// ============================================================================
// TRAINING PROGRESS TRACKING
// ============================================================================

/**
 * Get training progress for a user
 * @param {string} userId - User ID
 * @returns {Object} Training progress data
 */
export async function getTrainingProgress(userId) {
  try {
    const progressDoc = await getDoc(doc(db, 'trainingProgress', userId));

    if (!progressDoc.exists()) {
      // Initialize new user
      return initializeUserProgress(userId);
    }

    const progress = progressDoc.data();

    // Calculate overall completion
    const totalModules = countTotalModules();
    const completedModules = progress.completedModules?.length || 0;
    const overallCompletion = Math.round((completedModules / totalModules) * 100);

    // Determine proficiency level
    const proficiency = determineProficiency(progress);

    return {
      userId,
      overallCompletion,
      proficiency,
      completedModules: progress.completedModules || [],
      quizScores: progress.quizScores || {},
      timeSpent: progress.timeSpent || 0,
      certifications: progress.certifications || [],
      lastTrainingDate: progress.lastTrainingDate,
      currentTrack: progress.currentTrack || 'onboarding',
      nextRecommendedModule: recommendNextModule(progress)
    };

  } catch (error) {
    console.error('[getTrainingProgress] Error:', error);
    return { error: error.message };
  }
}

/**
 * Mark a training module as complete
 * @param {string} userId - User ID
 * @param {string} moduleId - Module ID
 * @param {Object} completionData - Completion details
 */
export async function completeModule(userId, moduleId, completionData = {}) {
  try {
    const progressRef = doc(db, 'trainingProgress', userId);
    const progressDoc = await getDoc(progressRef);

    const currentProgress = progressDoc.exists() ? progressDoc.data() : {};

    const updatedProgress = {
      ...currentProgress,
      completedModules: [
        ...(currentProgress.completedModules || []),
        {
          moduleId,
          completedAt: Timestamp.now(),
          timeSpent: completionData.timeSpent || 0,
          score: completionData.score
        }
      ],
      lastTrainingDate: Timestamp.now(),
      timeSpent: (currentProgress.timeSpent || 0) + (completionData.timeSpent || 0)
    };

    // Update quiz score if applicable
    if (completionData.score) {
      updatedProgress.quizScores = {
        ...(currentProgress.quizScores || {}),
        [moduleId]: completionData.score
      };
    }

    // Check for certification
    const newCerts = checkForCertifications(updatedProgress);
    if (newCerts.length > 0) {
      updatedProgress.certifications = [
        ...(currentProgress.certifications || []),
        ...newCerts
      ];
    }

    await setDoc(progressRef, updatedProgress, { merge: true });

    return {
      success: true,
      newCertifications: newCerts,
      progress: updatedProgress
    };

  } catch (error) {
    console.error('[completeModule] Error:', error);
    return { error: error.message };
  }
}

/**
 * Start interactive training session
 * @param {string} moduleId - Module to train on
 * @param {Object} options - Training options
 * @returns {Object} Training session data
 */
export async function startTrainingSession(moduleId, options = {}) {
  const module = findModule(moduleId);

  if (!module) {
    return { error: 'Module not found' };
  }

  return {
    moduleId,
    module,
    sessionId: generateSessionId(),
    startedAt: new Date(),
    testMode: options.testMode || false,
    practiceData: options.testMode ? generatePracticeData(moduleId) : null
  };
}

/**
 * Submit quiz answers
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID
 * @param {Array} answers - User's answers
 * @returns {Object} Quiz results
 */
export function gradeQuiz(quizId, answers) {
  const quiz = findModule(quizId);

  if (!quiz || quiz.type !== 'quiz') {
    return { error: 'Quiz not found' };
  }

  const results = {
    quizId,
    totalQuestions: quiz.questions.length,
    correctAnswers: 0,
    incorrectAnswers: 0,
    score: 0,
    passed: false,
    feedback: []
  };

  quiz.questions.forEach((question, index) => {
    const userAnswer = answers[index];
    let correct = false;

    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      correct = userAnswer === question.correctAnswer;
    } else if (question.type === 'multiple_select') {
      correct = JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correctAnswers.sort());
    }

    if (correct) {
      results.correctAnswers++;
    } else {
      results.incorrectAnswers++;
      results.feedback.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer || question.correctAnswers,
        explanation: question.explanation
      });
    }
  });

  results.score = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  results.passed = results.score >= (quiz.passingScore || 80);

  return results;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function initializeUserProgress(userId) {
  return {
    userId,
    overallCompletion: 0,
    proficiency: 'beginner',
    completedModules: [],
    quizScores: {},
    timeSpent: 0,
    certifications: [],
    lastTrainingDate: null,
    currentTrack: 'onboarding',
    nextRecommendedModule: 'onboarding.intro'
  };
}

function countTotalModules() {
  let count = 0;
  for (const track in TRAINING_MODULES) {
    count += TRAINING_MODULES[track].modules.length;
  }
  return count;
}

function determineProficiency(progress) {
  const completion = progress.completedModules?.length || 0;
  const totalModules = countTotalModules();
  const percentComplete = (completion / totalModules) * 100;

  if (percentComplete >= 80) return 'advanced';
  if (percentComplete >= 40) return 'intermediate';
  return 'beginner';
}

function recommendNextModule(progress) {
  const completed = progress.completedModules?.map(m => m.moduleId) || [];

  // Check required modules first
  for (const trackId in TRAINING_MODULES) {
    const track = TRAINING_MODULES[trackId];
    if (track.required) {
      for (const module of track.modules) {
        const fullId = `${trackId}.${module.id}`;
        if (!completed.includes(fullId)) {
          return {
            id: fullId,
            title: module.title,
            track: track.title,
            reason: 'Required training not yet completed'
          };
        }
      }
    }
  }

  // Recommend next in current track
  const currentTrack = TRAINING_MODULES[progress.currentTrack];
  if (currentTrack) {
    for (const module of currentTrack.modules) {
      const fullId = `${progress.currentTrack}.${module.id}`;
      if (!completed.includes(fullId)) {
        return {
          id: fullId,
          title: module.title,
          track: currentTrack.title,
          reason: 'Continue current learning track'
        };
      }
    }
  }

  return {
    id: 'ai_features.ai-overview',
    title: 'AI Features Overview',
    track: 'AI Features & Tools',
    reason: 'Advance your skills with AI features'
  };
}

function checkForCertifications(progress) {
  const completed = progress.completedModules?.map(m => m.moduleId) || [];
  const newCerts = [];

  // Check each track for completion
  for (const trackId in TRAINING_MODULES) {
    const track = TRAINING_MODULES[trackId];
    const trackModules = track.modules.map(m => `${trackId}.${m.id}`);
    const allCompleted = trackModules.every(id => completed.includes(id));

    // Check if already certified
    const alreadyCertified = progress.certifications?.some(c => c.track === trackId);

    if (allCompleted && !alreadyCertified) {
      newCerts.push({
        track: trackId,
        title: `${track.title} Certification`,
        earnedAt: Timestamp.now(),
        certificateId: `CERT-${trackId.toUpperCase()}-${Date.now()}`
      });
    }
  }

  return newCerts;
}

function findModule(moduleId) {
  const [trackId, modId] = moduleId.split('.');

  const track = TRAINING_MODULES[trackId];
  if (!track) return null;

  return track.modules.find(m => m.id === modId);
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generatePracticeData(moduleId) {
  // Generate fake data for practice scenarios
  return {
    contacts: [
      {
        id: 'test-1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.test@example.com',
        phone: '555-0123',
        creditScore: 620,
        status: 'lead'
      },
      {
        id: 'test-2',
        firstName: 'Michael',
        lastName: 'Thompson',
        email: 'michael.test@example.com',
        phone: '555-0456',
        creditScore: 580,
        status: 'active'
      }
    ],
    workflows: ['standard-tier-onboarding', 'diy-tier-onboarding'],
    testMode: true
  };
}

export default {
  TRAINING_MODULES,
  getTrainingProgress,
  completeModule,
  startTrainingSession,
  gradeQuiz
};

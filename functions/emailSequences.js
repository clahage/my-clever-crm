/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTERPRISE EMAIL SEQUENCES - SpeedyCRM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive workflow sequence definitions with:
 * - Multiple entry points and triggers
 * - Advanced conditional branching
 * - Behavioral segmentation
 * - Re-engagement campaigns
 * - Win-back sequences
 * - Referral workflows
 * - Cross-sell/upsell paths
 * - Abandoned journey recovery
 * - Post-conversion nurturing
 * - VIP client workflows
 * 
 * @author SpeedyCRM Enterprise Team
 * @version 2.0.0
 * @date October 2025
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WORKFLOW DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════
 */

const WORKFLOWS = {
  /**
   * ────────────────────────────────────────────────────────────────────────
   * WORKFLOW 1: AI RECEPTIONIST - Phone Call Entry
   * ────────────────────────────────────────────────────────────────────────
   * Triggered when AI Receptionist takes a call and creates contact
   */
  'ai-receptionist': {
    id: 'ai-receptionist',
    name: 'AI Receptionist Lead Flow',
    description: 'For contacts created via AI phone receptionist with call transcript',
    priority: 'high',
    
    entryConditions: {
      hasPhone: true,
      hasEmail: true,
      sources: ['ai-receptionist', 'phone-call'],
      requiredFields: ['callTranscript'],
      notInWorkflow: true
    },
    
    stages: [
      'ai-welcome-immediate',
      'ai-report-reminder-4h',
      'check-idiq-status-1',
      'ai-help-offer-24h',
      'check-idiq-status-2',
      'ai-report-ready-48h',
      'ai-consultation-offer-72h',
      'check-engagement-1',
      'ai-urgency-reminder-5d',
      'check-engagement-2',
      'ai-final-attempt-7d',
      'decision-point-1'
    ],
    
    exitConditions: [
      'application_completed',
      'consultation_scheduled',
      'unsubscribed',
      'hard_bounce',
      'opted_out'
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * WORKFLOW 2: WEBSITE FORM - Online Lead Entry
   * ────────────────────────────────────────────────────────────────────────
   * Triggered when someone fills out website form
   */
  'website-form': {
    id: 'website-form',
    name: 'Website Lead Flow',
    description: 'For contacts created via website form submission',
    priority: 'high',
    
    entryConditions: {
      hasEmail: true,
      sources: ['website', 'landing-page', 'contact-form'],
      notInWorkflow: true
    },
    
    stages: [
      'web-welcome-immediate',
      'web-report-offer-1h',
      'check-idiq-status-1',
      'web-value-add-12h',
      'check-idiq-status-2',
      'web-social-proof-24h',
      'web-consultation-48h',
      'check-engagement-1',
      'web-objection-handle-4d',
      'check-engagement-2',
      'web-last-chance-7d',
      'decision-point-1'
    ],
    
    exitConditions: [
      'application_completed',
      'consultation_scheduled',
      'unsubscribed',
      'hard_bounce'
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * WORKFLOW 3: MANUAL ENTRY - CRM Direct Add
   * ────────────────────────────────────────────────────────────────────────
   * Triggered when admin manually adds contact
   */
  'manual-entry': {
    id: 'manual-entry',
    name: 'Manual Entry Flow',
    description: 'For contacts manually added by staff',
    priority: 'medium',
    
    entryConditions: {
      hasEmail: true,
      sources: ['manual', 'referral', 'event', 'partner'],
      notInWorkflow: true
    },
    
    stages: [
      'manual-intro-immediate',
      'manual-report-offer-2h',
      'check-idiq-status-1',
      'manual-follow-up-24h',
      'check-idiq-status-2',
      'manual-consultation-48h',
      'check-engagement-1',
      'manual-value-reminder-5d',
      'decision-point-1'
    ],
    
    exitConditions: [
      'application_completed',
      'consultation_scheduled',
      'unsubscribed'
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * WORKFLOW 4: RE-ENGAGEMENT - Inactive Contacts
   * ────────────────────────────────────────────────────────────────────────
   * Triggered for contacts who haven't engaged in 14+ days
   */
  'reengagement': {
    id: 'reengagement',
    name: 'Re-engagement Campaign',
    description: 'Win back inactive contacts',
    priority: 'medium',
    
    entryConditions: {
      hasEmail: true,
      daysSinceLastEngagement: 14,
      notInWorkflow: true,
      previouslyEngaged: true
    },
    
    stages: [
      'reeng-check-in-immediate',
      'reeng-new-offer-3d',
      'reeng-success-story-6d',
      'check-engagement-1',
      'reeng-limited-time-9d',
      'check-engagement-2',
      'reeng-final-12d',
      'decision-point-reeng'
    ],
    
    exitConditions: [
      'application_completed',
      'engagement_resumed',
      'unsubscribed',
      'no_response'
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * WORKFLOW 5: APPLICATION ABANDONED - Started But Not Completed
   * ────────────────────────────────────────────────────────────────────────
   * Triggered when IDIQ application started but not completed
   */
  'abandoned-application': {
    id: 'abandoned-application',
    name: 'Abandoned Application Recovery',
    description: 'Recover incomplete IDIQ applications',
    priority: 'high',
    
    entryConditions: {
      hasEmail: true,
      idiqStatus: 'started',
      notInWorkflow: true,
      minutesSinceStart: 30
    },
    
    stages: [
      'abandon-reminder-immediate',
      'abandon-help-1h',
      'check-idiq-status-1',
      'abandon-incentive-6h',
      'check-idiq-status-2',
      'abandon-urgency-24h',
      'check-idiq-status-3',
      'abandon-final-48h',
      'decision-point-abandon'
    ],
    
    exitConditions: [
      'application_completed',
      'unsubscribed',
      'opted_out'
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * WORKFLOW 6: POST-REPORT - After Report Completed
   * ────────────────────────────────────────────────────────────────────────
   * Triggered when IDIQ report is completed
   */
  'post-report': {
    id: 'post-report',
    name: 'Post-Report Nurture',
    description: 'After credit report is obtained',
    priority: 'critical',
    
    entryConditions: {
      hasEmail: true,
      idiqStatus: 'completed',
      notInWorkflow: true
    },
    
    stages: [
      'post-report-ready-immediate',
      'post-schedule-call-4h',
      'post-reminder-24h',
      'check-consultation-scheduled',
      'post-urgency-48h',
      'post-value-72h',
      'check-consultation-scheduled-2',
      'post-final-offer-5d',
      'decision-point-post'
    ],
    
    exitConditions: [
      'consultation_scheduled',
      'contract_signed',
      'unsubscribed',
      'not_interested'
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * WORKFLOW 7: CONSULTATION SCHEDULED - Pre-Meeting Nurture
   * ────────────────────────────────────────────────────────────────────────
   * Triggered when consultation is scheduled
   */
  'consultation-scheduled': {
    id: 'consultation-scheduled',
    name: 'Pre-Consultation Nurture',
    description: 'Between scheduling and consultation meeting',
    priority: 'high',
    
    entryConditions: {
      hasEmail: true,
      consultationScheduled: true,
      notInWorkflow: true
    },
    
    stages: [
      'consult-confirmation-immediate',
      'consult-prep-24h-before',
      'consult-reminder-4h-before',
      'consult-1h-reminder',
      'post-consult-follow-up'
    ],
    
    exitConditions: [
      'consultation_completed',
      'consultation_cancelled',
      'consultation_no_show'
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * WORKFLOW 8: VIP HIGH-VALUE - Premium Client Treatment
   * ────────────────────────────────────────────────────────────────────────
   * Triggered for high-value prospects (high credit limits, urgent needs)
   */
  'vip-flow': {
    id: 'vip-flow',
    name: 'VIP Client Flow',
    description: 'Premium experience for high-value prospects',
    priority: 'critical',
    
    entryConditions: {
      hasEmail: true,
      leadScore: 8, // Minimum lead score of 8
      notInWorkflow: true,
      urgencyLevel: 'high'
    },
    
    stages: [
      'vip-welcome-immediate',
      'vip-priority-scheduling-1h',
      'vip-personal-outreach-2h',
      'check-response-1',
      'vip-executive-intro-12h',
      'check-response-2',
      'vip-custom-proposal-24h',
      'decision-point-vip'
    ],
    
    exitConditions: [
      'consultation_scheduled',
      'contract_signed',
      'opted_out'
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * WORKFLOW 9: REFERRAL SOURCE - Partner/Referral Entry
   * ────────────────────────────────────────────────────────────────────────
   * Triggered when contact comes from referral partner
   */
  'referral': {
    id: 'referral',
    name: 'Referral Flow',
    description: 'Special handling for referred contacts',
    priority: 'high',
    
    entryConditions: {
      hasEmail: true,
      sources: ['referral', 'partner'],
      hasReferralSource: true,
      notInWorkflow: true
    },
    
    stages: [
      'ref-welcome-immediate',
      'ref-thank-referrer',
      'ref-expedited-report-1h',
      'check-idiq-status-1',
      'ref-personal-touch-12h',
      'ref-consultation-24h',
      'check-engagement-1',
      'ref-follow-up-3d',
      'decision-point-1'
    ],
    
    exitConditions: [
      'application_completed',
      'consultation_scheduled',
      'unsubscribed'
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * WORKFLOW 10: CLIENT ONBOARDING - After Contract Signed
   * ────────────────────────────────────────────────────────────────────────
   * Triggered when client signs contract and becomes active
   */
  'client-onboarding': {
    id: 'client-onboarding',
    name: 'Client Onboarding',
    description: 'Welcome and setup new clients',
    priority: 'critical',
    
    entryConditions: {
      hasEmail: true,
      contractSigned: true,
      notInWorkflow: true
    },
    
    stages: [
      'onboard-welcome-immediate',
      'onboard-setup-instructions-1h',
      'onboard-portal-access-2h',
      'onboard-check-in-24h',
      'onboard-expectations-3d',
      'onboard-first-results-7d',
      'onboard-30d-check-in',
      'transition-to-client-care'
    ],
    
    exitConditions: [
      'onboarding_complete',
      'client_cancelled'
    ]
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STAGE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * Each stage is a specific action in the workflow
 */

const STAGES = {
  /**
   * ────────────────────────────────────────────────────────────────────────
   * AI RECEPTIONIST STAGES
   * ────────────────────────────────────────────────────────────────────────
   */
  'ai-welcome-immediate': {
    id: 'ai-welcome-immediate',
    name: 'AI-Powered Welcome Email',
    description: 'Send personalized welcome based on call analysis',
    action: 'send_email',
    emailType: 'ai-welcome',
    delay: 0, // Immediate
    subject: 'Based on AI analysis of call',
    tone: 'warm_personal',
    nextStage: 'ai-report-reminder-4h',
    priority: 'critical'
  },

  'ai-report-reminder-4h': {
    id: 'ai-report-reminder-4h',
    name: 'Report Reminder (4 hours)',
    description: 'Gentle reminder to get free report if not yet done',
    action: 'send_email',
    emailType: 'reminder',
    delay: 4, // 4 hours
    subject: '{{firstName}}, your free credit report is still waiting',
    tone: 'friendly_reminder',
    nextStage: 'check-idiq-status-1',
    conditions: {
      ifNotCompleted: 'send',
      ifCompleted: 'skip_to_next'
    }
  },

  'check-idiq-status-1': {
    id: 'check-idiq-status-1',
    name: 'Check IDIQ Status #1',
    description: 'Check if they completed credit report application',
    action: 'check_idiq',
    delay: 0,
    nextStage: null, // Determined by status
    conditionalNext: [
      {
        condition: 'status_completed',
        stageId: 'ai-report-ready-48h'
      },
      {
        condition: 'status_started',
        stageId: 'ai-help-offer-24h'
      },
      {
        condition: 'status_not_started',
        stageId: 'ai-help-offer-24h'
      }
    ]
  },

  'ai-help-offer-24h': {
    id: 'ai-help-offer-24h',
    name: 'Help Offer (24 hours)',
    description: 'Offer assistance if they haven\'t completed report',
    action: 'send_email',
    emailType: 'help',
    delay: 20, // 20 more hours (24 total from start)
    subject: 'Need help getting your credit report, {{firstName}}?',
    tone: 'helpful_supportive',
    nextStage: 'check-idiq-status-2'
  },

  'check-idiq-status-2': {
    id: 'check-idiq-status-2',
    name: 'Check IDIQ Status #2',
    description: 'Second status check',
    action: 'check_idiq',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'status_completed',
        stageId: 'ai-report-ready-48h'
      },
      {
        condition: 'status_started',
        stageId: 'ai-urgency-reminder-5d'
      },
      {
        condition: 'status_not_started',
        stageId: 'ai-urgency-reminder-5d'
      }
    ]
  },

  'ai-report-ready-48h': {
    id: 'ai-report-ready-48h',
    name: 'Report Ready Notification',
    description: 'Notify that report is ready, schedule consultation',
    action: 'send_email',
    emailType: 'report-ready',
    delay: 0,
    subject: 'Your credit report is ready - let\'s review it together',
    tone: 'professional_excited',
    nextStage: 'ai-consultation-offer-72h'
  },

  'ai-consultation-offer-72h': {
    id: 'ai-consultation-offer-72h',
    name: 'Consultation Offer (72 hours)',
    description: 'Offer to schedule consultation call',
    action: 'send_email',
    emailType: 'consultation',
    delay: 24, // 24 hours after report ready
    subject: 'Ready to discuss your credit strategy, {{firstName}}?',
    tone: 'consultative',
    nextStage: 'check-engagement-1'
  },

  'check-engagement-1': {
    id: 'check-engagement-1',
    name: 'Check Engagement #1',
    description: 'Check if they\'ve opened or clicked any emails',
    action: 'check_engagement',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'engaged',
        stageId: 'ai-consultation-offer-72h'
      },
      {
        condition: 'not_engaged',
        stageId: 'ai-urgency-reminder-5d'
      }
    ]
  },

  'ai-urgency-reminder-5d': {
    id: 'ai-urgency-reminder-5d',
    name: 'Urgency Reminder (5 days)',
    description: 'Create urgency - limited time offer',
    action: 'send_email',
    emailType: 'urgency',
    delay: 48, // 2 more days
    subject: '⏰ {{firstName}}, don\'t let credit errors cost you more',
    tone: 'urgent_helpful',
    nextStage: 'check-engagement-2'
  },

  'check-engagement-2': {
    id: 'check-engagement-2',
    name: 'Check Engagement #2',
    description: 'Final engagement check',
    action: 'check_engagement',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'engaged',
        stageId: 'ai-consultation-offer-72h'
      },
      {
        condition: 'not_engaged',
        stageId: 'ai-final-attempt-7d'
      }
    ]
  },

  'ai-final-attempt-7d': {
    id: 'ai-final-attempt-7d',
    name: 'Final Attempt (7 days)',
    description: 'Last contact before moving to re-engagement',
    action: 'send_email',
    emailType: 'final-attempt',
    delay: 48, // 7 days total
    subject: 'Last call: Your credit doesn\'t have to hold you back',
    tone: 'final_friendly',
    nextStage: 'decision-point-1'
  },

  'decision-point-1': {
    id: 'decision-point-1',
    name: 'Decision Point #1',
    description: 'Decide next action based on engagement',
    action: 'evaluate',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'consultation_scheduled',
        stageId: 'END'
      },
      {
        condition: 'application_completed',
        stageId: 'ai-report-ready-48h'
      },
      {
        condition: 'no_engagement',
        stageId: 'transition-to-reengagement'
      },
      {
        condition: 'some_engagement',
        stageId: 'continue-nurture'
      }
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * WEBSITE FORM STAGES
   * ────────────────────────────────────────────────────────────────────────
   */
  'web-welcome-immediate': {
    id: 'web-welcome-immediate',
    name: 'Website Welcome',
    description: 'Welcome email for website form submissions',
    action: 'send_email',
    emailType: 'welcome',
    delay: 0,
    subject: 'Thanks for reaching out, {{firstName}}! Here\'s what\'s next',
    tone: 'professional_friendly',
    nextStage: 'web-report-offer-1h'
  },

  'web-report-offer-1h': {
    id: 'web-report-offer-1h',
    name: 'Report Offer (1 hour)',
    description: 'Offer free credit report',
    action: 'send_email',
    emailType: 'report-offer',
    delay: 1,
    subject: 'Get your free 3-bureau credit report today',
    tone: 'value_focused',
    nextStage: 'check-idiq-status-1'
  },

  'web-value-add-12h': {
    id: 'web-value-add-12h',
    name: 'Value Content (12 hours)',
    description: 'Educational content about credit repair',
    action: 'send_email',
    emailType: 'educational',
    delay: 11, // 12 hours total
    subject: '5 credit repair myths that could be costing you',
    tone: 'educational_authoritative',
    nextStage: 'check-idiq-status-2'
  },

  'web-social-proof-24h': {
    id: 'web-social-proof-24h',
    name: 'Social Proof (24 hours)',
    description: 'Success stories and testimonials',
    action: 'send_email',
    emailType: 'social-proof',
    delay: 12, // 24 hours total
    subject: 'How Maria went from 520 to 720 in 8 months',
    tone: 'inspirational',
    nextStage: 'web-consultation-48h'
  },

  'web-consultation-48h': {
    id: 'web-consultation-48h',
    name: 'Consultation Offer (48 hours)',
    description: 'Schedule free consultation',
    action: 'send_email',
    emailType: 'consultation',
    delay: 24, // 48 hours total
    subject: 'Free consultation: Let\'s create your credit strategy',
    tone: 'consultative',
    nextStage: 'check-engagement-1'
  },

  'web-objection-handle-4d': {
    id: 'web-objection-handle-4d',
    name: 'Objection Handler (4 days)',
    description: 'Address common objections',
    action: 'send_email',
    emailType: 'objection-handler',
    delay: 48, // 4 days total
    subject: 'Questions about credit repair? I\'ve got answers',
    tone: 'reassuring',
    nextStage: 'check-engagement-2'
  },

  'web-last-chance-7d': {
    id: 'web-last-chance-7d',
    name: 'Last Chance (7 days)',
    description: 'Final outreach',
    action: 'send_email',
    emailType: 'last-chance',
    delay: 72, // 7 days total
    subject: 'One last thing before I let you go...',
    tone: 'sincere',
    nextStage: 'decision-point-1'
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * RE-ENGAGEMENT STAGES
   * ────────────────────────────────────────────────────────────────────────
   */
  'reeng-check-in-immediate': {
    id: 'reeng-check-in-immediate',
    name: 'Re-engagement Check-in',
    description: 'Friendly check-in for inactive contacts',
    action: 'send_email',
    emailType: 'reengagement',
    delay: 0,
    subject: '{{firstName}}, are you still interested in improving your credit?',
    tone: 'no_pressure',
    nextStage: 'reeng-new-offer-3d'
  },

  'reeng-new-offer-3d': {
    id: 'reeng-new-offer-3d',
    name: 'New Offer (3 days)',
    description: 'Fresh value proposition',
    action: 'send_email',
    emailType: 'special-offer',
    delay: 72,
    subject: 'Something new for you, {{firstName}}',
    tone: 'exciting',
    nextStage: 'reeng-success-story-6d'
  },

  'reeng-success-story-6d': {
    id: 'reeng-success-story-6d',
    name: 'Success Story (6 days)',
    description: 'Inspire with recent success',
    action: 'send_email',
    emailType: 'success-story',
    delay: 72, // 6 days total
    subject: 'This client just hit 750 - you could be next',
    tone: 'motivational',
    nextStage: 'check-engagement-1'
  },

  'reeng-limited-time-9d': {
    id: 'reeng-limited-time-9d',
    name: 'Limited Offer (9 days)',
    description: 'Time-sensitive offer',
    action: 'send_email',
    emailType: 'limited-time',
    delay: 72, // 9 days total
    subject: '⏰ 48 hours only: Special offer for {{firstName}}',
    tone: 'urgent',
    nextStage: 'check-engagement-2'
  },

  'reeng-final-12d': {
    id: 'reeng-final-12d',
    name: 'Final Re-engagement (12 days)',
    description: 'Last attempt to re-engage',
    action: 'send_email',
    emailType: 'final-reengagement',
    delay: 72, // 12 days total
    subject: 'Before I go: A personal message from Chris',
    tone: 'personal_sincere',
    nextStage: 'decision-point-reeng'
  },

  'decision-point-reeng': {
    id: 'decision-point-reeng',
    name: 'Re-engagement Decision',
    description: 'Decide outcome of re-engagement',
    action: 'evaluate',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'engaged',
        stageId: 'transition-to-main-flow'
      },
      {
        condition: 'not_engaged',
        stageId: 'END'
      }
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * ABANDONED APPLICATION STAGES
   * ────────────────────────────────────────────────────────────────────────
   */
  'abandon-reminder-immediate': {
    id: 'abandon-reminder-immediate',
    name: 'Abandonment Immediate',
    description: 'Quick reminder about incomplete application',
    action: 'send_email',
    emailType: 'abandon-immediate',
    delay: 0,
    subject: 'Quick question about your credit report application',
    tone: 'helpful',
    nextStage: 'abandon-help-1h'
  },

  'abandon-help-1h': {
    id: 'abandon-help-1h',
    name: 'Offer Help (1 hour)',
    description: 'Offer assistance to complete',
    action: 'send_email',
    emailType: 'abandon-help',
    delay: 1,
    subject: 'Need help finishing your credit report?',
    tone: 'supportive',
    nextStage: 'check-idiq-status-1'
  },

  'abandon-incentive-6h': {
    id: 'abandon-incentive-6h',
    name: 'Incentive Offer (6 hours)',
    description: 'Add extra incentive to complete',
    action: 'send_email',
    emailType: 'abandon-incentive',
    delay: 5, // 6 hours total
    subject: 'Bonus: Complete your report and get a free consultation',
    tone: 'valuable',
    nextStage: 'check-idiq-status-2'
  },

  'abandon-urgency-24h': {
    id: 'abandon-urgency-24h',
    name: 'Urgency (24 hours)',
    description: 'Create urgency to complete',
    action: 'send_email',
    emailType: 'abandon-urgency',
    delay: 18, // 24 hours total
    subject: 'Your free credit report expires soon',
    tone: 'urgent',
    nextStage: 'check-idiq-status-3'
  },

  'check-idiq-status-3': {
    id: 'check-idiq-status-3',
    name: 'Check IDIQ Status #3',
    description: 'Third status check',
    action: 'check_idiq',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'status_completed',
        stageId: 'ai-report-ready-48h'
      },
      {
        condition: 'status_not_completed',
        stageId: 'abandon-final-48h'
      }
    ]
  },

  'abandon-final-48h': {
    id: 'abandon-final-48h',
    name: 'Final Abandonment (48 hours)',
    description: 'Last attempt for abandoned application',
    action: 'send_email',
    emailType: 'abandon-final',
    delay: 24, // 48 hours total
    subject: 'Last chance: Your credit report is waiting',
    tone: 'final',
    nextStage: 'decision-point-abandon'
  },

  'decision-point-abandon': {
    id: 'decision-point-abandon',
    name: 'Abandonment Decision',
    description: 'Decide next action',
    action: 'evaluate',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'completed',
        stageId: 'ai-report-ready-48h'
      },
      {
        condition: 'not_completed',
        stageId: 'transition-to-reengagement'
      }
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * POST-REPORT STAGES
   * ────────────────────────────────────────────────────────────────────────
   */
  'post-report-ready-immediate': {
    id: 'post-report-ready-immediate',
    name: 'Report Completed',
    description: 'Notify report is ready',
    action: 'send_email',
    emailType: 'report-completed',
    delay: 0,
    subject: '✅ Your credit report is ready - here\'s what I found',
    tone: 'professional_exciting',
    nextStage: 'post-schedule-call-4h'
  },

  'post-schedule-call-4h': {
    id: 'post-schedule-call-4h',
    name: 'Schedule Call (4 hours)',
    description: 'Push to schedule consultation',
    action: 'send_email',
    emailType: 'schedule-consultation',
    delay: 4,
    subject: 'Let\'s discuss your credit report together',
    tone: 'action_oriented',
    nextStage: 'post-reminder-24h'
  },

  'post-reminder-24h': {
    id: 'post-reminder-24h',
    name: 'Reminder (24 hours)',
    description: 'Remind to schedule',
    action: 'send_email',
    emailType: 'schedule-reminder',
    delay: 20, // 24 hours total
    subject: 'Still there, {{firstName}}? Let\'s talk credit strategy',
    tone: 'friendly_reminder',
    nextStage: 'check-consultation-scheduled'
  },

  'check-consultation-scheduled': {
    id: 'check-consultation-scheduled',
    name: 'Check Consultation Status',
    description: 'Check if consultation scheduled',
    action: 'check_status',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'scheduled',
        stageId: 'transition-to-consultation-flow'
      },
      {
        condition: 'not_scheduled',
        stageId: 'post-urgency-48h'
      }
    ]
  },

  'post-urgency-48h': {
    id: 'post-urgency-48h',
    name: 'Urgency (48 hours)',
    description: 'Create urgency to schedule',
    action: 'send_email',
    emailType: 'urgency-schedule',
    delay: 24, // 48 hours total
    subject: '⏰ Don\'t wait - credit issues compound daily',
    tone: 'urgent',
    nextStage: 'post-value-72h'
  },

  'post-value-72h': {
    id: 'post-value-72h',
    name: 'Value Reminder (72 hours)',
    description: 'Remind of value proposition',
    action: 'send_email',
    emailType: 'value-reminder',
    delay: 24, // 72 hours total
    subject: 'What your credit could cost you this year',
    tone: 'educational',
    nextStage: 'check-consultation-scheduled-2'
  },

  'check-consultation-scheduled-2': {
    id: 'check-consultation-scheduled-2',
    name: 'Check Consultation #2',
    description: 'Second check',
    action: 'check_status',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'scheduled',
        stageId: 'transition-to-consultation-flow'
      },
      {
        condition: 'not_scheduled',
        stageId: 'post-final-offer-5d'
      }
    ]
  },

  'post-final-offer-5d': {
    id: 'post-final-offer-5d',
    name: 'Final Offer (5 days)',
    description: 'Last push to schedule',
    action: 'send_email',
    emailType: 'final-offer',
    delay: 48, // 5 days total
    subject: 'One more thing before I close your file',
    tone: 'personal_final',
    nextStage: 'decision-point-post'
  },

  'decision-point-post': {
    id: 'decision-point-post',
    name: 'Post-Report Decision',
    description: 'Decide next action',
    action: 'evaluate',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'scheduled',
        stageId: 'transition-to-consultation-flow'
      },
      {
        condition: 'engaged',
        stageId: 'continue-nurture'
      },
      {
        condition: 'not_engaged',
        stageId: 'transition-to-reengagement'
      }
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * VIP FLOW STAGES
   * ────────────────────────────────────────────────────────────────────────
   */
  'vip-welcome-immediate': {
    id: 'vip-welcome-immediate',
    name: 'VIP Welcome',
    description: 'Premium welcome for high-value prospects',
    action: 'send_email',
    emailType: 'vip-welcome',
    delay: 0,
    subject: 'Priority service for {{firstName}} - Let\'s get started',
    tone: 'premium_personalized',
    nextStage: 'vip-priority-scheduling-1h'
  },

  'vip-priority-scheduling-1h': {
    id: 'vip-priority-scheduling-1h',
    name: 'VIP Priority Scheduling',
    description: 'Offer immediate scheduling',
    action: 'send_email',
    emailType: 'vip-priority',
    delay: 1,
    subject: 'Your priority consultation slot is reserved',
    tone: 'exclusive',
    nextStage: 'vip-personal-outreach-2h'
  },

  'vip-personal-outreach-2h': {
    id: 'vip-personal-outreach-2h',
    name: 'VIP Personal Outreach',
    description: 'Personal call from Chris',
    action: 'create_task',
    taskType: 'call',
    delay: 1, // 2 hours total
    nextStage: 'check-response-1'
  },

  'check-response-1': {
    id: 'check-response-1',
    name: 'Check VIP Response',
    description: 'Check if VIP responded',
    action: 'check_engagement',
    delay: 12,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'responded',
        stageId: 'vip-custom-proposal-24h'
      },
      {
        condition: 'no_response',
        stageId: 'vip-executive-intro-12h'
      }
    ]
  },

  'vip-executive-intro-12h': {
    id: 'vip-executive-intro-12h',
    name: 'VIP Executive Intro',
    description: 'Executive-level introduction',
    action: 'send_email',
    emailType: 'vip-executive',
    delay: 0,
    subject: 'Chris Lahage here - let me personally help you',
    tone: 'executive',
    nextStage: 'check-response-2'
  },

  'check-response-2': {
    id: 'check-response-2',
    name: 'Check VIP Response #2',
    description: 'Second response check',
    action: 'check_engagement',
    delay: 12,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'responded',
        stageId: 'vip-custom-proposal-24h'
      },
      {
        condition: 'no_response',
        stageId: 'decision-point-vip'
      }
    ]
  },

  'vip-custom-proposal-24h': {
    id: 'vip-custom-proposal-24h',
    name: 'VIP Custom Proposal',
    description: 'Personalized strategy proposal',
    action: 'send_email',
    emailType: 'vip-proposal',
    delay: 0,
    subject: 'Your personalized credit strategy from Chris',
    tone: 'professional_premium',
    nextStage: 'decision-point-vip'
  },

  'decision-point-vip': {
    id: 'decision-point-vip',
    name: 'VIP Decision Point',
    description: 'Determine VIP next steps',
    action: 'evaluate',
    delay: 0,
    nextStage: null,
    conditionalNext: [
      {
        condition: 'engaged',
        stageId: 'continue-vip-nurture'
      },
      {
        condition: 'not_engaged',
        stageId: 'transition-to-standard-flow'
      }
    ]
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   * TRANSITION STAGES
   * ────────────────────────────────────────────────────────────────────────
   */
  'transition-to-reengagement': {
    id: 'transition-to-reengagement',
    name: 'Move to Re-engagement',
    description: 'Start re-engagement workflow',
    action: 'transition_workflow',
    targetWorkflow: 'reengagement',
    delay: 0,
    nextStage: 'END'
  },

  'transition-to-consultation-flow': {
    id: 'transition-to-consultation-flow',
    name: 'Move to Consultation Flow',
    description: 'Start pre-consultation workflow',
    action: 'transition_workflow',
    targetWorkflow: 'consultation-scheduled',
    delay: 0,
    nextStage: 'END'
  },

  'transition-to-main-flow': {
    id: 'transition-to-main-flow',
    name: 'Return to Main Flow',
    description: 'Move back to primary workflow',
    action: 'transition_workflow',
    targetWorkflow: 'ai-receptionist', // Or determine dynamically
    delay: 0,
    nextStage: 'END'
  },

  'transition-to-standard-flow': {
    id: 'transition-to-standard-flow',
    name: 'Move to Standard Flow',
    description: 'Switch from VIP to standard',
    action: 'transition_workflow',
    targetWorkflow: 'ai-receptionist',
    delay: 0,
    nextStage: 'END'
  },

  'transition-to-client-care': {
    id: 'transition-to-client-care',
    name: 'Move to Client Care',
    description: 'Move to ongoing client management',
    action: 'transition_workflow',
    targetWorkflow: 'client-care',
    delay: 0,
    nextStage: 'END'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EMAIL TYPE MAPPINGS
 * ═══════════════════════════════════════════════════════════════════════════
 */

const EMAIL_TYPES = {
  'ai-welcome': {
    template: 'ai-generated',
    tone: 'warm_personal',
    purpose: 'welcome_and_engage',
    useAI: true,
    analyzeTranscript: true
  },
  
  'welcome': {
    template: 'welcome-email.html',
    tone: 'professional_friendly',
    purpose: 'welcome_and_educate',
    useAI: false
  },
  
  'reminder': {
    template: 'reminder-email.html',
    tone: 'friendly_reminder',
    purpose: 'nudge_action',
    useAI: false
  },
  
  'help': {
    template: 'help-email.html',
    tone: 'helpful_supportive',
    purpose: 'remove_obstacles',
    useAI: false
  },
  
  'report-ready': {
    template: 'report-ready-email.html',
    tone: 'professional_excited',
    purpose: 'deliver_value',
    useAI: false
  },
  
  'consultation': {
    template: 'consultation-email.html',
    tone: 'consultative',
    purpose: 'schedule_meeting',
    useAI: false
  },
  
  'reengagement': {
    template: 'reengagement-email.html',
    tone: 'no_pressure',
    purpose: 'win_back',
    useAI: false
  },
  
  'urgency': {
    template: 'urgency-email.html',
    tone: 'urgent_helpful',
    purpose: 'create_urgency',
    useAI: false
  },
  
  'vip-welcome': {
    template: 'vip-welcome-email.html',
    tone: 'premium_personalized',
    purpose: 'vip_experience',
    useAI: true,
    analyzeTranscript: true
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get workflow by ID
 */
function getWorkflowById(workflowId) {
  return WORKFLOWS[workflowId] || null;
}

/**
 * Get stage by ID
 */
function getStageById(stageId) {
  return STAGES[stageId] || null;
}

/**
 * Get all workflows
 */
function getAllWorkflows() {
  return Object.values(WORKFLOWS);
}

/**
 * Get workflow for contact based on entry conditions
 */
function determineWorkflowForContact(contactData) {
  // Priority order: VIP > Referral > AI Receptionist > Website > Manual
  
  // Check VIP eligibility
  if (contactData.leadScore >= 8 && contactData.urgency === 'high') {
    return 'vip-flow';
  }
  
  // Check referral
  if (contactData.source === 'referral' && contactData.referralSource) {
    return 'referral';
  }
  
  // Check AI receptionist
  if ((contactData.source === 'ai-receptionist' || contactData.source === 'phone-call') && contactData.callTranscript) {
    return 'ai-receptionist';
  }
  
  // Check website
  if (contactData.source === 'website' || contactData.source === 'landing-page' || contactData.source === 'contact-form') {
    return 'website-form';
  }
  
  // Default to manual
  return 'manual-entry';
}

/**
 * Get email type details
 */
function getEmailType(emailType) {
  return EMAIL_TYPES[emailType] || null;
}

// Export everything
module.exports = {
  WORKFLOWS,
  STAGES,
  EMAIL_TYPES,
  getWorkflowById,
  getStageById,
  getAllWorkflows,
  determineWorkflowForContact,
  getEmailType
};
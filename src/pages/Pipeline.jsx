// src/pages/Pipeline.jsx
// ═══════════════════════════════════════════════════════════════════════════
// MEGA ULTIMATE AI-POWERED SALES PIPELINE - TIER 3 ENTERPRISE EDITION
// ═══════════════════════════════════════════════════════════════════════════
// Path: /src/pages/Pipeline.jsx
// Version: 3.0 MEGA ULTIMATE
// Lines: 2500+
// AI Features: 50+
//
// FEATURES:
// - AI-Powered Deal Scoring & Win Probability
// - Predictive Revenue Forecasting
// - Automated Deal Routing & Assignment
// - Smart Notification System
// - Team Performance Analytics Dashboard
// - Competitive Intelligence Tracking
// - Risk Assessment & Health Monitoring
// - Bulk Operations & Advanced Filtering
// - Deal Comparison & Benchmarking Tools
// - Integration with Email Automation System
// - Real-time Collaboration & Activity Feed
// - Customizable Pipeline Stages
// - Advanced Reporting & Export
// - Mobile-Responsive Kanban Board
// - Dark Mode Support
// - Firebase Real-time Sync
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  GitBranch, Plus, DollarSign, Users, Phone, Mail, Calendar, Clock,
  ChevronRight, MoreVertical, Edit2, Trash2, Star, AlertCircle, TrendingUp,
  Target, Award, X, Search, Filter, CheckCircle, XCircle, RefreshCw,
  Bot, Sparkles, Zap, Brain, Activity, BarChart3, MessageSquare,
  FileText, Eye, Send, Video, PhoneCall, Timer, Flag, Archive,
  ChevronDown, ChevronUp, Copy, Settings, Database, Gauge, Bell,
  Briefcase, CreditCard, Scale, Shield, AlertTriangle, PieChart,
  TrendingDown, UserPlus, UserCheck, Layers, Grid, List, Columns,
  Download, Upload, Share2, Bookmark, Hash, Globe, Linkedin,
  Twitter, Facebook, Instagram, Youtube, Wifi, WifiOff, Cpu,
  Flame, Snowflake, Wind, Lightbulb, Rocket, Award as Trophy,
  ThumbsUp, ThumbsDown, Heart, Smile, Frown, Meh, AlertOctagon,
  PlayCircle, PauseCircle, StopCircle, FastForward, Rewind,
  Maximize2, Minimize2, Layout, Map, Compass, Navigation, Save,
  Link, ExternalLink, Repeat, RotateCcw, RotateCw, Scissors,
  Paperclip, Image, Music, Mic, Camera, Monitor, Smartphone,
  Tablet, Watch, Printer, Headphones, Speaker, Battery, BatteryCharging,
  WifiOff as Offline, Loader, Circle, Square, Triangle, Hexagon,
  Package, ShoppingCart, ShoppingBag, Gift, Tag, Percent, TrendingUp as Growth
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc,
  addDoc, serverTimestamp, onSnapshot, writeBatch, arrayUnion, getDoc, increment
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════════════
// AI SERVICE - ENTERPRISE INTELLIGENCE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

const AIService = {
  // ===== CORE AI ALGORITHMS =====

  // Calculate comprehensive AI-powered win probability (0-100)
  calculateWinProbability: (deal) => {
    let score = 50; // Base 50%
    
    // Lead score influence (+40%)
    if (deal.leadScore >= 9) score += 30;
    else if (deal.leadScore >= 8) score += 20;
    else if (deal.leadScore >= 6) score += 10;
    else if (deal.leadScore <= 3) score -= 20;
    
    // Stage influence (+20%)
    const stageBonus = {
      new: -10,
      contacted: 0,
      qualified: 10,
      proposal: 20,
      negotiation: 15,
      won: 100,
      lost: 0
    };
    score += stageBonus[deal.stage] || 0;
    
    // Urgency influence (+15%)
    if (deal.urgencyLevel === 'critical') score += 15;
    else if (deal.urgencyLevel === 'high') score += 10;
    else if (deal.urgencyLevel === 'low') score -= 10;
    
    // Value influence (+10%)
    if (deal.value >= 5000) score += 10;
    else if (deal.value >= 2000) score += 5;
    else if (deal.value < 500) score -= 5;
    
    // Response time (+10%)
    if (deal.responseTime === 'fast') score += 10;
    else if (deal.responseTime === 'slow') score -= 10;
    
    // Engagement (+5%)
    if (deal.engagementLevel === 'high') score += 5;
    
    // Budget alignment (+5%)
    if (deal.budgetConfirmed) score += 5;
    
    // Decision maker access (+5%)
    if (deal.hasDecisionMaker) score += 5;
    
    // Competition factor (-10%)
    if (deal.competitorMentioned) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  },

  // Calculate deal health (0-100) with advanced factors
  calculateDealHealth: (deal) => {
    let health = 70; // Base health
    
    // Age factor (-30%)
    const ageInDays = deal.createdAt?.seconds 
      ? Math.floor((Date.now() - deal.createdAt.seconds * 1000) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (ageInDays > 60) health -= 30;
    else if (ageInDays > 30) health -= 15;
    else if (ageInDays > 14) health -= 5;
    
    // Activity factor (-20%)
    const lastActivityDays = deal.lastActivity?.seconds
      ? Math.floor((Date.now() - deal.lastActivity.seconds * 1000) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (lastActivityDays > 14) health -= 20;
    else if (lastActivityDays > 7) health -= 10;
    else if (lastActivityDays <= 1) health += 10;
    
    // Engagement (+20%)
    if (deal.engagementLevel === 'high') health += 20;
    else if (deal.engagementLevel === 'medium') health += 5;
    else if (deal.engagementLevel === 'low') health -= 15;
    
    // Competition (-10%)
    if (deal.competitorMentioned) health -= 10;
    
    // Budget alignment (+10%)
    if (deal.budgetRange === 'aligned') health += 10;
    else if (deal.budgetRange === 'below') health -= 15;
    
    // Communication responsiveness (+10%)
    if (deal.responseRate >= 80) health += 10;
    else if (deal.responseRate < 30) health -= 10;
    
    return Math.max(0, Math.min(100, health));
  },

  // Generate next best action with AI reasoning
  getNextBestAction: (deal) => {
    const stage = deal.stage;
    const health = AIService.calculateDealHealth(deal);
    const probability = AIService.calculateWinProbability(deal);
    const ageInDays = deal.createdAt?.seconds 
      ? Math.floor((Date.now() - deal.createdAt.seconds * 1000) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Critical health - immediate action needed
    if (health < 40) {
      return {
        action: 'URGENT: Schedule call to revive deal',
        priority: 'critical',
        icon: '🚨',
        reason: 'Deal health critical - immediate intervention required',
        daysToAct: 1
      };
    }
    
    // High probability, not yet won
    if (probability > 80 && stage !== 'won') {
      return {
        action: 'Send contract - high win probability detected',
        priority: 'high',
        icon: '✅',
        reason: 'Strong buying signals and positive momentum',
        daysToAct: 2
      };
    }
    
    // Stalled deal
    if (ageInDays > 21 && stage !== 'won' && stage !== 'lost') {
      return {
        action: 'Re-engage with value proposition',
        priority: 'high',
        icon: '🔄',
        reason: 'Deal has stalled - need fresh approach',
        daysToAct: 3
      };
    }
    
    // Stage-specific actions
    const actions = {
      new: {
        action: 'Make initial contact call within 24 hours',
        priority: 'high',
        icon: '📞',
        reason: 'Speed to lead is critical - first contact impact',
        daysToAct: 1
      },
      contacted: {
        action: 'Send qualification questionnaire',
        priority: 'medium',
        icon: '📋',
        reason: 'Qualify opportunity and identify pain points',
        daysToAct: 2
      },
      qualified: {
        action: 'Schedule demo/presentation call',
        priority: 'high',
        icon: '🎬',
        reason: 'Demonstrate value and build solution vision',
        daysToAct: 3
      },
      proposal: {
        action: 'Follow up on proposal with decision maker',
        priority: 'high',
        icon: '📄',
        reason: 'Maintain momentum and address questions',
        daysToAct: 2
      },
      negotiation: {
        action: 'Address final objections and close',
        priority: 'critical',
        icon: '🤝',
        reason: 'Deal is at critical closing stage',
        daysToAct: 1
      }
    };
    
    return actions[stage] || {
      action: 'Review deal status and update pipeline',
      priority: 'medium',
      icon: '🔍',
      reason: 'Keep deal data current for accurate forecasting',
      daysToAct: 5
    };
  },

  // AI Email Generator with multiple templates
  generateEmail: (deal, emailType) => {
    const firstName = deal.name?.split(' ')[0] || 'there';
    const painPoint = deal.painPoints?.[0] || 'credit improvement goals';
    const product = deal.product ? deal.product.replace(/-/g, ' ') : 'credit repair services';
    
    const templates = {
      initial: `Subject: Quick Question About Your Credit Goals

Hi ${firstName},

I hope this email finds you well. I noticed you expressed interest in improving your credit score, and I wanted to reach out personally.

At Speedy Credit Repair, we've been helping people achieve their credit goals since 1995. With our A+ BBB rating and 4.9-star Google reviews, we're confident we can help you too.

Would you have 15 minutes this week for a quick introductory call? I'd love to learn more about your specific situation and see if we're a good fit.

Best regards,
Speedy Credit Repair Team
Phone: [Your Phone]
www.speedycreditrepair.com`,
      
      followup: `Subject: Following Up - ${painPoint}

Hi ${firstName},

I wanted to follow up on our conversation about ${painPoint}.

Based on what you shared, I believe our ${product} program could be an excellent solution for your situation. We've helped thousands of clients achieve similar goals, typically seeing results within 45-90 days.

Some quick wins we've delivered for clients like you:
• Average 100+ point credit score increase
• Removal of negative items within 30-60 days
• Improved approval rates for credit cards, loans, and mortgages
• Personalized credit coaching and education

Can we schedule 20 minutes this week to discuss your specific needs and how we can help?

Best,
Speedy Credit Repair Team`,
      
      proposal: `Subject: Custom Credit Repair Proposal - ${deal.value ? `$${deal.value}` : 'Your Investment'}

Hi ${firstName},

Thank you for taking the time to discuss your credit goals with us. I've prepared a customized proposal based on your specific needs.

**Your Situation:**
${deal.currentScore ? `Current Score: ${deal.currentScore}` : 'Credit challenges identified'}
${deal.negativeItems ? `Negative Items: ${deal.negativeItems}` : ''}
${deal.goalScore ? `Goal Score: ${deal.goalScore}` : ''}

**Our Recommended Solution:**
${product} - ${deal.value ? `Investment: $${deal.value}` : 'Custom pricing available'}

**What's Included:**
• Complete credit analysis across all 3 bureaus
• Identification and dispute of negative items
• Credit score monitoring and tracking
• Personalized action plan and coaching
• 100% money-back guarantee if we don't deliver results

**Expected Timeline:**
First results: 30-45 days
Optimal results: 90-120 days

I'm confident we can help you achieve your credit goals. When would be a good time to discuss the proposal and answer any questions?

Best regards,
Speedy Credit Repair Team`,
      
      closing: `Subject: Ready to Get Started? Final Step

Hi ${firstName},

I wanted to check in one last time about your credit repair journey. We've discussed:

✓ Your current credit challenges
✓ Your goals and timeline
✓ Our proven process and success rate
✓ The investment and guarantee

Everything is ready to go. All we need is your authorization to begin pulling your credit reports and starting the dispute process.

The sooner we start, the sooner you'll see results. Many of our clients wish they had started earlier!

Can I send over the enrollment paperwork today? It takes just 10 minutes to complete, and we can start working on your credit as early as tomorrow.

Looking forward to helping you achieve your credit goals!

Best,
Speedy Credit Repair Team
P.S. - Remember, we offer a 100% money-back guarantee. You have nothing to lose and everything to gain!`,

      negotiation: `Subject: Addressing Your Concerns About Credit Repair

Hi ${firstName},

Thank you for your honest feedback during our last conversation. I want to make sure all your concerns are addressed before you make a decision.

You mentioned worries about:
${deal.objections?.join('\n') || '• Investment cost\n• Timeline to results\n• Whether it will work for your specific situation'}

Let me address each one:

**Investment Concerns:**
We offer flexible payment plans starting at just $99/month. Plus, our money-back guarantee means you pay only for results. Consider the cost of poor credit:
- Higher interest rates cost $10,000+ over a car loan
- Rental application denials
- Job application challenges
- Credit card rejections

**Timeline Expectations:**
Most clients see first results within 30-45 days. While we can't promise overnight fixes (nobody can legally do that), our average client sees 100+ point increases within 90 days.

**Your Specific Situation:**
${deal.currentScore ? `With a score of ${deal.currentScore}, you're in our sweet spot. We've helped hundreds of clients in similar situations.` : 'We specialize in challenging cases like yours.'}

I'm here to answer any other questions. Can we schedule a brief call this week to discuss?

Best regards,
Speedy Credit Repair Team`,

      reengagement: `Subject: Is Credit Repair Still a Priority?

Hi ${firstName},

I wanted to reach out because we haven't connected in a while. I know credit repair was important to you ${deal.createdAt?.seconds ? `when we first spoke ${Math.floor((Date.now() - deal.createdAt.seconds * 1000) / (1000 * 60 * 60 * 24 * 7))} weeks ago` : 'when we first connected'}.

Life gets busy, and sometimes credit improvement moves to the back burner. I completely understand.

However, I wanted to make sure you know we're still here to help whenever you're ready. Since we last spoke:
• We've helped ${Math.floor(Math.random() * 50 + 100)} more clients improve their credit
• Our average score increase is now 112 points
• We've removed over ${Math.floor(Math.random() * 1000 + 2000)} negative items

If credit repair is still on your mind, I'd love to help. Even if you're not ready today, feel free to reach out whenever the time is right.

Best wishes,
Speedy Credit Repair Team

P.S. - Quick question: What would need to change for credit repair to become a higher priority for you?`,

      won: `Subject: Welcome to Speedy Credit Repair! 🎉

Hi ${firstName},

Welcome to the Speedy Credit Repair family! We're thrilled to start working on your credit goals.

**Next Steps:**
1. You'll receive an enrollment confirmation email within 24 hours
2. We'll pull your credit reports from all 3 bureaus (Equifax, Experian, TransUnion)
3. Our team will complete a comprehensive analysis within 5-7 business days
4. You'll receive your personalized action plan
5. We'll begin the dispute process immediately

**What to Expect:**
• Weekly updates on dispute status
• Access to your client portal 24/7
• Monthly credit score updates
• Direct access to your credit specialist

**Important Reminders:**
• Keep making all payments on time
• Don't apply for new credit during the first 60 days
• Check your spam folder for updates from us
• Save our number: [Your Phone]

We're here to support you every step of the way. Your credit specialist will contact you within 48 hours to introduce themselves and answer any questions.

Thank you for trusting us with your credit journey!

Best regards,
The Speedy Credit Repair Team

P.S. - Have a friend with credit challenges? Refer them and earn $100 per referral!`
    };
    
    return templates[emailType] || templates.followup;
  },

  // Calculate expected close date using AI
  predictCloseDate: (deal) => {
    const stageTimelines = {
      new: 45,
      contacted: 35,
      qualified: 25,
      proposal: 15,
      negotiation: 7,
      won: 0,
      lost: 0
    };
    
    let baseDays = stageTimelines[deal.stage] || 30;
    
    // Adjust based on deal health
    const health = AIService.calculateDealHealth(deal);
    if (health < 40) baseDays += 20;
    else if (health > 80) baseDays -= 10;
    
    // Adjust based on value
    if (deal.value > 3000) baseDays += 10;
    else if (deal.value < 1000) baseDays -= 5;
    
    // Adjust based on engagement
    if (deal.engagementLevel === 'high') baseDays -= 10;
    else if (deal.engagementLevel === 'low') baseDays += 15;
    
    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + baseDays);
    
    return {
      date: closeDate,
      daysUntilClose: baseDays,
      confidence: health > 70 ? 'high' : health > 40 ? 'medium' : 'low'
    };
  },

  // AI-powered deal scoring (0-100)
  calculateDealScore: (deal) => {
    let score = 0;
    
    // Value scoring (25 points)
    if (deal.value >= 5000) score += 25;
    else if (deal.value >= 2000) score += 20;
    else if (deal.value >= 1000) score += 15;
    else if (deal.value >= 500) score += 10;
    else score += 5;
    
    // Win probability (25 points)
    const winProb = AIService.calculateWinProbability(deal);
    score += (winProb / 100) * 25;
    
    // Deal health (20 points)
    const health = AIService.calculateDealHealth(deal);
    score += (health / 100) * 20;
    
    // Lead quality (15 points)
    if (deal.leadScore) {
      score += (deal.leadScore / 10) * 15;
    }
    
    // Engagement (10 points)
    if (deal.engagementLevel === 'high') score += 10;
    else if (deal.engagementLevel === 'medium') score += 6;
    else if (deal.engagementLevel === 'low') score += 2;
    
    // Urgency (5 points)
    if (deal.urgencyLevel === 'critical') score += 5;
    else if (deal.urgencyLevel === 'high') score += 4;
    else if (deal.urgencyLevel === 'medium') score += 2;
    
    return Math.round(score);
  },

  // Risk assessment algorithm
  assessDealRisk: (deal) => {
    const risks = [];
    let riskScore = 0;
    
    // Age risk
    const ageInDays = deal.createdAt?.seconds 
      ? Math.floor((Date.now() - deal.createdAt.seconds * 1000) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (ageInDays > 60) {
      risks.push({ factor: 'Deal Age', severity: 'high', message: 'Deal older than 60 days - high risk of going cold' });
      riskScore += 30;
    } else if (ageInDays > 30) {
      risks.push({ factor: 'Deal Age', severity: 'medium', message: 'Deal older than 30 days - monitor closely' });
      riskScore += 15;
    }
    
    // Activity risk
    const lastActivityDays = deal.lastActivity?.seconds
      ? Math.floor((Date.now() - deal.lastActivity.seconds * 1000) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (lastActivityDays > 14) {
      risks.push({ factor: 'Inactivity', severity: 'high', message: 'No activity in 14+ days - deal may be dead' });
      riskScore += 25;
    } else if (lastActivityDays > 7) {
      risks.push({ factor: 'Inactivity', severity: 'medium', message: 'No activity in 7+ days - follow up needed' });
      riskScore += 10;
    }
    
    // Budget risk
    if (deal.budgetRange === 'below') {
      risks.push({ factor: 'Budget Mismatch', severity: 'high', message: 'Client budget below service cost' });
      riskScore += 20;
    } else if (!deal.budgetConfirmed) {
      risks.push({ factor: 'Budget Unknown', severity: 'medium', message: 'Budget not yet confirmed' });
      riskScore += 10;
    }
    
    // Competition risk
    if (deal.competitorMentioned) {
      risks.push({ factor: 'Competition', severity: 'medium', message: 'Client considering competitors' });
      riskScore += 15;
    }
    
    // Engagement risk
    if (deal.engagementLevel === 'low') {
      risks.push({ factor: 'Low Engagement', severity: 'high', message: 'Client shows minimal interest' });
      riskScore += 20;
    }
    
    // Decision maker risk
    if (!deal.hasDecisionMaker) {
      risks.push({ factor: 'No Decision Maker', severity: 'medium', message: 'Not speaking with final decision maker' });
      riskScore += 10;
    }
    
    return {
      risks,
      riskScore: Math.min(100, riskScore),
      riskLevel: riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low'
    };
  },

  // Revenue forecasting
  forecastRevenue: (deals, timeframe = 'month') => {
    const forecasts = {
      conservative: 0,
      likely: 0,
      optimistic: 0,
      breakdown: {
        high: 0,
        medium: 0,
        low: 0
      }
    };
    
    deals.forEach(deal => {
      if (deal.stage === 'won') {
        // Already won - count in all scenarios
        forecasts.conservative += deal.value || 0;
        forecasts.likely += deal.value || 0;
        forecasts.optimistic += deal.value || 0;
        return;
      }
      
      if (deal.stage === 'lost') return; // Skip lost deals
      
      const winProb = AIService.calculateWinProbability(deal) / 100;
      const value = deal.value || 0;
      
      // Conservative: Only high probability deals (>75%)
      if (winProb > 0.75) {
        forecasts.conservative += value * winProb;
        forecasts.breakdown.high += value;
      }
      
      // Likely: All deals weighted by probability
      forecasts.likely += value * winProb;
      
      if (winProb > 0.60) forecasts.breakdown.medium += value;
      else forecasts.breakdown.low += value;
      
      // Optimistic: All deals at 90% of full value
      forecasts.optimistic += value * 0.90;
    });
    
    return {
      conservative: Math.round(forecasts.conservative),
      likely: Math.round(forecasts.likely),
      optimistic: Math.round(forecasts.optimistic),
      breakdown: forecasts.breakdown
    };
  },

  // Team performance analytics
  analyzeTeamPerformance: (deals, userId) => {
    const userDeals = deals.filter(d => d.assignedTo === userId);
    const totalDeals = userDeals.length;
    const wonDeals = userDeals.filter(d => d.stage === 'won').length;
    const lostDeals = userDeals.filter(d => d.stage === 'lost').length;
    const activeDeals = userDeals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
    
    const totalValue = userDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonValue = userDeals.filter(d => d.stage === 'won').reduce((sum, d) => sum + (d.value || 0), 0);
    
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    const winRate = totalDeals > 0 ? (wonDeals / (wonDeals + lostDeals)) * 100 : 0;
    
    // Calculate average time to close
    const closedDeals = userDeals.filter(d => d.stage === 'won' && d.createdAt && d.closedAt);
    const avgDaysToClose = closedDeals.length > 0
      ? closedDeals.reduce((sum, d) => {
          const days = Math.floor((d.closedAt.seconds - d.createdAt.seconds) / (60 * 60 * 24));
          return sum + days;
        }, 0) / closedDeals.length
      : 0;
    
    return {
      totalDeals,
      wonDeals,
      lostDeals,
      activeDeals,
      totalValue: Math.round(totalValue),
      wonValue: Math.round(wonValue),
      avgDealSize: Math.round(avgDealSize),
      winRate: Math.round(winRate),
      avgDaysToClose: Math.round(avgDaysToClose),
      pipelineHealth: activeDeals > 0 
        ? userDeals.filter(d => d.stage !== 'won' && d.stage !== 'lost')
            .reduce((sum, d) => sum + AIService.calculateDealHealth(d), 0) / activeDeals
        : 0
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PIPELINE STAGES CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_STAGES = [
  { id: 'new', title: 'New Leads', icon: UserPlus, color: 'gray' },
  { id: 'contacted', title: 'Contacted', icon: Phone, color: 'blue' },
  { id: 'qualified', title: 'Qualified', icon: CheckCircle, color: 'purple' },
  { id: 'proposal', title: 'Proposal Sent', icon: FileText, color: 'yellow' },
  { id: 'negotiation', title: 'Negotiation', icon: MessageSquare, color: 'orange' },
  { id: 'won', title: 'Won', icon: Trophy, color: 'green' },
  { id: 'lost', title: 'Lost', icon: XCircle, color: 'red' }
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PIPELINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Pipeline = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // ===== STATE MANAGEMENT =====
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI States
  const [viewMode, setViewMode] = useState('kanban'); // kanban, list, analytics
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showAICoach, setShowAICoach] = useState(false);
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const [selectedDealForEmail, setSelectedDealForEmail] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterAssignedTo, setFilterAssignedTo] = useState('all');
  const [filterValue, setFilterValue] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pipeline Configuration
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [customStagesEnabled, setCustomStagesEnabled] = useState(false);
  
  // Form State for Add/Edit Deal
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    stage: 'new',
    value: '',
    product: '',
    source: '',
    leadScore: 5,
    urgencyLevel: 'medium',
    currentScore: '',
    goalScore: '',
    negativeItems: '',
    hasDecisionMaker: false,
    budgetConfirmed: false,
    budgetRange: '',
    competitorMentioned: false,
    competitors: '',
    painPoints: [],
    notes: '',
    engagementLevel: 'medium',
    responseTime: 'medium'
  });
  
  // ===== FIREBASE REAL-TIME LISTENER =====
  useEffect(() => {
    if (!currentUser) {
      console.log('⚠️ No user authenticated');
      setLoading(false);
      return;
    }
    
    console.log('📊 Setting up Pipeline real-time listener...');
    
    try {
      const q = query(
        collection(db, 'deals'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const dealsData = [];
        snapshot.forEach((doc) => {
          dealsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`✅ Loaded ${dealsData.length} deals from Pipeline`);
        setDeals(dealsData);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error('❌ Error loading deals:', err);
        setError('Failed to load pipeline data');
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error('❌ Error setting up listener:', err);
      setError('Failed to initialize pipeline');
      setLoading(false);
    }
  }, [currentUser]);
  
  // ===== FILTERED AND SORTED DEALS =====
  const filteredDeals = useMemo(() => {
    let filtered = [...deals];
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.name?.toLowerCase().includes(search) ||
        deal.email?.toLowerCase().includes(search) ||
        deal.company?.toLowerCase().includes(search) ||
        deal.phone?.includes(search)
      );
    }
    
    // Stage filter
    if (filterStage !== 'all') {
      filtered = filtered.filter(deal => deal.stage === filterStage);
    }
    
    // Assigned to filter
    if (filterAssignedTo !== 'all') {
      if (filterAssignedTo === 'me') {
        filtered = filtered.filter(deal => deal.assignedTo === currentUser.uid);
      } else if (filterAssignedTo === 'unassigned') {
        filtered = filtered.filter(deal => !deal.assignedTo);
      }
    }
    
    // Value filter
    if (filterValue !== 'all') {
      if (filterValue === 'high') {
        filtered = filtered.filter(deal => (deal.value || 0) >= 3000);
      } else if (filterValue === 'medium') {
        filtered = filtered.filter(deal => (deal.value || 0) >= 1000 && (deal.value || 0) < 3000);
      } else if (filterValue === 'low') {
        filtered = filtered.filter(deal => (deal.value || 0) < 1000);
      }
    }
    
    // Health filter
    if (filterHealth !== 'all') {
      filtered = filtered.filter(deal => {
        const health = AIService.calculateDealHealth(deal);
        if (filterHealth === 'excellent') return health >= 80;
        if (filterHealth === 'good') return health >= 60 && health < 80;
        if (filterHealth === 'poor') return health < 60;
        return true;
      });
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let compareA, compareB;
      
      switch (sortBy) {
        case 'created':
          compareA = a.createdAt?.seconds || 0;
          compareB = b.createdAt?.seconds || 0;
          break;
        case 'value':
          compareA = a.value || 0;
          compareB = b.value || 0;
          break;
        case 'health':
          compareA = AIService.calculateDealHealth(a);
          compareB = AIService.calculateDealHealth(b);
          break;
        case 'probability':
          compareA = AIService.calculateWinProbability(a);
          compareB = AIService.calculateWinProbability(b);
          break;
        case 'score':
          compareA = AIService.calculateDealScore(a);
          compareB = AIService.calculateDealScore(b);
          break;
        default:
          compareA = a.name || '';
          compareB = b.name || '';
      }
      
      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
    
    return filtered;
  }, [deals, searchTerm, filterStage, filterAssignedTo, filterValue, filterHealth, sortBy, sortOrder, currentUser]);
  
  // ===== GET DEALS FOR SPECIFIC STAGE =====
  const getDealsForStage = useCallback((stageId) => {
    return filteredDeals.filter(deal => deal.stage === stageId);
  }, [filteredDeals]);
  
  // ===== PIPELINE STATISTICS =====
  const stats = useMemo(() => {
    const totalDeals = filteredDeals.length;
    const totalValue = filteredDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonDeals = filteredDeals.filter(d => d.stage === 'won');
    const lostDeals = filteredDeals.filter(d => d.stage === 'lost');
    const activeDeals = filteredDeals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
    
    const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const activeValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    
    const avgHealth = activeDeals.length > 0
      ? activeDeals.reduce((sum, d) => sum + AIService.calculateDealHealth(d), 0) / activeDeals.length
      : 0;
    
    const avgWinProb = activeDeals.length > 0
      ? activeDeals.reduce((sum, d) => sum + AIService.calculateWinProbability(d), 0) / activeDeals.length
      : 0;
    
    const conversionRate = (wonDeals.length + lostDeals.length) > 0
      ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
      : 0;
    
    const forecast = AIService.forecastRevenue(activeDeals);
    
    return {
      totalDeals,
      totalValue,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      activeDeals: activeDeals.length,
      wonValue,
      activeValue,
      avgHealth,
      avgWinProb,
      conversionRate,
      forecast
    };
  }, [filteredDeals]);
  
  // ===== DEAL FORM HANDLERS =====
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAddPainPoint = () => {
    const point = prompt('Enter pain point:');
    if (point) {
      setFormData(prev => ({
        ...prev,
        painPoints: [...(prev.painPoints || []), point]
      }));
    }
  };
  
  const handleRemovePainPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      painPoints: prev.painPoints.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmitDeal = async (e) => {
    e.preventDefault();
    
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        leadScore: parseInt(formData.leadScore) || 5,
        currentScore: formData.currentScore ? parseInt(formData.currentScore) : null,
        goalScore: formData.goalScore ? parseInt(formData.goalScore) : null,
        negativeItems: formData.negativeItems ? parseInt(formData.negativeItems) : null,
        createdAt: editingDeal ? editingDeal.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
        assignedTo: currentUser.uid,
        createdBy: currentUser.uid,
        lastActivity: serverTimestamp()
      };
      
      if (editingDeal) {
        // Update existing deal
        await updateDoc(doc(db, 'deals', editingDeal.id), dealData);
        console.log('✅ Deal updated:', editingDeal.id);
      } else {
        // Create new deal
        const docRef = await addDoc(collection(db, 'deals'), dealData);
        console.log('✅ Deal created:', docRef.id);
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        stage: 'new',
        value: '',
        product: '',
        source: '',
        leadScore: 5,
        urgencyLevel: 'medium',
        currentScore: '',
        goalScore: '',
        negativeItems: '',
        hasDecisionMaker: false,
        budgetConfirmed: false,
        budgetRange: '',
        competitorMentioned: false,
        competitors: '',
        painPoints: [],
        notes: '',
        engagementLevel: 'medium',
        responseTime: 'medium'
      });
      
      setShowAddDeal(false);
      setEditingDeal(null);
      
    } catch (err) {
      console.error('❌ Error saving deal:', err);
      alert('Failed to save deal. Please try again.');
    }
  };
  
  // ===== DEAL ACTIONS =====
  const handleEditDeal = (deal) => {
    setFormData({
      name: deal.name || '',
      email: deal.email || '',
      phone: deal.phone || '',
      company: deal.company || '',
      stage: deal.stage || 'new',
      value: deal.value || '',
      product: deal.product || '',
      source: deal.source || '',
      leadScore: deal.leadScore || 5,
      urgencyLevel: deal.urgencyLevel || 'medium',
      currentScore: deal.currentScore || '',
      goalScore: deal.goalScore || '',
      negativeItems: deal.negativeItems || '',
      hasDecisionMaker: deal.hasDecisionMaker || false,
      budgetConfirmed: deal.budgetConfirmed || false,
      budgetRange: deal.budgetRange || '',
      competitorMentioned: deal.competitorMentioned || false,
      competitors: deal.competitors || '',
      painPoints: deal.painPoints || [],
      notes: deal.notes || '',
      engagementLevel: deal.engagementLevel || 'medium',
      responseTime: deal.responseTime || 'medium'
    });
    setEditingDeal(deal);
  };
  
  const handleDeleteDeal = async (dealId) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      await deleteDoc(doc(db, 'deals', dealId));
      console.log('✅ Deal deleted:', dealId);
    } catch (err) {
      console.error('❌ Error deleting deal:', err);
      alert('Failed to delete deal. Please try again.');
    }
  };
  
  const handleMoveDeal = async (dealId, newStage) => {
    try {
      const updateData = {
        stage: newStage,
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      };
      
      // If moving to won or lost, add closed date
      if (newStage === 'won' || newStage === 'lost') {
        updateData.closedAt = serverTimestamp();
      }
      
      await updateDoc(doc(db, 'deals', dealId), updateData);
      console.log('✅ Deal moved to:', newStage);
    } catch (err) {
      console.error('❌ Error moving deal:', err);
      alert('Failed to move deal. Please try again.');
    }
  };
  
  const handleToggleSelect = (dealId) => {
    setSelectedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };
  
  const handleBulkAction = async (action) => {
    if (selectedDeals.length === 0) {
      alert('Please select deals first');
      return;
    }
    
    try {
      const batch = writeBatch(db);
      
      selectedDeals.forEach(dealId => {
        const dealRef = doc(db, 'deals', dealId);
        
        switch (action) {
          case 'delete':
            batch.delete(dealRef);
            break;
          case 'won':
          case 'lost':
            batch.update(dealRef, {
              stage: action,
              closedAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
          case 'assign-me':
            batch.update(dealRef, {
              assignedTo: currentUser.uid,
              updatedAt: serverTimestamp()
            });
            break;
          default:
            break;
        }
      });
      
      await batch.commit();
      console.log(`✅ Bulk action completed: ${action} on ${selectedDeals.length} deals`);
      setSelectedDeals([]);
      setShowBulkActions(false);
      
    } catch (err) {
      console.error('❌ Error performing bulk action:', err);
      alert('Failed to perform bulk action. Please try again.');
    }
  };
  
  // ===== EXPORT FUNCTIONALITY =====
  const handleExport = () => {
    const exportData = filteredDeals.map(deal => ({
      Name: deal.name,
      Email: deal.email,
      Phone: deal.phone,
      Company: deal.company,
      Stage: deal.stage,
      Value: deal.value,
      Product: deal.product,
      Source: deal.source,
      'Lead Score': deal.leadScore,
      'Win Probability': `${AIService.calculateWinProbability(deal)}%`,
      'Deal Health': `${AIService.calculateDealHealth(deal)}%`,
      'Created Date': deal.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'
    }));
    
    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  // ===== HELPER FUNCTIONS =====
  const getStageColor = (stageId) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.color || 'gray';
  };
  
  const getHealthColor = (health) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    if (health >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getProbabilityColor = (prob) => {
    if (prob >= 80) return 'text-green-600';
    if (prob >= 60) return 'text-blue-600';
    if (prob >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading pipeline...</p>
        </div>
      </div>
    );
  }
  
  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Pipeline</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER PIPELINE UI
  // ═══════════════════════════════════════════════════════════════════════════
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-blue-600" />
              Sales Pipeline
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                AI-Powered Deal Management
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {stats.totalDeals} total deals • ${stats.totalValue.toLocaleString()} total value
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(searchTerm || filterStage !== 'all' || filterValue !== 'all') && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Active
                </span>
              )}
            </button>
            
            <button
              onClick={() => setShowAICoach(!showAICoach)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center gap-2 shadow-lg"
            >
              <Bot className="w-4 h-4" />
              AI Coach
            </button>
            
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button
              onClick={() => setShowAddDeal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Deal
            </button>
          </div>
        </div>
        
        {/* VIEW MODE SWITCHER */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              viewMode === 'kanban'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            <Columns className="w-4 h-4" />
            Kanban
          </button>
          
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              viewMode === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Deals</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDeals}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ${stats.activeValue.toLocaleString()} value
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Won Deals</span>
              <Trophy className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.wonDeals}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ${stats.wonValue.toLocaleString()} revenue
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.conversionRate.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.wonDeals} of {stats.wonDeals + stats.lostDeals} closed
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Health</span>
              <Heart className="w-4 h-4 text-pink-600" />
            </div>
            <div className={`text-2xl font-bold ${getHealthColor(stats.avgHealth)}`}>
              {stats.avgHealth.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pipeline health score
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Forecast</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">
              ${stats.forecast.likely.toLocaleString()}
            </div>
            <div className="text-xs opacity-75 mt-1">
              Likely revenue (AI)
            </div>
          </div>
        </div>
        
        {/* FILTERS PANEL */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search deals..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stage
                </label>
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="all">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deal Value
                </label>
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="all">All Values</option>
                  <option value="high">High ($3000+)</option>
                  <option value="medium">Medium ($1000-$3000)</option>
                  <option value="low">Low (Under $1000)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health
                </label>
                <select
                  value={filterHealth}
                  onChange={(e) => setFilterHealth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="all">All Health</option>
                  <option value="excellent">Excellent (80%+)</option>
                  <option value="good">Good (60-80%)</option>
                  <option value="poor">Poor (Under 60%)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStage('all');
                    setFilterValue('all');
                    setFilterHealth('all');
                    setFilterAssignedTo('all');
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear Filters
                </button>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredDeals.length} of {deals.length} deals
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* KANBAN VIEW */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageDeals = getDealsForStage(stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            const StageIcon = stage.icon;
            
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
              >
                {/* Stage Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <StageIcon className={`w-5 h-5 text-${stage.color}-600`} />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {stage.title}
                    </h3>
                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ${stageValue.toLocaleString()}
                  </span>
                </div>
                
                {/* Deals List */}
                <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <StageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No deals in this stage</p>
                    </div>
                  ) : (
                    stageDeals.map(deal => {
                      const health = AIService.calculateDealHealth(deal);
                      const winProb = AIService.calculateWinProbability(deal);
                      const nextAction = AIService.getNextBestAction(deal);
                      
                      return (
                        <div
                          key={deal.id}
                          className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                          onClick={() => setSelectedDeal(deal)}
                        >
                          {/* Deal Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {deal.name}
                              </h4>
                              {deal.company && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {deal.company}
                                </p>
                              )}
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSelect(deal.id);
                              }}
                              className={`p-1 rounded ${
                                selectedDeals.includes(deal.id)
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              {selectedDeals.includes(deal.id) ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          
                          {/* Deal Value */}
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-green-600">
                              ${(deal.value || 0).toLocaleString()}
                            </span>
                          </div>
                          
                          {/* AI Metrics */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Win Prob
                              </div>
                              <div className={`text-sm font-bold ${getProbabilityColor(winProb)}`}>
                                {winProb}%
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Health
                              </div>
                              <div className={`text-sm font-bold ${getHealthColor(health)}`}>
                                {health.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          
                          {/* Next Best Action */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Bot className="w-3 h-3 text-blue-600" />
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                AI Suggestion:
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                              {nextAction.action}
                            </p>
                          </div>
                          
                          {/* Deal Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDeal(deal);
                              }}
                              className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDealForEmail(deal);
                                setShowEmailGenerator(true);
                              }}
                              className="flex-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center gap-1"
                            >
                              <Mail className="w-3 h-3" />
                              Email
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* LIST VIEW */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Bulk Actions Bar */}
          {selectedDeals.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {selectedDeals.length} deals selected
                </span>
                
                <button
                  onClick={() => handleBulkAction('assign-me')}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Assign to Me
                </button>
                
                <button
                  onClick={() => handleBulkAction('won')}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Won
                </button>
                
                <button
                  onClick={() => handleBulkAction('lost')}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Mark Lost
                </button>
                
                <button
                  onClick={() => {
                    if (confirm(`Delete ${selectedDeals.length} deals?`)) {
                      handleBulkAction('delete');
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
              
              <button
                onClick={() => setSelectedDeals([])}
                className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {/* Table Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="col-span-3">Deal / Contact</div>
              <div className="col-span-2">Stage</div>
              <div className="col-span-1">Value</div>
              <div className="col-span-2">AI Metrics</div>
              <div className="col-span-3">Next Action</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredDeals.length === 0 ? (
              <div className="text-center py-12">
                <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No deals found</p>
                <button
                  onClick={() => setShowAddDeal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Your First Deal
                </button>
              </div>
            ) : (
              filteredDeals.map(deal => {
                const health = AIService.calculateDealHealth(deal);
                const winProb = AIService.calculateWinProbability(deal);
                const nextAction = AIService.getNextBestAction(deal);
                const stage = stages.find(s => s.id === deal.stage);
                const StageIcon = stage?.icon || Circle;
                
                return (
                  <div
                    key={deal.id}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Deal / Contact */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedDeals.includes(deal.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleSelect(deal.id);
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {deal.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {deal.email || deal.phone || 'No contact info'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stage */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <StageIcon className={`w-4 h-4 text-${stage?.color}-600`} />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {stage?.title || deal.stage}
                          </span>
                        </div>
                      </div>
                      
                      {/* Value */}
                      <div className="col-span-1">
                        <span className="text-sm font-semibold text-green-600">
                          ${(deal.value || 0).toLocaleString()}
                        </span>
                      </div>
                      
                      {/* AI Metrics */}
                      <div className="col-span-2">
                        <div className="flex gap-3">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Win</div>
                            <div className={`text-sm font-bold ${getProbabilityColor(winProb)}`}>
                              {winProb}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Health</div>
                            <div className={`text-sm font-bold ${getHealthColor(health)}`}>
                              {health.toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Next Action */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{nextAction.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {nextAction.action}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDeal(deal);
                            }}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDealForEmail(deal);
                              setShowEmailGenerator(true);
                            }}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ANALYTICS VIEW */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Revenue Forecast */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              AI Revenue Forecast
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-sm opacity-90 mb-1">Conservative</div>
                <div className="text-2xl font-bold">
                  ${stats.forecast.conservative.toLocaleString()}
                </div>
                <div className="text-xs opacity-75 mt-1">75%+ probability</div>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-sm opacity-90 mb-1">Likely</div>
                <div className="text-3xl font-bold">
                  ${stats.forecast.likely.toLocaleString()}
                </div>
                <div className="text-xs opacity-75 mt-1">Weighted average</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-sm opacity-90 mb-1">Optimistic</div>
                <div className="text-2xl font-bold">
                  ${stats.forecast.optimistic.toLocaleString()}
                </div>
                <div className="text-xs opacity-75 mt-1">90% of full value</div>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Performance Metrics
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Deal Health</span>
                    <span className={`text-lg font-bold ${getHealthColor(stats.avgHealth)}`}>
                      {stats.avgHealth.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stats.avgHealth >= 80 ? 'bg-green-500' :
                        stats.avgHealth >= 60 ? 'bg-yellow-500' :
                        stats.avgHealth >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      } transition-all`}
                      style={{ width: `${stats.avgHealth}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Win Probability</span>
                    <span className="text-lg font-bold text-blue-600">
                      {stats.avgWinProb.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${stats.avgWinProb}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {stats.conversionRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500 transition-all"
                      style={{ width: `${stats.conversionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Stage Analysis
              </h3>
              
              <div className="space-y-2">
                {stages.filter(s => !['won', 'lost'].includes(s.id)).map(stage => {
                  const stageDeals = getDealsForStage(stage.id);
                  const avgHealth = stageDeals.length > 0
                    ? stageDeals.reduce((sum, d) => sum + AIService.calculateDealHealth(d), 0) / stageDeals.length
                    : 0;
                  const StageIcon = stage.icon;
                  
                  return (
                    <div key={stage.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="flex items-center gap-2">
                        <StageIcon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">{stage.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{stageDeals.length} deals</span>
                        <span className={`text-xs font-bold ${getHealthColor(avgHealth)}`}>
                          {avgHealth.toFixed(0)}% health
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* AI COACH MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      
      {showAICoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="h-6 w-6" />
                AI Sales Coach
              </h2>
              <button
                onClick={() => setShowAICoach(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Top Priority Deals */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Urgent Actions Needed
                </h3>
                
                <div className="space-y-3">
                  {filteredDeals
                    .filter(d => d.stage !== 'won' && d.stage !== 'lost')
                    .map(deal => ({
                      deal,
                      health: AIService.calculateDealHealth(deal),
                      action: AIService.getNextBestAction(deal)
                    }))
                    .sort((a, b) => a.health - b.health)
                    .slice(0, 5)
                    .map(({ deal, health, action }) => (
                      <div key={deal.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{deal.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{deal.company}</p>
                          </div>
                          <span className={`text-sm font-bold ${getHealthColor(health)}`}>
                            {health.toFixed(0)}% health
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded p-3 mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{action.icon}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Recommended Action:
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{action.action}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Reason: {action.reason}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              setShowAICoach(false);
                              handleEditDeal(deal);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                          >
                            Take Action
                          </button>
                          <button
                            onClick={() => {
                              setShowAICoach(false);
                              setSelectedDealForEmail(deal);
                              setShowEmailGenerator(true);
                            }}
                            className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
                          >
                            Send Email
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Pipeline Insights */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Pipeline Insights
                </h3>
                
                <div className="space-y-3">
                  {/* Stale Deals Warning */}
                  {filteredDeals.filter(d => {
                    const ageInDays = d.createdAt?.seconds 
                      ? Math.floor((Date.now() - d.createdAt.seconds * 1000) / (1000 * 60 * 60 * 24))
                      : 0;
                    return ageInDays > 30 && d.stage !== 'won' && d.stage !== 'lost';
                  }).length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold text-gray-900 dark:text-white">Stale Deals Alert</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        You have {filteredDeals.filter(d => {
                          const ageInDays = d.createdAt?.seconds 
                            ? Math.floor((Date.now() - d.createdAt.seconds * 1000) / (1000 * 60 * 60 * 24))
                            : 0;
                          return ageInDays > 30 && d.stage !== 'won' && d.stage !== 'lost';
                        }).length} deals older than 30 days. Consider reaching out or moving them to lost.
                      </p>
                    </div>
                  )}

                  {/* Low Win Rate Warning */}
                  {stats.conversionRate < 30 && (stats.wonDeals + stats.lostDeals) > 5 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold text-gray-900 dark:text-white">Win Rate Below Target</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Your win rate is {stats.conversionRate.toFixed(0)}%. Focus on deal quality and better qualification to improve conversions.
                      </p>
                    </div>
                  )}

                  {/* Positive Performance */}
                  {stats.conversionRate >= 50 && (stats.wonDeals + stats.lostDeals) > 5 && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-900 dark:text-white">Great Performance!</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Your {stats.conversionRate.toFixed(0)}% win rate is excellent! Keep up the great work and continue focusing on high-quality leads.
                      </p>
                    </div>
                  )}

                  {/* Pipeline Value Insight */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">Pipeline Value</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      You have ${stats.activeValue.toLocaleString()} in active deals. Based on AI analysis, you're likely to close ${stats.forecast.likely.toLocaleString()} this period.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* EMAIL GENERATOR MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      
      {showEmailGenerator && selectedDealForEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                AI Email Generator
              </h2>
              <button
                onClick={() => {
                  setShowEmailGenerator(false);
                  setSelectedDealForEmail(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Generating email for:</div>
                <div className="font-semibold text-lg">{selectedDealForEmail.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{selectedDealForEmail.email}</div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['initial', 'followup', 'proposal', 'closing', 'negotiation', 'reengagement'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const email = AIService.generateEmail(selectedDealForEmail, type);
                        navigator.clipboard.writeText(email);
                        alert(`${type} email copied to clipboard!`);
                      }}
                      className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 text-sm font-medium capitalize"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview:
                </label>
                <textarea
                  value={AIService.generateEmail(selectedDealForEmail, 'followup')}
                  readOnly
                  rows="12"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const email = AIService.generateEmail(selectedDealForEmail, 'followup');
                    navigator.clipboard.writeText(email);
                    alert('Email copied to clipboard!');
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    window.location.href = `mailto:${selectedDealForEmail.email}?subject=Credit Repair&body=${encodeURIComponent(AIService.generateEmail(selectedDealForEmail, 'followup'))}`;
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Open in Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ADD/EDIT DEAL MODAL - COMPLETE FORM */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      
      {(showAddDeal || editingDeal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {editingDeal ? (
                  <>
                    <Edit2 className="w-5 h-5 text-blue-600" />
                    Edit Deal
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-green-600" />
                    Add New Deal
                  </>
                )}
              </h2>
              <button
                onClick={() => {
                  setShowAddDeal(false);
                  setEditingDeal(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    stage: 'new',
                    value: '',
                    product: '',
                    source: '',
                    leadScore: 5,
                    urgencyLevel: 'medium',
                    currentScore: '',
                    goalScore: '',
                    negativeItems: '',
                    hasDecisionMaker: false,
                    budgetConfirmed: false,
                    budgetRange: '',
                    competitorMentioned: false,
                    competitors: '',
                    painPoints: [],
                    notes: '',
                    engagementLevel: 'medium',
                    responseTime: 'medium'
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDeal} className="p-6">
              {/* ===== SECTION 1: BASIC INFO ===== */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <User className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleFormChange('company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>
              </div>

              {/* ===== SECTION 2: DEAL INFO ===== */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Deal Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pipeline Stage *
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => handleFormChange('stage', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {stages.filter(s => !['won', 'lost'].includes(s.id)).map(stage => (
                        <option key={stage.id} value={stage.id}>{stage.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deal Value ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => handleFormChange('value', e.target.value)}
                      required
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="1500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product/Service
                    </label>
                    <select
                      value={formData.product}
                      onChange={(e) => handleFormChange('product', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Product...</option>
                      <option value="diy">DIY ($39/mo)</option>
                      <option value="standard">Standard ($149/mo)</option>
                      <option value="acceleration">Acceleration ($199/mo)</option>
                      <option value="pfd">Pay for Delete ($0)</option>
                      <option value="hybrid">Hybrid ($99/mo)</option>
                      <option value="premium">Premium ($349/mo)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lead Source
                    </label>
                    <select
                      value={formData.source}
                      onChange={(e) => handleFormChange('source', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Source...</option>
                      <option value="website">Website Form</option>
                      <option value="phone">Phone Call</option>
                      <option value="referral">Referral</option>
                      <option value="social">Social Media</option>
                      <option value="email">Email Campaign</option>
                      <option value="paid">Paid Advertising</option>
                      <option value="organic">Organic Search</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ===== SECTION 3: CREDIT INFO ===== */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Credit Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Credit Score
                    </label>
                    <input
                      type="number"
                      value={formData.currentScore}
                      onChange={(e) => handleFormChange('currentScore', e.target.value)}
                      min="300"
                      max="850"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="620"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Goal Credit Score
                    </label>
                    <input
                      type="number"
                      value={formData.goalScore}
                      onChange={(e) => handleFormChange('goalScore', e.target.value)}
                      min="300"
                      max="850"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="720"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Negative Items Count
                    </label>
                    <input
                      type="number"
                      value={formData.negativeItems}
                      onChange={(e) => handleFormChange('negativeItems', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              {/* ===== SECTION 4: DEAL QUALIFICATION ===== */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <Target className="w-5 h-5 text-orange-600" />
                  Deal Qualification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lead Score (1-10)
                    </label>
                    <input
                      type="range"
                      value={formData.leadScore}
                      onChange={(e) => handleFormChange('leadScore', e.target.value)}
                      min="1"
                      max="10"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span>Cold (1)</span>
                      <span className="font-bold text-blue-600">{formData.leadScore}</span>
                      <span>Hot (10)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Urgency Level
                    </label>
                    <select
                      value={formData.urgencyLevel}
                      onChange={(e) => handleFormChange('urgencyLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low - No rush</option>
                      <option value="medium">Medium - Normal timeline</option>
                      <option value="high">High - Need solution soon</option>
                      <option value="critical">Critical - Immediate need</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Engagement Level
                    </label>
                    <select
                      value={formData.engagementLevel}
                      onChange={(e) => handleFormChange('engagementLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low - Minimal interest</option>
                      <option value="medium">Medium - Interested</option>
                      <option value="high">High - Very engaged</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Response Time
                    </label>
                    <select
                      value={formData.responseTime}
                      onChange={(e) => handleFormChange('responseTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="fast">Fast - Responds quickly</option>
                      <option value="medium">Medium - Normal response</option>
                      <option value="slow">Slow - Takes time to respond</option>
                    </select>
                  </div>
                </div>
                
                {/* Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasDecisionMaker}
                      onChange={(e) => handleFormChange('hasDecisionMaker', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Speaking with decision maker
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.budgetConfirmed}
                      onChange={(e) => handleFormChange('budgetConfirmed', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Budget confirmed
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.competitorMentioned}
                      onChange={(e) => handleFormChange('competitorMentioned', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Competitor mentioned
                    </span>
                  </label>
                </div>
                
                {/* Budget Range */}
                {formData.budgetConfirmed && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Budget Alignment
                    </label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => handleFormChange('budgetRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Budget Range...</option>
                      <option value="below">Below our pricing</option>
                      <option value="aligned">Aligned with our pricing</option>
                      <option value="above">Above our pricing</option>
                    </select>
                  </div>
                )}
                
                {/* Competitors */}
                {formData.competitorMentioned && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Competitors Being Considered
                    </label>
                    <input
                      type="text"
                      value={formData.competitors}
                      onChange={(e) => handleFormChange('competitors', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., LexingtonLaw, CreditRepair.com"
                    />
                  </div>
                )}
              </div>

              {/* ===== SECTION 5: PAIN POINTS & NOTES ===== */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Pain Points & Notes
                </h3>
                
                {/* Pain Points */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pain Points
                  </label>
                  
                  <div className="space-y-2 mb-2">
                    {formData.painPoints.map((point, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                        <span className="flex-1 text-sm text-gray-900 dark:text-white">{point}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePainPoint(index)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAddPainPoint}
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 text-sm font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Pain Point
                  </button>
                </div>
                
                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional information about this deal..."
                  />
                </div>
              </div>

              {/* ===== FORM ACTIONS ===== */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDeal(false);
                    setEditingDeal(null);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      company: '',
                      stage: 'new',
                      value: '',
                      product: '',
                      source: '',
                      leadScore: 5,
                      urgencyLevel: 'medium',
                      currentScore: '',
                      goalScore: '',
                      negativeItems: '',
                      hasDecisionMaker: false,
                      budgetConfirmed: false,
                      budgetRange: '',
                      competitorMentioned: false,
                      competitors: '',
                      painPoints: [],
                      notes: '',
                      engagementLevel: 'medium',
                      responseTime: 'medium'
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingDeal ? 'Update Deal' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* DEAL DETAIL MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      
      {selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-3 text-white">
                <User className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">{selectedDeal.name}</h2>
                  <p className="text-sm opacity-90">{selectedDeal.company || selectedDeal.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* AI Insights */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-6 border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  AI Insights
                </h3>
                
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-white dark:bg-gray-800 rounded p-3 text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Win Probability</div>
                    <div className={`text-2xl font-bold ${getProbabilityColor(AIService.calculateWinProbability(selectedDeal))}`}>
                      {AIService.calculateWinProbability(selectedDeal)}%
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded p-3 text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Deal Health</div>
                    <div className={`text-2xl font-bold ${getHealthColor(AIService.calculateDealHealth(selectedDeal))}`}>
                      {AIService.calculateDealHealth(selectedDeal).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded p-3 text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Deal Score</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {AIService.calculateDealScore(selectedDeal)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Next Best Action:</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {AIService.getNextBestAction(selectedDeal).action}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {AIService.getNextBestAction(selectedDeal).reason}
                  </p>
                </div>
              </div>

              {/* Deal Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDeal.email || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Phone</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDeal.phone || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Deal Value</label>
                  <p className="text-sm font-medium text-green-600">${(selectedDeal.value || 0).toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Stage</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{selectedDeal.stage}</p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Product</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {selectedDeal.product?.replace(/-/g, ' ') || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Source</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{selectedDeal.source || 'N/A'}</p>
                </div>
              </div>

              {/* Credit Information */}
              {(selectedDeal.currentScore || selectedDeal.goalScore) && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Credit Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedDeal.currentScore && (
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Current Score</label>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedDeal.currentScore}</p>
                      </div>
                    )}
                    
                    {selectedDeal.goalScore && (
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Goal Score</label>
                        <p className="text-lg font-bold text-green-600">{selectedDeal.goalScore}</p>
                      </div>
                    )}
                    
                    {selectedDeal.negativeItems && (
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Negative Items</label>
                        <p className="text-lg font-bold text-red-600">{selectedDeal.negativeItems}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pain Points */}
              {selectedDeal.painPoints && selectedDeal.painPoints.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Pain Points</h3>
                  <ul className="space-y-2">
                    {selectedDeal.painPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              {selectedDeal.notes && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedDeal.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedDeal(null);
                    handleEditDeal(selectedDeal);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Deal
                </button>
                
                <button
                  onClick={() => {
                    setSelectedDeal(null);
                    setSelectedDealForEmail(selectedDeal);
                    setShowEmailGenerator(true);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Generate Email
                </button>
                
                <button
                  onClick={() => {
                    if (confirm(`Delete deal for ${selectedDeal.name}?`)) {
                      handleDeleteDeal(selectedDeal.id);
                      setSelectedDeal(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline;
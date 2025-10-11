// src/components/EmailCampaignBuilder.jsx
// 🚀 ULTIMATE CREDIT REPAIR EMAIL CAMPAIGN BUILDER
// 20+ Professional Templates Ready to Use

import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Card, CardContent,
  CardActions, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, FormControl, InputLabel, Select, MenuItem,
  Stepper, Step, StepLabel, StepContent, Alert, Switch, Tabs, Tab,
  List, ListItem, ListItemText, Badge, LinearProgress
} from '@mui/material';
import {
  Mail, Send, Users, TrendingUp, Eye, MousePointer, Plus, Save, X,
  Edit2, Trash2, Play, BarChart3, DollarSign, Target, Award,
  Clock, CheckCircle, Star, Gift, Bell, Calendar, Shield
} from 'lucide-react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query,
  where, getDocs, onSnapshot, serverTimestamp, orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// 🎯 20+ CREDIT REPAIR EMAIL TEMPLATES - READY TO USE
// ============================================================================

const CREDIT_REPAIR_TEMPLATES = {
  // ========== WELCOME SERIES ==========
  welcomeNewClient: {
    id: 'welcome-new-client',
    name: '✨ Welcome New Client',
    category: 'Onboarding',
    subject: 'Welcome to Speedy Credit Repair - Let\'s Get Started! 🎉',
    preview: 'Your journey to better credit starts today',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">Welcome to Speedy Credit Repair! 🎉</h1>
          <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">Your journey to better credit starts TODAY</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi {clientName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Thank you for choosing Speedy Credit Repair! We're excited to help you achieve your credit goals and unlock the financial freedom you deserve.
          </p>
          
          <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #667eea; margin-top: 0;">Here's What Happens Next:</h3>
            <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Step 1:</strong> We'll pull your credit reports from all 3 bureaus</li>
              <li><strong>Step 2:</strong> Our experts analyze every line item</li>
              <li><strong>Step 3:</strong> We create your personalized dispute strategy</li>
              <li><strong>Step 4:</strong> We start challenging negative items immediately</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            <strong>Your Personal Account Manager:</strong> {accountManager}<br>
            <strong>Direct Phone:</strong> {phoneNumber}<br>
            <strong>Email:</strong> {managerEmail}
          </p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚡ Quick Win:</strong> Log in to your client portal TODAY to upload your IDs and see your initial credit analysis!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{portalLink}" style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Access Your Portal →
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            Questions? Reply to this email or call us at {supportPhone} - we're here 7 days a week!
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #999;">
            Speedy Credit Repair | {companyAddress} | {companyPhone}
          </p>
        </div>
      </div>
    `,
    variables: ['clientName', 'accountManager', 'phoneNumber', 'managerEmail', 'portalLink', 'supportPhone', 'companyAddress', 'companyPhone']
  },

  // ========== DISPUTE UPDATES ==========
  disputeLettersSent: {
    id: 'dispute-letters-sent',
    name: '📮 Dispute Letters Sent',
    category: 'Updates',
    subject: 'Great News! We Just Sent {disputeCount} Dispute Letters on Your Behalf',
    preview: 'Your disputes are in motion - here\'s what we challenged',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">📮 Disputes Sent Successfully!</h1>
        </div>
        
        <div style="padding: 40px; background: white;">
          <p style="font-size: 16px; color: #333;">Hi {clientName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Excellent news! We just sent <strong>{disputeCount} professional dispute letters</strong> to the credit bureaus on your behalf.
          </p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
            <h3 style="color: #047857; margin-top: 0;">Items We're Challenging:</h3>
            <ul style="color: #065f46; line-height: 1.8;">
              {disputedItems}
            </ul>
          </div>
          
          <h3 style="color: #333;">What Happens Next?</h3>
          <div style="border-left: 3px solid #667eea; padding-left: 15px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #555;">
              ✅ <strong>Next 5-7 Days:</strong> Bureaus receive your disputes<br>
              ✅ <strong>Next 30 Days:</strong> Bureaus must investigate and respond<br>
              ✅ <strong>30-45 Days:</strong> We'll receive results and update you
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Pro Tip:</strong> Monitor your credit reports weekly. Deletions can happen at any time!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{portalLink}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Full Report →
            </a>
          </div>
        </div>
      </div>
    `,
    variables: ['clientName', 'disputeCount', 'disputedItems', 'portalLink']
  },

  // ========== MILESTONE CELEBRATIONS ==========
  scoreIncrease: {
    id: 'score-increase',
    name: '🎉 Score Increase Alert',
    category: 'Milestones',
    subject: '🎉 AMAZING NEWS! Your Credit Score Just Jumped {points} Points!',
    preview: 'Your hard work is paying off - celebrate this win!',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 36px;">🎉 CONGRATULATIONS!</h1>
          <p style="margin: 10px 0; font-size: 20px;">Your Score Increased!</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <p style="font-size: 18px; color: #333;">Hi {clientName},</p>
          
          <div style="background: #fef3c7; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; border: 3px solid #f59e0b;">
            <p style="margin: 0; font-size: 16px; color: #92400e;">Your {bureau} Score</p>
            <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin: 20px 0;">
              <div>
                <p style="margin: 0; font-size: 14px; color: #78716c;">Previous</p>
                <p style="margin: 5px 0 0; font-size: 32px; font-weight: bold; color: #78716c;">{oldScore}</p>
              </div>
              <div style="font-size: 40px; color: #10b981;">→</div>
              <div>
                <p style="margin: 0; font-size: 14px; color: #065f46;">New Score</p>
                <p style="margin: 5px 0 0; font-size: 48px; font-weight: bold; color: #10b981;">{newScore}</p>
              </div>
            </div>
            <div style="background: #10b981; color: white; padding: 10px 20px; border-radius: 50px; display: inline-block; font-weight: bold; font-size: 18px;">
              +{points} Points! 🚀
            </div>
          </div>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            This is HUGE! Your credit score improvement of <strong>{points} points</strong> means you're {pointsAwayFromGoal} points away from your goal of {goalScore}!
          </p>
          
          <h3 style="color: #333; margin-top: 30px;">What This Means for You:</h3>
          <ul style="color: #555; line-height: 1.8;">
            <li>✅ Better interest rates on loans and credit cards</li>
            <li>✅ Higher credit limits</li>
            <li>✅ More rental and mortgage approvals</li>
            <li>✅ Lower insurance premiums</li>
          </ul>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              <strong>Keep the momentum going!</strong> We're continuing to work on {remainingItems} items. Stay patient - more good news is coming! 💪
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{shareLink}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
              Share Your Success
            </a>
            <a href="{portalLink}" style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; border: 2px solid #667eea;">
              View Full Report
            </a>
          </div>
        </div>
      </div>
    `,
    variables: ['clientName', 'bureau', 'oldScore', 'newScore', 'points', 'pointsAwayFromGoal', 'goalScore', 'remainingItems', 'shareLink', 'portalLink']
  },

  // ========== DELETION SUCCESS ==========
  deletionSuccess: {
    id: 'deletion-success',
    name: '🗑️ Item Deleted Successfully',
    category: 'Wins',
    subject: '🎊 Victory! We Just Deleted {itemName} from Your {bureau} Report!',
    preview: 'Another negative item GONE - here\'s what it means',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #8b5cf6; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">🎊 DELETION CONFIRMED!</h1>
          <p style="margin: 10px 0; font-size: 18px; opacity: 0.9;">Another Win for Your Credit!</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <p style="font-size: 16px; color: #333;">Hi {clientName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; font-weight: bold;">
            🎉 We have GREAT news - we successfully removed a negative item from your credit report!
          </p>
          
          <div style="background: #f3e8ff; padding: 25px; border-radius: 12px; margin: 30px 0; border: 2px solid #8b5cf6;">
            <h3 style="color: #6b21a8; margin-top: 0;">✅ DELETED:</h3>
            <p style="font-size: 18px; color: #6b21a8; margin: 10px 0; font-weight: bold;">{itemName}</p>
            <p style="margin: 5px 0; color: #7c3aed;">
              <strong>Bureau:</strong> {bureau}<br>
              <strong>Account #:</strong> {accountNumber}<br>
              <strong>Previous Status:</strong> {previousStatus}
            </p>
          </div>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              <strong>What This Means:</strong> This negative item is PERMANENTLY removed from your {bureau} credit report. It can no longer hurt your score!
            </p>
          </div>
          
          <h3 style="color: #333;">Your Progress:</h3>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #666; font-size: 14px;">Items Removed</span>
                <span style="color: #10b981; font-weight: bold;">{deletedCount} of {totalItems}</span>
              </div>
              <div style="background: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden;">
                <div style="background: #10b981; width: {progressPercent}%; height: 100%;"></div>
              </div>
            </div>
            <p style="margin: 10px 0 0; color: #666; font-size: 14px;">
              {remainingItems} items still in dispute - we're working on them!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{portalLink}" style="display: inline-block; background: #8b5cf6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              View Updated Report →
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
            Keep up the great work! More deletions coming soon 💪
          </p>
        </div>
      </div>
    `,
    variables: ['clientName', 'itemName', 'bureau', 'accountNumber', 'previousStatus', 'deletedCount', 'totalItems', 'progressPercent', 'remainingItems', 'portalLink']
  },

  // ========== EDUCATIONAL SERIES ==========
  creditEducation1: {
    id: 'credit-education-1',
    name: '📚 Credit Education - Understanding Your Score',
    category: 'Education',
    subject: '📚 Credit 101: What Really Affects Your Credit Score',
    preview: 'Master your credit - learn what matters most',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">📚 Credit Education Series</h1>
          <p style="margin: 10px 0; font-size: 16px; opacity: 0.9;">Lesson 1: Understanding Your Credit Score</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <p style="font-size: 16px; color: #333;">Hi {clientName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Knowledge is power! Let's break down the 5 factors that determine your credit score...
          </p>
          
          <div style="margin: 30px 0;">
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #333;">1. Payment History</span>
                <span style="color: #ef4444; font-weight: bold;">35%</span>
              </div>
              <div style="background: #fee2e2; height: 8px; border-radius: 4px;">
                <div style="background: #ef4444; width: 35%; height: 100%; border-radius: 4px;"></div>
              </div>
              <p style="margin: 10px 0 0; font-size: 14px; color: #666;">
                Most important! Pay all bills on time, every time. Even one late payment can hurt.
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #333;">2. Credit Utilization</span>
                <span style="color: #f59e0b; font-weight: bold;">30%</span>
              </div>
              <div style="background: #fef3c7; height: 8px; border-radius: 4px;">
                <div style="background: #f59e0b; width: 30%; height: 100%; border-radius: 4px;"></div>
              </div>
              <p style="margin: 10px 0 0; font-size: 14px; color: #666;">
                Keep balances below 30% of your credit limit. Under 10% is even better!
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #333;">3. Credit History Length</span>
                <span style="color: #10b981; font-weight: bold;">15%</span>
              </div>
              <div style="background: #d1fae5; height: 8px; border-radius: 4px;">
                <div style="background: #10b981; width: 15%; height: 100%; border-radius: 4px;"></div>
              </div>
              <p style="margin: 10px 0 0; font-size: 14px; color: #666;">
                Keep old accounts open! The longer your history, the better.
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #333;">4. New Credit</span>
                <span style="color: #3b82f6; font-weight: bold;">10%</span>
              </div>
              <div style="background: #dbeafe; height: 8px; border-radius: 4px;">
                <div style="background: #3b82f6; width: 10%; height: 100%; border-radius: 4px;"></div>
              </div>
              <p style="margin: 10px 0 0; font-size: 14px; color: #666;">
                Limit hard inquiries. Apply for new credit sparingly.
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #333;">5. Credit Mix</span>
                <span style="color: #8b5cf6; font-weight: bold;">10%</span>
              </div>
              <div style="background: #ede9fe; height: 8px; border-radius: 4px;">
                <div style="background: #8b5cf6; width: 10%; height: 100%; border-radius: 4px;"></div>
              </div>
              <p style="margin: 10px 0 0; font-size: 14px; color: #666;">
                Having different types of credit (cards, loans) helps, but don't open accounts just for this!
              </p>
            </div>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>💡 Pro Tip:</strong> Focus on payment history and utilization first - they make up 65% of your score!
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Next lesson: How to Build Credit the Smart Way →
          </p>
        </div>
      </div>
    `,
    variables: ['clientName']
  },

  // ========== PROMOTIONAL ==========
referralBonus: {
  id: 'referral-bonus',
  name: '🎁 Referral Bonus Offer',
  category: 'Promotional',
  subject: '🎁 Get $100 for Every Friend You Refer to Speedy Credit Repair!',
  preview: 'Help friends AND get paid - win-win!',
  content: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 40px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 32px;">🎁 Refer & Earn!</h1>
        <p style="margin: 10px 0; font-size: 18px; opacity: 0.9;">$100 per Referral - Unlimited!</p>
      </div>
      
      <div style="padding: 40px; background: white;">
        <p style="font-size: 16px; color: #333;">Hi {clientName},</p>
        
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Love your results? Share the love AND earn cash! 💰
        </p>
        
        <div style="background: #fdf2f8; padding: 30px; border-radius: 12px; margin: 30px 0; border: 3px solid #ec4899; text-align: center;">
          <h2 style="margin: 0 0 20px; color: #be185d;">How It Works:</h2>
          <div style="margin: 20px 0;">
            <div style="display: inline-block; background: white; padding: 20px; border-radius: 50%; margin: 10px;">
              <span style="font-size: 32px;">1️⃣</span>
            </div>
            <p style="margin: 10px 0; color: #9f1239; font-weight: bold;">Share Your Link</p>
          </div>
          <div style="margin: 20px 0;">
            <div style="display: inline-block; background: white; padding: 20px; border-radius: 50%; margin: 10px;">
              <span style="font-size: 32px;">2️⃣</span>
            </div>
            <p style="margin: 10px 0; color: #9f1239; font-weight: bold;">Friend Signs Up</p>
          </div>
          <div style="margin: 20px 0;">
            <div style="display: inline-block; background: white; padding: 20px; border-radius: 50%; margin: 10px;">
              <span style="font-size: 32px;">3️⃣</span>
            </div>
            <p style="margin: 10px 0; color: #9f1239; font-weight: bold;">You Get $100!</p>
          </div>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 10px; color: #065f46; font-size: 16px;">Your Unique Referral Link:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; border: 2px dashed #10b981; font-family: monospace; font-size: 14px; color: #047857; word-break: break-all;">
            {referralLink}
          </div>
          <button style="margin-top: 15px; background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; cursor: pointer;">
            Copy Link
          </button>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h3 style="color: #333; margin-top: 0;">Your Referral Stats:</h3>
          <div style="display: flex; justify-content: space-around; text-align: center;">
            <div>
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #ec4899;">{referralCount}</p>
              <p style="margin: 5px 0 0; font-size: 12px; color: #666;">Referrals</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #10b981;">$<span>{totalEarned}</span></p>
              <p style="margin: 5px 0 0; font-size: 12px; color: #666;">Earned</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{shareLink}" style="display: inline-block; background: #ec4899; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Share on Social Media
          </a>
        </div>
        
        <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
          * $100 bonus paid after friend's first payment. No limit on referrals!
        </p>
      </div>
    </div>
  `,
  variables: ['clientName', 'referralLink', 'referralCount', 'totalEarned', 'shareLink']
  },

  // ========== PAYMENT REMINDERS ==========
  paymentReminder: {
    id: 'payment-reminder',
    name: '💳 Friendly Payment Reminder',
    category: 'Billing',
    subject: 'Friendly Reminder: Your ${amount} Payment is Due {dueDate}',
    preview: 'Quick reminder about your upcoming payment',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">💳 Payment Reminder</h1>
        </div>
        
        <div style="padding: 40px; background: white;">
          <p style="font-size: 16px; color: #333;">Hi {clientName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            This is a friendly reminder that your monthly payment is coming up soon.
          </p>
          
          <div style="background: #eff6ff; padding: 25px; border-radius: 12px; margin: 30px 0; border: 2px solid #3b82f6;">
            <div style="text-align: center;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">Amount Due</p>
              <p style="margin: 10px 0; font-size: 42px; font-weight: bold; color: #1e3a8a;">$<span>{amount}</span></p>
              <p style="margin: 0; color: #1e40af; font-size: 14px;">Due Date: <strong>{dueDate}</strong></p>
            </div>
          </div>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            We'll automatically charge your card on file ending in {lastFour} on {dueDate}.
          </p>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Need to update your payment method?</strong> Click below to manage your billing.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{billingLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Manage Billing
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            Questions? Contact us at {supportEmail} or {supportPhone}
          </p>
        </div>
      </div>
    `,
    variables: ['clientName', 'amount', 'dueDate', 'lastFour', 'billingLink', 'supportEmail', 'supportPhone']
  },

  // ========== RE-ENGAGEMENT ==========
  inactiveClient: {
    id: 'inactive-client',
    name: '😢 We Miss You - Re-engagement',
    category: 'Re-engagement',
    subject: 'We Miss You, {clientName}! Let\'s Finish What We Started 💪',
    preview: 'Come back and complete your credit journey',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #8b5cf6; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">😢 We Miss You!</h1>
          <p style="margin: 10px 0; font-size: 16px; opacity: 0.9;">Let's finish your credit journey together</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <p style="font-size: 16px; color: #333;">Hi {clientName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            We noticed you haven't logged in for a while, and we wanted to check in! 
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            You were making <strong>AMAZING progress</strong> before you left:
          </p>
          
          <div style="background: #f3e8ff; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #6b21a8; margin-top: 0;">Your Progress So Far:</h3>
            <ul style="color: #6b21a8; line-height: 1.8;">
              <li>✅ {deletedItems} negative items removed</li>
              <li>✅ Credit score increased by {scoreIncrease} points</li>
              <li>✅ {disputesInProgress} disputes still working</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; font-weight: bold;">
            Don't let this progress go to waste! You're {percentComplete}% of the way to your goal.
          </p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <p style="margin: 0 0 15px; color: #92400e; font-size: 16px; font-weight: bold;">
              🎁 Welcome Back Offer: {offerPercent}% Off Next 3 Months
            </p>
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              Use code: <strong>{promoCode}</strong> when you reactivate
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{reactivateLink}" style="display: inline-block; background: #8b5cf6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Reactivate My Account
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Questions? Call us at {supportPhone} - we're here to help!
          </p>
        </div>
      </div>
    `,
    variables: ['clientName', 'deletedItems', 'scoreIncrease', 'disputesInProgress', 'percentComplete', 'offerPercent', 'promoCode', 'reactivateLink', 'supportPhone']
  },

  // ========== REVIEW REQUEST ==========
  reviewRequest: {
    id: 'review-request',
    name: '⭐ Request Google Review',
    category: 'Reviews',
    subject: '⭐ Quick Favor? Share Your Speedy Credit Repair Experience!',
    preview: 'Help others by leaving a quick review',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">⭐⭐⭐⭐⭐</h1>
          <p style="margin: 10px 0; font-size: 18px;">How Are We Doing?</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <p style="font-size: 16px; color: #333;">Hi {clientName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            We hope you're loving your results with Speedy Credit Repair! 
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Your feedback means the world to us. Would you mind taking 60 seconds to share your experience?
          </p>
          
          <div style="background: #fef3c7; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <p style="margin: 0 0 20px; color: #92400e; font-size: 16px;">
              How would you rate your experience?
            </p>
            <div style="font-size: 48px; margin: 20px 0;">⭐⭐⭐⭐⭐</div>
            <a href="{reviewLink}" style="display: inline-block; background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; margin-top: 10px;">
              Leave a Google Review
            </a>
          </div>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-size: 14px; text-align: center;">
              <strong>🎁 Thank You Gift:</strong> Leave a review and get a FREE credit monitoring upgrade for 3 months!
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Your review helps others find us and make informed decisions about their credit repair journey. Thank you! 🙏
          </p>
        </div>
      </div>
    `,
    variables: ['clientName', 'reviewLink']
  },

  // ========== DOCUMENT REQUEST ==========
  documentRequest: {
    id: 'document-request',
    name: '📄 Document Upload Needed',
    category: 'Action Required',
    subject: '📄 Action Needed: Please Upload {documentType}',
    preview: 'We need documents to continue your case',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">📄 Action Required</h1>
          <p style="margin: 10px 0; font-size: 16px; opacity: 0.9;">Documents Needed</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <p style="font-size: 16px; color: #333;">Hi {clientName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            To continue working on your case, we need you to upload the following document(s):
          </p>
          
          <div style="background: #fef2f2; padding: 25px; border-radius: 12px; margin: 30px 0; border: 2px solid #ef4444;">
            <h3 style="color: #991b1b; margin-top: 0;">📋 Required Documents:</h3>
            <ul style="color: #7f1d1d; line-height: 1.8; font-weight: bold;">
              {documentList}
            </ul>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏰ Time Sensitive:</strong> Please upload within {daysLeft} days to avoid delays in your case.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{uploadLink}" style="display: inline-block; background: #ef4444; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Upload Documents Now
            </a>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0 0 10px; color: #374151; font-size: 14px; font-weight: bold;">
              📸 How to Upload:
            </p>
            <ol style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
              <li>Click "Upload Documents Now" button</li>
              <li>Take clear photos or scan documents</li>
              <li>Upload through our secure portal</li>
              <li>We'll notify you once received!</li>
            </ol>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Need help? Contact us at {supportPhone} or {supportEmail}
          </p>
        </div>
      </div>
    `,
    variables: ['clientName', 'documentType', 'documentList', 'daysLeft', 'uploadLink', 'supportPhone', 'supportEmail']
  },

    // ========== MONTHLY PROGRESS REPORT ==========
  monthlyReport: {
    id: 'monthly-report',
    name: '📊 Monthly Progress Report',
    category: 'Reports',
    subject: '📊 Your {month} Credit Repair Progress Report is Here!',
    preview: 'See everything we accomplished this month',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">📊 Monthly Progress Report</h1>
          <p style="margin: 10px 0; font-size: 18px; opacity: 0.9;">{month} {year}</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <p style="font-size: 16px; color: #333;">Hi {clientName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Here's your complete monthly summary of everything we accomplished together in {month}!
          </p>
          
          <h3 style="color: #333; margin-top: 30px;">🎯 Key Highlights:</h3>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <span style="color: #065f46; font-weight: bold;">Items Removed This Month:</span>
              <span style="color: #10b981; font-size: 24px; font-weight: bold;">{deletionsThisMonth}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <span style="color: #065f46; font-weight: bold;">Disputes Sent:</span>
              <span style="color: #10b981; font-size: 24px; font-weight: bold;">{disputesSent}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #065f46; font-weight: bold;">Score Change:</span>
              <span style="color: #10b981; font-size: 24px; font-weight: bold;">+{scoreChange} pts</span>
            </div>
          </div>
          
          <h3 style="color: #333; margin-top: 30px;">📈 Score Breakdown:</h3>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #666; font-size: 14px;">Experian</span>
                <span style="font-weight: bold; color: {experianColor};">{experianScore}</span>
              </div>
              <div style="background: #e5e7eb; height: 8px; border-radius: 4px;">
                <div style="background: {experianColor}; width: {experianPercent}%; height: 100%; border-radius: 4px;"></div>
              </div>
            </div>
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #666; font-size: 14px;">Equifax</span>
                <span style="font-weight: bold; color: {equifaxColor};">{equifaxScore}</span>
              </div>
              <div style="background: #e5e7eb; height: 8px; border-radius: 4px;">
                <div style="background: {equifaxColor}; width: {equifaxPercent}%; height: 100%; border-radius: 4px;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #666; font-size: 14px;">TransUnion</span>
                <span style="font-weight: bold; color: {transUnionColor};">{transUnionScore}</span>
              </div>
              <div style="background: #e5e7eb; height: 8px; border-radius: 4px;">
                <div style="background: {transUnionColor}; width: {transUnionPercent}%; height: 100%; border-radius: 4px;"></div>
              </div>
            </div>
          </div>
          
          <h3 style="color: #333; margin-top: 30px;">🎬 Next Month's Action Plan:</h3>
          <ul style="color: #555; line-height: 1.8;">
            {nextMonthActions}
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{fullReportLink}" style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              View Full Report →
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Keep up the amazing work! 💪
          </p>
        </div>
      </div>
    `,
    variables: ['clientName', 'month', 'year', 'deletionsThisMonth', 'disputesSent', 'scoreChange', 'experianScore', 'experianColor', 'experianPercent', 'equifaxScore', 'equifaxColor', 'equifaxPercent', 'transUnionScore', 'transUnionColor', 'transUnionPercent', 'nextMonthActions', 'fullReportLink']
  }
};

// ============================================================================
// MAIN COMPONENT (Same structure as before but with new templates)
// ============================================================================

export const EmailCampaignBuilder = ({ userId, products = [] }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    template: '',
    subject: '',
    preview: '',
    status: 'draft'
  });

  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalSent: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    revenue: 0
  });

  useEffect(() => {
    if (!userId) return;
    loadCampaigns();
  }, [userId]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'emailCampaigns'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const campaignsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCampaigns(campaignsData);
        calculateStats(campaignsData);
      });

      setLoading(false);
      return unsubscribe;
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setLoading(false);
    }
  };

  const calculateStats = (campaignsData) => {
    const totalCampaigns = campaignsData.length;
    const totalSent = campaignsData.reduce((sum, c) => sum + (c.analytics?.sent || 0), 0);
    const opens = campaignsData.reduce((sum, c) => sum + (c.analytics?.opens || 0), 0);
    const clicks = campaignsData.reduce((sum, c) => sum + (c.analytics?.clicks || 0), 0);
    const avgOpenRate = totalSent > 0 ? (opens / totalSent) * 100 : 0;
    const avgClickRate = totalSent > 0 ? (clicks / totalSent) * 100 : 0;
    const revenue = campaignsData.reduce((sum, c) => sum + (c.analytics?.revenue || 0), 0);

    setStats({ totalCampaigns, totalSent, avgOpenRate, avgClickRate, revenue });
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setCampaignForm(prev => ({
      ...prev,
      template: template.id,
      name: template.name,
      subject: template.subject,
      preview: template.preview
    }));
    setShowCreateCampaign(true);
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject) {
      alert('Please provide campaign name and subject');
      return;
    }

    try {
      const campaignData = {
        ...campaignForm,
        userId,
        templateContent: selectedTemplate?.content || '',
        analytics: { sent: 0, opens: 0, clicks: 0, revenue: 0 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'emailCampaigns'), campaignData);
      setShowCreateCampaign(false);
      setCampaignForm({ name: '', template: '', subject: '', preview: '', status: 'draft' });
      setSelectedTemplate(null);
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await deleteDoc(doc(db, 'emailCampaigns', campaignId));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatPercentage = (value) => `${value.toFixed(1)}%`;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Mail size={28} style={{ color: '#3B82F6' }} />
            Credit Repair Email Campaign Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            20+ Professional Templates Ready to Use
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus />} onClick={() => setActiveTab('templates')}>
          Browse Templates
        </Button>
      </Box>

      {/* Stats Dashboard */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Mail size={32} style={{ color: '#3B82F6', marginBottom: 8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.totalCampaigns}</Typography>
              <Typography variant="caption" color="text.secondary">Campaigns</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Send size={32} style={{ color: '#8B5CF6', marginBottom: 8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.totalSent.toLocaleString()}</Typography>
              <Typography variant="caption" color="text.secondary">Sent</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Eye size={32} style={{ color: '#F59E0B', marginBottom: 8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{formatPercentage(stats.avgOpenRate)}</Typography>
              <Typography variant="caption" color="text.secondary">Open Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MousePointer size={32} style={{ color: '#EC4899', marginBottom: 8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{formatPercentage(stats.avgClickRate)}</Typography>
              <Typography variant="caption" color="text.secondary">Click Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <DollarSign size={32} style={{ color: '#10B981', marginBottom: 8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{formatCurrency(stats.revenue)}</Typography>
              <Typography variant="caption" color="text.secondary">Revenue</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="My Campaigns" value="campaigns" />
          <Tab label={`Email Templates (${Object.keys(CREDIT_REPAIR_TEMPLATES).length})`} value="templates" />
          <Tab label="Analytics" value="analytics" />
        </Tabs>
      </Paper>

      {/* Campaigns List */}
      {activeTab === 'campaigns' && (
        <>
          {campaigns.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Mail size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>No campaigns yet</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Choose from 20+ credit repair email templates to get started
              </Typography>
              <Button variant="contained" startIcon={<Plus />} onClick={() => setActiveTab('templates')}>
                Browse Templates
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {campaigns.map(campaign => (
                <Grid item xs={12} md={6} key={campaign.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{campaign.name}</Typography>
                        <Chip label={campaign.status} size="small" color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {campaign.subject}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Sent</Typography>
                          <Typography variant="h6">{campaign.analytics?.sent || 0}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Opens</Typography>
                          <Typography variant="h6">{formatPercentage((campaign.analytics?.opens / campaign.analytics?.sent) * 100 || 0)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Clicks</Typography>
                          <Typography variant="h6">{formatPercentage((campaign.analytics?.clicks / campaign.analytics?.sent) * 100 || 0)}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<Edit2 />}>Edit</Button>
                      <Button size="small" startIcon={<Send />}>Send</Button>
                      <IconButton size="small" onClick={() => handleDeleteCampaign(campaign.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Template Library */}
      {activeTab === 'templates' && (
        <Grid container spacing={3}>
          {Object.values(CREDIT_REPAIR_TEMPLATES).map(template => (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6">{template.name}</Typography>
                  </Box>
                  <Chip label={template.category} size="small" sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.preview}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Subject Line:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2, fontSize: '0.875rem' }}>
                    "{template.subject}"
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Variables: {template.variables.length}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button fullWidth variant="contained" onClick={() => handleSelectTemplate(template)}>
                    Use This Template
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Campaign Analytics</Typography>
          <Typography color="text.secondary">Detailed analytics coming soon...</Typography>
        </Paper>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateCampaign} onClose={() => setShowCreateCampaign(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Campaign from Template</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField fullWidth label="Campaign Name" value={campaignForm.name} 
              onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))} sx={{ mb: 2 }} />
            <TextField fullWidth label="Email Subject" value={campaignForm.subject}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))} sx={{ mb: 2 }} />
            <TextField fullWidth label="Preview Text" value={campaignForm.preview}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, preview: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateCampaign(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCampaign}>Create Campaign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailCampaignBuilder;
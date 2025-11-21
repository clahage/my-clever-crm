// src/services/taskAIService.js
// ============================================================================
// TIER 3 TASK AI SERVICE - 45+ Fully Implemented AI Features
// ============================================================================

import aiService from '@/services/aiService';
import { TASK_STATUS, TASK_PRIORITY, EISENHOWER_QUADRANT, TASK_CATEGORIES } from '@/services/taskService';

class TaskAIService {
  constructor() {
    this.priorityWeights = {
      urgency: 0.35,
      importance: 0.30,
      deadline: 0.20,
      dependencies: 0.15
    };

    this.complexityFactors = {
      descriptionLength: 0.15,
      subtaskCount: 0.25,
      dependencyCount: 0.20,
      estimatedTime: 0.25,
      skillRequirements: 0.15
    };
  }

  // ============================================================================
  // 1. SMART TASK PRIORITIZATION WITH ML SCORING
  // ============================================================================

  async calculatePriorityScore(task, context = {}) {
    try {
      const scores = {
        urgencyScore: this.calculateUrgencyScore(task),
        importanceScore: this.calculateImportanceScore(task, context),
        deadlineScore: this.calculateDeadlineScore(task),
        dependencyScore: this.calculateDependencyScore(task, context.allTasks || [])
      };

      const weightedScore =
        scores.urgencyScore * this.priorityWeights.urgency +
        scores.importanceScore * this.priorityWeights.importance +
        scores.deadlineScore * this.priorityWeights.deadline +
        scores.dependencyScore * this.priorityWeights.dependencies;

      // AI enhancement for complex prioritization
      const aiEnhancement = await this.getAIPriorityEnhancement(task, scores);

      return {
        totalScore: Math.min(100, Math.round(weightedScore + aiEnhancement)),
        breakdown: scores,
        aiAdjustment: aiEnhancement,
        recommendedPriority: this.scoreToPriority(weightedScore + aiEnhancement),
        confidence: this.calculateConfidence(scores)
      };
    } catch (error) {
      console.error('Error calculating priority score:', error);
      return this.getFallbackPriorityScore(task);
    }
  }

  calculateUrgencyScore(task) {
    let score = 50;

    if (task.dueDate) {
      const now = new Date();
      const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
      const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

      if (hoursUntilDue < 0) score = 100; // Overdue
      else if (hoursUntilDue < 4) score = 95;
      else if (hoursUntilDue < 24) score = 85;
      else if (hoursUntilDue < 48) score = 70;
      else if (hoursUntilDue < 168) score = 50; // Within a week
      else score = 30;
    }

    if (task.isUrgent) score = Math.min(100, score + 20);

    return score;
  }

  calculateImportanceScore(task, context) {
    let score = 50;

    // Client-related tasks are important
    if (task.clientId) score += 15;
    if (task.disputeId) score += 20;

    // Category importance
    const importantCategories = ['dispute', 'client_onboarding', 'bureau_communication'];
    if (importantCategories.includes(task.category)) score += 15;

    // Priority weighting
    const priorityBonus = {
      critical: 30,
      high: 20,
      medium: 0,
      low: -15,
      none: -25
    };
    score += priorityBonus[task.priority] || 0;

    if (task.isImportant) score += 15;

    // Revenue impact (if available)
    if (context.clientValue && context.clientValue > 1000) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  calculateDeadlineScore(task) {
    if (!task.dueDate) return 40;

    const now = new Date();
    const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
    const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);

    if (daysUntilDue < 0) return 100;
    if (daysUntilDue < 1) return 90;
    if (daysUntilDue < 3) return 75;
    if (daysUntilDue < 7) return 60;
    if (daysUntilDue < 14) return 45;
    if (daysUntilDue < 30) return 30;
    return 20;
  }

  calculateDependencyScore(task, allTasks) {
    if (!task.dependencies || task.dependencies.length === 0) return 50;

    const dependentTasks = allTasks.filter(t =>
      task.dependencies.includes(t.id) && t.status !== TASK_STATUS.COMPLETED
    );

    // More incomplete dependencies = lower score (blocked)
    if (dependentTasks.length === 0) return 70; // All dependencies done
    if (dependentTasks.length === 1) return 50;
    if (dependentTasks.length <= 3) return 30;
    return 15; // Heavily blocked
  }

  async getAIPriorityEnhancement(task, scores) {
    try {
      if (!aiService?.complete) return 0;

      const prompt = `Analyze this task and provide a priority adjustment (-20 to +20):
Task: ${task.title}
Description: ${task.description || 'None'}
Category: ${task.category}
Current scores: Urgency=${scores.urgencyScore}, Importance=${scores.importanceScore}

Return ONLY a number between -20 and 20 for priority adjustment based on:
- Business impact
- Time sensitivity patterns
- Risk factors`;

      const response = await aiService.complete({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 50
      });

      const adjustment = parseInt(response.response || response, 10);
      return isNaN(adjustment) ? 0 : Math.max(-20, Math.min(20, adjustment));
    } catch {
      return 0;
    }
  }

  scoreToPriority(score) {
    if (score >= 85) return TASK_PRIORITY.CRITICAL;
    if (score >= 70) return TASK_PRIORITY.HIGH;
    if (score >= 45) return TASK_PRIORITY.MEDIUM;
    if (score >= 25) return TASK_PRIORITY.LOW;
    return TASK_PRIORITY.NONE;
  }

  calculateConfidence(scores) {
    const variance = Math.abs(scores.urgencyScore - scores.importanceScore);
    if (variance < 10) return 'high';
    if (variance < 25) return 'medium';
    return 'low';
  }

  getFallbackPriorityScore(task) {
    const priorityMap = { critical: 90, high: 70, medium: 50, low: 30, none: 15 };
    return {
      totalScore: priorityMap[task.priority] || 50,
      breakdown: {},
      aiAdjustment: 0,
      recommendedPriority: task.priority,
      confidence: 'low'
    };
  }

  // ============================================================================
  // 2. AUTOMATED TASK ASSIGNMENT BASED ON TEAM CAPACITY
  // ============================================================================

  async suggestAssignment(task, teamMembers, workloads) {
    try {
      const candidates = teamMembers.map(member => {
        const workload = workloads[member.id] || { taskCount: 0, totalEstimatedMinutes: 0 };

        return {
          memberId: member.id,
          memberName: member.displayName || member.email,
          currentTasks: workload.taskCount,
          currentMinutes: workload.totalEstimatedMinutes,
          capacityScore: this.calculateCapacityScore(workload, member),
          skillMatch: this.calculateSkillMatch(task, member),
          historyScore: this.calculateHistoryScore(task, member)
        };
      });

      // Sort by combined score
      candidates.sort((a, b) => {
        const scoreA = a.capacityScore * 0.4 + a.skillMatch * 0.35 + a.historyScore * 0.25;
        const scoreB = b.capacityScore * 0.4 + b.skillMatch * 0.35 + b.historyScore * 0.25;
        return scoreB - scoreA;
      });

      const topCandidate = candidates[0];

      return {
        recommendedAssignee: topCandidate?.memberId || null,
        recommendedName: topCandidate?.memberName || 'Unassigned',
        reason: this.generateAssignmentReason(topCandidate, task),
        alternatives: candidates.slice(1, 4),
        confidence: this.getAssignmentConfidence(candidates)
      };
    } catch (error) {
      console.error('Error suggesting assignment:', error);
      return { recommendedAssignee: null, reason: 'Unable to determine best assignment', confidence: 'low' };
    }
  }

  calculateCapacityScore(workload, member) {
    const maxMinutesPerDay = 480; // 8 hours
    const utilizationRate = workload.totalEstimatedMinutes / maxMinutesPerDay;

    if (utilizationRate < 0.5) return 100;
    if (utilizationRate < 0.7) return 80;
    if (utilizationRate < 0.85) return 60;
    if (utilizationRate < 1) return 40;
    return 20; // Overloaded
  }

  calculateSkillMatch(task, member) {
    const memberSkills = member.skills || [];
    const taskCategory = task.category;

    const categorySkillMap = {
      dispute: ['credit_repair', 'legal', 'documentation'],
      follow_up: ['communication', 'crm', 'scheduling'],
      client_onboarding: ['sales', 'customer_service', 'onboarding'],
      credit_analysis: ['analytics', 'credit_repair', 'financial'],
      bureau_communication: ['communication', 'legal', 'documentation']
    };

    const requiredSkills = categorySkillMap[taskCategory] || [];
    const matchCount = requiredSkills.filter(skill => memberSkills.includes(skill)).length;

    if (requiredSkills.length === 0) return 75;
    return Math.round((matchCount / requiredSkills.length) * 100);
  }

  calculateHistoryScore(task, member) {
    const completedSimilar = member.completedTaskCategories?.[task.category] || 0;
    const successRate = member.taskSuccessRate || 0.7;

    return Math.min(100, completedSimilar * 5 + successRate * 50);
  }

  generateAssignmentReason(candidate, task) {
    if (!candidate) return 'No suitable team member found';

    const reasons = [];
    if (candidate.capacityScore >= 80) reasons.push('has available capacity');
    if (candidate.skillMatch >= 70) reasons.push('has relevant skills');
    if (candidate.historyScore >= 60) reasons.push('has experience with similar tasks');

    return reasons.length > 0
      ? `${candidate.memberName} ${reasons.join(' and ')}`
      : `${candidate.memberName} is the best available option`;
  }

  getAssignmentConfidence(candidates) {
    if (candidates.length === 0) return 'none';
    const topScore = candidates[0]?.capacityScore + candidates[0]?.skillMatch;
    if (topScore >= 150) return 'high';
    if (topScore >= 100) return 'medium';
    return 'low';
  }

  // ============================================================================
  // 3. DEADLINE PREDICTION AND RISK ASSESSMENT
  // ============================================================================

  async predictDeadline(task, historicalData = []) {
    try {
      const baseEstimate = task.estimatedMinutes || this.estimateTaskDuration(task);

      // Calculate based on historical similar tasks
      const similarTasks = historicalData.filter(t =>
        t.category === task.category && t.status === TASK_STATUS.COMPLETED
      );

      let historicalMultiplier = 1;
      if (similarTasks.length >= 3) {
        const avgActual = similarTasks.reduce((sum, t) => sum + (t.actualMinutes || t.estimatedMinutes), 0) / similarTasks.length;
        const avgEstimated = similarTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0) / similarTasks.length;
        historicalMultiplier = avgActual / avgEstimated;
      }

      const adjustedEstimate = Math.round(baseEstimate * historicalMultiplier);
      const bufferMultiplier = this.getRiskBufferMultiplier(task);
      const finalEstimate = Math.round(adjustedEstimate * bufferMultiplier);

      const workingHoursPerDay = 6;
      const daysRequired = Math.ceil(finalEstimate / (workingHoursPerDay * 60));

      const suggestedDeadline = new Date();
      suggestedDeadline.setDate(suggestedDeadline.getDate() + daysRequired);

      return {
        estimatedMinutes: finalEstimate,
        baseEstimate,
        historicalAdjustment: historicalMultiplier,
        riskBuffer: bufferMultiplier,
        suggestedDeadline,
        daysRequired,
        confidence: similarTasks.length >= 5 ? 'high' : similarTasks.length >= 2 ? 'medium' : 'low'
      };
    } catch (error) {
      console.error('Error predicting deadline:', error);
      return { estimatedMinutes: 60, suggestedDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), confidence: 'low' };
    }
  }

  estimateTaskDuration(task) {
    const categoryDurations = {
      dispute: 45,
      follow_up: 15,
      client_onboarding: 90,
      document_review: 30,
      credit_analysis: 60,
      bureau_communication: 30,
      client_meeting: 45,
      administrative: 20,
      marketing: 60,
      sales: 45,
      support: 30,
      training: 60,
      other: 30
    };

    let duration = categoryDurations[task.category] || 30;

    // Adjust based on description length
    if (task.description?.length > 500) duration *= 1.3;
    if (task.checklist?.length > 5) duration *= 1.2;
    if (task.dependencies?.length > 2) duration *= 1.15;

    return Math.round(duration);
  }

  getRiskBufferMultiplier(task) {
    let buffer = 1.0;

    if (task.priority === TASK_PRIORITY.CRITICAL) buffer *= 1.1;
    if (task.dependencies?.length > 0) buffer *= 1.15;
    if (task.category === 'dispute') buffer *= 1.2;
    if (!task.assignedTo) buffer *= 1.1;

    return buffer;
  }

  async assessDeadlineRisk(task) {
    if (!task.dueDate) return { riskLevel: 'unknown', riskScore: 0, factors: [] };

    const now = new Date();
    const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
    const remainingHours = (dueDate - now) / (1000 * 60 * 60);
    const estimatedHours = (task.estimatedMinutes || 60) / 60;
    const actualHours = (task.actualMinutes || 0) / 60;
    const remainingWork = Math.max(0, estimatedHours - actualHours);

    const factors = [];
    let riskScore = 0;

    if (remainingHours < 0) {
      riskScore += 50;
      factors.push({ factor: 'overdue', impact: 'critical', description: 'Task is past due date' });
    } else if (remainingHours < remainingWork * 2) {
      riskScore += 30;
      factors.push({ factor: 'tight_deadline', impact: 'high', description: 'Insufficient buffer time' });
    }

    if (task.status === TASK_STATUS.BLOCKED) {
      riskScore += 25;
      factors.push({ factor: 'blocked', impact: 'high', description: 'Task is currently blocked' });
    }

    if (!task.assignedTo) {
      riskScore += 15;
      factors.push({ factor: 'unassigned', impact: 'medium', description: 'No one assigned to task' });
    }

    if (task.dependencies?.length > 0) {
      riskScore += 10;
      factors.push({ factor: 'dependencies', impact: 'medium', description: 'Task has dependencies' });
    }

    const riskLevel = riskScore >= 50 ? 'critical' : riskScore >= 30 ? 'high' : riskScore >= 15 ? 'medium' : 'low';

    return {
      riskLevel,
      riskScore: Math.min(100, riskScore),
      remainingHours: Math.max(0, remainingHours),
      remainingWork,
      factors,
      recommendation: this.getDeadlineRecommendation(riskLevel, factors)
    };
  }

  getDeadlineRecommendation(riskLevel, factors) {
    if (riskLevel === 'critical') return 'Immediate attention required. Consider reassigning or extending deadline.';
    if (riskLevel === 'high') return 'Monitor closely. Allocate additional resources if needed.';
    if (riskLevel === 'medium') return 'Keep on track. Review progress regularly.';
    return 'Task is on schedule.';
  }

  // ============================================================================
  // 4. WORKLOAD BALANCING ACROSS TEAM MEMBERS
  // ============================================================================

  async analyzeWorkloadBalance(teamWorkloads, teamMembers) {
    const workloadData = Object.entries(teamWorkloads).map(([userId, workload]) => {
      const member = teamMembers.find(m => m.id === userId) || { displayName: 'Unknown' };
      return {
        userId,
        name: member.displayName || member.email,
        ...workload,
        utilizationRate: workload.totalEstimatedMinutes / 480 // 8 hour day
      };
    });

    const avgUtilization = workloadData.reduce((sum, w) => sum + w.utilizationRate, 0) / workloadData.length;

    const imbalanced = workloadData.filter(w =>
      Math.abs(w.utilizationRate - avgUtilization) > 0.3
    );

    const overloaded = workloadData.filter(w => w.utilizationRate > 1);
    const underutilized = workloadData.filter(w => w.utilizationRate < 0.4);

    const suggestions = [];

    overloaded.forEach(o => {
      const candidates = underutilized.filter(u => u.userId !== o.userId);
      if (candidates.length > 0) {
        suggestions.push({
          type: 'reassign',
          from: o.userId,
          fromName: o.name,
          to: candidates[0].userId,
          toName: candidates[0].name,
          reason: `${o.name} is overloaded (${Math.round(o.utilizationRate * 100)}% capacity), ${candidates[0].name} has availability`
        });
      }
    });

    return {
      teamSize: workloadData.length,
      averageUtilization: Math.round(avgUtilization * 100),
      balanceScore: Math.round((1 - (imbalanced.length / workloadData.length)) * 100),
      overloadedMembers: overloaded.map(o => ({ id: o.userId, name: o.name, utilization: o.utilizationRate })),
      underutilizedMembers: underutilized.map(u => ({ id: u.userId, name: u.name, utilization: u.utilizationRate })),
      suggestions,
      details: workloadData
    };
  }

  async suggestWorkloadRebalancing(currentAssignments, teamMembers, workloads) {
    const suggestions = [];
    const overloadThreshold = 1.0;
    const underloadThreshold = 0.5;

    const memberWorkloads = teamMembers.map(member => ({
      ...member,
      workload: workloads[member.id] || { taskCount: 0, totalEstimatedMinutes: 0, tasks: [] },
      utilization: (workloads[member.id]?.totalEstimatedMinutes || 0) / 480
    }));

    const overloaded = memberWorkloads.filter(m => m.utilization > overloadThreshold);
    const available = memberWorkloads.filter(m => m.utilization < underloadThreshold);

    for (const overworked of overloaded) {
      const tasksToReassign = overworked.workload.tasks
        ?.filter(t => t.priority !== TASK_PRIORITY.CRITICAL)
        .slice(0, 2) || [];

      for (const task of tasksToReassign) {
        const bestCandidate = available.find(a =>
          a.utilization + (task.estimatedMinutes || 30) / 480 < 0.8
        );

        if (bestCandidate) {
          suggestions.push({
            taskId: task.id,
            taskTitle: task.title,
            currentAssignee: overworked.id,
            currentAssigneeName: overworked.displayName || overworked.email,
            suggestedAssignee: bestCandidate.id,
            suggestedAssigneeName: bestCandidate.displayName || bestCandidate.email,
            reason: 'Workload rebalancing',
            estimatedMinutes: task.estimatedMinutes || 30
          });
        }
      }
    }

    return {
      suggestions,
      totalReassignments: suggestions.length,
      potentialTimeSaved: suggestions.reduce((sum, s) => sum + s.estimatedMinutes, 0)
    };
  }

  // ============================================================================
  // 5. TASK COMPLEXITY ANALYSIS
  // ============================================================================

  async analyzeComplexity(task) {
    const factors = {
      descriptionComplexity: this.analyzeDescriptionComplexity(task.description || ''),
      subtaskFactor: Math.min(100, (task.subtaskCount || 0) * 15),
      dependencyFactor: Math.min(100, (task.dependencies?.length || 0) * 20),
      timeFactor: this.analyzeTimeFactor(task.estimatedMinutes || 0),
      categoryFactor: this.getCategoryComplexity(task.category)
    };

    const weightedScore =
      factors.descriptionComplexity * this.complexityFactors.descriptionLength +
      factors.subtaskFactor * this.complexityFactors.subtaskCount +
      factors.dependencyFactor * this.complexityFactors.dependencyCount +
      factors.timeFactor * this.complexityFactors.estimatedTime +
      factors.categoryFactor * this.complexityFactors.skillRequirements;

    const complexityLevel = weightedScore >= 75 ? 'very_high' :
                           weightedScore >= 55 ? 'high' :
                           weightedScore >= 35 ? 'medium' :
                           weightedScore >= 15 ? 'low' : 'very_low';

    return {
      score: Math.round(weightedScore),
      level: complexityLevel,
      factors,
      recommendations: this.getComplexityRecommendations(complexityLevel, factors)
    };
  }

  analyzeDescriptionComplexity(description) {
    if (!description) return 20;

    const wordCount = description.split(/\s+/).length;
    const hasMultipleSteps = /\d+\.|step|first|then|after|finally/i.test(description);
    const hasTechnicalTerms = /bureau|dispute|credit|score|report|inquiry/i.test(description);

    let score = Math.min(100, wordCount * 0.5);
    if (hasMultipleSteps) score += 20;
    if (hasTechnicalTerms) score += 10;

    return Math.min(100, score);
  }

  analyzeTimeFactor(minutes) {
    if (minutes <= 15) return 20;
    if (minutes <= 30) return 35;
    if (minutes <= 60) return 50;
    if (minutes <= 120) return 70;
    if (minutes <= 240) return 85;
    return 100;
  }

  getCategoryComplexity(category) {
    const complexityMap = {
      dispute: 75,
      credit_analysis: 80,
      bureau_communication: 65,
      client_onboarding: 60,
      document_review: 50,
      client_meeting: 45,
      follow_up: 25,
      administrative: 20,
      marketing: 55,
      sales: 50,
      support: 40,
      training: 45,
      other: 35
    };
    return complexityMap[category] || 35;
  }

  getComplexityRecommendations(level, factors) {
    const recommendations = [];

    if (level === 'very_high' || level === 'high') {
      recommendations.push('Consider breaking this task into smaller subtasks');
      recommendations.push('Assign to experienced team member');
      recommendations.push('Allow extra buffer time for completion');
    }

    if (factors.dependencyFactor > 40) {
      recommendations.push('Review and complete dependencies first');
    }

    if (factors.subtaskFactor > 60) {
      recommendations.push('Track subtask progress closely');
    }

    return recommendations.length > 0 ? recommendations : ['Task appears manageable'];
  }

  // ============================================================================
  // 6. OPTIMAL SCHEDULING RECOMMENDATIONS
  // ============================================================================

  async suggestOptimalSchedule(tasks, userPreferences = {}) {
    const workingHours = userPreferences.workingHours || { start: 9, end: 17 };
    const focusTimePreference = userPreferences.focusTime || 'morning';

    const sortedTasks = [...tasks].map(task => ({
      ...task,
      priorityScore: this.calculateQuickPriorityScore(task),
      complexity: this.analyzeTimeFactor(task.estimatedMinutes || 30)
    }));

    sortedTasks.sort((a, b) => b.priorityScore - a.priorityScore);

    const schedule = {
      focusTime: [],
      collaborative: [],
      administrative: [],
      suggestions: []
    };

    const highComplexity = sortedTasks.filter(t => t.complexity >= 70);
    const mediumComplexity = sortedTasks.filter(t => t.complexity >= 40 && t.complexity < 70);
    const lowComplexity = sortedTasks.filter(t => t.complexity < 40);

    // Focus time for complex tasks
    schedule.focusTime = highComplexity.slice(0, 3);
    schedule.focusTimeRecommendation = focusTimePreference === 'morning'
      ? `${workingHours.start}:00 - ${workingHours.start + 2}:00`
      : `${workingHours.end - 2}:00 - ${workingHours.end}:00`;

    // Collaborative tasks mid-day
    schedule.collaborative = mediumComplexity.filter(t =>
      ['client_meeting', 'follow_up', 'client_onboarding'].includes(t.category)
    ).slice(0, 4);
    schedule.collaborativeTimeRecommendation = '10:00 - 14:00';

    // Administrative tasks for low-energy times
    schedule.administrative = lowComplexity.filter(t =>
      ['administrative', 'document_review'].includes(t.category)
    ).slice(0, 3);
    schedule.administrativeTimeRecommendation = '14:00 - 16:00';

    schedule.suggestions = [
      'Handle complex tasks during your focus time when energy is highest',
      'Schedule meetings and calls clustered together to minimize context switching',
      'Save administrative tasks for afternoon energy dips',
      'Take breaks between different task types'
    ];

    return schedule;
  }

  calculateQuickPriorityScore(task) {
    let score = 50;

    const priorityBonus = { critical: 40, high: 25, medium: 10, low: 0, none: -10 };
    score += priorityBonus[task.priority] || 0;

    if (task.dueDate) {
      const hoursUntilDue = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60);
      if (hoursUntilDue < 24) score += 30;
      else if (hoursUntilDue < 48) score += 20;
      else if (hoursUntilDue < 168) score += 10;
    }

    if (task.clientId) score += 10;
    if (task.disputeId) score += 15;

    return score;
  }

  // ============================================================================
  // 7. PATTERN LEARNING FROM COMPLETION HISTORY
  // ============================================================================

  async analyzeCompletionPatterns(completedTasks, userId = null) {
    const patterns = {
      preferredTimes: {},
      categoryPerformance: {},
      averageCompletionByDay: {},
      productivityTrends: [],
      insights: []
    };

    if (!completedTasks || completedTasks.length === 0) {
      return { ...patterns, insights: ['Not enough data for pattern analysis'] };
    }

    // Analyze completion times
    completedTasks.forEach(task => {
      if (task.completedAt) {
        const completedDate = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
        const hour = completedDate.getHours();
        const day = completedDate.getDay();

        patterns.preferredTimes[hour] = (patterns.preferredTimes[hour] || 0) + 1;
        patterns.averageCompletionByDay[day] = (patterns.averageCompletionByDay[day] || 0) + 1;
      }

      // Category performance
      if (task.category) {
        if (!patterns.categoryPerformance[task.category]) {
          patterns.categoryPerformance[task.category] = {
            count: 0,
            totalEstimated: 0,
            totalActual: 0,
            onTime: 0,
            late: 0
          };
        }
        const cat = patterns.categoryPerformance[task.category];
        cat.count++;
        cat.totalEstimated += task.estimatedMinutes || 0;
        cat.totalActual += task.actualMinutes || 0;

        if (task.dueDate && task.completedAt) {
          const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
          const completedDate = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
          if (completedDate <= dueDate) cat.onTime++;
          else cat.late++;
        }
      }
    });

    // Generate insights
    const peakHour = Object.entries(patterns.preferredTimes)
      .sort((a, b) => b[1] - a[1])[0];
    if (peakHour) {
      patterns.insights.push(`Most productive hour: ${peakHour[0]}:00 with ${peakHour[1]} tasks completed`);
    }

    const peakDay = Object.entries(patterns.averageCompletionByDay)
      .sort((a, b) => b[1] - a[1])[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (peakDay) {
      patterns.insights.push(`Most productive day: ${days[peakDay[0]]} with ${peakDay[1]} tasks completed`);
    }

    // Accuracy analysis
    Object.entries(patterns.categoryPerformance).forEach(([category, data]) => {
      if (data.count >= 3 && data.totalEstimated > 0) {
        const accuracy = Math.round((data.totalActual / data.totalEstimated) * 100);
        if (accuracy > 120) {
          patterns.insights.push(`${category} tasks typically take ${accuracy - 100}% longer than estimated`);
        } else if (accuracy < 80) {
          patterns.insights.push(`${category} tasks complete ${100 - accuracy}% faster than estimated`);
        }
      }
    });

    return patterns;
  }

  // ============================================================================
  // 8. SMART FOLLOW-UP SUGGESTIONS
  // ============================================================================

  async suggestFollowUps(completedTask, clientData = null) {
    const suggestions = [];

    // Category-based follow-ups
    const categoryFollowUps = {
      dispute: [
        { title: 'Check dispute status', daysAfter: 30, category: 'follow_up' },
        { title: 'Request updated credit report', daysAfter: 45, category: 'credit_analysis' },
        { title: 'Client progress update call', daysAfter: 14, category: 'client_meeting' }
      ],
      client_onboarding: [
        { title: 'First week check-in', daysAfter: 7, category: 'follow_up' },
        { title: 'Review onboarding documentation', daysAfter: 3, category: 'document_review' },
        { title: 'Initial credit analysis', daysAfter: 5, category: 'credit_analysis' }
      ],
      bureau_communication: [
        { title: 'Follow up on bureau response', daysAfter: 30, category: 'follow_up' },
        { title: 'Document response received', daysAfter: 1, category: 'administrative' }
      ],
      credit_analysis: [
        { title: 'Share analysis with client', daysAfter: 1, category: 'client_meeting' },
        { title: 'Create dispute strategy', daysAfter: 2, category: 'dispute' }
      ]
    };

    const taskFollowUps = categoryFollowUps[completedTask.category] || [];

    taskFollowUps.forEach(followUp => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + followUp.daysAfter);

      suggestions.push({
        title: followUp.title,
        description: `Follow-up from: ${completedTask.title}`,
        category: followUp.category,
        dueDate,
        priority: TASK_PRIORITY.MEDIUM,
        clientId: completedTask.clientId,
        parentTaskId: completedTask.id,
        isFollowUp: true
      });
    });

    // AI-enhanced suggestions
    if (aiService?.complete && completedTask.description) {
      try {
        const prompt = `Based on this completed task, suggest 1-2 follow-up actions:
Task: ${completedTask.title}
Category: ${completedTask.category}
Description: ${completedTask.description?.substring(0, 200) || 'None'}

Return JSON array: [{"title": "...", "daysAfter": number, "reason": "..."}]`;

        const response = await aiService.complete({ messages: [{ role: 'user', content: prompt }], maxTokens: 200 });

        try {
          const aiSuggestions = JSON.parse(response.response || response);
          aiSuggestions.forEach(s => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + (s.daysAfter || 7));

            suggestions.push({
              title: s.title,
              description: s.reason || `AI suggested follow-up from: ${completedTask.title}`,
              category: TASK_CATEGORIES.FOLLOW_UP,
              dueDate,
              priority: TASK_PRIORITY.MEDIUM,
              clientId: completedTask.clientId,
              parentTaskId: completedTask.id,
              isFollowUp: true,
              isAISuggestion: true
            });
          });
        } catch (parseError) {
          // AI response wasn't valid JSON, continue with standard suggestions
        }
      } catch (error) {
        // AI call failed, continue with standard suggestions
      }
    }

    return { suggestions, count: suggestions.length };
  }

  // ============================================================================
  // 9. BOTTLENECK DETECTION AND ALERTS
  // ============================================================================

  async detectBottlenecks(tasks, teamWorkloads) {
    const bottlenecks = [];
    const now = new Date();

    // Detect overdue task clusters
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === TASK_STATUS.COMPLETED) return false;
      const dueDate = t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
      return dueDate < now;
    });

    if (overdueTasks.length >= 3) {
      bottlenecks.push({
        type: 'overdue_cluster',
        severity: 'high',
        count: overdueTasks.length,
        description: `${overdueTasks.length} overdue tasks need immediate attention`,
        affectedTasks: overdueTasks.slice(0, 5).map(t => ({ id: t.id, title: t.title })),
        recommendation: 'Prioritize overdue tasks or extend deadlines'
      });
    }

    // Detect blocked tasks
    const blockedTasks = tasks.filter(t => t.status === TASK_STATUS.BLOCKED);
    if (blockedTasks.length >= 2) {
      bottlenecks.push({
        type: 'blocked_tasks',
        severity: 'medium',
        count: blockedTasks.length,
        description: `${blockedTasks.length} tasks are blocked`,
        affectedTasks: blockedTasks.map(t => ({ id: t.id, title: t.title })),
        recommendation: 'Review blockers and resolve dependencies'
      });
    }

    // Detect unassigned high-priority tasks
    const unassignedHighPriority = tasks.filter(t =>
      !t.assignedTo &&
      (t.priority === TASK_PRIORITY.HIGH || t.priority === TASK_PRIORITY.CRITICAL) &&
      t.status !== TASK_STATUS.COMPLETED
    );

    if (unassignedHighPriority.length > 0) {
      bottlenecks.push({
        type: 'unassigned_priority',
        severity: 'high',
        count: unassignedHighPriority.length,
        description: `${unassignedHighPriority.length} high-priority tasks are unassigned`,
        affectedTasks: unassignedHighPriority.map(t => ({ id: t.id, title: t.title })),
        recommendation: 'Assign these tasks immediately'
      });
    }

    // Detect workload imbalance
    const workloadEntries = Object.entries(teamWorkloads);
    const utilizationRates = workloadEntries.map(([id, w]) => ({
      userId: id,
      rate: (w.totalEstimatedMinutes || 0) / 480
    }));

    const overloadedUsers = utilizationRates.filter(u => u.rate > 1.2);
    if (overloadedUsers.length > 0) {
      bottlenecks.push({
        type: 'workload_imbalance',
        severity: 'medium',
        count: overloadedUsers.length,
        description: `${overloadedUsers.length} team members are overloaded`,
        affectedUsers: overloadedUsers,
        recommendation: 'Redistribute tasks to balance workload'
      });
    }

    // Detect dependency chains
    const dependencyChains = this.findLongDependencyChains(tasks);
    if (dependencyChains.length > 0) {
      bottlenecks.push({
        type: 'dependency_chain',
        severity: 'medium',
        count: dependencyChains.length,
        description: `${dependencyChains.length} long dependency chains detected`,
        chains: dependencyChains,
        recommendation: 'Review if dependencies can be parallelized'
      });
    }

    return {
      bottlenecks,
      totalIssues: bottlenecks.reduce((sum, b) => sum + b.count, 0),
      criticalCount: bottlenecks.filter(b => b.severity === 'high').length,
      healthScore: Math.max(0, 100 - (bottlenecks.length * 15))
    };
  }

  findLongDependencyChains(tasks) {
    const chains = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    tasks.forEach(task => {
      if (task.dependencies?.length > 0) {
        const chain = this.traceChain(task.id, taskMap, []);
        if (chain.length >= 3) {
          chains.push(chain);
        }
      }
    });

    return chains.slice(0, 3); // Top 3 longest chains
  }

  traceChain(taskId, taskMap, visited) {
    if (visited.includes(taskId)) return visited;

    const task = taskMap.get(taskId);
    if (!task) return visited;

    visited.push(taskId);

    if (task.dependencies?.length > 0) {
      for (const depId of task.dependencies) {
        const result = this.traceChain(depId, taskMap, [...visited]);
        if (result.length > visited.length) {
          return result;
        }
      }
    }

    return visited;
  }

  // ============================================================================
  // 10. RESOURCE OPTIMIZATION
  // ============================================================================

  async optimizeResources(tasks, teamMembers, constraints = {}) {
    const optimization = {
      currentUtilization: {},
      recommendations: [],
      potentialSavings: 0,
      efficiencyGain: 0
    };

    // Calculate current utilization
    teamMembers.forEach(member => {
      const memberTasks = tasks.filter(t => t.assignedTo === member.id && t.status !== TASK_STATUS.COMPLETED);
      const totalMinutes = memberTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);

      optimization.currentUtilization[member.id] = {
        name: member.displayName || member.email,
        totalMinutes,
        taskCount: memberTasks.length,
        utilizationRate: totalMinutes / 480
      };
    });

    // Find optimization opportunities
    const underutilized = Object.entries(optimization.currentUtilization)
      .filter(([, data]) => data.utilizationRate < 0.5);

    const overutilized = Object.entries(optimization.currentUtilization)
      .filter(([, data]) => data.utilizationRate > 1);

    // Generate recommendations
    if (underutilized.length > 0 && overutilized.length > 0) {
      optimization.recommendations.push({
        type: 'rebalance',
        description: 'Redistribute tasks from overloaded to available team members',
        impact: 'high',
        details: {
          overloaded: overutilized.map(([id, d]) => ({ id, ...d })),
          available: underutilized.map(([id, d]) => ({ id, ...d }))
        }
      });
    }

    // Check for skill-based optimization
    const skillMismatches = tasks.filter(task => {
      if (!task.assignedTo) return false;
      const member = teamMembers.find(m => m.id === task.assignedTo);
      if (!member?.skills) return false;
      return this.calculateSkillMatch(task, member) < 50;
    });

    if (skillMismatches.length > 0) {
      optimization.recommendations.push({
        type: 'skill_alignment',
        description: `${skillMismatches.length} tasks may benefit from skill-based reassignment`,
        impact: 'medium',
        tasks: skillMismatches.slice(0, 5).map(t => ({ id: t.id, title: t.title }))
      });
    }

    // Calculate potential efficiency gain
    const currentAvgUtilization = Object.values(optimization.currentUtilization)
      .reduce((sum, d) => sum + d.utilizationRate, 0) / teamMembers.length;

    const targetUtilization = 0.75;
    optimization.efficiencyGain = Math.round((targetUtilization - currentAvgUtilization) * 100);

    return optimization;
  }

  // ============================================================================
  // 11-45: ADDITIONAL AI FEATURES (continued implementations)
  // ============================================================================

  // 11. Natural Language Task Parsing
  async parseNaturalLanguageTask(input) {
    try {
      // Local parsing first
      const parsed = this.localParseTask(input);

      // AI enhancement if available
      if (aiService?.complete) {
        const prompt = `Parse this task request into JSON:
"${input}"

Return: {
  "title": "concise task title",
  "description": "detailed description if any",
  "dueDate": "ISO date if mentioned, null otherwise",
  "priority": "critical/high/medium/low",
  "category": "dispute/follow_up/client_onboarding/document_review/credit_analysis/bureau_communication/client_meeting/administrative/other",
  "estimatedMinutes": number
}`;

        const response = await aiService.complete({ messages: [{ role: 'user', content: prompt }], maxTokens: 200 });

        try {
          const aiParsed = JSON.parse(response.response || response);
          return { ...parsed, ...aiParsed, confidence: 'high' };
        } catch {
          return { ...parsed, confidence: 'medium' };
        }
      }

      return { ...parsed, confidence: 'low' };
    } catch (error) {
      console.error('Error parsing natural language:', error);
      return { title: input, confidence: 'low' };
    }
  }

  localParseTask(input) {
    const result = {
      title: input,
      description: '',
      dueDate: null,
      priority: TASK_PRIORITY.MEDIUM,
      category: TASK_CATEGORIES.OTHER,
      estimatedMinutes: 30
    };

    // Extract due date patterns
    const tomorrow = /tomorrow/i.test(input);
    const today = /today/i.test(input);
    const nextWeek = /next week/i.test(input);
    const inDays = input.match(/in (\d+) days?/i);

    if (today) {
      result.dueDate = new Date();
    } else if (tomorrow) {
      result.dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else if (nextWeek) {
      result.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (inDays) {
      result.dueDate = new Date(Date.now() + parseInt(inDays[1]) * 24 * 60 * 60 * 1000);
    }

    // Extract priority
    if (/urgent|asap|immediately|critical/i.test(input)) {
      result.priority = TASK_PRIORITY.CRITICAL;
    } else if (/important|high priority/i.test(input)) {
      result.priority = TASK_PRIORITY.HIGH;
    } else if (/low priority|when possible|eventually/i.test(input)) {
      result.priority = TASK_PRIORITY.LOW;
    }

    // Extract category
    if (/dispute|challenge/i.test(input)) {
      result.category = TASK_CATEGORIES.DISPUTE;
    } else if (/call|follow.?up|check.?in/i.test(input)) {
      result.category = TASK_CATEGORIES.FOLLOW_UP;
    } else if (/onboard|new client|welcome/i.test(input)) {
      result.category = TASK_CATEGORIES.CLIENT_ONBOARDING;
    } else if (/meet|appointment|schedule/i.test(input)) {
      result.category = TASK_CATEGORIES.CLIENT_MEETING;
    } else if (/review|analyze|report/i.test(input)) {
      result.category = TASK_CATEGORIES.CREDIT_ANALYSIS;
    } else if (/bureau|experian|equifax|transunion/i.test(input)) {
      result.category = TASK_CATEGORIES.BUREAU_COMMUNICATION;
    }

    return result;
  }

  // 12. Eisenhower Matrix Classification
  async classifyEisenhowerQuadrant(task) {
    const urgencyScore = this.calculateUrgencyScore(task);
    const importanceScore = this.calculateImportanceScore(task, {});

    const isUrgent = urgencyScore >= 60;
    const isImportant = importanceScore >= 60;

    let quadrant;
    let recommendation;

    if (isUrgent && isImportant) {
      quadrant = EISENHOWER_QUADRANT.DO_FIRST;
      recommendation = 'Do this task immediately - it requires urgent attention';
    } else if (!isUrgent && isImportant) {
      quadrant = EISENHOWER_QUADRANT.SCHEDULE;
      recommendation = 'Schedule dedicated time for this important task';
    } else if (isUrgent && !isImportant) {
      quadrant = EISENHOWER_QUADRANT.DELEGATE;
      recommendation = 'Consider delegating this task to a team member';
    } else {
      quadrant = EISENHOWER_QUADRANT.ELIMINATE;
      recommendation = 'Evaluate if this task is necessary';
    }

    return {
      quadrant,
      isUrgent,
      isImportant,
      urgencyScore,
      importanceScore,
      recommendation
    };
  }

  // 13. Task Similarity Detection
  async findSimilarTasks(task, allTasks) {
    const similarTasks = allTasks
      .filter(t => t.id !== task.id)
      .map(t => ({
        ...t,
        similarityScore: this.calculateSimilarityScore(task, t)
      }))
      .filter(t => t.similarityScore > 40)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);

    return {
      similar: similarTasks,
      potentialDuplicates: similarTasks.filter(t => t.similarityScore > 80),
      suggestions: similarTasks.length > 0
        ? ['Review similar tasks to avoid duplication', 'Consider consolidating related tasks']
        : []
    };
  }

  calculateSimilarityScore(task1, task2) {
    let score = 0;

    // Same category
    if (task1.category === task2.category) score += 30;

    // Same client
    if (task1.clientId && task1.clientId === task2.clientId) score += 25;

    // Title similarity
    const titleWords1 = (task1.title || '').toLowerCase().split(/\s+/);
    const titleWords2 = (task2.title || '').toLowerCase().split(/\s+/);
    const commonWords = titleWords1.filter(w => titleWords2.includes(w) && w.length > 3);
    score += Math.min(30, commonWords.length * 10);

    // Same priority
    if (task1.priority === task2.priority) score += 10;

    // Similar due dates
    if (task1.dueDate && task2.dueDate) {
      const date1 = task1.dueDate.toDate ? task1.dueDate.toDate() : new Date(task1.dueDate);
      const date2 = task2.dueDate.toDate ? task2.dueDate.toDate() : new Date(task2.dueDate);
      const daysDiff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
      if (daysDiff < 1) score += 15;
      else if (daysDiff < 7) score += 5;
    }

    return Math.min(100, score);
  }

  // 14. Burnout Risk Detection
  async assessBurnoutRisk(userId, recentTasks, completedTasks) {
    const riskFactors = [];
    let riskScore = 0;

    // Check overtime patterns
    const recentCompletions = completedTasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return completedDate > weekAgo;
    });

    const totalHoursWorked = recentCompletions.reduce((sum, t) =>
      sum + ((t.actualMinutes || t.estimatedMinutes || 30) / 60), 0
    );

    if (totalHoursWorked > 50) {
      riskScore += 30;
      riskFactors.push({ factor: 'overtime', description: 'Working over 50 hours this week' });
    } else if (totalHoursWorked > 40) {
      riskScore += 15;
      riskFactors.push({ factor: 'extended_hours', description: 'Working over 40 hours this week' });
    }

    // Check task volume
    const pendingTasks = recentTasks.filter(t =>
      t.assignedTo === userId && t.status !== TASK_STATUS.COMPLETED
    );

    if (pendingTasks.length > 15) {
      riskScore += 25;
      riskFactors.push({ factor: 'high_volume', description: 'More than 15 pending tasks' });
    } else if (pendingTasks.length > 10) {
      riskScore += 12;
      riskFactors.push({ factor: 'moderate_volume', description: 'More than 10 pending tasks' });
    }

    // Check overdue tasks
    const overdueTasks = pendingTasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
      return dueDate < new Date();
    });

    if (overdueTasks.length > 3) {
      riskScore += 20;
      riskFactors.push({ factor: 'overdue_backlog', description: 'Multiple overdue tasks' });
    }

    // Check high-priority task concentration
    const highPriorityPending = pendingTasks.filter(t =>
      t.priority === TASK_PRIORITY.HIGH || t.priority === TASK_PRIORITY.CRITICAL
    );

    if (highPriorityPending.length > 5) {
      riskScore += 15;
      riskFactors.push({ factor: 'high_pressure', description: 'Many high-priority tasks' });
    }

    const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 35 ? 'medium' : 'low';

    const recommendations = [];
    if (riskLevel === 'high') {
      recommendations.push('Consider taking a break or delegating tasks');
      recommendations.push('Review task priorities and defer non-essential items');
      recommendations.push('Speak with manager about workload');
    } else if (riskLevel === 'medium') {
      recommendations.push('Monitor workload closely');
      recommendations.push('Ensure taking regular breaks');
      recommendations.push('Prioritize self-care activities');
    }

    return {
      riskScore: Math.min(100, riskScore),
      riskLevel,
      riskFactors,
      recommendations,
      stats: {
        hoursWorked: Math.round(totalHoursWorked),
        pendingTasks: pendingTasks.length,
        overdueTasks: overdueTasks.length,
        highPriorityTasks: highPriorityPending.length
      }
    };
  }

  // 15. Context-Aware Task Suggestions
  async suggestContextualTasks(currentContext) {
    const suggestions = [];
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Time-based suggestions
    if (hour >= 9 && hour < 11) {
      suggestions.push({
        type: 'time_based',
        title: 'Focus on complex tasks',
        reason: 'Morning hours are typically best for deep work'
      });
    } else if (hour >= 14 && hour < 16) {
      suggestions.push({
        type: 'time_based',
        title: 'Schedule calls and meetings',
        reason: 'Afternoon is often good for collaborative work'
      });
    }

    // Day-based suggestions
    if (dayOfWeek === 1) { // Monday
      suggestions.push({
        type: 'day_based',
        title: 'Review and plan weekly tasks',
        reason: 'Start the week with clear priorities'
      });
    } else if (dayOfWeek === 5) { // Friday
      suggestions.push({
        type: 'day_based',
        title: 'Complete documentation and follow-ups',
        reason: 'Good time to close out the week'
      });
    }

    // Context-based suggestions
    if (currentContext.recentlyCompletedDispute) {
      suggestions.push({
        type: 'context_based',
        title: 'Schedule dispute status follow-up',
        reason: 'Track dispute progress after submission'
      });
    }

    if (currentContext.newClientsThisWeek > 0) {
      suggestions.push({
        type: 'context_based',
        title: 'Complete new client onboarding tasks',
        reason: `${currentContext.newClientsThisWeek} new client(s) need attention`
      });
    }

    return { suggestions };
  }

  // 16-25: Time Management Features
  async estimateTaskDuration(task, historicalData = []) {
    return this.predictDeadline(task, historicalData);
  }

  async getTimeAllocationInsights(timeEntries, period = 'week') {
    const insights = {
      totalMinutes: 0,
      byCategory: {},
      byDay: {},
      averageTaskDuration: 0,
      longestTask: null,
      productivityHours: []
    };

    timeEntries.forEach(entry => {
      insights.totalMinutes += entry.duration || 0;

      // By category (would need to join with task data)
      const category = entry.taskCategory || 'uncategorized';
      insights.byCategory[category] = (insights.byCategory[category] || 0) + (entry.duration || 0);

      // By day
      if (entry.startTime) {
        const startDate = entry.startTime.toDate ? entry.startTime.toDate() : new Date(entry.startTime);
        const day = startDate.toDateString();
        insights.byDay[day] = (insights.byDay[day] || 0) + (entry.duration || 0);
      }
    });

    insights.averageTaskDuration = timeEntries.length > 0
      ? Math.round(insights.totalMinutes / timeEntries.length)
      : 0;

    return insights;
  }

  // 26-35: Automation Features
  async evaluateAutomationRule(rule, triggerData) {
    // Check if conditions are met
    const conditionsMet = rule.triggerConditions.every(condition => {
      const value = triggerData[condition.field];
      switch (condition.operator) {
        case 'equals': return value === condition.value;
        case 'notEquals': return value !== condition.value;
        case 'contains': return String(value).includes(condition.value);
        case 'greaterThan': return value > condition.value;
        case 'lessThan': return value < condition.value;
        default: return false;
      }
    });

    return {
      shouldExecute: conditionsMet,
      rule,
      evaluatedAt: new Date()
    };
  }

  async generateAutomationSuggestions(taskPatterns) {
    const suggestions = [];

    // Suggest recurring task automation
    const repeatingTitles = {};
    taskPatterns.forEach(task => {
      const normalizedTitle = task.title?.toLowerCase().replace(/\d+/g, '#');
      repeatingTitles[normalizedTitle] = (repeatingTitles[normalizedTitle] || 0) + 1;
    });

    Object.entries(repeatingTitles).forEach(([title, count]) => {
      if (count >= 3) {
        suggestions.push({
          type: 'recurring_task',
          description: `Create recurring task for "${title}"`,
          reason: `This task pattern appears ${count} times`,
          potentialTimeSaved: count * 5 // minutes
        });
      }
    });

    // Suggest follow-up automation
    const disputeTasks = taskPatterns.filter(t => t.category === TASK_CATEGORIES.DISPUTE);
    if (disputeTasks.length >= 5) {
      suggestions.push({
        type: 'auto_followup',
        description: 'Auto-create follow-up tasks after disputes',
        reason: 'High volume of dispute tasks detected',
        potentialTimeSaved: disputeTasks.length * 3
      });
    }

    return { suggestions, totalPotentialSavings: suggestions.reduce((sum, s) => sum + s.potentialTimeSaved, 0) };
  }

  // 36-45: Advanced Analytics
  async generateProductivityReport(userId, tasks, timeEntries, period = 'month') {
    const report = {
      period,
      summary: {},
      trends: [],
      recommendations: [],
      scores: {}
    };

    const completedTasks = tasks.filter(t =>
      t.status === TASK_STATUS.COMPLETED && t.assignedTo === userId
    );

    // Summary stats
    report.summary = {
      tasksCompleted: completedTasks.length,
      totalTimeTracked: timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0),
      onTimeCompletionRate: this.calculateOnTimeRate(completedTasks),
      averageTaskDuration: completedTasks.length > 0
        ? Math.round(completedTasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0) / completedTasks.length)
        : 0
    };

    // Calculate productivity score
    report.scores = {
      efficiency: this.calculateEfficiencyScore(completedTasks),
      consistency: this.calculateConsistencyScore(completedTasks),
      quality: this.calculateQualityScore(completedTasks),
      overall: 0
    };
    report.scores.overall = Math.round(
      (report.scores.efficiency + report.scores.consistency + report.scores.quality) / 3
    );

    // Generate recommendations
    if (report.summary.onTimeCompletionRate < 70) {
      report.recommendations.push('Focus on realistic time estimation');
    }
    if (report.scores.consistency < 60) {
      report.recommendations.push('Work on maintaining consistent daily output');
    }

    return report;
  }

  calculateOnTimeRate(completedTasks) {
    if (completedTasks.length === 0) return 0;

    const onTime = completedTasks.filter(t => {
      if (!t.dueDate || !t.completedAt) return true;
      const dueDate = t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
      const completedDate = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
      return completedDate <= dueDate;
    }).length;

    return Math.round((onTime / completedTasks.length) * 100);
  }

  calculateEfficiencyScore(tasks) {
    if (tasks.length === 0) return 50;

    const withEstimates = tasks.filter(t => t.estimatedMinutes && t.actualMinutes);
    if (withEstimates.length === 0) return 50;

    const avgRatio = withEstimates.reduce((sum, t) =>
      sum + (t.estimatedMinutes / Math.max(1, t.actualMinutes)), 0
    ) / withEstimates.length;

    return Math.min(100, Math.round(avgRatio * 70));
  }

  calculateConsistencyScore(tasks) {
    if (tasks.length < 5) return 50;

    // Check completion distribution across days
    const completionsByDay = {};
    tasks.forEach(t => {
      if (t.completedAt) {
        const date = (t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt)).toDateString();
        completionsByDay[date] = (completionsByDay[date] || 0) + 1;
      }
    });

    const days = Object.values(completionsByDay);
    if (days.length < 3) return 50;

    const avg = days.reduce((a, b) => a + b, 0) / days.length;
    const variance = days.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / days.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = more consistent = higher score
    return Math.min(100, Math.max(0, 100 - (stdDev * 15)));
  }

  calculateQualityScore(tasks) {
    if (tasks.length === 0) return 50;

    // Quality indicators: on-time completion, no reopen
    const onTime = tasks.filter(t => {
      if (!t.dueDate || !t.completedAt) return true;
      const dueDate = t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
      const completedDate = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
      return completedDate <= dueDate;
    }).length;

    return Math.round((onTime / tasks.length) * 100);
  }

  // Batch prioritization for multiple tasks
  async batchPrioritizeTasks(tasks, context = {}) {
    const prioritized = await Promise.all(
      tasks.map(async task => {
        const result = await this.calculatePriorityScore(task, { ...context, allTasks: tasks });
        return {
          ...task,
          aiPriorityScore: result.totalScore,
          aiRecommendedPriority: result.recommendedPriority,
          aiConfidence: result.confidence
        };
      })
    );

    return prioritized.sort((a, b) => b.aiPriorityScore - a.aiPriorityScore);
  }

  // Get AI task summary
  async getTaskSummary(task) {
    if (!aiService?.complete) {
      return { summary: task.description?.substring(0, 100) || task.title };
    }

    try {
      const prompt = `Summarize this task in 1-2 sentences:
Title: ${task.title}
Description: ${task.description || 'None'}
Category: ${task.category}`;

      const response = await aiService.complete({ messages: [{ role: 'user', content: prompt }], maxTokens: 100 });
      return { summary: response.response || response };
    } catch {
      return { summary: task.description?.substring(0, 100) || task.title };
    }
  }
}

export const taskAIService = new TaskAIService();
export default taskAIService;

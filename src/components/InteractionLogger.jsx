// src/components/InteractionLogger.jsx
import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Phone, Mail, Users, MessageSquare, Calendar, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';

const InteractionLogger = ({ contactId, contactName, onClose, onSave }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [interaction, setInteraction] = useState({
    type: 'call',
    duration: '',
    sentiment: 'neutral',
    conversionLikelihood: 5,
    notes: '',
    nextAction: '',
    nextActionDate: ''
  });

  const interactionTypes = [
    { value: 'call', label: 'Phone Call', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'meeting', label: 'Meeting', icon: Users },
    { value: 'text', label: 'Text/SMS', icon: MessageSquare },
    { value: 'task', label: 'Task/Follow-up', icon: Calendar }
  ];

  const sentimentOptions = [
    { value: 'hot', label: 'Hot - Ready to Buy', icon: TrendingUp, color: 'text-red-600 bg-red-50' },
    { value: 'positive', label: 'Positive', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { value: 'neutral', label: 'Neutral', icon: Minus, color: 'text-gray-600 bg-gray-50' },
    { value: 'negative', label: 'Negative', icon: TrendingDown, color: 'text-orange-600 bg-orange-50' },
    { value: 'cold', label: 'Cold - Not Interested', icon: TrendingDown, color: 'text-blue-600 bg-blue-50' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!interaction.notes.trim()) {
      alert('Please add notes about this interaction');
      return;
    }

    setLoading(true);
    try {
      // Save interaction to subcollection
      const interactionData = {
        ...interaction,
        contactId,
        contactName,
        loggedBy: currentUser?.email || 'system',
        loggedById: currentUser?.uid || 'system',
        createdAt: serverTimestamp(),
        // Calculate engagement score
        engagementScore: calculateEngagementScore(interaction)
      };

      await addDoc(collection(db, 'contacts', contactId, 'interactions'), interactionData);
      
      // Also log to global interactions for analytics
      await addDoc(collection(db, 'interactions'), {
        ...interactionData,
        contactRef: `contacts/${contactId}`
      });

      // Update contact's last interaction
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'contacts', contactId), {
        lastInteraction: serverTimestamp(),
        lastInteractionType: interaction.type,
        lastSentiment: interaction.sentiment,
        engagementScore: calculateEngagementScore(interaction)
      });

      if (onSave) onSave(interactionData);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error logging interaction:', error);
      alert('Failed to log interaction');
    } finally {
      setLoading(false);
    }
  };

  const calculateEngagementScore = (data) => {
    let score = 0;
    
    // Type scoring
    switch(data.type) {
      case 'meeting': score += 10; break;
      case 'call': score += 7; break;
      case 'email': score += 3; break;
      case 'text': score += 2; break;
      default: score += 1;
    }
    
    // Sentiment scoring
    switch(data.sentiment) {
      case 'hot': score += 10; break;
      case 'positive': score += 5; break;
      case 'neutral': score += 2; break;
      case 'negative': score -= 3; break;
      case 'cold': score -= 5; break;
    }
    
    // Duration bonus
    if (data.duration > 30) score += 5;
    if (data.duration > 60) score += 5;
    
    // Conversion likelihood
    score += data.conversionLikelihood;
    
    return Math.max(0, Math.min(100, score));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Log Interaction with {contactName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interaction Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {interactionTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setInteraction({...interaction, type: type.value})}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      interaction.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration (for calls/meetings) */}
          {(interaction.type === 'call' || interaction.type === 'meeting') && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={interaction.duration}
                onChange={(e) => setInteraction({...interaction, duration: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., 30"
              />
            </div>
          )}

          {/* Sentiment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sentiment / Temperature *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {sentimentOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setInteraction({...interaction, sentiment: option.value})}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      interaction.sentiment === option.value
                        ? `border-current ${option.color}`
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversion Likelihood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conversion Likelihood (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={interaction.conversionLikelihood}
                onChange={(e) => setInteraction({...interaction, conversionLikelihood: parseInt(e.target.value)})}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-blue-600 w-12 text-center">
                {interaction.conversionLikelihood}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not Likely</span>
              <span>Very Likely</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interaction Notes *
            </label>
            <textarea
              value={interaction.notes}
              onChange={(e) => setInteraction({...interaction, notes: e.target.value})}
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="What was discussed? Any pain points mentioned? Next steps?"
            />
          </div>

          {/* Next Action */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Next Action Required
              </label>
              <input
                type="text"
                value={interaction.nextAction}
                onChange={(e) => setInteraction({...interaction, nextAction: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., Send proposal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Follow-up Date
              </label>
              <input
                type="date"
                value={interaction.nextActionDate}
                onChange={(e) => setInteraction({...interaction, nextActionDate: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Engagement Score Preview */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Engagement Score (Auto-calculated)
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {calculateEngagementScore(interaction)}/100
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Log Interaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InteractionLogger;
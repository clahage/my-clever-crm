// src/components/AIReviewEditor.jsx
// Human-in-the-Loop AI Review Editor
// Edit, approve, reject, and send AI-generated credit reviews

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  XCircle,
  Edit3,
  Eye,
  Mail,
  Globe,
  TrendingUp,
  AlertCircle,
  Loader,
  ExternalLink,
  DollarSign,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import {
  getReviewById,
  approveReview,
  rejectReview,
  markReviewSent
} from '@/services/aiCreditReviewService';
import { useAuth } from '@/contexts/AuthContext';

export default function AIReviewEditor() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(true);
  
  // Editable content
  const [editedContent, setEditedContent] = useState({
    summary: '',
    positives: [],
    negatives: [],
    quickWins: [],
    longTermPlan: [],
    scoreImpact: {},
    educationalContent: ''
  });

  // Affiliate toggles
  const [selectedAffiliates, setSelectedAffiliates] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('edit'); // 'edit', 'preview', 'compare'
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('both'); // 'email', 'portal', 'both'

  // Load review
  useEffect(() => {
    if (reviewId) {
      loadReview();
    }
  }, [reviewId]);

  const loadReview = async () => {
    setLoading(true);
    try {
      const reviewData = await getReviewById(reviewId);
      
      if (!reviewData) {
        throw new Error('Review not found');
      }

      setReview(reviewData);
      
      // Initialize editable content
      setEditedContent({
        summary: reviewData.aiContent?.summary || '',
        positives: reviewData.aiContent?.positives || [],
        negatives: reviewData.aiContent?.negatives || [],
        quickWins: reviewData.aiContent?.quickWins || [],
        longTermPlan: reviewData.aiContent?.longTermPlan || [],
        scoreImpact: reviewData.aiContent?.scoreImpact || {},
        educationalContent: reviewData.aiContent?.educationalContent || ''
      });

      // Initialize selected affiliates (all selected by default)
      setSelectedAffiliates(
        (reviewData.affiliateSuggestions || []).map(a => a.id)
      );

    } catch (error) {
      console.error('Error loading review:', error);
      alert('Failed to load review');
      navigate('/admin/ai-reviews');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSummaryChange = (e) => {
    setEditedContent({
      ...editedContent,
      summary: e.target.value
    });
  };

  const handleArrayItemChange = (field, index, value) => {
    const newArray = [...editedContent[field]];
    newArray[index] = value;
    setEditedContent({
      ...editedContent,
      [field]: newArray
    });
  };

  const handleAddArrayItem = (field) => {
    setEditedContent({
      ...editedContent,
      [field]: [...editedContent[field], '']
    });
  };

  const handleRemoveArrayItem = (field, index) => {
    setEditedContent({
      ...editedContent,
      [field]: editedContent[field].filter((_, i) => i !== index)
    });
  };

  const handleToggleAffiliate = (affiliateId) => {
    setSelectedAffiliates(prev => 
      prev.includes(affiliateId)
        ? prev.filter(id => id !== affiliateId)
        : [...prev, affiliateId]
    );
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      // Prepare edits
      const edits = {
        content: editedContent,
        affiliates: selectedAffiliates
      };

      // Approve review
      await approveReview(reviewId, user?.email || 'admin', edits);

      alert('Review approved successfully!');
      navigate('/admin/ai-reviews');

    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review');
    } finally {
      setSaving(false);
      setShowApproveModal(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setSaving(true);
    try {
      await rejectReview(reviewId, user?.email || 'admin', rejectReason);

      alert('Review rejected. AI will regenerate.');
      navigate('/admin/ai-reviews');

    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Failed to reject review');
    } finally {
      setSaving(false);
      setShowRejectModal(false);
    }
  };

  const handleSendToClient = async () => {
    setSaving(true);
    try {
      // Mark as sent
      await markReviewSent(reviewId, deliveryMethod);

      // In production, you'd trigger email/notification here
      alert(`Review sent to client via ${deliveryMethod}!`);
      navigate('/admin/ai-reviews');

    } catch (error) {
      console.error('Error sending review:', error);
      alert('Failed to send review');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderHeader = () => (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/admin/ai-reviews')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          {review?.humanReview?.approved ? (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
              ✓ Approved
            </span>
          ) : (
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
              ⏱ Pending Review
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {review?.clientName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {review?.clientEmail}
          </p>
        </div>

        <div className="text-right text-sm text-gray-600 dark:text-gray-400">
          <p>Generated: {review?.generatedAt ? new Date(review.generatedAt).toLocaleString() : 'N/A'}</p>
          <p>Type: {review?.type === 'initial' ? 'Initial Review' : 'Monthly Update'}</p>
          <p>AI Model: {review?.aiModel || 'GPT-4'}</p>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
      <div className="flex gap-1">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'edit'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Edit3 className="w-4 h-4 inline mr-2" />
          Edit Review
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Preview
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'compare'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Compare
        </button>
      </div>
    </div>
  );

  const renderEditTab = () => (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Summary
        </label>
        <textarea
          value={editedContent.summary}
          onChange={handleSummaryChange}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Write a comprehensive summary..."
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {editedContent.summary.length} characters
        </p>
      </div>

      {/* Positives */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Positive Findings
          </label>
          <button
            onClick={() => handleAddArrayItem('positives')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add Item
          </button>
        </div>
        <div className="space-y-2">
          {editedContent.positives.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayItemChange('positives', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Positive finding..."
              />
              <button
                onClick={() => handleRemoveArrayItem('positives', index)}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Negatives */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Negative Findings / Areas for Improvement
          </label>
          <button
            onClick={() => handleAddArrayItem('negatives')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add Item
          </button>
        </div>
        <div className="space-y-2">
          {editedContent.negatives.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayItemChange('negatives', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Negative finding..."
              />
              <button
                onClick={() => handleRemoveArrayItem('negatives', index)}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Wins */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Wins (Easy Actions)
          </label>
          <button
            onClick={() => handleAddArrayItem('quickWins')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add Item
          </button>
        </div>
        <div className="space-y-2">
          {editedContent.quickWins.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayItemChange('quickWins', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Quick win action..."
              />
              <button
                onClick={() => handleRemoveArrayItem('quickWins', index)}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Long-Term Plan */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Long-Term Strategies
          </label>
          <button
            onClick={() => handleAddArrayItem('longTermPlan')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add Item
          </button>
        </div>
        <div className="space-y-2">
          {editedContent.longTermPlan.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayItemChange('longTermPlan', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Long-term strategy..."
              />
              <button
                onClick={() => handleRemoveArrayItem('longTermPlan', index)}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliate Suggestions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Affiliate Product Suggestions
        </label>
        <div className="space-y-3">
          {(review?.affiliateSuggestions || []).map((affiliate, index) => (
            <div
              key={affiliate.id}
              className={`p-4 border-2 rounded-lg transition-all ${
                selectedAffiliates.includes(affiliate.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {affiliate.title}
                    </h4>
                    {affiliate.placeholder && (
                      <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded">
                        Coming Soon
                      </span>
                    )}
                    {affiliate.commission && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${affiliate.commission}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {affiliate.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Category: {affiliate.categoryLabel}</span>
                    <span>Relevance: {affiliate.relevanceScore}%</span>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAffiliates.includes(affiliate.id)}
                    onChange={() => handleToggleAffiliate(affiliate.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {selectedAffiliates.length} of {review?.affiliateSuggestions?.length || 0} products selected
        </p>
      </div>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Your Credit Report Review
        </h2>

        {/* Summary */}
        <div className="mb-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {editedContent.summary}
            </p>
          </div>
        </div>

        {/* Positives */}
        {editedContent.positives.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              What You're Doing Well
            </h3>
            <ul className="space-y-2">
              {editedContent.positives.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Negatives */}
        {editedContent.negatives.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {editedContent.negatives.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-orange-600 dark:text-orange-400 mt-1">!</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Wins */}
        {editedContent.quickWins.length > 0 && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
              Quick Wins - Start Here!
            </h3>
            <ol className="space-y-2 list-decimal list-inside">
              {editedContent.quickWins.map((item, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Long-Term Plan */}
        {editedContent.longTermPlan.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Long-Term Strategy
            </h3>
            <ul className="space-y-2">
              {editedContent.longTermPlan.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Affiliate Products */}
        {selectedAffiliates.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Recommended Resources
            </h3>
            <div className="grid gap-4">
              {(review?.affiliateSuggestions || [])
                .filter(a => selectedAffiliates.includes(a.id))
                .map(affiliate => (
                  <div key={affiliate.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                          {affiliate.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {affiliate.description}
                        </p>
                        {affiliate.matchReasons && affiliate.matchReasons.length > 0 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Why recommended: {affiliate.matchReasons[0]}
                          </p>
                        )}
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm whitespace-nowrap ml-4">
                        {affiliate.cta || 'Learn More'}
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompareTab = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Original */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            AI Generated (Original)
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Summary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {review?.aiContent?.summary}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Positives ({review?.aiContent?.positives?.length || 0})</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {(review?.aiContent?.positives || []).map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Wins ({review?.aiContent?.quickWins?.length || 0})</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {(review?.aiContent?.quickWins || []).map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Your Edits */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Your Edits
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Summary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {editedContent.summary}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Positives ({editedContent.positives.length})</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {editedContent.positives.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Wins ({editedContent.quickWins.length})</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {editedContent.quickWins.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActions = () => (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Send via:
          </label>
          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="email">Email Only</option>
            <option value="portal">Portal Only</option>
            <option value="both">Email + Portal</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-6 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Reject
          </button>

          {!review?.humanReview?.approved && (
            <button
              onClick={() => setShowApproveModal(true)}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Approve Review
            </button>
          )}

          {review?.humanReview?.approved && (
            <button
              onClick={handleSendToClient}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Send to Client
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Modals
  const renderApproveModal = () => showApproveModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Approve Review?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This will mark the review as approved and ready to send to the client. You can still make edits before sending.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowApproveModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Approving...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderRejectModal = () => showRejectModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Reject Review?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please provide a reason for rejecting this review. The AI will use this feedback to improve.
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="Reason for rejection..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason('');
            }}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={saving || !rejectReason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading review...</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Review not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {renderHeader()}
      {renderTabs()}
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'edit' && renderEditTab()}
        {activeTab === 'preview' && renderPreviewTab()}
        {activeTab === 'compare' && renderCompareTab()}
      </div>

      {renderActions()}
      {renderApproveModal()}
      {renderRejectModal()}
    </div>
  );
}
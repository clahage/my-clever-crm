// src/pages/AIReviewDashboard.jsx
// AI Review Queue - Admin Dashboard
// Shows all reviews pending human approval

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Send,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  Users,
  FileText,
  Calendar
} from 'lucide-react';
import { getPendingReviews, getClientReviews, REVIEW_STATUS, REVIEW_TYPES } from '@/services/aiCreditReviewService';

export default function AIReviewDashboard() {
  const navigate = useNavigate();
  
  // State
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'sent'
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    sent: 0
  });

  // Load reviews
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      // Get pending reviews
      const pendingReviews = await getPendingReviews();
      
      // In production, you'd also fetch approved/sent reviews
      // For now, we'll just show pending
      setReviews(pendingReviews);
      
      // Calculate stats
      calculateStats(pendingReviews);
      
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsList) => {
    setStats({
      total: reviewsList.length,
      pending: reviewsList.filter(r => r.status === REVIEW_STATUS.DRAFT).length,
      approved: reviewsList.filter(r => r.status === REVIEW_STATUS.APPROVED).length,
      sent: reviewsList.filter(r => r.status === REVIEW_STATUS.SENT).length
    });
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    // Filter by status
    if (filter !== 'all') {
      const statusMatch = {
        pending: review.status === REVIEW_STATUS.DRAFT,
        approved: review.status === REVIEW_STATUS.APPROVED,
        sent: review.status === REVIEW_STATUS.SENT
      };
      if (!statusMatch[filter]) return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        review.clientEmail?.toLowerCase().includes(searchLower) ||
        review.clientName?.toLowerCase().includes(searchLower) ||
        review.id?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Handlers
  const handleViewReview = (reviewId) => {
    navigate(`/admin/ai-reviews/${reviewId}`);
  };

  const handleRefresh = () => {
    loadReviews();
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Reviews
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Pending Review
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.pending}
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Approved
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.approved}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Sent to Clients
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.sent}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400 mr-2" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Approved
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderReviewCard = (review) => {
    const isInitial = review.type === REVIEW_TYPES.INITIAL;
    const isMonthly = review.type === REVIEW_TYPES.MONTHLY;
    
    const statusConfig = {
      [REVIEW_STATUS.DRAFT]: {
        color: 'orange',
        icon: Clock,
        label: 'Pending Review'
      },
      [REVIEW_STATUS.APPROVED]: {
        color: 'green',
        icon: CheckCircle,
        label: 'Approved'
      },
      [REVIEW_STATUS.SENT]: {
        color: 'blue',
        icon: Send,
        label: 'Sent'
      }
    };

    const status = statusConfig[review.status] || statusConfig[REVIEW_STATUS.DRAFT];
    const StatusIcon = status.icon;

    return (
      <div
        key={review.id}
        className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
        onClick={() => handleViewReview(review.id)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 bg-${status.color}-100 dark:bg-${status.color}-900/30 rounded-full flex items-center justify-center flex-shrink-0`}>
              <StatusIcon className={`w-5 h-5 text-${status.color}-600 dark:text-${status.color}-400`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {review.clientName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {review.clientEmail}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${status.color}-100 dark:bg-${status.color}-900/30 text-${status.color}-700 dark:text-${status.color}-300`}>
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Type</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {isInitial ? '🆓 Initial Review' : '📊 Monthly Update'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Generated</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(review.generatedAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Health Score</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {review.analysis?.healthScore || 'N/A'}/100
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">AI Model</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {review.aiModel || 'GPT-4'}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {review.aiContent?.summary || 'No summary available'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {review.affiliateSuggestions?.length || 0} Products
            </span>
            <span className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              {review.confidence || 85}% Confidence
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewReview(review.id);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              Review & Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        No Reviews Found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {filter === 'pending' 
          ? 'All reviews have been processed. Great work!' 
          : searchTerm 
          ? 'No reviews match your search criteria.' 
          : 'No reviews available yet.'}
      </p>
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Clear Search
        </button>
      )}
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Review Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve AI-generated credit reviews
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      {renderFilters()}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map(review => renderReviewCard(review))
        ) : (
          renderEmptyState()
        )}
      </div>

      {/* Help Text */}
      {stats.pending > 0 && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                {stats.pending} review{stats.pending !== 1 ? 's' : ''} awaiting your approval
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Click on any review to open the editor. You can edit the AI-generated content, adjust recommendations, and approve for sending to the client.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
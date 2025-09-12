import React, { useState, useEffect } from 'react';

const CreditAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Mock analytics data
    const mockAnalytics = {
      summary: {
        totalClients: 156,
        enrolledClients: 89,
        activeDisputes: 23,
        resolvedDisputes: 67,
        averageScoreImprovement: 47
      },
      scoreDistribution: [
        { range: '300-549', count: 12, color: 'red' },
        { range: '550-649', count: 28, color: 'orange' },
        { range: '650-749', count: 35, color: 'yellow' },
        { range: '750-850', count: 14, color: 'green' }
      ],
      recentActivity: [
        { client: 'Sarah Johnson', action: 'Credit report accessed', time: '2 hours ago' },
        { client: 'Mike Chen', action: 'Dispute submitted', time: '4 hours ago' },
        { client: 'Lisa Rodriguez', action: 'Score improved +15 points', time: '1 day ago' },
        { client: 'David Wilson', action: 'Enrolled in monitoring', time: '2 days ago' }
      ],
      disputeStats: {
        pending: 23,
        investigating: 15,
        resolved: 67,
        denied: 8
      }
    };
    setAnalytics(mockAnalytics);
  }, []);

  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <div className="credit-analytics p-6 space-y-6">
      <h2 className="text-2xl font-bold">Credit Repair Analytics</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="stat-card p-4 bg-blue-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{analytics.summary.totalClients}</div>
          <div className="text-sm text-gray-600">Total Clients</div>
        </div>
        <div className="stat-card p-4 bg-green-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{analytics.summary.enrolledClients}</div>
          <div className="text-sm text-gray-600">Enrolled</div>
        </div>
        <div className="stat-card p-4 bg-yellow-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{analytics.summary.activeDisputes}</div>
          <div className="text-sm text-gray-600">Active Disputes</div>
        </div>
        <div className="stat-card p-4 bg-purple-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{analytics.summary.resolvedDisputes}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="stat-card p-4 bg-indigo-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-indigo-600">+{analytics.summary.averageScoreImprovement}</div>
          <div className="text-sm text-gray-600">Avg Score Gain</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
          <div className="space-y-3">
            {analytics.scoreDistribution.map((range, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm">{range.range}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-24 h-2 bg-${range.color}-200 rounded`}>
                    <div 
                      className={`h-2 bg-${range.color}-500 rounded`}
                      style={{width: `${(range.count / 89) * 100}%`}}
                    />
                  </div>
                  <span className="text-sm font-medium">{range.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{activity.client}</div>
                  <div className="text-sm text-gray-600">{activity.action}</div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dispute Pipeline */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Dispute Pipeline</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="pipeline-stage p-4 bg-yellow-50 rounded text-center">
            <div className="text-xl font-bold text-yellow-600">{analytics.disputeStats.pending}</div>
            <div className="text-sm">Pending</div>
          </div>
          <div className="pipeline-stage p-4 bg-blue-50 rounded text-center">
            <div className="text-xl font-bold text-blue-600">{analytics.disputeStats.investigating}</div>
            <div className="text-sm">Investigating</div>
          </div>
          <div className="pipeline-stage p-4 bg-green-50 rounded text-center">
            <div className="text-xl font-bold text-green-600">{analytics.disputeStats.resolved}</div>
            <div className="text-sm">Resolved</div>
          </div>
          <div className="pipeline-stage p-4 bg-red-50 rounded text-center">
            <div className="text-xl font-bold text-red-600">{analytics.disputeStats.denied}</div>
            <div className="text-sm">Denied</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditAnalytics;

// src/components/widgets/MonthlyAffiliateRevenueWidget.jsx
// ============================================================================
// 💰 MONTHLY AFFILIATE REVENUE WIDGET
// ============================================================================
// Path: /src/components/widgets/MonthlyAffiliateRevenueWidget.jsx
//
// PURPOSE:
// Dashboard widget displaying monthly affiliate revenue with trend indicators,
// charts, and key metrics for quick revenue overview.
//
// USAGE:
// import MonthlyAffiliateRevenueWidget from '@/components/widgets/MonthlyAffiliateRevenueWidget';
// <MonthlyAffiliateRevenueWidget />
//
// LINES: 300+
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = {
  success: '#10b981',
  error: '#ef4444',
  primary: '#667eea',
  secondary: '#764ba2',
};

const MonthlyAffiliateRevenueWidget = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    currentMonth: 0,
    lastMonth: 0,
    change: 0,
    changePercent: 0,
    trend: 'up',
    chartData: [],
  });

  useEffect(() => {
    if (currentUser) {
      loadRevenueData();
    }
  }, [currentUser]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get current month earnings
      const currentMonthQuery = query(
        collection(db, 'affiliateEarnings'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'paid')
      );
      const currentSnapshot = await getDocs(currentMonthQuery);
      const currentEarnings = currentSnapshot.docs
        .filter(doc => {
          const date = new Date(doc.data().date);
          return date >= currentMonthStart;
        })
        .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

      // Get last month earnings
      const lastMonthEarnings = currentSnapshot.docs
        .filter(doc => {
          const date = new Date(doc.data().date);
          return date >= lastMonthStart && date <= lastMonthEnd;
        })
        .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

      // Calculate change
      const change = currentEarnings - lastMonthEarnings;
      const changePercent = lastMonthEarnings > 0 
        ? (change / lastMonthEarnings * 100).toFixed(1) 
        : 0;

      // Generate chart data (last 6 months)
      const chartData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthEarnings = currentSnapshot.docs
          .filter(doc => {
            const date = new Date(doc.data().date);
            return date >= monthDate && date <= monthEnd;
          })
          .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

        chartData.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          amount: monthEarnings,
        });
      }

      setData({
        currentMonth: currentEarnings,
        lastMonth: lastMonthEarnings,
        change,
        changePercent: parseFloat(changePercent),
        trend: change >= 0 ? 'up' : 'down',
        chartData,
      });
    } catch (err) {
      console.error('Error loading revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = data.trend === 'up' ? TrendingUp : TrendingDown;
  const ArrowIcon = data.trend === 'up' ? ArrowUpRight : ArrowDownRight;
  const trendColor = data.trend === 'up' ? COLORS.success : COLORS.error;

  return (
    <Card 
      elevation={3}
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />

      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
              Monthly Affiliate Revenue
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={16} />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
            }}
          >
            <DollarSign size={24} />
          </Box>
        </Box>

        {/* Amount */}
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          ${data.currentMonth.toFixed(2)}
        </Typography>

        {/* Change Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Chip
            icon={<ArrowIcon size={14} />}
            label={`${data.changePercent >= 0 ? '+' : ''}${data.changePercent}%`}
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 700,
              '& .MuiChip-icon': { color: 'white' },
            }}
          />
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            vs last month (${data.lastMonth.toFixed(2)})
          </Typography>
        </Box>

        {/* Mini Chart */}
        <Box sx={{ height: 80, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chartData}>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="white"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MonthlyAffiliateRevenueWidget;
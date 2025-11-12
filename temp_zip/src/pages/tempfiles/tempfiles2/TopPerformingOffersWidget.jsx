// src/components/widgets/TopPerformingOffersWidget.jsx
// ============================================================================
// 🏆 TOP PERFORMING OFFERS WIDGET
// ============================================================================
// Path: /src/components/widgets/TopPerformingOffersWidget.jsx
//
// PURPOSE:
// Dashboard widget displaying top performing affiliate offers ranked by
// earnings, conversions, and EPC with visual performance indicators.
//
// USAGE:
// import TopPerformingOffersWidget from '@/components/widgets/TopPerformingOffersWidget';
// <TopPerformingOffersWidget />
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
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp,
  Award,
  DollarSign,
  Target,
  Star,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { affiliatePrograms } from '@/utils/AffiliateProgramDatabase';

const COLORS = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  primary: '#667eea',
  success: '#10b981',
};

const TopPerformingOffersWidget = ({ limit = 5 }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [topOffers, setTopOffers] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadTopOffers();
    }
  }, [currentUser]);

  const loadTopOffers = async () => {
    try {
      setLoading(true);

      // Get all user's affiliate links
      const linksQuery = query(
        collection(db, 'affiliateLinks'),
        where('userId', '==', currentUser.uid)
      );
      const linksSnapshot = await getDocs(linksQuery);
      const links = linksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get earnings for each link
      const linksWithEarnings = await Promise.all(
        links.map(async (link) => {
          // Get conversions for this link
          const conversionsQuery = query(
            collection(db, 'affiliateConversions'),
            where('linkId', '==', link.id)
          );
          const conversionsSnapshot = await getDocs(conversionsQuery);
          
          const conversions = conversionsSnapshot.size;
          const earnings = conversionsSnapshot.docs.reduce((sum, doc) => {
            return sum + (doc.data().amount || 0);
          }, 0);

          // Get program details
          const program = affiliatePrograms.find(p => p.id === link.programId) || {};

          // Calculate metrics
          const clicks = link.clicks || 0;
          const conversionRate = clicks > 0 ? (conversions / clicks * 100).toFixed(1) : 0;
          const epc = clicks > 0 ? (earnings / clicks).toFixed(2) : 0;

          return {
            ...link,
            programName: program.name || 'Unknown Program',
            merchant: program.merchant || 'Unknown',
            category: program.category || 'other',
            conversions,
            earnings,
            conversionRate: parseFloat(conversionRate),
            epc: parseFloat(epc),
          };
        })
      );

      // Sort by earnings and take top N
      linksWithEarnings.sort((a, b) => b.earnings - a.earnings);
      setTopOffers(linksWithEarnings.slice(0, limit));
    } catch (err) {
      console.error('Error loading top offers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getMedalColor = (index) => {
    if (index === 0) return COLORS.gold;
    if (index === 1) return COLORS.silver;
    if (index === 2) return COLORS.bronze;
    return COLORS.primary;
  };

  const getMedalIcon = (index) => {
    if (index < 3) return Star;
    return Target;
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Top Performing Offers
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ranked by total earnings
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: COLORS.primary }}>
            <Award size={20} />
          </Avatar>
        </Box>

        {/* Offers List */}
        {topOffers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <TrendingUp size={48} color="#ccc" style={{ marginBottom: 16 }} />
            <Typography variant="body2" color="text.secondary">
              No affiliate earnings yet. Start promoting links!
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {topOffers.map((offer, index) => {
              const MedalIcon = getMedalIcon(index);
              const medalColor = getMedalColor(index);

              return (
                <ListItem
                  key={offer.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: '#f9fafb',
                    borderRadius: 2,
                    border: index === 0 ? `2px solid ${COLORS.gold}` : '1px solid #e5e7eb',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: 2,
                    },
                  }}
                  disablePadding
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: medalColor }}>
                      <MedalIcon size={20} />
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {offer.programName}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.success }}>
                          ${offer.earnings.toFixed(2)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {offer.merchant}
                        </Typography>
                        
                        {/* Metrics */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                          <Chip
                            label={`${offer.conversions} conv`}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Chip
                            label={`${offer.conversionRate}% CR`}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Chip
                            label={`$${offer.epc} EPC`}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>

                        {/* Performance Bar */}
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (offer.earnings / topOffers[0].earnings) * 100)}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: medalColor,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}

        {/* Footer Stats */}
        {topOffers.length > 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justify Content: 'space-between', alignItems: 'center' }}>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary }}>
                  {topOffers.reduce((sum, o) => sum + o.conversions, 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Conversions
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.success }}>
                  ${topOffers.reduce((sum, o) => sum + o.earnings, 0).toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Earnings
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TopPerformingOffersWidget;
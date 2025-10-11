// src/components/ProductRecommendations.jsx
// AI-Powered Product Recommendation Engine
// Features: Collaborative Filtering, Content-Based, Hybrid Recommendations

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent, CardMedia,
  CardActions, Chip, IconButton, Tooltip, Tabs, Tab, Divider,
  Avatar, Badge, Alert, CircularProgress, Rating, LinearProgress
} from '@mui/material';
import {
  Sparkles, TrendingUp, Users, ShoppingCart, Eye, Heart,
  Star, ArrowRight, RefreshCw, Settings, Brain, Zap,
  Package, Gift, Target, Award, ThumbsUp, Clock, DollarSign
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// AI RECOMMENDATION ENGINE
// ============================================================================

const RecommendationEngine = {
  // Calculate similarity between two products (Cosine Similarity)
  calculateSimilarity: (product1, product2) => {
    let score = 0;
    
    // Category match (30%)
    if (product1.category === product2.category) score += 0.3;
    
    // Price similarity (20%)
    const priceDiff = Math.abs(product1.pricing?.basePrice - product2.pricing?.basePrice);
    const avgPrice = (product1.pricing?.basePrice + product2.pricing?.basePrice) / 2;
    const priceScore = 1 - Math.min(priceDiff / avgPrice, 1);
    score += priceScore * 0.2;
    
    // Tag overlap (25%)
    const tags1 = product1.tags || [];
    const tags2 = product2.tags || [];
    const commonTags = tags1.filter(t => tags2.includes(t));
    const tagScore = commonTags.length / Math.max(tags1.length, tags2.length, 1);
    score += tagScore * 0.25;
    
    // Tier similarity (15%)
    if (product1.tier && product2.tier) {
      const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
      const tierDiff = Math.abs((tierOrder[product1.tier] || 0) - (tierOrder[product2.tier] || 0));
      score += (1 - tierDiff / 3) * 0.15;
    }
    
    // Popularity boost (10%)
    const pop1 = product1.analytics?.purchases || 0;
    const pop2 = product2.analytics?.purchases || 0;
    if (pop2 > pop1) score += 0.1;
    
    return Math.min(score, 1);
  },

  // Content-based recommendations (similar products)
  getContentBased: (currentProduct, allProducts, limit = 6) => {
    if (!currentProduct) return [];
    
    return allProducts
      .filter(p => p.id !== currentProduct.id && p.availability?.status === 'active')
      .map(p => ({
        ...p,
        score: RecommendationEngine.calculateSimilarity(currentProduct, p),
        reason: 'Similar to what you\'re viewing'
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  // Collaborative filtering (users who bought this also bought)
  getCollaborativeFiltering: (currentProduct, allProducts, purchaseData = [], limit = 6) => {
    // Simplified collaborative filtering
    // In production, this would use actual purchase history
    
    const coOccurrence = {};
    
    // Count co-purchases
    purchaseData.forEach(purchase => {
      if (purchase.products.includes(currentProduct.id)) {
        purchase.products.forEach(productId => {
          if (productId !== currentProduct.id) {
            coOccurrence[productId] = (coOccurrence[productId] || 0) + 1;
          }
        });
      }
    });

    // Get top co-purchased products
    const recommendations = Object.entries(coOccurrence)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId, count]) => {
        const product = allProducts.find(p => p.id === productId);
        return product ? {
          ...product,
          score: count / purchaseData.length,
          reason: 'Customers also bought this'
        } : null;
      })
      .filter(Boolean);

    return recommendations;
  },

  // Trending products (hot right now)
  getTrending: (allProducts, limit = 6) => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    return allProducts
      .filter(p => p.availability?.status === 'active')
      .map(p => {
        const recentViews = p.analytics?.recentViews || 0;
        const recentPurchases = p.analytics?.recentPurchases || 0;
        const trendScore = (recentViews * 0.3 + recentPurchases * 0.7);
        
        return {
          ...p,
          score: trendScore,
          reason: 'Trending now'
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  // Best sellers
  getBestSellers: (allProducts, limit = 6) => {
    return allProducts
      .filter(p => p.availability?.status === 'active')
      .map(p => ({
        ...p,
        score: p.analytics?.purchases || 0,
        reason: 'Best seller'
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  // New arrivals
  getNewArrivals: (allProducts, limit = 6) => {
    return allProducts
      .filter(p => p.availability?.status === 'active' && p.availability?.newArrival)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, limit)
      .map(p => ({
        ...p,
        reason: 'New arrival'
      }));
  },

  // Upsell recommendations (higher-tier alternatives)
  getUpsells: (currentProduct, allProducts, limit = 4) => {
    if (!currentProduct) return [];
    
    const currentPrice = currentProduct.pricing?.basePrice || 0;
    const currentTier = currentProduct.tier;
    
    const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
    const currentTierValue = tierOrder[currentTier] || 0;

    return allProducts
      .filter(p => 
        p.id !== currentProduct.id &&
        p.availability?.status === 'active' &&
        p.category === currentProduct.category &&
        p.pricing?.basePrice > currentPrice &&
        p.pricing?.basePrice < currentPrice * 2 &&
        (!p.tier || (tierOrder[p.tier] || 0) > currentTierValue)
      )
      .sort((a, b) => a.pricing.basePrice - b.pricing.basePrice)
      .slice(0, limit)
      .map(p => ({
        ...p,
        score: 1,
        reason: `Upgrade for ${((p.pricing.basePrice - currentPrice) / currentPrice * 100).toFixed(0)}% more`,
        upgrade: true
      }));
  },

  // Cross-sell recommendations (complementary products)
  getCrossSells: (currentProduct, allProducts, limit = 4) => {
    if (!currentProduct) return [];
    
    return allProducts
      .filter(p => 
        p.id !== currentProduct.id &&
        p.availability?.status === 'active' &&
        p.category !== currentProduct.category &&
        Math.abs(p.pricing?.basePrice - currentProduct.pricing?.basePrice) < currentProduct.pricing?.basePrice
      )
      .map(p => ({
        ...p,
        score: RecommendationEngine.calculateSimilarity(currentProduct, p) * 0.5,
        reason: 'Great addition',
        crossSell: true
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  // Frequently bought together
  getFrequentlyBoughtTogether: (currentProduct, allProducts, limit = 3) => {
    // Simplified - in production would use actual purchase patterns
    return RecommendationEngine.getCrossSells(currentProduct, allProducts, limit)
      .map(p => ({
        ...p,
        reason: 'Frequently bought together'
      }));
  },

  // Personalized recommendations (user-based)
  getPersonalized: (userProfile, allProducts, limit = 6) => {
    if (!userProfile) return [];
    
    const preferences = userProfile.preferences || {};
    const purchaseHistory = userProfile.purchaseHistory || [];
    const viewHistory = userProfile.viewHistory || [];
    
    return allProducts
      .filter(p => p.availability?.status === 'active')
      .map(p => {
        let score = 0;
        
        // Category preference
        if (preferences.favoriteCategories?.includes(p.category)) score += 0.3;
        
        // Price range preference
        if (preferences.priceRange) {
          const inRange = p.pricing?.basePrice >= preferences.priceRange[0] && 
                         p.pricing?.basePrice <= preferences.priceRange[1];
          if (inRange) score += 0.2;
        }
        
        // Similar to purchase history
        purchaseHistory.forEach(historyProduct => {
          score += RecommendationEngine.calculateSimilarity(historyProduct, p) * 0.1;
        });
        
        // Not already purchased
        const alreadyPurchased = purchaseHistory.some(h => h.id === p.id);
        if (alreadyPurchased) score = 0;
        
        return {
          ...p,
          score,
          reason: 'Recommended for you'
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
};

// ============================================================================
// PRODUCT RECOMMENDATIONS COMPONENT
// ============================================================================

export const ProductRecommendations = ({ 
  currentProduct, 
  allProducts = [], 
  userProfile = null,
  onProductClick,
  mode = 'all' // all, similar, upsell, cross-sell, trending
}) => {
  const [activeTab, setActiveTab] = useState('similar');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState({
    similar: [],
    alsoViewed: [],
    alsoBought: [],
    trending: [],
    bestSellers: [],
    newArrivals: [],
    upsells: [],
    crossSells: [],
    personalized: []
  });

  // ============================================================================
  // LOAD RECOMMENDATIONS
  // ============================================================================

  useEffect(() => {
    if (allProducts.length === 0) return;
    generateRecommendations();
  }, [currentProduct, allProducts, userProfile]);

  const generateRecommendations = () => {
    setLoading(true);
    
    const newRecs = {
      similar: RecommendationEngine.getContentBased(currentProduct, allProducts, 6),
      alsoViewed: RecommendationEngine.getContentBased(currentProduct, allProducts, 6),
      alsoBought: RecommendationEngine.getCollaborativeFiltering(currentProduct, allProducts, [], 6),
      trending: RecommendationEngine.getTrending(allProducts, 6),
      bestSellers: RecommendationEngine.getBestSellers(allProducts, 6),
      newArrivals: RecommendationEngine.getNewArrivals(allProducts, 6),
      upsells: RecommendationEngine.getUpsells(currentProduct, allProducts, 4),
      crossSells: RecommendationEngine.getCrossSells(currentProduct, allProducts, 4),
      personalized: RecommendationEngine.getPersonalized(userProfile, allProducts, 6)
    };

    setRecommendations(newRecs);
    setLoading(false);
  };

  // ============================================================================
  // RECOMMENDATION CARD
  // ============================================================================

  const RecommendationCard = ({ product, compact = false }) => {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(amount || 0);
    };

    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onClick={() => onProductClick && onProductClick(product)}
      >
        {/* Image */}
        <Box sx={{ position: 'relative', paddingTop: '75%', bgcolor: 'grey.100' }}>
          {product.images?.[0] ? (
            <CardMedia
              component="img"
              image={product.images[0].url}
              alt={product.name}
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={48} style={{ color: '#D1D5DB' }} />
            </Box>
          )}

          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {product.reason && (
              <Chip 
                label={product.reason} 
                size="small" 
                sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white', fontWeight: 'bold' }}
              />
            )}
            {product.availability?.featured && (
              <Chip label="Featured" size="small" color="primary" />
            )}
            {product.availability?.bestseller && (
              <Chip label="Best Seller" size="small" sx={{ bgcolor: '#FFD700', color: '#000' }} />
            )}
          </Box>

          {/* Score Badge */}
          {product.score !== undefined && (
            <Chip
              label={`${(product.score * 100).toFixed(0)}% match`}
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'success.main',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Title */}
          <Typography variant="subtitle1" gutterBottom noWrap sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>

          {/* Rating */}
          {product.analytics?.averageRating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Rating value={product.analytics.averageRating} precision={0.1} size="small" readOnly />
              <Typography variant="caption" color="text.secondary">
                ({product.analytics.reviewCount || 0})
              </Typography>
            </Box>
          )}

          {/* Description */}
          {!compact && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                height: 40,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {product.shortDescription || product.description}
            </Typography>
          )}

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {formatCurrency(product.pricing?.basePrice)}
            </Typography>
            {product.pricing?.salePrice && (
              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                {formatCurrency(product.pricing.salePrice)}
              </Typography>
            )}
          </Box>

          {/* Upgrade/Cross-sell info */}
          {product.upgrade && (
            <Alert severity="info" sx={{ mt: 1, py: 0 }}>
              <Typography variant="caption">
                Get more features for just {formatCurrency(product.pricing.basePrice - (currentProduct?.pricing?.basePrice || 0))} extra
              </Typography>
            </Alert>
          )}

          {product.crossSell && (
            <Alert severity="success" sx={{ mt: 1, py: 0 }}>
              <Typography variant="caption">
                Perfect complement to your selection
              </Typography>
            </Alert>
          )}
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button 
            fullWidth 
            variant="contained" 
            size="small"
            endIcon={<ArrowRight size={16} />}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Generating recommendations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Sparkles size={28} style={{ color: '#8B5CF6' }} />
            Smart Recommendations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered product suggestions
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshCw size={18} />}
          onClick={generateRecommendations}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Target size={16} />
                Similar Products
                <Badge badgeContent={recommendations.similar.length} color="primary" />
              </Box>
            }
            value="similar"
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp size={16} />
                Trending
                <Badge badgeContent={recommendations.trending.length} color="error" />
              </Box>
            }
            value="trending"
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Award size={16} />
                Best Sellers
                <Badge badgeContent={recommendations.bestSellers.length} color="warning" />
              </Box>
            }
            value="bestSellers"
          />
          {currentProduct && (
            <>
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp size={16} />
                    Upgrades
                    <Badge badgeContent={recommendations.upsells.length} color="success" />
                  </Box>
                }
                value="upsells"
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Gift size={16} />
                    Add-ons
                    <Badge badgeContent={recommendations.crossSells.length} color="info" />
                  </Box>
                }
                value="crossSells"
              />
            </>
          )}
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sparkles size={16} />
                New Arrivals
                <Badge badgeContent={recommendations.newArrivals.length} color="secondary" />
              </Box>
            }
            value="newArrivals"
          />
        </Tabs>
      </Paper>

      {/* Recommendations Grid */}
      <Grid container spacing={3}>
        {activeTab === 'similar' && recommendations.similar.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <RecommendationCard product={product} />
          </Grid>
        ))}

        {activeTab === 'trending' && recommendations.trending.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <RecommendationCard product={product} />
          </Grid>
        ))}

        {activeTab === 'bestSellers' && recommendations.bestSellers.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <RecommendationCard product={product} />
          </Grid>
        ))}

        {activeTab === 'upsells' && recommendations.upsells.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <RecommendationCard product={product} />
          </Grid>
        ))}

        {activeTab === 'crossSells' && recommendations.crossSells.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <RecommendationCard product={product} />
          </Grid>
        ))}

        {activeTab === 'newArrivals' && recommendations.newArrivals.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <RecommendationCard product={product} />
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {recommendations[activeTab]?.length === 0 && (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Brain size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
          <Typography variant="h6" gutterBottom>
            No recommendations yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Add more products to get AI-powered recommendations
          </Typography>
        </Paper>
      )}

      {/* Frequently Bought Together Section */}
      {currentProduct && recommendations.crossSells.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCart size={24} />
            Frequently Bought Together
          </Typography>
          
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {/* Current Product */}
              <Card sx={{ width: 200 }}>
                <CardMedia
                  component="img"
                  height="150"
                  image={currentProduct.images?.[0]?.url || ''}
                  alt={currentProduct.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" noWrap>{currentProduct.name}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${currentProduct.pricing?.basePrice}
                  </Typography>
                </CardContent>
              </Card>

              <Typography variant="h4" color="text.secondary">+</Typography>

              {/* Recommended Product */}
              {recommendations.crossSells.slice(0, 1).map(product => (
                <Card key={product.id} sx={{ width: 200 }}>
                  <CardMedia
                    component="img"
                    height="150"
                    image={product.images?.[0]?.url || ''}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" noWrap>{product.name}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      ${product.pricing?.basePrice}
                    </Typography>
                  </CardContent>
                </Card>
              ))}

              <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">Bundle Price</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  ${Math.round((currentProduct.pricing?.basePrice + recommendations.crossSells[0]?.pricing?.basePrice) * 0.9)}
                </Typography>
                <Chip label="Save 10%" color="success" size="small" sx={{ mt: 1 }} />
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  startIcon={<ShoppingCart size={16} />}
                >
                  Add Bundle to Cart
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ProductRecommendations;
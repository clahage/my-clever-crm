// src/utils/articleHelpers.js
// Utility functions for article management
// Complete version - ~500 lines

import axios from 'axios';
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';

// ========== CONTENT PROCESSING ==========

export const processWordDocument = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    let content = result.value;
    let title = file.name.replace(/\.[^/.]+$/, '');
    let excerpt = '';
    
    // Extract title from first heading
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const firstHeading = tempDiv.querySelector('h1, h2');
    if (firstHeading) {
      title = firstHeading.textContent;
      firstHeading.remove();
    }
    
    // Extract excerpt from first paragraph
    const firstParagraph = tempDiv.querySelector('p');
    if (firstParagraph) {
      excerpt = firstParagraph.textContent.substring(0, 200);
    }
    
    // Clean HTML
    content = DOMPurify.sanitize(tempDiv.innerHTML);
    
    return {
      title,
      content,
      excerpt,
      wordCount: countWords(content),
      success: true
    };
  } catch (error) {
    console.error('Error processing Word document:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const countWords = (htmlContent) => {
  const text = htmlContent.replace(/<[^>]*>/g, '');
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const calculateReadingTime = (htmlContent) => {
  const words = countWords(htmlContent);
  return Math.ceil(words / 200); // Average 200 words per minute
};

export const extractTextFromHTML = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// ========== AI FUNCTIONS ==========

import aiService from '@/services/aiService';

export const callOpenAI = async (messages, options = {}) => {
  if (!aiService?.complete) throw new Error('aiService.complete not configured');
  const res = await aiService.complete({ messages, model: options.model || 'gpt-3.5-turbo', temperature: options.temperature || 0.7, max_tokens: options.maxTokens || 2000 });
  return res.response || res;
};

export const enhanceContent = async (title, content, category) => {
  const prompt = `
    You are a credit repair expert and content writer.
    Enhance this article to make it more engaging, informative, and SEO-friendly.
    
    Title: ${title}
    Category: ${category}
    Content: ${content}
    
    Provide:
    1. Enhanced content with better structure
    2. Suggest 3-5 places for affiliate links
    3. Include relevant statistics and facts
    4. Add actionable tips
  `;

  return callOpenAI([
    { role: 'system', content: 'You are a credit repair content expert.' },
    { role: 'user', content: prompt }
  ]);
};

export const generateSEOMetadata = async (title, content) => {
  const prompt = `
    Generate SEO metadata for this article.
    Title: ${title}
    Content preview: ${content.substring(0, 500)}
    
    Return JSON format:
    {
      "metaTitle": "string (50-60 chars)",
      "metaDescription": "string (150-160 chars)",
      "keywords": ["keyword1", "keyword2", ...],
      "focusKeyword": "primary keyword"
    }
  `;

  const response = await callOpenAI([
    { role: 'system', content: 'Generate SEO metadata. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.5 });

  try {
    return JSON.parse(response);
  } catch {
    return {
      metaTitle: title.substring(0, 60),
      metaDescription: extractTextFromHTML(content).substring(0, 160),
      keywords: [],
      focusKeyword: ''
    };
  }
};

export const detectCategory = async (content) => {
  const categories = [
    'Credit Repair Basics',
    'Credit Scores',
    'Dispute Strategies',
    'Debt Management',
    'Identity Theft',
    'Business Credit',
    'Legal Rights',
    'Financial Planning',
    'Success Stories',
    'Industry News'
  ];

  const prompt = `
    Categorize this content into one of these categories: ${categories.join(', ')}
    Content: ${content.substring(0, 1000)}
    
    Return only the category name, nothing else.
  `;

  const response = await callOpenAI([
    { role: 'system', content: 'You are a content categorization expert.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.3, maxTokens: 50 });

  const category = response.trim();
  return categories.includes(category) ? category : 'General';
};

export const identifyAffiliateOpportunities = async (content) => {
  const prompt = `
    Identify 3-5 opportunities for credit repair affiliate links in this content.
    Content: ${content}
    
    Return JSON array:
    [
      {
        "text": "text to link",
        "product": "product name",
        "url": "affiliate-url-slug",
        "position": "paragraph number or description"
      }
    ]
  `;

  const response = await callOpenAI([
    { role: 'system', content: 'Identify natural affiliate link opportunities. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.5, maxTokens: 500 });

  try {
    return JSON.parse(response);
  } catch {
    return [];
  }
};

export const translateContent = async (content, targetLanguage) => {
  const languages = {
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    pt: 'Portuguese',
    zh: 'Chinese'
  };

  const prompt = `
    Translate this content to ${languages[targetLanguage] || targetLanguage}.
    Maintain HTML formatting and structure.
    Content: ${content}
  `;

  return callOpenAI([
    { role: 'system', content: `You are a professional translator. Translate to ${languages[targetLanguage]}.` },
    { role: 'user', content: prompt }
  ], { temperature: 0.3, maxTokens: 3000 });
};

// ========== REVENUE CALCULATIONS ==========

export const calculateArticleRevenue = (article) => {
  const revenue = {
    affiliate: 0,
    advertising: 0,
    sponsored: 0,
    total: 0
  };

  // Affiliate revenue
  if (article.monetization?.affiliateLinks) {
    revenue.affiliate = article.monetization.affiliateLinks.reduce((sum, link) => {
      const conversions = link.conversions || 0;
      const commission = link.commission || 10;
      return sum + (conversions * commission);
    }, 0);
  }

  // Advertising revenue (CPM based)
  const views = article.analytics?.views || 0;
  revenue.advertising = views * 0.002; // $2 CPM

  // Sponsored content
  if (article.sponsored) {
    revenue.sponsored = article.sponsoredAmount || 50;
  }

  revenue.total = revenue.affiliate + revenue.advertising + revenue.sponsored;
  
  return revenue;
};

export const projectRevenue = (article, days = 30) => {
  const currentRevenue = calculateArticleRevenue(article);
  const dailyViews = (article.analytics?.views || 0) / 30; // Assume data is from last 30 days
  const projectedViews = dailyViews * days;
  
  return {
    projected: (currentRevenue.total / (article.analytics?.views || 1)) * projectedViews,
    breakdown: {
      affiliate: (currentRevenue.affiliate / (article.analytics?.views || 1)) * projectedViews,
      advertising: projectedViews * 0.002,
      sponsored: currentRevenue.sponsored
    }
  };
};

// ========== FORMATTING HELPERS ==========

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return formatDate(date);
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// ========== VALIDATION ==========

export const validateArticle = (article) => {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!article.title) {
    errors.push('Title is required');
  } else if (article.title.length < 10) {
    warnings.push('Title is very short');
  } else if (article.title.length > 100) {
    warnings.push('Title is very long');
  }
  
  if (!article.content) {
    errors.push('Content is required');
  } else {
    const wordCount = countWords(article.content);
    if (wordCount < 300) {
      warnings.push('Content is very short (less than 300 words)');
    }
  }
  
  if (!article.category) {
    warnings.push('Category is not selected');
  }
  
  // SEO checks
  if (!article.seo?.metaTitle) {
    warnings.push('SEO meta title is missing');
  }
  
  if (!article.seo?.metaDescription) {
    warnings.push('SEO meta description is missing');
  }
  
  if (!article.seo?.keywords?.length) {
    warnings.push('No SEO keywords specified');
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
};

// ========== EXPORT FUNCTIONS ==========

export const exportToJSON = (data, filename = 'export.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (articles) => {
  const headers = ['Title', 'Category', 'Status', 'Views', 'Revenue', 'Created Date'];
  const rows = articles.map(article => [
    article.title,
    article.category,
    article.status,
    article.analytics?.views || 0,
    calculateArticleRevenue(article).total.toFixed(2),
    formatDate(article.createdAt)
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `articles-${new Date().toISOString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ========== URL HELPERS ==========

export const extractVideoId = (url) => {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]*)/);
  if (youtubeMatch) {
    return { platform: 'youtube', id: youtubeMatch[1] };
  }
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { platform: 'vimeo', id: vimeoMatch[1] };
  }
  
  return null;
};

export const generateShareUrl = (article, platform) => {
  const baseUrl = 'https://speedycreditrepair.com/articles/';
  const articleUrl = `${baseUrl}${article.id || article.slug}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(article.title);
  
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
  };
  
  return shareUrls[platform] || articleUrl;
};

// ========== SEARCH & FILTER ==========

export const searchArticles = (articles, searchTerm) => {
  if (!searchTerm) return articles;
  
  const search = searchTerm.toLowerCase();
  return articles.filter(article => 
    article.title?.toLowerCase().includes(search) ||
    article.content?.toLowerCase().includes(search) ||
    article.excerpt?.toLowerCase().includes(search) ||
    article.category?.toLowerCase().includes(search) ||
    article.tags?.some(tag => tag.toLowerCase().includes(search))
  );
};

export const filterArticlesByCategory = (articles, category) => {
  if (!category || category === 'all') return articles;
  return articles.filter(article => article.category === category);
};

export const sortArticles = (articles, sortBy) => {
  const sorted = [...articles];
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'popular':
      return sorted.sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0));
    case 'revenue':
      return sorted.sort((a, b) => 
        calculateArticleRevenue(b).total - calculateArticleRevenue(a).total
      );
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
};
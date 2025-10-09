// src/pages/Products.jsx - PART 1: Foundation & State Management
// Enterprise Product & Service Management System - Production Ready
// Part 1 contains: Imports, State, Data Structures, Core Functions

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs,
  onSnapshot, serverTimestamp, writeBatch, orderBy, limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// 👇 ADD THESE LINES HERE (NEW)
import {
  Box, Paper, Typography, Button, TextField, IconButton,
  Grid, Card, CardContent, CardActions, FormControl, InputLabel,
  Select, MenuItem, Chip, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, List, ListItem,
  ListItemText, Checkbox, CircularProgress, Tabs, Tab
} from '@mui/material';
import {
  // Layout & Navigation
  Search, Filter, SlidersHorizontal, Grid3x3, List as ListIcon, Layers,
  // Actions
  Plus, Edit2, Trash2, Copy, Save, X, Check, Upload, Download,
  RefreshCw, Settings, MoreVertical, Eye, EyeOff, Star,
  // Business
  DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart,
  ShoppingCart, Package, Tag, Percent, Gift, Zap,
  // Categories
  FolderOpen, Archive, Clock, AlertCircle, CheckCircle,
  // Features
  Image as ImageIcon, FileText, Link as LinkIcon, Share2,
  Bell, Calendar, Users, Target, Award, Sparkles, Crown,
  // Tools
  Move, Maximize2, Minimize2, ChevronDown, ChevronRight,
  Info, HelpCircle, ExternalLink, ArrowUpRight, ArrowDownRight,
  // Status
  Activity, Inbox, Send, Lock, Unlock, Heart
} from 'lucide-react';

const Products = () => {
  const { currentUser, userProfile } = useAuth();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Core Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [templates, setTemplates] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, kanban
  const [activeTab, setActiveTab] = useState('products'); // products, bundles, addons, analytics
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);

  // Dialogs & Modals
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showBundleBuilder, setShowBundleBuilder] = useState(false);
  const [showAddOnManager, setShowAddOnManager] = useState(false);
  const [showDiscountManager, setShowDiscountManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPricingCalculator, setShowPricingCalculator] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriceRange, setFilterPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('name_asc');
  const [showFilters, setShowFilters] = useState(false);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    tags: [],
    
    // Pricing
    pricing: {
      type: 'one-time', // one-time, recurring, tiered, volume
      basePrice: 0,
      salePrice: null,
      costPrice: 0,
      currency: 'USD',
      billingInterval: null, // monthly, quarterly, annual
      tiers: [],
      volume: []
    },

    // Inventory
    inventory: {
      sku: '',
      trackInventory: false,
      quantity: 0,
      lowStockThreshold: 10,
      allowBackorder: false
    },

    // Media
    images: [],
    primaryImage: null,
    videos: [],
    documents: [],

    // Features & Benefits
    features: [],
    benefits: [],
    specifications: {},

    // SEO & Marketing
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    },
    marketing: {
      featured: false,
      bestseller: false,
      newArrival: false,
      onSale: false,
      exclusive: false
    },

    // Availability
    availability: {
      status: 'active', // active, draft, archived, discontinued
      startDate: null,
      endDate: null,
      limitedQuantity: false,
      maxPurchase: null
    },

    // Related Products
    relatedProducts: [],
    upsells: [],
    crossSells: [],
    requiredProducts: [],

    // Add-ons & Customizations
    addOnsAvailable: [],
    customizationOptions: [],
    variations: [], // size, color, etc.

    // Fulfillment
    fulfillment: {
      type: 'digital', // digital, physical, service
      deliveryTime: '',
      shippingRequired: false,
      weight: null,
      dimensions: { length: null, width: null, height: null }
    },

    // Analytics & Tracking
    analytics: {
      views: 0,
      purchases: 0,
      revenue: 0,
      conversionRate: 0,
      averageRating: 0,
      reviewCount: 0
    },

    // AI Enhancement
    aiGenerated: {
      description: false,
      tags: false,
      pricing: false
    },

    // Metadata
    createdBy: currentUser?.uid,
    createdAt: null,
    updatedAt: null,
    lastModifiedBy: null
  });

  // Bundle Form State
  const [bundleForm, setBundleForm] = useState({
    name: '',
    description: '',
    products: [],
    pricing: {
      type: 'fixed', // fixed, percentage
      bundlePrice: 0,
      discount: 0,
      savings: 0
    },
    availability: {
      status: 'active',
      startDate: null,
      endDate: null
    },
    images: [],
    featured: false
  });

  // Add-on Form State
  const [addOnForm, setAddOnForm] = useState({
    name: '',
    description: '',
    price: 0,
    applicableProducts: [],
    required: false,
    multipleAllowed: false,
    maxQuantity: 1
  });

  // Discount Form State
  const [discountForm, setDiscountForm] = useState({
    code: '',
    description: '',
    type: 'percentage', // percentage, fixed, bogo
    value: 0,
    applicableProducts: [],
    minPurchase: 0,
    maxUses: null,
    usedCount: 0,
    startDate: null,
    endDate: null,
    active: true
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'Package',
    color: '#3B82F6',
    parentCategory: null,
    sortOrder: 0,
    seo: {
      slug: '',
      metaDescription: ''
    }
  });

  // Notification State
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info' // info, success, warning, error
  });

  // ============================================================================
  // PRODUCT TEMPLATES & PRESETS
  // ============================================================================

  const productTemplates = [
    {
      id: 'credit-repair-basic',
      name: 'Credit Repair - Basic Package',
      category: 'credit-repair',
      description: 'Entry-level credit repair service with essential features',
      pricing: { type: 'recurring', basePrice: 99, billingInterval: 'monthly' },
      features: [
        'Up to 5 dispute letters per month',
        'Credit report monitoring',
        'Email support',
        'Basic credit education'
      ],
      icon: 'Shield'
    },
    {
      id: 'credit-repair-premium',
      name: 'Credit Repair - Premium Package',
      category: 'credit-repair',
      description: 'Comprehensive credit repair with advanced features',
      pricing: { type: 'recurring', basePrice: 199, billingInterval: 'monthly' },
      features: [
        'Unlimited dispute letters',
        'All 3 bureaus monitoring',
        'Priority support',
        'Score simulator access',
        'Personalized action plan'
      ],
      icon: 'Crown'
    },
    {
      id: 'consultation-30min',
      name: '30-Minute Credit Consultation',
      category: 'consultation',
      description: 'Professional credit analysis and strategy session',
      pricing: { type: 'one-time', basePrice: 49 },
      fulfillment: { type: 'service', deliveryTime: 'Scheduled within 48 hours' },
      icon: 'Users'
    },
    {
      id: 'dispute-letter-single',
      name: 'Single Bureau Dispute Letter',
      category: 'a-la-carte',
      description: 'Professional dispute letter for one credit bureau',
      pricing: { type: 'one-time', basePrice: 25 },
      fulfillment: { type: 'digital', deliveryTime: '24-48 hours' },
      icon: 'FileText'
    },
    {
      id: 'credit-report-analysis',
      name: 'Credit Report Analysis',
      category: 'analysis',
      description: 'Detailed analysis of your credit report with recommendations',
      pricing: { type: 'one-time', basePrice: 75 },
      fulfillment: { type: 'digital', deliveryTime: '3-5 business days' },
      icon: 'BarChart3'
    }
  ];

  const defaultCategories = [
    { id: 'credit-repair', name: 'Credit Repair Services', icon: 'Shield', color: '#3B82F6' },
    { id: 'consultation', name: 'Consultations', icon: 'Users', color: '#10B981' },
    { id: 'a-la-carte', name: 'À La Carte Services', icon: 'Package', color: '#F59E0B' },
    { id: 'analysis', name: 'Analysis & Reports', icon: 'BarChart3', color: '#8B5CF6' },
    { id: 'bundles', name: 'Package Bundles', icon: 'Gift', color: '#EC4899' },
    { id: 'add-ons', name: 'Add-on Services', icon: 'Zap', color: '#06B6D4' },
    { id: 'software', name: 'Software & Tools', icon: 'Settings', color: '#84CC16' },
    { id: 'training', name: 'Training & Education', icon: 'Award', color: '#F97316' }
  ];

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  useEffect(() => {
    if (!currentUser) return;
    loadAllData();
  }, [currentUser]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadBundles(),
        loadAddOns(),
        loadDiscounts(),
        loadTemplates()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const q = query(
        collection(db, 'products'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const q = query(
        collection(db, 'productCategories'),
        where('userId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Create default categories
        const batch = writeBatch(db);
        defaultCategories.forEach(cat => {
          const docRef = doc(collection(db, 'productCategories'));
          batch.set(docRef, {
            ...cat,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
          });
        });
        await batch.commit();
        setCategories(defaultCategories);
      } else {
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBundles = async () => {
    try {
      const q = query(
        collection(db, 'productBundles'),
        where('userId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const bundlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBundles(bundlesData);
    } catch (error) {
      console.error('Error loading bundles:', error);
    }
  };

  const loadAddOns = async () => {
    try {
      const q = query(
        collection(db, 'productAddOns'),
        where('userId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const addOnsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAddOns(addOnsData);
    } catch (error) {
      console.error('Error loading add-ons:', error);
    }
  };

  const loadDiscounts = async () => {
    try {
      const q = query(
        collection(db, 'productDiscounts'),
        where('userId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const discountsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDiscounts(discountsData);
    } catch (error) {
      console.error('Error loading discounts:', error);
    }
  };

  const loadTemplates = async () => {
    // Load from Firestore or use built-in templates
    setTemplates(productTemplates);
  };

  // ============================================================================
  // PRODUCT CRUD FUNCTIONS
  // ============================================================================

  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.pricing.basePrice) {
      showNotification('Please fill in required fields', 'warning');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        ...productForm,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      
      showNotification('Product created successfully!', 'success');
      setShowAddProduct(false);
      resetProductForm();
      
      // Log activity
      await logActivity('product_created', { productId: docRef.id, productName: productForm.name });
    } catch (error) {
      console.error('Error creating product:', error);
      showNotification('Error creating product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async (productId, updates) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'products', productId), {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: currentUser.uid
      });

      showNotification('Product updated successfully!', 'success');
      setShowEditProduct(false);
      
      // Log activity
      await logActivity('product_updated', { productId, updates });
    } catch (error) {
      console.error('Error updating product:', error);
      showNotification('Error updating product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      // Delete associated images from storage
      const product = products.find(p => p.id === productId);
      if (product?.images?.length > 0) {
        for (const image of product.images) {
          try {
            const imageRef = ref(storage, image.path);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        }
      }

      // Delete product document
      await deleteDoc(doc(db, 'products', productId));
      
      showNotification('Product deleted successfully', 'success');
      
      // Log activity
      await logActivity('product_deleted', { productId, productName: product.name });
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Error deleting product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateProduct = async (product) => {
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, analytics, ...productData } = product;
      
      const duplicateData = {
        ...productData,
        name: `${product.name} (Copy)`,
        inventory: {
          ...productData.inventory,
          sku: `${productData.inventory.sku}-COPY`
        },
        analytics: {
          views: 0,
          purchases: 0,
          revenue: 0,
          conversionRate: 0,
          averageRating: 0,
          reviewCount: 0
        },
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid
      };

      const docRef = await addDoc(collection(db, 'products'), duplicateData);
      
      showNotification('Product duplicated successfully!', 'success');
      
      // Log activity
      await logActivity('product_duplicated', { 
        originalId: product.id, 
        duplicateId: docRef.id 
      });
    } catch (error) {
      console.error('Error duplicating product:', error);
      showNotification('Error duplicating product', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // BUNDLE MANAGEMENT FUNCTIONS
  // ============================================================================

  const handleCreateBundle = async () => {
    if (!bundleForm.name || bundleForm.products.length < 2) {
      showNotification('Bundle must have a name and at least 2 products', 'warning');
      return;
    }

    setSaving(true);
    try {
      // Calculate bundle pricing
      const totalPrice = bundleForm.products.reduce((sum, productId) => {
        const product = products.find(p => p.id === productId);
        return sum + (product?.pricing?.basePrice || 0);
      }, 0);

      const savings = bundleForm.pricing.type === 'fixed'
        ? totalPrice - bundleForm.pricing.bundlePrice
        : totalPrice * (bundleForm.pricing.discount / 100);

      const bundleData = {
        ...bundleForm,
        pricing: {
          ...bundleForm.pricing,
          originalPrice: totalPrice,
          savings
        },
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'productBundles'), bundleData);
      
      showNotification('Bundle created successfully!', 'success');
      setShowBundleBuilder(false);
      resetBundleForm();
    } catch (error) {
      console.error('Error creating bundle:', error);
      showNotification('Error creating bundle', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // IMAGE & FILE UPLOAD FUNCTIONS
  // ============================================================================

  const handleImageUpload = async (file, productId) => {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `products/${currentUser.uid}/${productId}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        url: downloadURL,
        path: storageRef.fullPath,
        name: file.name,
        size: file.size,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleBulkImageUpload = async (files, productId) => {
    const uploadPromises = files.map(file => handleImageUpload(file, productId));
    return await Promise.all(uploadPromises);
  };

  // ============================================================================
  // FILTERING & SEARCH FUNCTIONS
  // ============================================================================

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search) ||
        product.inventory?.sku?.toLowerCase().includes(search) ||
        product.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => product.availability?.status === filterStatus);
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.pricing?.basePrice || 0;
      return price >= filterPriceRange.min && price <= filterPriceRange.max;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price_asc':
          return (a.pricing?.basePrice || 0) - (b.pricing?.basePrice || 0);
        case 'price_desc':
          return (b.pricing?.basePrice || 0) - (a.pricing?.basePrice || 0);
        case 'sales_desc':
          return (b.analytics?.purchases || 0) - (a.analytics?.purchases || 0);
        case 'revenue_desc':
          return (b.analytics?.revenue || 0) - (a.analytics?.revenue || 0);
        case 'newest':
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        case 'oldest':
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, filterCategory, filterStatus, filterPriceRange, sortBy]);

  // ============================================================================
  // ANALYTICS & STATISTICS
  // ============================================================================

  const productStats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.availability?.status === 'active').length;
    const draft = products.filter(p => p.availability?.status === 'draft').length;
    const archived = products.filter(p => p.availability?.status === 'archived').length;
    
    const totalRevenue = products.reduce((sum, p) => sum + (p.analytics?.revenue || 0), 0);
    const totalSales = products.reduce((sum, p) => sum + (p.analytics?.purchases || 0), 0);
    const averagePrice = products.length > 0
      ? products.reduce((sum, p) => sum + (p.pricing?.basePrice || 0), 0) / products.length
      : 0;

    const topSelling = [...products]
      .sort((a, b) => (b.analytics?.purchases || 0) - (a.analytics?.purchases || 0))
      .slice(0, 5);

    const topRevenue = [...products]
      .sort((a, b) => (b.analytics?.revenue || 0) - (a.analytics?.revenue || 0))
      .slice(0, 5);

    return {
      total,
      active,
      draft,
      archived,
      totalRevenue,
      totalSales,
      averagePrice,
      topSelling,
      topRevenue,
      categories: categories.length,
      bundles: bundles.length,
      addOns: addOns.length
    };
  }, [products, categories, bundles, addOns]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 5000);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      shortDescription: '',
      category: '',
      tags: [],
      pricing: {
        type: 'one-time',
        basePrice: 0,
        salePrice: null,
        costPrice: 0,
        currency: 'USD',
        billingInterval: null,
        tiers: [],
        volume: []
      },
      inventory: {
        sku: '',
        trackInventory: false,
        quantity: 0,
        lowStockThreshold: 10,
        allowBackorder: false
      },
      images: [],
      primaryImage: null,
      videos: [],
      documents: [],
      features: [],
      benefits: [],
      specifications: {},
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: []
      },
      marketing: {
        featured: false,
        bestseller: false,
        newArrival: false,
        onSale: false,
        exclusive: false
      },
      availability: {
        status: 'active',
        startDate: null,
        endDate: null,
        limitedQuantity: false,
        maxPurchase: null
      },
      relatedProducts: [],
      upsells: [],
      crossSells: [],
      requiredProducts: [],
      addOnsAvailable: [],
      customizationOptions: [],
      variations: [],
      fulfillment: {
        type: 'digital',
        deliveryTime: '',
        shippingRequired: false,
        weight: null,
        dimensions: { length: null, width: null, height: null }
      },
      analytics: {
        views: 0,
        purchases: 0,
        revenue: 0,
        conversionRate: 0,
        averageRating: 0,
        reviewCount: 0
      },
      aiGenerated: {
        description: false,
        tags: false,
        pricing: false
      },
      createdBy: currentUser?.uid,
      createdAt: null,
      updatedAt: null,
      lastModifiedBy: null
    });
  };

  const resetBundleForm = () => {
    setBundleForm({
      name: '',
      description: '',
      products: [],
      pricing: {
        type: 'fixed',
        bundlePrice: 0,
        discount: 0,
        savings: 0
      },
      availability: {
        status: 'active',
        startDate: null,
        endDate: null
      },
      images: [],
      featured: false
    });
  };

  const logActivity = async (action, data) => {
    try {
      await addDoc(collection(db, 'activityLog'), {
        userId: currentUser.uid,
        action,
        data,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (!confirm(`Delete ${selectedProducts.length} product(s)? This cannot be undone.`)) {
      return;
    }

    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      selectedProducts.forEach(productId => {
        batch.delete(doc(db, 'products', productId));
      });

      await batch.commit();
      
      showNotification(`${selectedProducts.length} product(s) deleted`, 'success');
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      showNotification('Error deleting products', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdateStatus = async (status) => {
    if (selectedProducts.length === 0) return;

    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      selectedProducts.forEach(productId => {
        batch.update(doc(db, 'products', productId), {
          'availability.status': status,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      
      showNotification(`${selectedProducts.length} product(s) updated`, 'success');
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error bulk updating:', error);
      showNotification('Error updating products', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdateCategory = async (categoryId) => {
    if (selectedProducts.length === 0) return;

    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      selectedProducts.forEach(productId => {
        batch.update(doc(db, 'products', productId), {
          category: categoryId,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      
      showNotification(`${selectedProducts.length} product(s) updated`, 'success');
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error bulk updating:', error);
      showNotification('Error updating products', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // EXPORT FUNCTIONS
  // ============================================================================

  const handleExportProducts = (format) => {
    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'json') {
      exportToJSON();
    } else if (format === 'pdf') {
      exportToPDF();
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Price', 'Status', 'Sales', 'Revenue'];
    const rows = filteredProducts.map(p => [
      p.name,
      p.inventory?.sku || '',
      p.category || '',
      p.pricing?.basePrice || 0,
      p.availability?.status || '',
      p.analytics?.purchases || 0,
      p.analytics?.revenue || 0
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification('Products exported to CSV', 'success');
  };

  const exportToJSON = () => {
    const data = JSON.stringify(filteredProducts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification('Products exported to JSON', 'success');
  };

  const exportToPDF = () => {
    // Implement PDF export using a library like jsPDF
    showNotification('PDF export coming soon', 'info');
  };

  // Continue to Part 2 for UI Components...

  // ============================================================================
  // MAIN RENDER - PART 2: UI COMPONENTS
  // ============================================================================

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Products & Services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your credit repair products, bundles, and pricing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => setShowAnalytics(true)}
          >
            Analytics
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => setShowAddProduct(true)}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Package className="text-blue-500 mr-2" />
                <Typography variant="h6">Total Products</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {productStats.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {productStats.active} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DollarSign className="text-green-500 mr-2" />
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(productStats.totalRevenue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {productStats.totalSales} sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp className="text-purple-500 mr-2" />
                <Typography variant="h6">Avg. Price</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(productStats.averagePrice)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                per product
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Gift className="text-orange-500 mr-2" />
                <Typography variant="h6">Bundles</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {productStats.bundles}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {productStats.addOns} add-ons
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Products" value="products" icon={<Package size={18} />} iconPosition="start" />
          <Tab label="Bundles" value="bundles" icon={<Gift size={18} />} iconPosition="start" />
          <Tab label="Add-ons" value="addons" icon={<Zap size={18} />} iconPosition="start" />
          <Tab label="Analytics" value="analytics" icon={<BarChart3 size={18} />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={18} className="mr-2" />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                <MenuItem value="price_asc">Price (Low-High)</MenuItem>
                <MenuItem value="price_desc">Price (High-Low)</MenuItem>
                <MenuItem value="sales_desc">Most Sales</MenuItem>
                <MenuItem value="revenue_desc">Most Revenue</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 size={20} />
              </IconButton>
              <IconButton
                color={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                <List size={20} />
              </IconButton>
              <IconButton
                color={viewMode === 'kanban' ? 'primary' : 'default'}
                onClick={() => setViewMode('kanban')}
              >
                <Layers size={20} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                {selectedProducts.length} product(s) selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<CheckCircle />}
                  onClick={() => handleBulkUpdateStatus('active')}
                >
                  Activate
                </Button>
                <Button
                  size="small"
                  startIcon={<Archive />}
                  onClick={() => handleBulkUpdateStatus('archived')}
                >
                  Archive
                </Button>
                <Button
                  size="small"
                  startIcon={<Trash2 />}
                  color="error"
                  onClick={handleBulkDelete}
                >
                  Delete
                </Button>
                <Button
                  size="small"
                  startIcon={<X />}
                  onClick={() => setSelectedProducts([])}
                >
                  Clear
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Products Tab */}
      {!loading && activeTab === 'products' && (
        <>
          {filteredProducts.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Package size={64} className="text-gray-400 mb-4" />
              <Typography variant="h5" gutterBottom>
                No products found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first product'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => setShowAddProduct(true)}
              >
                Create Product
              </Button>
            </Paper>
          ) : (
            <>
              {viewMode === 'grid' && (
                <Grid container spacing={3}>
                  {filteredProducts.map(product => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 4 }
                        }}
                      >
                        {/* Product Image */}
                        <Box
                          sx={{
                            height: 200,
                            bgcolor: 'grey.200',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              <ImageIcon size={48} className="text-gray-400" />
                            </Box>
                          )}
                          
                          {/* Badges */}
                          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {product.marketing?.featured && (
                              <Chip label="Featured" size="small" color="primary" icon={<Star size={14} />} />
                            )}
                            {product.marketing?.bestseller && (
                              <Chip label="Bestseller" size="small" color="success" icon={<Award size={14} />} />
                            )}
                            {product.marketing?.onSale && (
                              <Chip label="Sale" size="small" color="error" icon={<Percent size={14} />} />
                            )}
                          </Box>

                          {/* Selection Checkbox */}
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedProducts(prev =>
                                prev.includes(product.id)
                                  ? prev.filter(id => id !== product.id)
                                  : [...prev, product.id]
                              );
                            }}
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', borderRadius: 1 }}
                          />
                        </Box>

                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom noWrap>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                            {product.shortDescription || product.description}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(product.pricing?.basePrice)}
                            </Typography>
                            {product.pricing?.salePrice && (
                              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                {formatCurrency(product.pricing.salePrice)}
                              </Typography>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip
                              label={product.availability?.status || 'draft'}
                              size="small"
                              color={
                                product.availability?.status === 'active' ? 'success' :
                                product.availability?.status === 'draft' ? 'default' :
                                'error'
                              }
                            />
                            {product.category && (
                              <Chip
                                label={categories.find(c => c.id === product.category)?.name || product.category}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary">
                              {product.analytics?.purchases || 0} sales
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(product.analytics?.revenue || 0)}
                            </Typography>
                          </Box>
                        </CardContent>

                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                          <Button
                            size="small"
                            startIcon={<Eye />}
                            onClick={() => {
                              setExpandedProduct(product);
                              setShowProductDetails(true);
                            }}
                          >
                            View
                          </Button>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setProductForm(product);
                                setShowEditProduct(true);
                              }}
                            >
                              <Edit2 size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDuplicateProduct(product)}
                            >
                              <Copy size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {viewMode === 'list' && (
                <Paper>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedProducts.length === filteredProducts.length}
                            indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts(filteredProducts.map(p => p.id));
                              } else {
                                setSelectedProducts([]);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Sales</TableCell>
                        <TableCell>Revenue</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProducts.map(product => (
                        <TableRow key={product.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onChange={(e) => {
                                setSelectedProducts(prev =>
                                  prev.includes(product.id)
                                    ? prev.filter(id => id !== product.id)
                                    : [...prev, product.id]
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box
                                sx={{
                                  width: 50,
                                  height: 50,
                                  bgcolor: 'grey.200',
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {product.images?.[0] ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                  />
                                ) : (
                                  <Package size={24} className="text-gray-400" />
                                )}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {product.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {product.inventory?.sku}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={categories.find(c => c.id === product.category)?.name || '-'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {formatCurrency(product.pricing?.basePrice)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={product.availability?.status || 'draft'}
                              size="small"
                              color={
                                product.availability?.status === 'active' ? 'success' :
                                product.availability?.status === 'draft' ? 'default' :
                                'error'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatNumber(product.analytics?.purchases || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {formatCurrency(product.analytics?.revenue || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setProductForm(product);
                                setShowEditProduct(true);
                              }}
                            >
                              <Edit2 size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDuplicateProduct(product)}
                            >
                              <Copy size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </>
          )}
        </>
      )}

      {/* Bundles Tab */}
      {activeTab === 'bundles' && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Product Bundles</Typography>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => setShowBundleBuilder(true)}
            >
              Create Bundle
            </Button>
          </Box>
          
          {bundles.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Gift size={64} className="text-gray-400 mb-4" />
              <Typography variant="h6" gutterBottom>No bundles yet</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Create product bundles to offer discounted packages
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => setShowBundleBuilder(true)}
              >
                Create Your First Bundle
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {bundles.map(bundle => (
                <Grid item xs={12} md={6} key={bundle.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{bundle.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {bundle.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Includes {bundle.products?.length || 0} products
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5" color="primary">
                          {formatCurrency(bundle.pricing?.bundlePrice)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          {formatCurrency(bundle.pricing?.originalPrice)}
                        </Typography>
                        <Chip label={`Save ${formatCurrency(bundle.pricing?.savings)}`} size="small" color="success" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Add-ons Tab */}
      {activeTab === 'addons' && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Product Add-ons</Typography>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => setShowAddOnManager(true)}
            >
              Create Add-on
            </Button>
          </Box>
          
          <Typography color="text.secondary">
            Add-on management coming soon
          </Typography>
        </Paper>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Product Performance</Typography>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Top Selling Products</Typography>
                <List>
                  {productStats.topSelling.slice(0, 5).map((product, index) => (
                    <ListItem key={product.id}>
                      <ListItemText
                        primary={`${index + 1}. ${product.name}`}
                        secondary={`${product.analytics?.purchases || 0} sales`}
                      />
                      <Chip label={formatCurrency(product.analytics?.revenue || 0)} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Add Product Dialog */}
      <Dialog
        open={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={productForm.category}
                  onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={productForm.inventory.sku}
                onChange={(e) => setProductForm(prev => ({
                  ...prev,
                  inventory: { ...prev.inventory, sku: e.target.value }
                }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Base Price"
                value={productForm.pricing.basePrice}
                onChange={(e) => setProductForm(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing, basePrice: parseFloat(e.target.value) }
                }))}
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Pricing Type</InputLabel>
                <Select
                  value={productForm.pricing.type}
                  onChange={(e) => setProductForm(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, type: e.target.value }
                  }))}
                  label="Pricing Type"
                >
                  <MenuItem value="one-time">One-time</MenuItem>
                  <MenuItem value="recurring">Recurring</MenuItem>
                  <MenuItem value="tiered">Tiered</MenuItem>
                  <MenuItem value="volume">Volume</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {productForm.pricing.type === 'recurring' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Billing Interval</InputLabel>
                  <Select
                    value={productForm.pricing.billingInterval || ''}
                    onChange={(e) => setProductForm(prev => ({
                      ...prev,
                      pricing: { ...prev.pricing, billingInterval: e.target.value }
                    }))}
                    label="Billing Interval"
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="annual">Annual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={productForm.availability.status}
                  onChange={(e) => setProductForm(prev => ({
                    ...prev,
                    availability: { ...prev.availability, status: e.target.value }
                  }))}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddProduct(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateProduct}
            disabled={saving || !productForm.name || !productForm.pricing.basePrice}
          >
            {saving ? 'Creating...' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.show}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, show: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, show: false })}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;
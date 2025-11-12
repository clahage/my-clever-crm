// src/components/ProductVariantsBuilder.jsx
// Advanced Product Variants System with SKU Generation, Pricing Matrix, Inventory Tracking

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where,
  getDocs, onSnapshot, serverTimestamp, orderBy, writeBatch
} from 'firebase/firestore';

import {
  Box, Paper, Typography, Button, TextField, Grid, Card, CardContent,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton,
  Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Alert, Snackbar,
  List, ListItem, ListItemText, Divider, CircularProgress, Avatar,
  Stack, Badge, CardHeader, CardActions, InputAdornment, Checkbox,
  FormControlLabel, Switch, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';

import {
  Package, Plus, Edit2, Trash2, Copy, Eye, Download, Upload, RefreshCw,
  Settings, ChevronDown, ChevronUp, Grid as GridIcon, List as ListIcon,
  DollarSign, Image as ImageIcon, Tag, Box as BoxIcon, Layers,
  ShoppingCart, TrendingUp, BarChart2, Search, Filter, Check, X
} from 'lucide-react';

const ProductVariantsBuilder = () => {
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    baseSKU: '',
    category: '',
    brand: '',
    hasVariants: true
  });

  const [variantForm, setVariantForm] = useState({
    productId: '',
    name: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    cost: '',
    quantity: 0,
    weight: '',
    barcode: '',
    options: {},
    images: [],
    isActive: true
  });

  const [optionForm, setOptionForm] = useState({
    productId: '',
    optionName: '',
    optionValues: ['']
  });

  const [bulkEditForm, setBulkEditForm] = useState({
    field: 'price',
    operation: 'set',
    value: '',
    selectedVariants: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalVariants: 0,
    activeVariants: 0,
    totalValue: 0,
    avgVariantsPerProduct: 0,
    outOfStock: 0
  });

  // Load Data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadVariants(),
        loadVariantOptions()
      ]);
      calculateStats();
    } catch (error) {
      console.error('Error loading variant data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const q = query(collection(db, 'variantProducts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadVariants = async () => {
    const q = query(collection(db, 'productVariants'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setVariants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadVariantOptions = async () => {
    const q = query(collection(db, 'variantOptions'));
    const snapshot = await getDocs(q);
    setVariantOptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const totalVariants = variants.length;
    const activeVariants = variants.filter(v => v.isActive).length;
    const totalValue = variants.reduce((sum, v) => sum + ((v.quantity || 0) * (v.cost || 0)), 0);
    const avgVariantsPerProduct = totalProducts > 0 ? (totalVariants / totalProducts).toFixed(1) : 0;
    const outOfStock = variants.filter(v => v.quantity === 0).length;

    setStats({
      totalProducts,
      totalVariants,
      activeVariants,
      totalValue,
      avgVariantsPerProduct,
      outOfStock
    });
  };

  // Handlers
  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.baseSKU) {
      showNotification('Please fill required fields', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'variantProducts'), {
        ...productForm,
        basePrice: parseFloat(productForm.basePrice || 0),
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Product created!', 'success');
      setShowProductDialog(false);
      setProductForm({
        name: '', description: '', basePrice: '', baseSKU: '',
        category: '', brand: '', hasVariants: true
      });
      loadProducts();
      calculateStats();
    } catch (error) {
      console.error('Error creating product:', error);
      showNotification('Error creating product', 'error');
    }
  };

  const handleCreateVariant = async () => {
    if (!variantForm.productId || !variantForm.sku) {
      showNotification('Please fill required fields', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'productVariants'), {
        ...variantForm,
        price: parseFloat(variantForm.price || 0),
        compareAtPrice: parseFloat(variantForm.compareAtPrice || 0),
        cost: parseFloat(variantForm.cost || 0),
        quantity: parseInt(variantForm.quantity || 0),
        weight: parseFloat(variantForm.weight || 0),
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Variant created!', 'success');
      setShowVariantDialog(false);
      setVariantForm({
        productId: '', name: '', sku: '', price: '', compareAtPrice: '',
        cost: '', quantity: 0, weight: '', barcode: '', options: {},
        images: [], isActive: true
      });
      loadVariants();
      calculateStats();
    } catch (error) {
      console.error('Error creating variant:', error);
      showNotification('Error creating variant', 'error');
    }
  };

  const handleCreateOption = async () => {
    if (!optionForm.productId || !optionForm.optionName) {
      showNotification('Please fill required fields', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'variantOptions'), {
        ...optionForm,
        optionValues: optionForm.optionValues.filter(v => v.trim() !== ''),
        createdAt: serverTimestamp()
      });

      showNotification('Option created!', 'success');
      setShowOptionDialog(false);
      setOptionForm({ productId: '', optionName: '', optionValues: [''] });
      loadVariantOptions();
    } catch (error) {
      console.error('Error creating option:', error);
      showNotification('Error creating option', 'error');
    }
  };

  const handleGenerateVariants = async (productId) => {
    const product = products.find(p => p.id === productId);
    const productOptions = variantOptions.filter(o => o.productId === productId);

    if (productOptions.length === 0) {
      showNotification('Add variant options first', 'warning');
      return;
    }

    try {
      const combinations = generateCombinations(productOptions);
      const batch = writeBatch(db);

      combinations.forEach((combo, index) => {
        const variantRef = doc(collection(db, 'productVariants'));
        const sku = `${product.baseSKU}-${index + 1}`;
        const name = `${product.name} - ${combo.label}`;

        batch.set(variantRef, {
          productId,
          name,
          sku,
          price: parseFloat(product.basePrice || 0),
          compareAtPrice: 0,
          cost: 0,
          quantity: 0,
          weight: 0,
          barcode: '',
          options: combo.options,
          images: [],
          isActive: true,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      });

      await batch.commit();
      showNotification(`${combinations.length} variants generated!`, 'success');
      loadVariants();
      calculateStats();
    } catch (error) {
      console.error('Error generating variants:', error);
      showNotification('Error generating variants', 'error');
    }
  };

  const generateCombinations = (options) => {
    if (options.length === 0) return [];
    if (options.length === 1) {
      return options[0].optionValues.map(value => ({
        label: value,
        options: { [options[0].optionName]: value }
      }));
    }

    const result = [];
    const helper = (index, current, currentOptions) => {
      if (index === options.length) {
        result.push({
          label: current.join(' / '),
          options: { ...currentOptions }
        });
        return;
      }

      options[index].optionValues.forEach(value => {
        helper(
          index + 1,
          [...current, value],
          { ...currentOptions, [options[index].optionName]: value }
        );
      });
    };

    helper(0, [], {});
    return result;
  };

  const handleBulkEdit = async () => {
    if (bulkEditForm.selectedVariants.length === 0) {
      showNotification('Please select variants', 'warning');
      return;
    }

    try {
      const batch = writeBatch(db);

      bulkEditForm.selectedVariants.forEach(variantId => {
        const variantRef = doc(db, 'productVariants', variantId);
        const value = parseFloat(bulkEditForm.value || 0);

        if (bulkEditForm.operation === 'set') {
          batch.update(variantRef, { [bulkEditForm.field]: value });
        } else if (bulkEditForm.operation === 'increase') {
          const variant = variants.find(v => v.id === variantId);
          const currentValue = variant?.[bulkEditForm.field] || 0;
          batch.update(variantRef, { [bulkEditForm.field]: currentValue + value });
        } else if (bulkEditForm.operation === 'decrease') {
          const variant = variants.find(v => v.id === variantId);
          const currentValue = variant?.[bulkEditForm.field] || 0;
          batch.update(variantRef, { [bulkEditForm.field]: Math.max(0, currentValue - value) });
        } else if (bulkEditForm.operation === 'percent') {
          const variant = variants.find(v => v.id === variantId);
          const currentValue = variant?.[bulkEditForm.field] || 0;
          batch.update(variantRef, { 
            [bulkEditForm.field]: currentValue * (1 + value / 100) 
          });
        }
      });

      await batch.commit();
      showNotification('Variants updated!', 'success');
      setShowBulkEditDialog(false);
      setBulkEditForm({ field: 'price', operation: 'set', value: '', selectedVariants: [] });
      loadVariants();
    } catch (error) {
      console.error('Error bulk editing:', error);
      showNotification('Error updating variants', 'error');
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Delete this variant?')) return;

    try {
      await deleteDoc(doc(db, 'productVariants', variantId));
      showNotification('Variant deleted', 'success');
      loadVariants();
      calculateStats();
    } catch (error) {
      console.error('Error deleting variant:', error);
      showNotification('Error deleting variant', 'error');
    }
  };

  const handleDuplicateVariant = async (variant) => {
    try {
      await addDoc(collection(db, 'productVariants'), {
        ...variant,
        id: undefined,
        name: `${variant.name} (Copy)`,
        sku: `${variant.sku}-COPY`,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Variant duplicated!', 'success');
      loadVariants();
      calculateStats();
    } catch (error) {
      console.error('Error duplicating variant:', error);
      showNotification('Error duplicating variant', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 5000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Filtered variants
  const filteredVariants = useMemo(() => {
    return variants.filter(v => {
      const product = products.find(p => p.id === v.productId);
      const matchesSearch = searchTerm === '' ||
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product?.category === categoryFilter;
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in' && v.quantity > 0) ||
        (stockFilter === 'out' && v.quantity === 0) ||
        (stockFilter === 'low' && v.quantity > 0 && v.quantity <= 10);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [variants, products, searchTerm, categoryFilter, stockFilter]);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Product Variants Builder
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>Export</Button>
          <Button variant="outlined" startIcon={<RefreshCw />} onClick={loadAllData}>Refresh</Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Products</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.totalProducts}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {stats.totalVariants} variants
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Active Variants</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.activeVariants}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {stats.avgVariantsPerProduct} avg per product
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Total Value</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {formatCurrency(stats.totalValue)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Inventory value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Out of Stock</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.outOfStock}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Needs restocking
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Products" />
          <Tab label="Variants" />
          <Tab label="Bulk Edit" />
        </Tabs>
      </Paper>

      {/* Products Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Product Catalog</Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowProductDialog(true)}>
              Add Product
            </Button>
          </Box>

          <Grid container spacing={3}>
            {products.map(product => {
              const productVariants = variants.filter(v => v.productId === product.id);
              const productOptions = variantOptions.filter(o => o.productId === product.id);

              return (
                <Grid item xs={12} md={6} lg={4} key={product.id}>
                  <Card>
                    <CardHeader
                      avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><Package /></Avatar>}
                      title={product.name}
                      subheader={product.category}
                      action={
                        <Chip label={`${productVariants.length} variants`} size="small" color="primary" />
                      }
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {product.description?.substring(0, 100)}...
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Base SKU</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{product.baseSKU}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Base Price</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatCurrency(product.basePrice)}
                          </Typography>
                        </Grid>
                      </Grid>

                      {productOptions.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">Variant Options:</Typography>
                          {productOptions.map(opt => (
                            <Chip
                              key={opt.id}
                              label={`${opt.optionName}: ${opt.optionValues.length}`}
                              size="small"
                              sx={{ mr: 1, mt: 1 }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<Eye />} onClick={() => setSelectedProduct(product)}>
                        View
                      </Button>
                      <Button size="small" startIcon={<Settings />} onClick={() => {
                        setOptionForm({ ...optionForm, productId: product.id });
                        setShowOptionDialog(true);
                      }}>
                        Options
                      </Button>
                      <Button size="small" startIcon={<Layers />} onClick={() => handleGenerateVariants(product.id)}>
                        Generate
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {products.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Package size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>No products created</Typography>
              <Button variant="contained" startIcon={<Plus />} onClick={() => setShowProductDialog(true)} sx={{ mt: 2 }}>
                Create First Product
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Variants Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search variants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search size={18} style={{ marginRight: 8 }} /> }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Stock</InputLabel>
              <Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                label="Stock"
              >
                <MenuItem value="all">All Stock</MenuItem>
                <MenuItem value="in">In Stock</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={() => setViewMode('grid')}
                sx={{ bgcolor: viewMode === 'grid' ? 'primary.light' : 'transparent' }}
              >
                <GridIcon size={20} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setViewMode('list')}
                sx={{ bgcolor: viewMode === 'list' ? 'primary.light' : 'transparent' }}
              >
                <ListIcon size={20} />
              </IconButton>
            </Stack>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowVariantDialog(true)}>
              Add Variant
            </Button>
          </Box>

          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredVariants.map(variant => {
                const product = products.find(p => p.id === variant.productId);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={variant.id}>
                    <Card>
                      <Box sx={{ height: 200, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={48} style={{ color: '#9CA3AF' }} />
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} noWrap>
                          {variant.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {variant.sku}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(variant.price)}
                          </Typography>
                          <Chip
                            label={variant.quantity > 0 ? `${variant.quantity} in stock` : 'Out'}
                            size="small"
                            color={variant.quantity > 0 ? 'success' : 'error'}
                          />
                        </Box>
                        {Object.keys(variant.options || {}).length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {Object.entries(variant.options).map(([key, value]) => (
                              <Chip key={key} label={`${key}: ${value}`} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        <IconButton size="small" onClick={() => handleDuplicateVariant(variant)}>
                          <Copy size={16} />
                        </IconButton>
                        <IconButton size="small">
                          <Edit2 size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteVariant(variant.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>Variant</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Options</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVariants.map(variant => (
                    <TableRow key={variant.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={bulkEditForm.selectedVariants.includes(variant.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkEditForm({
                                ...bulkEditForm,
                                selectedVariants: [...bulkEditForm.selectedVariants, variant.id]
                              });
                            } else {
                              setBulkEditForm({
                                ...bulkEditForm,
                                selectedVariants: bulkEditForm.selectedVariants.filter(id => id !== variant.id)
                              });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {variant.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{variant.sku}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(variant.price)}</TableCell>
                      <TableCell>{variant.quantity}</TableCell>
                      <TableCell>
                        {Object.entries(variant.options || {}).map(([key, value]) => (
                          <Chip key={key} label={`${key}: ${value}`} size="small" sx={{ mr: 0.5 }} />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={variant.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={variant.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleDuplicateVariant(variant)}>
                          <Copy size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteVariant(variant.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {filteredVariants.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Typography color="text.secondary">No variants found</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Bulk Edit Tab */}
      {activeTab === 2 && (
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Bulk Edit Variants
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Select variants in the Variants tab, then use this tool to update them in bulk.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Field</InputLabel>
                  <Select
                    value={bulkEditForm.field}
                    onChange={(e) => setBulkEditForm({ ...bulkEditForm, field: e.target.value })}
                    label="Field"
                  >
                    <MenuItem value="price">Price</MenuItem>
                    <MenuItem value="compareAtPrice">Compare At Price</MenuItem>
                    <MenuItem value="cost">Cost</MenuItem>
                    <MenuItem value="quantity">Quantity</MenuItem>
                    <MenuItem value="weight">Weight</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Operation</InputLabel>
                  <Select
                    value={bulkEditForm.operation}
                    onChange={(e) => setBulkEditForm({ ...bulkEditForm, operation: e.target.value })}
                    label="Operation"
                  >
                    <MenuItem value="set">Set to</MenuItem>
                    <MenuItem value="increase">Increase by</MenuItem>
                    <MenuItem value="decrease">Decrease by</MenuItem>
                    <MenuItem value="percent">Percent change</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Value"
                  type="number"
                  value={bulkEditForm.value}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, value: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleBulkEdit}
                  disabled={bulkEditForm.selectedVariants.length === 0}
                >
                  Apply to {bulkEditForm.selectedVariants.length} Variants
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Create Product Dialog */}
      <Dialog open={showProductDialog} onClose={() => setShowProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name *"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Base SKU *"
                value={productForm.baseSKU}
                onChange={(e) => setProductForm({ ...productForm, baseSKU: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Base Price"
                type="number"
                value={productForm.basePrice}
                onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Category"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Brand"
                value={productForm.brand}
                onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.hasVariants}
                    onChange={(e) => setProductForm({ ...productForm, hasVariants: e.target.checked })}
                  />
                }
                label="This product has variants"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProductDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateProduct}>Create Product</Button>
        </DialogActions>
      </Dialog>

      {/* Create Variant Dialog */}
      <Dialog open={showVariantDialog} onClose={() => setShowVariantDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Variant</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Product *</InputLabel>
                <Select
                  value={variantForm.productId}
                  onChange={(e) => setVariantForm({ ...variantForm, productId: e.target.value })}
                  label="Product"
                >
                  {products.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Variant Name"
                value={variantForm.name}
                onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU *"
                value={variantForm.sku}
                onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={variantForm.price}
                onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Compare At"
                type="number"
                value={variantForm.compareAtPrice}
                onChange={(e) => setVariantForm({ ...variantForm, compareAtPrice: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={variantForm.cost}
                onChange={(e) => setVariantForm({ ...variantForm, cost: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={variantForm.quantity}
                onChange={(e) => setVariantForm({ ...variantForm, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weight"
                type="number"
                value={variantForm.weight}
                onChange={(e) => setVariantForm({ ...variantForm, weight: e.target.value })}
                InputProps={{ endAdornment: <InputAdornment position="end">lb</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Barcode"
                value={variantForm.barcode}
                onChange={(e) => setVariantForm({ ...variantForm, barcode: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVariantDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateVariant}>Add Variant</Button>
        </DialogActions>
      </Dialog>

      {/* Create Option Dialog */}
      <Dialog open={showOptionDialog} onClose={() => setShowOptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Variant Option</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Option Name (e.g., Size, Color)"
            value={optionForm.optionName}
            onChange={(e) => setOptionForm({ ...optionForm, optionName: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Option Values</Typography>
          {optionForm.optionValues.map((value, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={`Value ${index + 1}`}
                value={value}
                onChange={(e) => {
                  const newValues = [...optionForm.optionValues];
                  newValues[index] = e.target.value;
                  setOptionForm({ ...optionForm, optionValues: newValues });
                }}
              />
              {optionForm.optionValues.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => {
                    const newValues = optionForm.optionValues.filter((_, i) => i !== index);
                    setOptionForm({ ...optionForm, optionValues: newValues });
                  }}
                >
                  <X size={16} />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            startIcon={<Plus />}
            onClick={() => setOptionForm({
              ...optionForm,
              optionValues: [...optionForm.optionValues, '']
            })}
            sx={{ mt: 1 }}
          >
            Add Value
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOptionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateOption}>Create Option</Button>
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
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductVariantsBuilder;
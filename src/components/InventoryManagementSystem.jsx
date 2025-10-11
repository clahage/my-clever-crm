// src/components/InventoryManagementSystem.jsx
// Complete Inventory Management with Stock Tracking, Suppliers, Orders, Alerts

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
  Stack, Badge, LinearProgress, CardHeader, CardActions, InputAdornment
} from '@mui/material';

import {
  Package, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle,
  Plus, Edit2, Trash2, Download, Upload, RefreshCw, Eye, Search,
  ShoppingCart, Truck, Users, DollarSign, BarChart2, Clock, Filter,
  Settings, Bell, Star, Archive, Send, Calendar, Copy
} from 'lucide-react';

import { Bar, Line } from 'react-chartjs-2';

const InventoryManagementSystem = () => {
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showPurchaseOrderDialog, setShowPurchaseOrderDialog] = useState(false);
  const [showStockAdjustDialog, setShowStockAdjustDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    price: '',
    cost: '',
    quantity: 0,
    reorderPoint: 10,
    reorderQuantity: 50,
    supplierId: '',
    location: '',
    unit: 'unit'
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    leadTime: 7,
    minOrder: 1,
    rating: 5
  });

  const [purchaseOrderForm, setPurchaseOrderForm] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: 0, price: 0 }],
    expectedDate: '',
    notes: ''
  });

  const [stockAdjustForm, setStockAdjustForm] = useState({
    productId: '',
    adjustmentType: 'add',
    quantity: 0,
    reason: '',
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStock: 0,
    pendingOrders: 0,
    totalSuppliers: 0,
    avgTurnover: 0,
    monthlyValue: 0
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
        loadSuppliers(),
        loadPurchaseOrders(),
        loadStockMovements()
      ]);
      calculateStats();
      checkLowStockAlerts();
    } catch (error) {
      console.error('Error loading inventory data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const q = query(collection(db, 'inventoryProducts'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadSuppliers = async () => {
    const q = query(collection(db, 'suppliers'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadPurchaseOrders = async () => {
    const q = query(collection(db, 'purchaseOrders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setPurchaseOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadStockMovements = async () => {
    const q = query(collection(db, 'stockMovements'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    setStockMovements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.cost || 0)), 0);
    const lowStockItems = products.filter(p => p.quantity <= p.reorderPoint).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const pendingOrders = purchaseOrders.filter(po => po.status === 'pending' || po.status === 'ordered').length;
    const totalSuppliers = suppliers.length;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyMovements = stockMovements.filter(m => 
      m.timestamp?.toDate() >= monthStart && m.adjustmentType === 'sale'
    );
    const monthlyValue = monthlyMovements.reduce((sum, m) => {
      const product = products.find(p => p.id === m.productId);
      return sum + ((m.quantity || 0) * (product?.price || 0));
    }, 0);

    const avgTurnover = totalProducts > 0 ? (monthlyMovements.length / totalProducts * 30).toFixed(1) : 0;

    setStats({
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStock,
      pendingOrders,
      totalSuppliers,
      avgTurnover,
      monthlyValue
    });
  };

  const checkLowStockAlerts = () => {
    const alerts = products.filter(p => p.quantity <= p.reorderPoint && p.quantity > 0);
    setLowStockAlerts(alerts);
  };

  // Handlers
  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.sku) {
      showNotification('Please fill required fields', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'inventoryProducts'), {
        ...productForm,
        price: parseFloat(productForm.price || 0),
        cost: parseFloat(productForm.cost || 0),
        quantity: parseInt(productForm.quantity || 0),
        reorderPoint: parseInt(productForm.reorderPoint || 10),
        reorderQuantity: parseInt(productForm.reorderQuantity || 50),
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      // Log stock movement
      await addDoc(collection(db, 'stockMovements'), {
        productId: productForm.sku,
        adjustmentType: 'initial',
        quantity: parseInt(productForm.quantity || 0),
        reason: 'Initial stock',
        timestamp: serverTimestamp(),
        userId: user.uid
      });

      showNotification('Product added!', 'success');
      setShowProductDialog(false);
      setProductForm({
        name: '', sku: '', category: '', description: '', price: '', cost: '',
        quantity: 0, reorderPoint: 10, reorderQuantity: 50, supplierId: '', location: '', unit: 'unit'
      });
      loadProducts();
      loadStockMovements();
      calculateStats();
    } catch (error) {
      console.error('Error adding product:', error);
      showNotification('Error adding product', 'error');
    }
  };

  const handleAddSupplier = async () => {
    if (!supplierForm.name || !supplierForm.email) {
      showNotification('Please fill required fields', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'suppliers'), {
        ...supplierForm,
        leadTime: parseInt(supplierForm.leadTime || 7),
        minOrder: parseInt(supplierForm.minOrder || 1),
        rating: parseInt(supplierForm.rating || 5),
        createdAt: serverTimestamp()
      });

      showNotification('Supplier added!', 'success');
      setShowSupplierDialog(false);
      setSupplierForm({ name: '', email: '', phone: '', address: '', leadTime: 7, minOrder: 1, rating: 5 });
      loadSuppliers();
      calculateStats();
    } catch (error) {
      console.error('Error adding supplier:', error);
      showNotification('Error adding supplier', 'error');
    }
  };

  const handleCreatePurchaseOrder = async () => {
    if (!purchaseOrderForm.supplierId || purchaseOrderForm.items.length === 0) {
      showNotification('Please fill required fields', 'warning');
      return;
    }

    try {
      const total = purchaseOrderForm.items.reduce((sum, item) => 
        sum + (item.quantity * item.price), 0
      );

      await addDoc(collection(db, 'purchaseOrders'), {
        ...purchaseOrderForm,
        total,
        status: 'pending',
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Purchase order created!', 'success');
      setShowPurchaseOrderDialog(false);
      setPurchaseOrderForm({
        supplierId: '', items: [{ productId: '', quantity: 0, price: 0 }],
        expectedDate: '', notes: ''
      });
      loadPurchaseOrders();
      calculateStats();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      showNotification('Error creating purchase order', 'error');
    }
  };

  const handleStockAdjustment = async () => {
    if (!stockAdjustForm.productId || !stockAdjustForm.quantity) {
      showNotification('Please fill required fields', 'warning');
      return;
    }

    try {
      const product = products.find(p => p.id === stockAdjustForm.productId);
      if (!product) {
        showNotification('Product not found', 'error');
        return;
      }

      const adjustment = stockAdjustForm.adjustmentType === 'add' 
        ? parseInt(stockAdjustForm.quantity)
        : -parseInt(stockAdjustForm.quantity);

      const newQuantity = Math.max(0, product.quantity + adjustment);

      await updateDoc(doc(db, 'inventoryProducts', stockAdjustForm.productId), {
        quantity: newQuantity,
        lastUpdated: serverTimestamp()
      });

      await addDoc(collection(db, 'stockMovements'), {
        productId: stockAdjustForm.productId,
        adjustmentType: stockAdjustForm.adjustmentType,
        quantity: parseInt(stockAdjustForm.quantity),
        reason: stockAdjustForm.reason,
        notes: stockAdjustForm.notes,
        timestamp: serverTimestamp(),
        userId: user.uid
      });

      showNotification('Stock adjusted!', 'success');
      setShowStockAdjustDialog(false);
      setStockAdjustForm({ productId: '', adjustmentType: 'add', quantity: 0, reason: '', notes: '' });
      loadProducts();
      loadStockMovements();
      calculateStats();
      checkLowStockAlerts();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      showNotification('Error adjusting stock', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'inventoryProducts', productId));
      showNotification('Product deleted', 'success');
      loadProducts();
      calculateStats();
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Error deleting product', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 5000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = searchTerm === '' || 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStock = 
        stockFilter === 'all' ||
        (stockFilter === 'low' && p.quantity <= p.reorderPoint) ||
        (stockFilter === 'out' && p.quantity === 0) ||
        (stockFilter === 'ok' && p.quantity > p.reorderPoint);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Chart Data
  const getStockValueChart = () => {
    const topProducts = [...products]
      .sort((a, b) => ((b.quantity * b.cost) - (a.quantity * a.cost)))
      .slice(0, 10);

    return {
      labels: topProducts.map(p => p.name),
      datasets: [{
        label: 'Stock Value',
        data: topProducts.map(p => p.quantity * p.cost),
        backgroundColor: '#3B82F6',
        borderRadius: 8
      }]
    };
  };

  const getStockMovementChart = () => {
    const last7Days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      last7Days.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        in: 0,
        out: 0
      });
    }

    stockMovements.forEach(m => {
      const date = m.timestamp?.toDate();
      if (date) {
        const dayDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          if (m.adjustmentType === 'add' || m.adjustmentType === 'purchase') {
            last7Days[6 - dayDiff].in += m.quantity;
          } else {
            last7Days[6 - dayDiff].out += m.quantity;
          }
        }
      }
    });

    return {
      labels: last7Days.map(d => d.label),
      datasets: [
        {
          label: 'Stock In',
          data: last7Days.map(d => d.in),
          backgroundColor: '#10B981',
          borderRadius: 8
        },
        {
          label: 'Stock Out',
          data: last7Days.map(d => d.out),
          backgroundColor: '#EF4444',
          borderRadius: 8
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' } },
    scales: { y: { beginAtZero: true } }
  };

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
          Inventory Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>Export</Button>
          <Button variant="outlined" startIcon={<RefreshCw />} onClick={loadAllData}>Refresh</Button>
        </Stack>
      </Box>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<AlertCircle />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {lowStockAlerts.length} items are low on stock
          </Typography>
          <Typography variant="caption">
            {lowStockAlerts.slice(0, 3).map(p => p.name).join(', ')}
            {lowStockAlerts.length > 3 && ` and ${lowStockAlerts.length - 3} more`}
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Total Products</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.totalProducts}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {categories.length} categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Stock Value</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {formatCurrency(stats.totalValue)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Total inventory value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Low Stock</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.lowStockItems}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {stats.outOfStock} out of stock
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Pending Orders</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.pendingOrders}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {stats.totalSuppliers} suppliers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Products" />
          <Tab label="Suppliers" />
          <Tab label="Purchase Orders" />
          <Tab label="Stock Movements" />
        </Tabs>
      </Paper>

      {/* Products Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search products..."
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
              <InputLabel>Stock Level</InputLabel>
              <Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                label="Stock Level"
              >
                <MenuItem value="all">All Stock</MenuItem>
                <MenuItem value="ok">In Stock</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowProductDialog(true)}>
              Add Product
            </Button>
            <Button variant="outlined" startIcon={<Edit2 />} onClick={() => setShowStockAdjustDialog(true)}>
              Adjust Stock
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Top Products by Value
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={getStockValueChart()} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Stock Movement (Last 7 Days)
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={getStockMovementChart()} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.description?.substring(0, 30)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      <Chip label={product.category || 'N/A'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {product.quantity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.unit}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(product.quantity * product.cost)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          product.quantity === 0 ? 'OUT' :
                          product.quantity <= product.reorderPoint ? 'LOW' : 'OK'
                        }
                        size="small"
                        color={
                          product.quantity === 0 ? 'error' :
                          product.quantity <= product.reorderPoint ? 'warning' : 'success'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setSelectedProduct(product)}>
                        <Eye size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredProducts.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Package size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">No products found</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Suppliers Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Suppliers</Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowSupplierDialog(true)}>
              Add Supplier
            </Button>
          </Box>

          <Grid container spacing={3}>
            {suppliers.map(supplier => (
              <Grid item xs={12} md={6} lg={4} key={supplier.id}>
                <Card>
                  <CardHeader
                    avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{supplier.name[0]}</Avatar>}
                    title={supplier.name}
                    subheader={supplier.email}
                    action={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star size={16} style={{ color: '#F59E0B' }} />
                        <Typography variant="caption">{supplier.rating}/5</Typography>
                      </Box>
                    }
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Lead Time</Typography>
                        <Typography variant="body2">{supplier.leadTime} days</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Min Order</Typography>
                        <Typography variant="body2">{supplier.minOrder} units</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<ShoppingCart />}>Order</Button>
                    <Button size="small" startIcon={<Eye />}>View</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {suppliers.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Truck size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>No suppliers added</Typography>
              <Button variant="contained" startIcon={<Plus />} onClick={() => setShowSupplierDialog(true)} sx={{ mt: 2 }}>
                Add First Supplier
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Purchase Orders</Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowPurchaseOrderDialog(true)}>
              Create Order
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>PO #</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Expected</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseOrders.map((po, index) => (
                  <TableRow key={po.id} hover>
                    <TableCell>PO-{1000 + index}</TableCell>
                    <TableCell>{suppliers.find(s => s.id === po.supplierId)?.name || 'N/A'}</TableCell>
                    <TableCell>{po.items?.length || 0}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(po.total)}</TableCell>
                    <TableCell>{formatDate(po.expectedDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={po.status?.toUpperCase() || 'PENDING'}
                        size="small"
                        color={
                          po.status === 'received' ? 'success' :
                          po.status === 'ordered' ? 'info' : 'warning'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small"><Eye size={16} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {purchaseOrders.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <ShoppingCart size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">No purchase orders</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Stock Movements Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Stock Movement History</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockMovements.slice(0, 50).map(movement => (
                  <TableRow key={movement.id} hover>
                    <TableCell>{formatDate(movement.timestamp)}</TableCell>
                    <TableCell>{products.find(p => p.id === movement.productId)?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={movement.adjustmentType?.toUpperCase()}
                        size="small"
                        color={
                          movement.adjustmentType === 'add' || movement.adjustmentType === 'purchase' ? 'success' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{movement.quantity}</TableCell>
                    <TableCell>{movement.reason || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {stockMovements.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Typography color="text.secondary">No stock movements recorded</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showProductDialog} onClose={() => setShowProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name *"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU *"
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={productForm.location}
                onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={productForm.cost}
                onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={productForm.quantity}
                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Unit"
                value={productForm.unit}
                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Reorder Point"
                type="number"
                value={productForm.reorderPoint}
                onChange={(e) => setProductForm({ ...productForm, reorderPoint: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Reorder Quantity"
                type="number"
                value={productForm.reorderQuantity}
                onChange={(e) => setProductForm({ ...productForm, reorderQuantity: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProductDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProduct}>Add Product</Button>
        </DialogActions>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={showSupplierDialog} onClose={() => setShowSupplierDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Supplier</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Supplier Name *"
            value={supplierForm.name}
            onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email *"
            type="email"
            value={supplierForm.email}
            onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            value={supplierForm.phone}
            onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={2}
            value={supplierForm.address}
            onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Lead Time (days)"
                type="number"
                value={supplierForm.leadTime}
                onChange={(e) => setSupplierForm({ ...supplierForm, leadTime: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Min Order"
                type="number"
                value={supplierForm.minOrder}
                onChange={(e) => setSupplierForm({ ...supplierForm, minOrder: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Rating (1-5)"
                type="number"
                value={supplierForm.rating}
                onChange={(e) => setSupplierForm({ ...supplierForm, rating: e.target.value })}
                inputProps={{ min: 1, max: 5 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSupplierDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSupplier}>Add Supplier</Button>
        </DialogActions>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showStockAdjustDialog} onClose={() => setShowStockAdjustDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Stock</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Product</InputLabel>
            <Select
              value={stockAdjustForm.productId}
              onChange={(e) => setStockAdjustForm({ ...stockAdjustForm, productId: e.target.value })}
              label="Product"
            >
              {products.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name} (Current: {p.quantity})</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Adjustment Type</InputLabel>
            <Select
              value={stockAdjustForm.adjustmentType}
              onChange={(e) => setStockAdjustForm({ ...stockAdjustForm, adjustmentType: e.target.value })}
              label="Adjustment Type"
            >
              <MenuItem value="add">Add Stock</MenuItem>
              <MenuItem value="remove">Remove Stock</MenuItem>
              <MenuItem value="sale">Sale</MenuItem>
              <MenuItem value="damage">Damage/Loss</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={stockAdjustForm.quantity}
            onChange={(e) => setStockAdjustForm({ ...stockAdjustForm, quantity: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Reason"
            value={stockAdjustForm.reason}
            onChange={(e) => setStockAdjustForm({ ...stockAdjustForm, reason: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={2}
            value={stockAdjustForm.notes}
            onChange={(e) => setStockAdjustForm({ ...stockAdjustForm, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStockAdjustDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStockAdjustment}>Adjust Stock</Button>
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

export default InventoryManagementSystem;
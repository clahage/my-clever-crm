// src/pages/Invoices.jsx - Complete Invoice Management System
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Stack,
  Tooltip,
  Badge,
  CircularProgress,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  DollarSign,
  FileText,
  Download,
  Send,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Printer,
  Copy,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Package,
  User,
  Building,
  Phone,
  MapPin,
  Hash,
  Eye,
  RefreshCw,
  Archive,
  Settings,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Info,
  Zap,
  Shield,
  Award,
  Percent
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  getDoc,
  setDoc,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, subMonths, } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Invoices = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState({
    type: 'invoice', // invoice, quote, receipt
    status: 'draft', // draft, sent, viewed, paid, overdue, cancelled
    invoiceNumber: '',
    client: null,
    issueDate: new Date(),
    dueDate: addDays(new Date(), 30),
    items: [],
    subtotal: 0,
    tax: 0,
    taxRate: 8.5,
    discount: 0,
    discountType: 'percentage', // percentage or fixed
    total: 0,
    notes: '',
    terms: 'Payment due within 30 days',
    paymentMethod: '',
    recurring: {
      enabled: false,
      frequency: 'monthly', // weekly, monthly, quarterly, yearly
      nextDate: null,
      endDate: null
    },
    reminders: {
      enabled: true,
      beforeDue: [7, 3, 1], // days before due
      afterDue: [1, 3, 7, 14] // days after due
    },
    metadata: {
      sentAt: null,
      viewedAt: null,
      paidAt: null,
      remindersSent: []
    }
  });

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'credit_card', // credit_card, bank_transfer, cash, check, paypal, stripe
    reference: '',
    date: new Date(),
    notes: ''
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    totalInvoices: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalRevenue: 0,
    averagePaymentTime: 0,
    monthlyRevenue: [],
    topClients: []
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Product/Service Templates
  const serviceTemplates = [
    { id: 'credit_repair', name: 'Credit Repair Service', price: 99.99, description: 'Monthly credit repair service' },
    { id: 'dispute_letter', name: 'Dispute Letter', price: 49.99, description: 'Single dispute letter creation and sending' },
    { id: 'credit_monitoring', name: 'Credit Monitoring', price: 29.99, description: 'Monthly credit monitoring service' },
    { id: 'consultation', name: 'Credit Consultation', price: 149.99, description: 'One-time credit consultation' },
    { id: 'business_credit', name: 'Business Credit Building', price: 199.99, description: 'Business credit establishment service' },
    { id: 'identity_theft', name: 'Identity Theft Protection', price: 39.99, description: 'Monthly identity protection service' }
  ];

  // Load invoices
  const loadInvoices = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'invoices'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const invoicesData = [];
      
      querySnapshot.forEach((doc) => {
        invoicesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setInvoices(invoicesData);
      calculateStatistics(invoicesData);
      checkOverdueInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setSnackbar({
        open: true,
        message: 'Error loading invoices',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load contacts
  const loadContacts = async () => {
    try {
      const q = query(
        collection(db, 'contacts'),
        where('userId', '==', currentUser.uid),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const contactsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        contactsData.push({
          id: doc.id,
          ...data,
          displayName: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email
        });
      });
      
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // Calculate statistics
  const calculateStatistics = (invoicesData) => {
    const stats = {
      totalInvoices: invoicesData.length,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      totalRevenue: 0,
      averagePaymentTime: 0,
      monthlyRevenue: [],
      topClients: []
    };

    let totalPaymentDays = 0;
    let paidCount = 0;
    const clientRevenue = {};
    const now = new Date();

    invoicesData.forEach(invoice => {
      if (invoice.status === 'paid') {
        stats.totalPaid += invoice.total || 0;
        stats.totalRevenue += invoice.total || 0;
        
        // Calculate payment time
        if (invoice.metadata?.paidAt && invoice.issueDate) {
          const issueDate = invoice.issueDate.toDate ? invoice.issueDate.toDate() : new Date(invoice.issueDate);
          const paidDate = invoice.metadata.paidAt.toDate ? invoice.metadata.paidAt.toDate() : new Date(invoice.metadata.paidAt);
          totalPaymentDays += differenceInDays(paidDate, issueDate);
          paidCount++;
        }
        
        // Track client revenue
        if (invoice.client?.id) {
          clientRevenue[invoice.client.id] = (clientRevenue[invoice.client.id] || 0) + (invoice.total || 0);
        }
      } else if (invoice.status === 'sent' || invoice.status === 'viewed') {
        const dueDate = invoice.dueDate?.toDate ? invoice.dueDate.toDate() : new Date(invoice.dueDate);
        if (dueDate < now) {
          stats.totalOverdue += invoice.total || 0;
        } else {
          stats.totalPending += invoice.total || 0;
        }
      }
    });

    // Calculate average payment time
    if (paidCount > 0) {
      stats.averagePaymentTime = Math.round(totalPaymentDays / paidCount);
    }

    // Get top clients
    stats.topClients = Object.entries(clientRevenue)
      .map(([clientId, revenue]) => {
        const client = invoicesData.find(inv => inv.client?.id === clientId)?.client;
        return { ...client, revenue };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate monthly revenue (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      
      const monthRevenue = invoicesData
        .filter(inv => {
          if (inv.status !== 'paid') return false;
          const paidDate = inv.metadata?.paidAt?.toDate ? inv.metadata.paidAt.toDate() : new Date(inv.metadata?.paidAt);
          return paidDate >= monthStart && paidDate <= monthEnd;
        })
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      monthlyData.push({
        month: format(monthStart, 'MMM'),
        revenue: monthRevenue
      });
    }
    stats.monthlyRevenue = monthlyData;

    setStatistics(stats);
  };

  // Check and update overdue invoices
  const checkOverdueInvoices = async (invoicesData) => {
    const now = new Date();
    const updates = [];

    invoicesData.forEach(invoice => {
      if ((invoice.status === 'sent' || invoice.status === 'viewed') && invoice.dueDate) {
        const dueDate = invoice.dueDate.toDate ? invoice.dueDate.toDate() : new Date(invoice.dueDate);
        if (dueDate < now && invoice.status !== 'overdue') {
          updates.push({
            id: invoice.id,
            status: 'overdue'
          });
        }
      }
    });

    // Update overdue invoices in database
    for (const update of updates) {
      try {
        await updateDoc(doc(db, 'invoices', update.id), {
          status: update.status,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating overdue invoice:', error);
      }
    }

    if (updates.length > 0) {
      loadInvoices(); // Reload to show updated statuses
    }
  };

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const prefix = 'INV';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  };

  // Calculate invoice totals
  const calculateTotals = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    let discount = 0;
    if (invoiceForm.discountType === 'percentage') {
      discount = (subtotal * invoiceForm.discount) / 100;
    } else {
      discount = invoiceForm.discount;
    }
    
    const taxableAmount = subtotal - discount;
    const tax = (taxableAmount * invoiceForm.taxRate) / 100;
    const total = taxableAmount + tax;
    
    setInvoiceForm(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  // Add item to invoice
  const addInvoiceItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(),
        name: '',
        description: '',
        quantity: 1,
        price: 0,
        total: 0
      }]
    }));
  };

  // Update invoice item
  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    
    setInvoiceForm(prev => ({
      ...prev,
      items: newItems
    }));
    
    calculateTotals();
  };

  // Remove invoice item
  const removeInvoiceItem = (index) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    calculateTotals();
  };

  // Create invoice
  const handleCreateInvoice = async () => {
    setLoading(true);
    try {
      const invoiceData = {
        ...invoiceForm,
        invoiceNumber: invoiceForm.invoiceNumber || generateInvoiceNumber(),
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
      
      setSnackbar({
        open: true,
        message: 'Invoice created successfully!',
        severity: 'success'
      });
      
      setDialogOpen(false);
      resetInvoiceForm();
      loadInvoices();
      
      // Set up recurring invoice if enabled
      if (invoiceForm.recurring.enabled) {
        await createRecurringInvoice(docRef.id, invoiceForm.recurring);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setSnackbar({
        open: true,
        message: 'Error creating invoice',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update invoice
  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'invoices', selectedInvoice.id), {
        ...invoiceForm,
        updatedAt: serverTimestamp()
      });
      
      setSnackbar({
        open: true,
        message: 'Invoice updated successfully!',
        severity: 'success'
      });
      
      setDialogOpen(false);
      resetInvoiceForm();
      loadInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      setSnackbar({
        open: true,
        message: 'Error updating invoice',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Send invoice
  const handleSendInvoice = async (invoice) => {
    try {
      // In a real app, this would send an email with the invoice PDF
      await updateDoc(doc(db, 'invoices', invoice.id), {
        status: 'sent',
        'metadata.sentAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Log activity
      await addDoc(collection(db, 'invoiceActivities'), {
        invoiceId: invoice.id,
        type: 'sent',
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        details: {
          to: invoice.client?.email,
          method: 'email'
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Invoice sent successfully!',
        severity: 'success'
      });
      
      loadInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
      setSnackbar({
        open: true,
        message: 'Error sending invoice',
        severity: 'error'
      });
    }
  };

  // Record payment
  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;
    
    setLoading(true);
    try {
      // Update invoice status
      await updateDoc(doc(db, 'invoices', selectedInvoice.id), {
        status: 'paid',
        'metadata.paidAt': serverTimestamp(),
        paymentMethod: paymentForm.method,
        paymentReference: paymentForm.reference,
        updatedAt: serverTimestamp()
      });
      
      // Create payment record
      await addDoc(collection(db, 'payments'), {
        invoiceId: selectedInvoice.id,
        ...paymentForm,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      
      // Log activity
      await addDoc(collection(db, 'invoiceActivities'), {
        invoiceId: selectedInvoice.id,
        type: 'payment_received',
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        details: paymentForm
      });
      
      setSnackbar({
        open: true,
        message: 'Payment recorded successfully!',
        severity: 'success'
      });
      
      setPaymentDialogOpen(false);
      resetPaymentForm();
      loadInvoices();
    } catch (error) {
      console.error('Error recording payment:', error);
      setSnackbar({
        open: true,
        message: 'Error recording payment',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await deleteDoc(doc(db, 'invoices', invoiceId));
      
      setSnackbar({
        open: true,
        message: 'Invoice deleted successfully',
        severity: 'success'
      });
      
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting invoice',
        severity: 'error'
      });
    }
  };

  // Export invoice as PDF
  const exportInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    // Invoice details
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40);
    doc.text(`Date: ${format(invoice.issueDate.toDate ? invoice.issueDate.toDate() : new Date(invoice.issueDate), 'MM/dd/yyyy')}`, 20, 50);
    doc.text(`Due Date: ${format(invoice.dueDate.toDate ? invoice.dueDate.toDate() : new Date(invoice.dueDate), 'MM/dd/yyyy')}`, 20, 60);
    
    // Client details
    if (invoice.client) {
      doc.text('Bill To:', 20, 80);
      doc.text(invoice.client.displayName || invoice.client.name, 20, 90);
      if (invoice.client.email) doc.text(invoice.client.email, 20, 100);
      if (invoice.client.phone) doc.text(invoice.client.phone, 20, 110);
    }
    
    // Items table
    const tableData = invoice.items.map(item => [
      item.name,
      item.description,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);
    
    doc.autoTable({
      head: [['Item', 'Description', 'Qty', 'Price', 'Total']],
      body: tableData,
      startY: 130,
      theme: 'grid'
    });
    
    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 150, finalY);
    if (invoice.discount > 0) {
      doc.text(`Discount: -$${((invoice.discountType === 'percentage' ? (invoice.subtotal * invoice.discount / 100) : invoice.discount)).toFixed(2)}`, 150, finalY + 10);
    }
    doc.text(`Tax (${invoice.taxRate}%): $${invoice.tax.toFixed(2)}`, 150, finalY + 20);
    doc.setFontSize(14);
    doc.text(`Total: $${invoice.total.toFixed(2)}`, 150, finalY + 30);
    
    // Notes
    if (invoice.notes) {
      doc.setFontSize(10);
      doc.text('Notes:', 20, finalY + 50);
      doc.text(invoice.notes, 20, finalY + 60);
    }
    
    // Save PDF
    doc.save(`invoice_${invoice.invoiceNumber}.pdf`);
  };

  // Duplicate invoice
  const duplicateInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      invoiceNumber: generateInvoiceNumber(),
      status: 'draft',
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      metadata: {
        sentAt: null,
        viewedAt: null,
        paidAt: null,
        remindersSent: []
      }
    };
    
    delete newInvoice.id;
    delete newInvoice.createdAt;
    delete newInvoice.updatedAt;
    
    setInvoiceForm(newInvoice);
    setSelectedInvoice(null);
    setDialogOpen(true);
  };

  // Create recurring invoice
  const createRecurringInvoice = async (templateId, recurringConfig) => {
    try {
      await addDoc(collection(db, 'recurringInvoices'), {
        templateId,
        userId: currentUser.uid,
        ...recurringConfig,
        lastGenerated: null,
        active: true,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating recurring invoice:', error);
    }
  };

  // Reset forms
  const resetInvoiceForm = () => {
    setInvoiceForm({
      type: 'invoice',
      status: 'draft',
      invoiceNumber: '',
      client: null,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      items: [],
      subtotal: 0,
      tax: 0,
      taxRate: 8.5,
      discount: 0,
      discountType: 'percentage',
      total: 0,
      notes: '',
      terms: 'Payment due within 30 days',
      paymentMethod: '',
      recurring: {
        enabled: false,
        frequency: 'monthly',
        nextDate: null,
        endDate: null
      },
      reminders: {
        enabled: true,
        beforeDue: [7, 3, 1],
        afterDue: [1, 3, 7, 14]
      },
      metadata: {
        sentAt: null,
        viewedAt: null,
        paidAt: null,
        remindersSent: []
      }
    });
    setSelectedInvoice(null);
    setActiveStep(0);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: 0,
      method: 'credit_card',
      reference: '',
      date: new Date(),
      notes: ''
    });
    setSelectedInvoice(null);
  };

  // Initialize
  useEffect(() => {
    if (currentUser) {
      loadInvoices();
      loadContacts();
    }
  }, [currentUser]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Status filter
      if (filterStatus !== 'all' && invoice.status !== filterStatus) return false;
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          invoice.invoiceNumber?.toLowerCase().includes(search) ||
          invoice.client?.displayName?.toLowerCase().includes(search) ||
          invoice.client?.email?.toLowerCase().includes(search)
        );
      }
      
      // Date range filter
      if (dateRange.start && dateRange.end) {
        const invoiceDate = invoice.issueDate?.toDate ? invoice.issueDate.toDate() : new Date(invoice.issueDate);
        return invoiceDate >= dateRange.start && invoiceDate <= dateRange.end;
      }
      
      return true;
    });
  }, [invoices, filterStatus, searchTerm, dateRange]);

  const steps = ['Details', 'Items', 'Summary'];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Invoices
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your invoices and payments
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download size={20} />}
              onClick={() => {/* Export all invoices */}}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => {
                resetInvoiceForm();
                setInvoiceForm(prev => ({
                  ...prev,
                  invoiceNumber: generateInvoiceNumber()
                }));
                setDialogOpen(true);
              }}
            >
              Create Invoice
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      ${statistics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      <TrendingUp size={12} /> 12% from last month
                    </Typography>
                  </Box>
                  <DollarSign size={24} color="#10B981" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      ${statistics.totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Awaiting payment
                    </Typography>
                  </Box>
                  <Clock size={24} color="#F59E0B" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Overdue</Typography>
                    <Typography variant="h4" fontWeight={600} color="error.main">
                      ${statistics.totalOverdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" color="error.main">
                      Requires attention
                    </Typography>
                  </Box>
                  <AlertCircle size={24} color="#EF4444" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Avg Payment Time</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.averagePaymentTime} days
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Industry avg: 45 days
                    </Typography>
                  </Box>
                  <Calendar size={24} color="#8B5CF6" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label={`All Invoices (${invoices.length})`} />
            <Tab label="Recurring" />
            <Tab label="Analytics" />
          </Tabs>

          {/* All Invoices Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              {/* Filters */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search invoices..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search size={18} />
                  }}
                  sx={{ width: 300 }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="viewed">Viewed</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
              </Box>

              {/* Invoices Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Issue Date</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInvoices
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {invoice.invoiceNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {invoice.client?.displayName || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {invoice.client?.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              ${invoice.total?.toFixed(2) || '0.00'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {format(
                              invoice.issueDate?.toDate ? invoice.issueDate.toDate() : new Date(invoice.issueDate),
                              'MM/dd/yyyy'
                            )}
                          </TableCell>
                          <TableCell>
                            {format(
                              invoice.dueDate?.toDate ? invoice.dueDate.toDate() : new Date(invoice.dueDate),
                              'MM/dd/yyyy'
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status}
                              size="small"
                              color={
                                invoice.status === 'paid' ? 'success' :
                                invoice.status === 'overdue' ? 'error' :
                                invoice.status === 'sent' || invoice.status === 'viewed' ? 'warning' :
                                'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View">
                                <IconButton size="small" onClick={() => {/* View invoice */}}>
                                  <Eye size={16} />
                                </IconButton>
                              </Tooltip>
                              
                              {invoice.status === 'draft' && (
                                <Tooltip title="Send">
                                  <IconButton size="small" onClick={() => handleSendInvoice(invoice)}>
                                    <Send size={16} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && (
                                <Tooltip title="Record Payment">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => {
                                      setSelectedInvoice(invoice);
                                      setPaymentForm(prev => ({
                                        ...prev,
                                        amount: invoice.total
                                      }));
                                      setPaymentDialogOpen(true);
                                    }}
                                  >
                                    <CreditCard size={16} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              <Tooltip title="Download PDF">
                                <IconButton size="small" onClick={() => exportInvoicePDF(invoice)}>
                                  <Download size={16} />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Duplicate">
                                <IconButton size="small" onClick={() => duplicateInvoice(invoice)}>
                                  <Copy size={16} />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="More">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    setAnchorEl(e.currentTarget);
                                    setSelectedInvoice(invoice);
                                  }}
                                >
                                  <MoreVertical size={16} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredInvoices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </Box>
          )}

          {/* Recurring Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Set up recurring invoices to automatically generate and send invoices on a schedule.
              </Alert>
              <Typography variant="body1" color="text.secondary">
                No recurring invoices set up yet. Create an invoice and enable recurring to get started.
              </Typography>
            </Box>
          )}

          {/* Analytics Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Monthly Revenue</Typography>
                    <Box sx={{ height: 200 }}>
                      {/* Add chart here */}
                      <Typography color="text.secondary">Revenue chart visualization</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Top Clients</Typography>
                    <List dense>
                      {statistics.topClients.map((client, index) => (
                        <ListItem key={index}>
                          <ListItemText 
                            primary={client?.displayName || 'Unknown'}
                            secondary={`${client?.email || ''}`}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            ${client?.revenue?.toFixed(2) || '0.00'}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Create/Edit Invoice Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 3 }}>
              {steps.map((step) => (
                <Step key={step}>
                  <StepLabel>{step}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: Details */}
            {activeStep === 0 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Invoice Number"
                      fullWidth
                      value={invoiceForm.invoiceNumber}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={invoiceForm.type}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <MenuItem value="invoice">Invoice</MenuItem>
                        <MenuItem value="quote">Quote</MenuItem>
                        <MenuItem value="receipt">Receipt</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={contacts}
                      getOptionLabel={(option) => option.displayName || ''}
                      value={invoiceForm.client}
                      onChange={(e, value) => setInvoiceForm(prev => ({ ...prev, client: value }))}
                      renderInput={(params) => (
                        <TextField {...params} label="Client" fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Issue Date"
                      value={invoiceForm.issueDate}
                      onChange={(date) => setInvoiceForm(prev => ({ ...prev, issueDate: date }))}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Due Date"
                      value={invoiceForm.dueDate}
                      onChange={(date) => setInvoiceForm(prev => ({ ...prev, dueDate: date }))}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2: Items */}
            {activeStep === 1 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2">Invoice Items</Typography>
                  <Button size="small" startIcon={<Plus size={16} />} onClick={addInvoiceItem}>
                    Add Item
                  </Button>
                </Box>
                
                {invoiceForm.items.map((item, index) => (
                  <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Item Name"
                          fullWidth
                          value={item.name}
                          onChange={(e) => updateInvoiceItem(index, 'name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Description"
                          fullWidth
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6} md={1}>
                        <TextField
                          label="Qty"
                          type="number"
                          fullWidth
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <TextField
                          label="Price"
                          type="number"
                          fullWidth
                          value={item.price}
                          onChange={(e) => updateInvoiceItem(index, 'price', parseFloat(e.target.value) || 0)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton color="error" onClick={() => removeInvoiceItem(index)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                {/* Quick add from templates */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Quick Add:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {serviceTemplates.map(template => (
                      <Chip
                        key={template.id}
                        label={`${template.name} ($${template.price})`}
                        size="small"
                        onClick={() => {
                          setInvoiceForm(prev => ({
                            ...prev,
                            items: [...prev.items, {
                              id: Date.now(),
                              name: template.name,
                              description: template.description,
                              quantity: 1,
                              price: template.price,
                              total: template.price
                            }]
                          }));
                          calculateTotals();
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {/* Step 3: Summary */}
            {activeStep === 2 && (
              <Box sx={{ mt: 2 }}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Discount"
                        type="number"
                        fullWidth
                        value={invoiceForm.discount}
                        onChange={(e) => {
                          setInvoiceForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }));
                          calculateTotals();
                        }}
                        InputProps={{
                          endAdornment: (
                            <Select
                              value={invoiceForm.discountType}
                              onChange={(e) => {
                                setInvoiceForm(prev => ({ ...prev, discountType: e.target.value }));
                                calculateTotals();
                              }}
                              size="small"
                            >
                              <MenuItem value="percentage">%</MenuItem>
                              <MenuItem value="fixed">$</MenuItem>
                            </Select>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Tax Rate (%)"
                        type="number"
                        fullWidth
                        value={invoiceForm.taxRate}
                        onChange={(e) => {
                          setInvoiceForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }));
                          calculateTotals();
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>${invoiceForm.subtotal.toFixed(2)}</Typography>
                  </Box>
                  {invoiceForm.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Discount:</Typography>
                      <Typography color="success.main">
                        -${(invoiceForm.discountType === 'percentage' 
                          ? (invoiceForm.subtotal * invoiceForm.discount / 100)
                          : invoiceForm.discount
                        ).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax:</Typography>
                    <Typography>${invoiceForm.tax.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6">${invoiceForm.total.toFixed(2)}</Typography>
                  </Box>
                </Paper>

                <TextField
                  label="Notes"
                  multiline
                  rows={3}
                  fullWidth
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Terms & Conditions"
                  multiline
                  rows={2}
                  fullWidth
                  value={invoiceForm.terms}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, terms: e.target.value }))}
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={invoiceForm.recurring.enabled}
                      onChange={(e) => setInvoiceForm(prev => ({
                        ...prev,
                        recurring: { ...prev.recurring, enabled: e.target.checked }
                      }))}
                    />
                  }
                  label="Make this a recurring invoice"
                />
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(prev => prev - 1)}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (activeStep === steps.length - 1) {
                    selectedInvoice ? handleUpdateInvoice() : handleCreateInvoice();
                  } else {
                    setActiveStep(prev => prev + 1);
                  }
                }}
              >
                {activeStep === steps.length - 1 
                  ? (selectedInvoice ? 'Update Invoice' : 'Create Invoice')
                  : 'Next'
                }
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                >
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="stripe">Stripe</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Reference Number"
                fullWidth
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                sx={{ mb: 2 }}
              />
              
              <DatePicker
                label="Payment Date"
                value={paymentForm.date}
                onChange={(date) => setPaymentForm(prev => ({ ...prev, date: date }))}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              />
              
              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleRecordPayment}>
              Record Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* More Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            setInvoiceForm(selectedInvoice);
            setDialogOpen(true);
            setAnchorEl(null);
          }}>
            <Edit2 size={16} style={{ marginRight: 8 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => {
            duplicateInvoice(selectedInvoice);
            setAnchorEl(null);
          }}>
            <Copy size={16} style={{ marginRight: 8 }} /> Duplicate
          </MenuItem>
          <MenuItem onClick={() => {
            handleDeleteInvoice(selectedInvoice.id);
            setAnchorEl(null);
          }}>
            <Trash2 size={16} style={{ marginRight: 8 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default Invoices;
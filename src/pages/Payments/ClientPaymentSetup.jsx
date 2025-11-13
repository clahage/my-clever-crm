// src/pages/Payments/ClientPaymentSetup.jsx
// ============================================================================
// 💳 CLIENT PAYMENT SETUP - ACH & Zelle Payment Method Configuration
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Mail, Phone, Building, CheckCircle, AlertCircle, Lock, ArrowLeft, Save } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  encryptPaymentData,
  validateAccountNumber,
  validateRoutingNumber,
  validateEmail,
  validatePhone,
  formatPhone,
  maskAccountNumber,
  maskRoutingNumber,
  getEncryptionKey
} from '@/utils/paymentEncryption';

const ClientPaymentSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const { currentUser, userProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentType, setPaymentType] = useState('ACH'); // ACH or Zelle
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  // ACH Fields
  const [achData, setAchData] = useState({
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    routingNumber: '',
    accountType: 'checking'
  });

  // Zelle Fields
  const [zelleData, setZelleData] = useState({
    email: '',
    phone: ''
  });

  // Load clients (for admin view)
  useEffect(() => {
    if (userProfile?.role === 'admin' || userProfile?.role === 'masterAdmin') {
      loadClients();
    }
    if (clientId) {
      setSelectedClient(clientId);
    }
  }, [userProfile, clientId]);

  const loadClients = async () => {
    try {
      const clientsRef = collection(db, 'contacts');
      const q = query(clientsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const clientList = [];
      snapshot.forEach((doc) => {
        clientList.push({ id: doc.id, ...doc.data() });
      });
      setClients(clientList.sort((a, b) => a.name?.localeCompare(b.name)));
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const handleACHChange = (field, value) => {
    setAchData({ ...achData, [field]: value });
    setError('');
  };

  const handleZelleChange = (field, value) => {
    setZelleData({ ...zelleData, [field]: value });
    setError('');
  };

  const validateACH = () => {
    if (!achData.bankName.trim()) {
      setError('Bank name is required');
      return false;
    }
    if (!validateAccountNumber(achData.accountNumber)) {
      setError('Invalid account number (must be 4-17 digits)');
      return false;
    }
    if (achData.accountNumber !== achData.confirmAccountNumber) {
      setError('Account numbers do not match');
      return false;
    }
    if (!validateRoutingNumber(achData.routingNumber)) {
      setError('Invalid routing number (must be valid 9-digit US routing number)');
      return false;
    }
    return true;
  };

  const validateZelle = () => {
    if (!zelleData.email && !zelleData.phone) {
      setError('Either email or phone number is required for Zelle');
      return false;
    }
    if (zelleData.email && !validateEmail(zelleData.email)) {
      setError('Invalid email address');
      return false;
    }
    if (zelleData.phone && !validatePhone(zelleData.phone)) {
      setError('Invalid phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Determine client ID
      const targetClientId = selectedClient || currentUser.uid;

      // Validate based on payment type
      if (paymentType === 'ACH') {
        if (!validateACH()) {
          setLoading(false);
          return;
        }
      } else {
        if (!validateZelle()) {
          setLoading(false);
          return;
        }
      }

      // Check for existing payment methods
      const methodsRef = collection(db, 'paymentMethods');
      const existingQuery = query(methodsRef, where('clientId', '==', targetClientId));
      const existingSnapshot = await getDocs(existingQuery);
      const isFirstMethod = existingSnapshot.empty;

      // Prepare payment method data
      const paymentMethodData = {
        clientId: targetClientId,
        type: paymentType,
        isDefault: isFirstMethod,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid
      };

      if (paymentType === 'ACH') {
        // Encrypt sensitive data
        const encryptionKey = getEncryptionKey();
        const encryptedAccount = await encryptPaymentData(achData.accountNumber, encryptionKey);
        const encryptedRouting = await encryptPaymentData(achData.routingNumber, encryptionKey);

        paymentMethodData.bankName = achData.bankName;
        paymentMethodData.accountNumberEncrypted = encryptedAccount;
        paymentMethodData.accountLast4 = achData.accountNumber.slice(-4);
        paymentMethodData.routingNumberEncrypted = encryptedRouting;
        paymentMethodData.accountType = achData.accountType;
      } else {
        paymentMethodData.zelleEmail = zelleData.email || null;
        paymentMethodData.zellePhone = zelleData.phone ? formatPhone(zelleData.phone) : null;
      }

      // Save to Firestore
      await addDoc(collection(db, 'paymentMethods'), paymentMethodData);

      setSuccess(true);
      setTimeout(() => {
        navigate('/payments');
      }, 2000);
    } catch (err) {
      console.error('Error saving payment method:', err);
      setError('Failed to save payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Permission check
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'masterAdmin';
  const isClient = userProfile?.role === 'client';

  if (!isAdmin && !isClient) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-600 inline mr-2" />
          <span className="text-red-600">Access denied. You must be an admin or client to set up payment methods.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/payments')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payments
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <span>Setup Payment Method</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Add ACH (bank account) or Zelle payment method for automated recurring payments
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-in fade-in">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Payment method saved successfully!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">Redirecting to payments dashboard...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            {/* Client Selection (Admin Only) */}
            {isAdmin && (
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Payment Method Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentType('ACH')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentType === 'ACH'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Building className={`w-8 h-8 mx-auto mb-2 ${paymentType === 'ACH' ? 'text-blue-600' : 'text-gray-600'}`} />
                  <p className="font-semibold text-gray-900 dark:text-white">ACH Bank Transfer</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Direct from bank account</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('Zelle')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentType === 'Zelle'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Mail className={`w-8 h-8 mx-auto mb-2 ${paymentType === 'Zelle' ? 'text-blue-600' : 'text-gray-600'}`} />
                  <p className="font-semibold text-gray-900 dark:text-white">Zelle</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Email or phone transfer</p>
                </button>
              </div>
            </div>

            {/* ACH Form */}
            {paymentType === 'ACH' && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Secure & Encrypted</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Your banking information is encrypted using AES-256 encryption and stored securely.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={achData.bankName}
                    onChange={(e) => handleACHChange('bankName', e.target.value)}
                    placeholder="Chase Bank"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <select
                    value={achData.accountType}
                    onChange={(e) => handleACHChange('accountType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Routing Number (9 digits)
                  </label>
                  <input
                    type="text"
                    value={achData.routingNumber}
                    onChange={(e) => handleACHChange('routingNumber', e.target.value.replace(/\D/g, ''))}
                    placeholder="123456789"
                    maxLength={9}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={achData.accountNumber}
                    onChange={(e) => handleACHChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                    placeholder="1234567890"
                    maxLength={17}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Account Number
                  </label>
                  <input
                    type="text"
                    value={achData.confirmAccountNumber}
                    onChange={(e) => handleACHChange('confirmAccountNumber', e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter account number"
                    maxLength={17}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>
            )}

            {/* Zelle Form */}
            {paymentType === 'Zelle' && (
              <div className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">Zelle Payment Info</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                        Provide either your Zelle-registered email or phone number. Payments will be sent to this account.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zelle Email
                  </label>
                  <input
                    type="email"
                    value={zelleData.email}
                    onChange={(e) => handleZelleChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="text-center text-gray-600 dark:text-gray-400 py-2">
                  <span className="text-sm">OR</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zelle Phone Number
                  </label>
                  <input
                    type="tel"
                    value={zelleData.phone}
                    onChange={(e) => handleZelleChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/payments')}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Payment Method</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Bank-Level Security</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Your payment information is encrypted and stored securely. We never store your full account number in plain text,
                and all data is protected with industry-standard AES-256 encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPaymentSetup;

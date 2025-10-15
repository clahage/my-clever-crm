// src/components/payments/ZellePaymentOption.jsx
// Client-facing Zelle payment interface
// Shows instructions, copy buttons, and payment reporting

import React, { useState } from 'react';
import { Copy, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const ZellePaymentOption = ({ amountDue, clientNumber, clientId, invoiceId, onSuccess }) => {
  const [copied, setCopied] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const zelleEmail = 'billing@speedycreditrepair.com';
  const zellePhone = '(888) 724-7344';
  const zellePhoneDigits = '8887247344';
  const businessName = 'Speedy Credit Repair';

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleReportPayment = async () => {
    if (!confirm(`Have you already sent $${amountDue} via Zelle?`)) {
      return;
    }

    setReporting(true);
    try {
      const reportZellePayment = httpsCallable(functions, 'reportZellePayment');
      const result = await reportZellePayment({
        amount: amountDue,
        clientId: clientId,
        invoiceId: invoiceId || null
      });

      if (result.data.success) {
        setReported(true);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error reporting payment:', error);
      alert('Error reporting payment. Please try again or contact support.');
    } finally {
      setReporting(false);
    }
  };

  if (reported) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
            Payment Reported Successfully!
          </h3>
        </div>
        <div className="space-y-3 text-green-800 dark:text-green-200">
          <p>
            ✅ Thank you! We've received your payment notification.
          </p>
          <p>
            Your payment will be confirmed within 1 hour during business hours.
          </p>
          <p>
            You'll receive a receipt via email once confirmed.
          </p>
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border border-green-300">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Confirmation Time:</strong><br />
              • During business hours: Within 1 hour<br />
              • After hours: Next business morning<br />
              • Business hours: Mon-Thu, Sat 7:30am-3:00pm PT
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">
            Pay with Zelle
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Instant & Free - No Fees!
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 space-y-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-300 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
            📱 <strong>How to Pay with Zelle:</strong>
          </p>
          <ol className="text-sm text-blue-700 dark:text-blue-300 mt-2 ml-4 space-y-1 list-decimal">
            <li>Open your bank's mobile app</li>
            <li>Go to "Send Money with Zelle"</li>
            <li>Use the recipient info below</li>
            <li>Include your client # in the note</li>
            <li>Return here and click "I've Sent Payment"</li>
          </ol>
        </div>

        {/* Amount Due */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border-2 border-purple-400">
          <span className="text-lg font-medium text-purple-900 dark:text-purple-100">
            Amount to Send:
          </span>
          <span className="text-3xl font-bold text-purple-600 dark:text-purple-300">
            ${amountDue}
          </span>
        </div>

        {/* Recipient Info */}
        <div className="space-y-2">
          {/* Business Name */}
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recipient Name:</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white">{businessName}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Email Address:</p>
              <p className="font-mono font-bold text-lg text-gray-900 dark:text-white break-all">
                {zelleEmail}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(zelleEmail, 'email')}
              className="ml-3 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="Copy email"
            >
              {copied === 'email' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Phone */}
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number:</p>
              <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                {zellePhone}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(zellePhoneDigits, 'phone')}
              className="ml-3 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="Copy phone"
            >
              {copied === 'phone' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Client Number / Reference */}
          <div className="flex justify-between items-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border-2 border-yellow-400">
            <div className="flex-1">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                ⚠️ IMPORTANT - Include in Zelle Note:
              </p>
              <p className="font-mono font-bold text-lg text-yellow-900 dark:text-yellow-100">
                Client #{clientNumber}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`Client #${clientNumber}`, 'reference')}
              className="ml-3 p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              title="Copy reference"
            >
              {copied === 'reference' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 rounded-lg p-4 mb-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-bold mb-1">Please Include Your Client Number!</p>
            <p>
              Adding "Client #{clientNumber}" in the Zelle note helps us match your payment 
              quickly and send your receipt faster.
            </p>
          </div>
        </div>
      </div>

      {/* Report Payment Button */}
      <button
        onClick={handleReportPayment}
        disabled={reporting}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 font-bold text-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none"
      >
        {reporting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6" />
            ✓ I've Sent Payment via Zelle
          </span>
        )}
      </button>

      {/* Additional Info */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <p>
          After clicking "I've Sent Payment", your payment will be confirmed within 1 business hour.
        </p>
        <p>
          You'll receive a receipt via email once we confirm receipt in our bank account.
        </p>
        <p className="font-medium">
          Questions? Call us at {zellePhone} or email billing@speedycreditrepair.com
        </p>
      </div>

      {/* Benefits */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-white dark:bg-gray-800 rounded p-2">
          <p className="text-2xl mb-1">⚡</p>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Instant</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded p-2">
          <p className="text-2xl mb-1">💯</p>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">No Fees</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded p-2">
          <p className="text-2xl mb-1">🔒</p>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Secure</p>
        </div>
      </div>
    </div>
  );
};

export default ZellePaymentOption;
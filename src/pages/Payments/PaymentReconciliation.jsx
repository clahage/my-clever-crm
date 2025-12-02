// src/pages/Payments/PaymentReconciliation.jsx
import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PaymentReconciliation = () => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [reconciled, setReconciled] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [success, setSuccess] = useState(false);

  const parseChaseCSV = (csvText) => {
    const lines = csvText.split('\n');
    const transactions = [];

    // Skip header row, parse each transaction
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',');
      if (cols.length >= 4) {
        transactions.push({
          date: cols[0],
          description: cols[1],
          amount: parseFloat(cols[2].replace(/[^0-9.-]/g, '')),
          transactionId: cols[3]
        });
      }
    }
    return transactions;
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setParsing(true);

    try {
      const text = await uploadedFile.text();
      const transactions = parseChaseCSV(text);

      // Match transactions with pending payments
      const paymentsRef = collection(db, 'payments');
      const pendingQuery = query(paymentsRef, where('status', 'in', ['pending', 'scheduled']));
      const pendingSnapshot = await getDocs(pendingQuery);

      const matched = [];
      const unmatchedTxns = [];

      for (const txn of transactions) {
        let foundMatch = false;

        for (const paymentDoc of pendingSnapshot.docs) {
          const payment = paymentDoc.data();

          // Match by amount and approximate date
          if (Math.abs(payment.amount - txn.amount) < 0.01) {
            matched.push({
              transaction: txn,
              payment: { id: paymentDoc.id, ...payment }
            });

            // Update payment status
            await updateDoc(doc(db, 'payments', paymentDoc.id), {
              status: 'completed',
              chaseTransactionId: txn.transactionId,
              clearedDate: new Date(txn.date),
              reconciledAt: new Date()
            });

            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          unmatchedTxns.push(txn);
        }
      }

      setReconciled(matched);
      setUnmatched(unmatchedTxns);
      setSuccess(true);
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert('Failed to process CSV file. Please check the format.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <Upload className="w-8 h-8 text-blue-600" />
            <span>Payment Reconciliation</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Import Chase CSV to automatically reconcile payments
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
            {!file ? (
              <div>
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload your Chase CSV export file
                </p>
                <label className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : parsing ? (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing CSV file...</p>
              </div>
            ) : (
              <div>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-gray-900 dark:text-white font-semibold mb-2">{file.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {reconciled.length} matched, {unmatched.length} unmatched
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {success && (
          <div className="space-y-6">
            {/* Reconciled Payments */}
            {reconciled.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span>Reconciled Payments ({reconciled.length})</span>
                </h2>
                <div className="space-y-2">
                  {reconciled.map((match, idx) => (
                    <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{match.payment.clientName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Transaction ID: {match.transaction.transactionId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${match.transaction.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">{match.transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unmatched Transactions */}
            {unmatched.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  <span>Unmatched Transactions ({unmatched.length})</span>
                </h2>
                <div className="space-y-2">
                  {unmatched.map((txn, idx) => (
                    <div key={idx} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{txn.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {txn.transactionId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">${txn.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">{txn.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReconciliation;

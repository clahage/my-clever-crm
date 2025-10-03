import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, Send, FileText, User, CreditCard, AlertCircle, X, CheckCircle, Clock, RefreshCw, Save, ChevronLeft, Plus, Trash2, Search } from 'lucide-react';
import { sendFax, getFaxStatus } from '../services/telnyxFaxService';
import { generateLetterWithAI } from '../services/openaiDisputeService';
import { bureauContacts } from '../data/bureauContacts';
import { generateDisputeLetter } from '../templates/disputeLetterTemplates';


function DisputeCreation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [disputeItems, setDisputeItems] = useState([]);
  const [selectedBureaus, setSelectedBureaus] = useState([]);
  const [letterType, setLetterType] = useState('initial');
  const [strategy, setStrategy] = useState('moderate');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');
  const [sendingStatus, setSendingStatus] = useState({});
  const [faxResults, setFaxResults] = useState({});
  const [currentDispute, setCurrentDispute] = useState(null);

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  // Filter clients based on search
  useEffect(() => {
    const filtered = clients.filter(client => {
      const fullName = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase();
      const email = (client.email || '').toLowerCase();
      const phone = (client.phone || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || email.includes(search) || phone.includes(search);
    });
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      const clientsQuery = query(collection(db, 'contacts'));
      const snapshot = await getDocs(clientsQuery);
      const clientList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientList);
      setFilteredClients(clientList);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const addDisputeItem = () => {
    setDisputeItems([...disputeItems, {
      id: Date.now(),
      creditor: '',
      accountNumber: '',
      reason: 'Not mine',
      details: '',
      currentStatus: 'Open',
      reportedBalance: '',
      reportedStatus: 'Delinquent'
    }]);
  };

  const updateDisputeItem = (id, field, value) => {
    setDisputeItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeDisputeItem = (id) => {
    setDisputeItems(items => items.filter(item => item.id !== id));
  };

  const generatePreview = async () => {
    if (!selectedClient || disputeItems.length === 0 || selectedBureaus.length === 0) return;

    const clientInfo = {
      fullName: `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`,
      address: selectedClient.address || '123 Main St',
      city: selectedClient.city || 'City',
      state: selectedClient.state || 'CA',
      zip: selectedClient.zip || '12345',
      ssnLast4: selectedClient.ssnLast4,
      dateOfBirth: selectedClient.dateOfBirth,
      name: `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`
    };

    const bureau = bureauContacts[selectedBureaus[0].toLowerCase()] || bureauContacts.experian;
    
    // Try AI-enhanced letter first
    try {
      const aiLetter = await generateLetterWithAI({
        clientInfo: {
          name: clientInfo.fullName,
          address: `${clientInfo.address}, ${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}`
        },
        disputeDetails: {
          bureau: bureau.name.toLowerCase(),
          type: letterType,
          creditor: disputeItems[0]?.creditor || 'Multiple Creditors',
          account: disputeItems[0]?.accountNumber || 'Multiple Accounts',
          reason: disputeItems[0]?.reason || 'Inaccurate information',
          customNotes: disputeItems.map(item => 
            `${item.creditor} (${item.accountNumber}): ${item.reason} - ${item.details || 'No authorization for this account'}`
          ).join('\n')
        },
        strategy: strategy,
        template: null
      });
      
      setPreview(aiLetter);
    } catch (error) {
      console.log('AI generation failed, using template fallback');
      // Fallback to template
      const letterContent = generateDisputeLetter(letterType, {
        clientInfo,
        disputeItems,
        bureau,
        previousDisputeDate: new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString()
      });
      setPreview(letterContent);
    }
  };

  const generatePDFBase64 = async (letterContent) => {
    // For now, using test PDF - in production, use jsPDF or similar
    const testPdfBase64 = 'JVBERi0xLjMKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3MDAgVGQKKFRlc3QgRmF4IE1lc3NhZ2UpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDEzNSAwMDAwMCBuIAowMDAwMDAwMjI5IDAwMDAwIG4gCjAwMDAwMDAzMTIgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MDYKJSVFT0Y=';
    
    // TODO: Implement actual PDF generation
    // const jsPDF = (await import('jspdf')).default;
    // const doc = new jsPDF();
    // doc.text(letterContent, 15, 15);
    // return doc.output('datauristring').split(',')[1];
    
    return testPdfBase64;
  };

  // Save dispute as draft without sending
  const saveDraft = async () => {
    if (!selectedClient || !preview) return;
    
    setLoading(true);
    try {
      const disputeData = {
        clientId: selectedClient.id,
        clientName: `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim(),
        clientEmail: selectedClient.email || '',
        clientPhone: selectedClient.phone || '',
        disputeItems,
        selectedBureaus,
        letterType,
        strategy,
        letterContent: preview,
        status: 'draft',
        createdAt: serverTimestamp(),
        createdBy: user?.uid || 'unknown'
      };

      const docRef = await addDoc(collection(db, 'disputes'), disputeData);
      
      setCurrentDispute(docRef);
      alert('✓ Draft saved successfully! You can send it later from Dispute Status page.');
      navigate('/dispute-status');
      
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendDisputes = async () => {
    setLoading(true);
    setSendingStatus({});
    setFaxResults({});
    
    try {
      // Create dispute record in Firestore
      const disputeRecord = {
        clientId: selectedClient.id,
        clientName: `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`,
        clientEmail: selectedClient.email,
        clientPhone: selectedClient.phone,
        items: disputeItems,
        bureaus: selectedBureaus,
        letterType,
        strategy,
        status: 'sending',
        createdAt: serverTimestamp(),
        createdBy: user?.uid || 'unknown',
        faxTransmissions: {}
      };

      const docRef = await addDoc(collection(db, 'disputes'), disputeRecord);
      setCurrentDispute(docRef.id);
      
      console.log('Created dispute record:', docRef.id);
      
      // Send fax to each selected bureau
      const transmissions = {};
      
      for (const bureauName of selectedBureaus) {
        setSendingStatus(prev => ({ ...prev, [bureauName]: 'preparing' }));
        
        const bureau = bureauContacts[bureauName.toLowerCase()];
        if (!bureau) {
          console.error(`Bureau data not found for ${bureauName}`);
          setSendingStatus(prev => ({ ...prev, [bureauName]: 'error' }));
          continue;
        }
        
        // Generate letter for this bureau
        const clientInfo = {
          fullName: `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`,
          address: selectedClient.address || '123 Main St',
          city: selectedClient.city || 'City',
          state: selectedClient.state || 'CA',
          zip: selectedClient.zip || '12345',
          ssnLast4: selectedClient.ssnLast4,
          dateOfBirth: selectedClient.dateOfBirth,
          name: `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`
        };
        
        // Try AI generation first, fallback to template
        let letterContent;
        try {
          setSendingStatus(prev => ({ ...prev, [bureauName]: 'generating' }));
          
          letterContent = await generateLetterWithAI({
            clientInfo: {
              name: clientInfo.fullName,
              address: `${clientInfo.address}, ${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}`
            },
            disputeDetails: {
              bureau: bureau.name.toLowerCase(),
              type: letterType,
              creditor: disputeItems.map(item => item.creditor).join(', '),
              account: disputeItems.map(item => item.accountNumber).join(', '),
              reason: disputeItems.map(item => item.reason).join('; '),
              customNotes: disputeItems.map(item => 
                `${item.creditor} (${item.accountNumber}): ${item.reason} - ${item.details || 'Inaccurate information'}`
              ).join('\n')
            },
            strategy: strategy,
            template: null
          });
        } catch (error) {
          console.log('Using template fallback for', bureauName);
          letterContent = generateDisputeLetter(letterType, {
            clientInfo,
            disputeItems,
            bureau
          });
        }
        
        // Convert letter to PDF
        setSendingStatus(prev => ({ ...prev, [bureauName]: 'converting' }));
        const pdfBase64 = await generatePDFBase64(letterContent);
        
        // Send via Telnyx
        setSendingStatus(prev => ({ ...prev, [bureauName]: 'sending' }));
        
        try {
          const faxResult = await sendFax({
            toNumber: bureau.faxPrimary,
            pdfContent: pdfBase64,
            clientName: disputeRecord.clientName,
            userId: user?.uid || 'unknown',
            letterId: docRef.id,
            metadata: { 
              bureau: bureauName,
              disputeId: docRef.id,
              letterType: letterType
            }
          });
          
          if (faxResult.success) {
            transmissions[bureauName] = {
              faxId: faxResult.faxId,
              status: faxResult.status,
              sentAt: new Date().toISOString(),
              toNumber: bureau.faxPrimary,
              pageCount: faxResult.pageCount || 1
            };
            
            setSendingStatus(prev => ({ ...prev, [bureauName]: 'sent' }));
            setFaxResults(prev => ({ ...prev, [bureauName]: faxResult }));
            
            console.log(`✅ Fax sent to ${bureauName}:`, faxResult.faxId);
            
            // Save fax transmission record
            await addDoc(collection(db, 'faxTransmissions'), {
              disputeId: docRef.id,
              bureau: bureauName,
              faxId: faxResult.faxId,
              status: 'queued',
              toNumber: bureau.faxPrimary,
              createdAt: serverTimestamp()
            });
            
          } else {
            transmissions[bureauName] = {
              status: 'failed',
              error: faxResult.error || 'Unknown error',
              failedAt: new Date().toISOString()
            };
            setSendingStatus(prev => ({ ...prev, [bureauName]: 'failed' }));
            console.error(`❌ Failed to send to ${bureauName}`);
          }
        } catch (error) {
          console.error(`Error sending to ${bureauName}:`, error);
          transmissions[bureauName] = {
            status: 'error',
            error: error.message,
            failedAt: new Date().toISOString()
          };
          setSendingStatus(prev => ({ ...prev, [bureauName]: 'error' }));
        }
        
        // Add delay between sends to avoid rate limiting
        if (selectedBureaus.indexOf(bureauName) < selectedBureaus.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Update dispute record with transmission results
      await updateDoc(doc(db, 'disputes', docRef.id), {
        faxTransmissions: transmissions,
        status: Object.values(transmissions).every(t => t.faxId) ? 'sent' : 
                Object.values(transmissions).some(t => t.faxId) ? 'partial' : 'failed'
      });
      
      // Show success message
      const successCount = Object.values(transmissions).filter(t => t.faxId).length;
      const message = successCount === selectedBureaus.length 
        ? `All ${successCount} dispute letter(s) sent successfully!`
        : successCount > 0 
          ? `${successCount} of ${selectedBureaus.length} letter(s) sent. Some bureaus failed.`
          : 'Failed to send dispute letters. Please try again.';
      
      alert(message);
      
      // Move to success step
      setStep(4);
      
    } catch (error) {
      console.error('Error sending disputes:', error);
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const checkFaxStatus = async (faxId, bureau) => {
    try {
      const status = await getFaxStatus(faxId);
      setFaxResults(prev => ({
        ...prev,
        [bureau]: { ...prev[bureau], currentStatus: status }
      }));
      return status;
    } catch (error) {
      console.error('Error checking status:', error);
      return 'unknown';
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedClient(null);
    setDisputeItems([]);
    setSelectedBureaus([]);
    setLetterType('initial');
    setStrategy('moderate');
    setPreview('');
    setSendingStatus({});
    setFaxResults({});
    setCurrentDispute(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Dispute Letters</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate and send dispute letters to credit bureaus via fax
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {[
            { num: 1, icon: User, label: 'Select Client' },
            { num: 2, icon: CreditCard, label: 'Add Items' },
            { num: 3, icon: FileText, label: 'Review & Send' },
            { num: 4, icon: CheckCircle, label: 'Complete' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className={`flex items-center ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full p-3 ${step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="ml-3 font-medium hidden sm:inline">{s.label}</span>
              </div>
              {idx < 3 && <ChevronRight className="text-gray-400 mx-2" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Client Selection */}
      {step === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Select Client</h2>
          
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-6 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                {searchTerm ? 'No clients found matching your search' : 'No clients available'}
              </div>
            ) : (
              filteredClients.map(client => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedClient?.id === client.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {client.firstName} {client.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{client.email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{client.phone}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedClient}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       hover:bg-blue-700 transition-colors"
            >
              Next: Add Dispute Items
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Dispute Items */}
      {step === 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Add Dispute Items for {selectedClient?.firstName} {selectedClient?.lastName}
          </h2>
          
          {disputeItems.map((item, index) => (
            <div key={item.id} className="mb-6 p-5 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dispute Item #{index + 1}
                </h4>
                <button
                  onClick={() => removeDisputeItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove item"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Creditor Name (e.g., Capital One)"
                  value={item.creditor}
                  onChange={(e) => updateDisputeItem(item.id, 'creditor', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
                           bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Account Number (last 4 digits)"
                  value={item.accountNumber}
                  onChange={(e) => updateDisputeItem(item.id, 'accountNumber', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
                           bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <select
                  value={item.reason}
                  onChange={(e) => updateDisputeItem(item.id, 'reason', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
                           bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="Not mine">Not mine</option>
                  <option value="Never late">Never late</option>
                  <option value="Paid in full">Paid in full</option>
                  <option value="Incorrect balance">Incorrect balance</option>
                  <option value="Identity theft">Identity theft</option>
                  <option value="Duplicate account">Duplicate account</option>
                  <option value="Incorrect payment status">Incorrect payment status</option>
                  <option value="Account closed by consumer">Account closed by consumer</option>
                </select>
                <input
                  type="text"
                  placeholder="Current Status (e.g., Charged Off)"
                  value={item.currentStatus}
                  onChange={(e) => updateDisputeItem(item.id, 'currentStatus', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
                           bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Reported Balance"
                  value={item.reportedBalance}
                  onChange={(e) => updateDisputeItem(item.id, 'reportedBalance', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
                           bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <textarea
                  placeholder="Additional details or explanation..."
                  value={item.details}
                  onChange={(e) => updateDisputeItem(item.id, 'details', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
                           bg-white dark:bg-gray-600 text-gray-900 dark:text-white
                           md:col-span-2"
                  rows="2"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addDisputeItem}
            className="mb-8 px-6 py-3 border-2 border-dashed border-gray-400 dark:border-gray-500 
                     rounded-lg w-full text-gray-600 dark:text-gray-400 hover:border-gray-500 
                     dark:hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-300 
                     transition-colors font-medium"
          >
            + Add Another Dispute Item
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Select Credit Bureaus</h3>
              <div className="space-y-2">
                {['Experian', 'Equifax', 'TransUnion'].map(bureau => (
                  <label key={bureau} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBureaus.includes(bureau)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBureaus([...selectedBureaus, bureau]);
                        } else {
                          setSelectedBureaus(selectedBureaus.filter(b => b !== bureau));
                        }
                      }}
                      className="mr-3 w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{bureau}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Letter Options</h3>
              
              <label className="block mb-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">Letter Type</span>
                <select
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
                           bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="initial">Initial Dispute</option>
                  <option value="reinvestigation">Reinvestigation Request</option>
                  <option value="directCreditor">Direct to Creditor</option>
                </select>
              </label>
              
              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">Strategy</span>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
                           bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex justify-between">
            <button 
              onClick={() => setStep(1)} 
              className="px-6 py-3 border border-gray-300 dark:border-gray-500 rounded-lg
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                       transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={() => {
                generatePreview();
                setStep(3);
              }}
              disabled={disputeItems.length === 0 || selectedBureaus.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       hover:bg-blue-700 transition-colors"
            >
              Preview Letters
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review and Send */}
      {step === 3 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Review and Send</h2>
          
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300">Ready to Send</p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  {disputeItems.length} dispute item(s) will be sent to {selectedBureaus.length} bureau(s) via fax
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                  Strategy: {strategy.charAt(0).toUpperCase() + strategy.slice(1)} | 
                  Type: {letterType === 'initial' ? 'Initial Dispute' : 
                        letterType === 'reinvestigation' ? 'Reinvestigation' : 'Direct to Creditor'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Letter Preview</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600">
              <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200">
                {preview || 'Generating preview...'}
              </pre>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Fax Delivery Details</h3>
            <div className="space-y-2">
              {selectedBureaus.map(bureau => {
                const contact = bureauContacts[bureau.toLowerCase()];
                return (
                  <div key={bureau} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{bureau}</span>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {contact?.disputeAddress?.city}, {contact?.disputeAddress?.state}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {contact?.faxPrimary || 'No fax configured'}
                      </span>
                      {sendingStatus[bureau] && (
                        <span className="ml-3">
                          {sendingStatus[bureau] === 'preparing' && <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />}
                          {sendingStatus[bureau] === 'generating' && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                          {sendingStatus[bureau] === 'converting' && <FileText className="w-4 h-4 text-blue-500 animate-pulse" />}
                          {sendingStatus[bureau] === 'sending' && <Send className="w-4 h-4 text-blue-500 animate-pulse" />}
                          {sendingStatus[bureau] === 'sent' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {sendingStatus[bureau] === 'failed' && <X className="w-4 h-4 text-red-500" />}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <button 
              onClick={() => setStep(2)} 
              disabled={loading}
              className="px-6 py-3 border border-gray-300 dark:border-gray-500 rounded-lg
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                       transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back to Edit
            </button>
            <div className="flex gap-3">
              <button
                onClick={saveDraft}
                disabled={loading || !preview}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium
                         disabled:bg-gray-300 disabled:cursor-not-allowed
                         hover:bg-gray-700 transition-colors flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Draft
              </button>
              <button
                onClick={sendDisputes}
                disabled={loading || !preview}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium
                         disabled:bg-gray-300 disabled:cursor-not-allowed
                         hover:bg-green-700 transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Sending Disputes...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send All Dispute Letters
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Success/Complete */}
      {step === 4 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Dispute Letters Sent!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your dispute letters have been queued for transmission
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Transmission Summary</h3>
            <div className="space-y-3">
              {Object.entries(faxResults).map(([bureau, result]) => (
                <div key={bureau} className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-900 dark:text-white">{bureau}</span>
                  <div className="flex items-center">
                    {result.success ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Fax ID: {result.faxId?.substring(0, 8)}...
                        </span>
                        {result.currentStatus && (
                          <button
                            onClick={() => checkFaxStatus(result.faxId, bureau)}
                            className="ml-3 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Check Status
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-sm text-red-600">Failed to send</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-8">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Next Steps</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Credit bureaus have 30 days to investigate your disputes</li>
              <li>• You'll receive responses via mail at the address on file</li>
              <li>• Check the Dispute Status page to monitor delivery confirmations</li>
              <li>• Set a reminder to follow up in 30-45 days if no response</li>
            </ul>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/dispute-status')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View Dispute Status
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 dark:border-gray-500 rounded-lg
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                       transition-colors font-medium"
            >
              Create Another Dispute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisputeCreation;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Building2, 
  AlertCircle,
  Save,
  Eye,
  Download,
  Send,
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Hash
} from 'lucide-react';
import { createDisputeLetter, updateDisputeLetter } from '../services/disputeService';
import { generateDisputePDF } from '../services/pdfService';
import ClientPicker from '../components/ClientPicker';

const DisputeLetterGenerator = ({ existingLetter = null, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form data state
  const [formData, setFormData] = useState({
    // Client Information
    clientId: existingLetter?.clientId || null,
    clientName: existingLetter?.clientName || '',
    clientEmail: existingLetter?.clientEmail || '',
    clientPhone: existingLetter?.clientPhone || '',
    clientAddress: existingLetter?.clientAddress || '',
    
    // Basic Information
    bureauType: existingLetter?.bureauType || '',
    accountNumber: existingLetter?.accountNumber || '',
    creditorName: existingLetter?.creditorName || '',
    
    // Dispute Details
    disputeReason: existingLetter?.disputeReason || '',
    disputeItems: existingLetter?.disputeItems || [],
    customDispute: existingLetter?.customDispute || '',
    
    // Supporting Information
    supportingDocs: existingLetter?.supportingDocs || [],
    additionalNotes: existingLetter?.additionalNotes || '',
    
    // Letter Content (generated in step 4)
    letterContent: existingLetter?.letterContent || '',
    
    // Metadata
    status: existingLetter?.status || 'draft'
  });

  const steps = [
    { number: 1, title: 'Client & Bureau', icon: User },
    { number: 2, title: 'Dispute Details', icon: AlertCircle },
    { number: 3, title: 'Supporting Info', icon: FileText },
    { number: 4, title: 'Review & Generate', icon: Eye }
  ];

  const disputeReasons = [
    { value: 'not_mine', label: 'Account is not mine' },
    { value: 'incorrect_balance', label: 'Incorrect balance' },
    { value: 'incorrect_payment', label: 'Incorrect payment status' },
    { value: 'duplicate', label: 'Duplicate account' },
    { value: 'identity_theft', label: 'Identity theft' },
    { value: 'closed', label: 'Account was closed' },
    { value: 'paid_settlement', label: 'Paid settlement' },
    { value: 'incorrect_dates', label: 'Incorrect dates' },
    { value: 'other', label: 'Other (specify)' }
  ];

  const bureauInfo = {
    equifax: {
      name: 'Equifax',
      address: 'P.O. Box 740256\nAtlanta, GA 30348',
      phone: '1-866-349-5191'
    },
    experian: {
      name: 'Experian',
      address: 'P.O. Box 4500\nAllen, TX 75013',
      phone: '1-888-397-3742'
    },
    transunion: {
      name: 'TransUnion',
      address: 'P.O. Box 2000\nChester, PA 19016',
      phone: '1-833-395-6938'
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.clientId) newErrors.client = 'Please select a client';
        if (!formData.bureauType) newErrors.bureauType = 'Please select a credit bureau';
        break;
      case 2:
        if (!formData.disputeReason) newErrors.disputeReason = 'Please select a dispute reason';
        if (formData.disputeReason === 'other' && !formData.customDispute) {
          newErrors.customDispute = 'Please describe your dispute';
        }
        break;
      case 3:
        // Optional step, no required fields
        break;
      case 4:
        if (!formData.letterContent) newErrors.letterContent = 'Letter content is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        generateLetterContent();
      }
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleClientSelect = (clientData) => {
    if (clientData) {
      setFormData(prev => ({
        ...prev,
        clientId: clientData.clientId,
        clientName: clientData.clientName,
        clientEmail: clientData.clientEmail,
        clientPhone: clientData.clientPhone,
        clientAddress: clientData.clientAddress
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        clientId: null,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: ''
      }));
    }
    setErrors(prev => ({ ...prev, client: null }));
  };

  const generateLetterContent = () => {
    const bureau = bureauInfo[formData.bureauType];
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const reasonText = disputeReasons.find(r => r.value === formData.disputeReason)?.label;
    
    let letterContent = `${today}\n\n`;
    letterContent += `${formData.clientName}\n`;
    if (formData.clientAddress) {
      letterContent += `${formData.clientAddress}\n`;
    }
    letterContent += `${formData.clientEmail}\n`;
    if (formData.clientPhone) {
      letterContent += `${formData.clientPhone}\n`;
    }
    letterContent += `\n`;
    letterContent += `${bureau.name}\n`;
    letterContent += `${bureau.address}\n\n`;
    letterContent += `RE: Dispute of Inaccurate Information\n`;
    if (formData.accountNumber) {
      letterContent += `Account Number: ${formData.accountNumber}\n`;
    }
    if (formData.creditorName) {
      letterContent += `Creditor: ${formData.creditorName}\n`;
    }
    letterContent += `\nDear ${bureau.name} Dispute Department,\n\n`;
    letterContent += `I am writing to formally dispute inaccurate information on my credit report. `;
    letterContent += `After reviewing my credit report, I have identified the following error(s) that require immediate correction:\n\n`;
    
    if (formData.disputeReason === 'other' && formData.customDispute) {
      letterContent += `${formData.customDispute}\n\n`;
    } else {
      letterContent += `The account listed above is being disputed for the following reason: ${reasonText}.\n\n`;
    }
    
    letterContent += `Under the Fair Credit Reporting Act (FCRA), I have the right to dispute any inaccurate, incomplete, or unverifiable information on my credit report. `;
    letterContent += `I request that you investigate this matter and correct or remove the inaccurate information within 30 days as required by law.\n\n`;
    
    if (formData.supportingDocs && formData.supportingDocs.length > 0) {
      letterContent += `I have enclosed the following supporting documentation:\n`;
      formData.supportingDocs.forEach(doc => {
        letterContent += `- ${doc}\n`;
      });
      letterContent += `\n`;
    }
    
    if (formData.additionalNotes) {
      letterContent += `Additional Information:\n${formData.additionalNotes}\n\n`;
    }
    
    letterContent += `Please send me written confirmation of the corrections made to my credit report. `;
    letterContent += `If you determine that the disputed information is accurate, please provide me with a detailed explanation and copies of all documents supporting your position.\n\n`;
    letterContent += `Thank you for your prompt attention to this matter.\n\n`;
    letterContent += `Sincerely,\n\n\n`;
    letterContent += `${formData.clientName}\n`;
    
    setFormData(prev => ({ ...prev, letterContent }));
  };

  const handleSave = async () => {
    if (!validateStep(4)) return;
    
    setLoading(true);
    try {
      if (existingLetter?.id) {
        await updateDisputeLetter(existingLetter.id, formData);
      } else {
        await createDisputeLetter(formData);
      }
      
      navigate('/dispute-letters');
    } catch (error) {
      console.error('Error saving dispute letter:', error);
      setErrors({ submit: 'Failed to save dispute letter' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const bureau = bureauInfo[formData.bureauType];
    generateDisputePDF({
      ...formData,
      bureauInfo: bureau
    });
  };

  const handleSendEmail = async () => {
    // TODO: Implement email sending
    alert('Email functionality will be implemented in the next session');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {existingLetter ? 'Edit Dispute Letter' : 'Generate Dispute Letter'}
        </h2>
        <p className="mt-2 text-gray-600">
          Create professional dispute letters for credit bureaus
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div 
                className={`flex flex-col items-center cursor-pointer ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                }`}
                onClick={() => {
                  if (step.number < currentStep || validateStep(currentStep)) {
                    setCurrentStep(step.number);
                  }
                }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="mt-2 text-sm font-medium hidden sm:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Client & Bureau Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Client and Credit Bureau
            </h3>
            
            {/* Client Picker */}
            <div>
              <ClientPicker
                selectedClient={formData.clientId ? {
                  clientId: formData.clientId,
                  clientName: formData.clientName,
                  clientEmail: formData.clientEmail,
                  clientPhone: formData.clientPhone,
                  clientAddress: formData.clientAddress
                } : null}
                onSelectClient={handleClientSelect}
                required={true}
                className="mb-6"
              />
              {errors.client && (
                <p className="mt-1 text-sm text-red-600">{errors.client}</p>
              )}
            </div>

            {/* Display selected client info */}
            {formData.clientId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Selected Client Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{formData.clientName}</span>
                  </div>
                  {formData.clientEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{formData.clientEmail}</span>
                    </div>
                  )}
                  {formData.clientPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{formData.clientPhone}</span>
                    </div>
                  )}
                  {formData.clientAddress && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{formData.clientAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bureau Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Credit Bureau <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(bureauInfo).map(([key, bureau]) => (
                  <div
                    key={key}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, bureauType: key }));
                      setErrors(prev => ({ ...prev, bureauType: null }));
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.bureauType === key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="h-8 w-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-gray-900">{bureau.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{bureau.phone}</p>
                  </div>
                ))}
              </div>
              {errors.bureauType && (
                <p className="mt-2 text-sm text-red-600">{errors.bureauType}</p>
              )}
            </div>

            {/* Account Information (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number (Optional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter account number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creditor Name (Optional)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.creditorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, creditorName: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter creditor name"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Dispute Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dispute Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reason for Dispute <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {disputeReasons.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.disputeReason === reason.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="disputeReason"
                      value={reason.value}
                      checked={formData.disputeReason === reason.value}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, disputeReason: e.target.value }));
                        setErrors(prev => ({ ...prev, disputeReason: null }));
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm">{reason.label}</span>
                  </label>
                ))}
              </div>
              {errors.disputeReason && (
                <p className="mt-2 text-sm text-red-600">{errors.disputeReason}</p>
              )}
            </div>

            {formData.disputeReason === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe Your Dispute <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.customDispute}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, customDispute: e.target.value }));
                    setErrors(prev => ({ ...prev, customDispute: null }));
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide details about your dispute..."
                />
                {errors.customDispute && (
                  <p className="mt-1 text-sm text-red-600">{errors.customDispute}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Items to Dispute (Optional)
              </label>
              <textarea
                value={formData.disputeItems.join('\n')}
                onChange={(e) => {
                  const items = e.target.value.split('\n').filter(item => item.trim());
                  setFormData(prev => ({ ...prev, disputeItems: items }));
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter each item on a new line..."
              />
              <p className="mt-1 text-sm text-gray-500">
                List specific items, dates, or amounts you're disputing
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Supporting Information */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Supporting Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supporting Documents
              </label>
              <textarea
                value={formData.supportingDocs.join('\n')}
                onChange={(e) => {
                  const docs = e.target.value.split('\n').filter(doc => doc.trim());
                  setFormData(prev => ({ ...prev, supportingDocs: docs }));
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="List documents you're including (one per line)..."
              />
              <p className="mt-1 text-sm text-gray-500">
                E.g., Payment receipts, Account statements, Police report
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information you want to include..."
              />
            </div>
          </div>
        )}

        {/* Step 4: Review & Generate */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Review and Generate Letter
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Client:</span>
                  <p className="font-medium">{formData.clientName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Bureau:</span>
                  <p className="font-medium">{bureauInfo[formData.bureauType]?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Reason:</span>
                  <p className="font-medium">
                    {disputeReasons.find(r => r.value === formData.disputeReason)?.label}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p className="font-medium capitalize">{formData.status}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generated Letter Content
              </label>
              <textarea
                value={formData.letterContent}
                onChange={(e) => setFormData(prev => ({ ...prev, letterContent: e.target.value }))}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              {errors.letterContent && (
                <p className="mt-1 text-sm text-red-600">{errors.letterContent}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </button>
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="h-5 w-5" />
                Send via Email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </button>

        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          )}
          
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Letter'}
            </button>
          )}
        </div>
      </div>

      {errors.submit && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}
    </div>
  );
};

export default DisputeLetterGenerator;
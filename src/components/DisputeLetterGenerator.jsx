import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import disputeService from '../services/disputeService';
import { 
  X, 
  FileText, 
  User, 
  Building, 
  CreditCard,
  AlertCircle,
  Save,
  Send,
  Wand2,
  ChevronDown,
  Calendar,
  Hash,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

const DisputeLetterGenerator = ({ isOpen, onClose, onLetterCreated, userId, editLetter = null }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: '',
    type: 'dispute',
    bureau: 'Equifax',
    
    // Step 2: Account Details
    accountNumber: '',
    creditorName: '',
    reason: '',
    explanation: '',
    
    // Step 3: Personal Information
    clientName: '',
    clientAddress: '',
    clientCity: '',
    clientState: '',
    clientZip: '',
    ssnLast4: '',
    dateOfBirth: '',
    
    // Step 4: Letter Content
    content: '',
    supportingDocs: [],
    
    // Additional fields for other letter types
    customerLength: '',
    purpose: ''
  });

  const [errors, setErrors] = useState({});

  const letterTypes = [
    { value: 'dispute', label: 'Credit Report Dispute', icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'validation', label: 'Debt Validation', icon: <FileText className="w-4 h-4" /> },
    { value: 'goodwill', label: 'Goodwill Letter', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'cease', label: 'Cease and Desist', icon: <X className="w-4 h-4" /> }
  ];

  const bureaus = ['Equifax', 'Experian', 'TransUnion'];

  const disputeReasons = [
    'Account does not belong to me',
    'Account paid in full',
    'Account settled for less',
    'Incorrect balance',
    'Incorrect payment status',
    'Duplicate account',
    'Identity theft',
    'Bankruptcy not reported',
    'Account closed by consumer',
    'Other'
  ];

  useEffect(() => {
    if (editLetter) {
      setFormData(editLetter);
    }
  }, [editLetter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const generateTemplate = () => {
    const template = disputeService.generateTemplate(formData.type, formData);
    setFormData(prev => ({ 
      ...prev, 
      content: template.content,
      title: formData.title || template.title
    }));
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.type) newErrors.type = 'Letter type is required';
        if (!formData.bureau) newErrors.bureau = 'Bureau is required';
        break;
      case 2:
        if (!formData.creditorName) newErrors.creditorName = 'Creditor name is required';
        if (!formData.reason) newErrors.reason = 'Dispute reason is required';
        break;
      case 3:
        if (!formData.clientName) newErrors.clientName = 'Client name is required';
        if (!formData.clientAddress) newErrors.clientAddress = 'Address is required';
        if (!formData.clientCity) newErrors.clientCity = 'City is required';
        if (!formData.clientState) newErrors.clientState = 'State is required';
        if (!formData.clientZip) newErrors.clientZip = 'ZIP code is required';
        break;
      case 4:
        if (!formData.content) newErrors.content = 'Letter content is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 3) {
        // Generate template when moving to step 4
        generateTemplate();
      }
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSave = async (status = 'draft') => {
    if (!validateStep(4)) return;
    
    setLoading(true);
    try {
      const letterData = {
        ...formData,
        status
      };
      
      let result;
      if (editLetter) {
        result = await disputeService.updateLetter(editLetter.id, letterData);
      } else {
        result = await disputeService.createLetter(userId, letterData);
      }
      
      onLetterCreated(result);
      onClose();
    } catch (error) {
      console.error('Error saving letter:', error);
      setErrors({ submit: 'Failed to save letter. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((num) => (
        <React.Fragment key={num}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
            step >= num 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-white border-gray-300 text-gray-500'
          }`}>
            {num}
          </div>
          {num < 4 && (
            <div className={`w-16 h-1 transition-colors ${
              step > num ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Letter Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., Dispute for Account #1234"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Letter Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {letterTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
              className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                formData.type === type.value
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              {type.icon}
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="text-red-500 text-sm mt-1">{errors.type}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Credit Bureau
        </label>
        <select
          name="bureau"
          value={formData.bureau}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.bureau ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {bureaus.map(bureau => (
            <option key={bureau} value={bureau}>{bureau}</option>
          ))}
        </select>
        {errors.bureau && (
          <p className="text-red-500 text-sm mt-1">{errors.bureau}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Account Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account Number
        </label>
        <div className="relative">
          <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleInputChange}
            placeholder="Enter account number"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Creditor Name
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="creditorName"
            value={formData.creditorName}
            onChange={handleInputChange}
            placeholder="e.g., ABC Collections"
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.creditorName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.creditorName && (
          <p className="text-red-500 text-sm mt-1">{errors.creditorName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dispute Reason
        </label>
        <select
          name="reason"
          value={formData.reason}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.reason ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a reason</option>
          {disputeReasons.map(reason => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
        {errors.reason && (
          <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Detailed Explanation
        </label>
        <textarea
          name="explanation"
          value={formData.explanation}
          onChange={handleInputChange}
          placeholder="Provide additional details about why you're disputing this item..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {formData.type === 'goodwill' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How long have you been a customer?
            </label>
            <input
              type="text"
              name="customerLength"
              value={formData.customerLength}
              onChange={handleInputChange}
              placeholder="e.g., 5 years"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why do you need good credit?
            </label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="e.g., applying for a mortgage"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            placeholder="Enter full name"
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.clientName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.clientName && (
          <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address
        </label>
        <input
          type="text"
          name="clientAddress"
          value={formData.clientAddress}
          onChange={handleInputChange}
          placeholder="123 Main Street"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.clientAddress ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.clientAddress && (
          <p className="text-red-500 text-sm mt-1">{errors.clientAddress}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="clientCity"
            value={formData.clientCity}
            onChange={handleInputChange}
            placeholder="City"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.clientCity ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.clientCity && (
            <p className="text-red-500 text-sm mt-1">{errors.clientCity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            name="clientState"
            value={formData.clientState}
            onChange={handleInputChange}
            placeholder="ST"
            maxLength="2"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.clientState ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.clientState && (
            <p className="text-red-500 text-sm mt-1">{errors.clientState}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP
          </label>
          <input
            type="text"
            name="clientZip"
            value={formData.clientZip}
            onChange={handleInputChange}
            placeholder="12345"
            maxLength="5"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.clientZip ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.clientZip && (
            <p className="text-red-500 text-sm mt-1">{errors.clientZip}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SSN (Last 4 digits)
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="ssnLast4"
              value={formData.ssnLast4}
              onChange={handleInputChange}
              placeholder="1234"
              maxLength="4"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Letter Content</h3>
        <button
          onClick={generateTemplate}
          className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate Template
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Letter Body
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          rows={12}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Supporting Documents (Optional)
        </label>
        <textarea
          name="supportingDocs"
          value={formData.supportingDocs.join('\n')}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            supportingDocs: e.target.value.split('\n').filter(doc => doc.trim())
          }))}
          placeholder="List any supporting documents (one per line)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.submit}
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {editLetter ? 'Edit Dispute Letter' : 'Create Dispute Letter'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="px-6 pt-6">
            {renderStepIndicator()}
          </div>

          <div className="px-6 py-4 min-h-[400px]">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              {step > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleSave('draft')}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleSave('sent')}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save & Mark Sent'}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DisputeLetterGenerator;
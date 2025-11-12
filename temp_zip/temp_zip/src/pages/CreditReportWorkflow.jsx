// src/pages/CreditReportWorkflow.jsx
// Enhanced Credit Report Intake Workflow
// Connects: IDIQ API, Manual Entry, PDF Upload → AI Review Generation

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  Loader,
  ChevronRight,
  CreditCard,
  User
} from 'lucide-react';
import { fetchCreditReport, PROVIDERS } from '@/services/creditReportService';
import { generateInitialReview } from '@/services/aiCreditReviewService';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreditReportWorkflow() {
  const navigate = useNavigate();
  
  // Workflow state
  const [step, setStep] = useState(1); // 1=method, 2=data entry, 3=processing, 4=success
  const [method, setMethod] = useState(null); // 'idiq', 'manual', 'pdf'
  
  // Form data
  const [formData, setFormData] = useState({
    // Client info
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    ssn: '',
    
    // Address
    street: '',
    city: '',
    state: '',
    zip: '',
    
    // IDIQ specific
    offerCode: import.meta.env.VITE_IDIQ_OFFER_CODE || '',
    planCode: import.meta.env.VITE_IDIQ_PLAN_CODE || '',
    
    // Client goals
    primaryGoal: 'general', // 'house', 'car', 'business', 'general'
    
    // Manual entry
    manualScores: {
      vantage: '',
      fico8: '',
      experian: '',
      equifax: '',
      transunion: ''
    },
    
    // PDF upload
    pdfFile: null
  });
  
  // Processing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [results, setResults] = useState(null);

  // ============================================================================
  // STEP 1: METHOD SELECTION
  // ============================================================================

  const renderMethodSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Credit Report Intake
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose how you'd like to submit the credit report
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* IDIQ API Option */}
        <button
          onClick={() => {
            setMethod('idiq');
            setStep(2);
          }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              IDIQ API
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Automatic pull via IDIQ integration. Fastest method.
            </p>
            <span className="inline-flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
              Select <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </button>

        {/* Manual Entry Option */}
        <button
          onClick={() => {
            setMethod('manual');
            setStep(2);
          }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 transition-all group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              Manual Entry
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter credit data manually from physical report.
            </p>
            <span className="inline-flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
              Select <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </button>

        {/* PDF Upload Option */}
        <button
          onClick={() => {
            setMethod('pdf');
            setStep(2);
          }}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              PDF Upload
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload credit report PDF. AI will extract data.
            </p>
            <span className="inline-flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
              Select <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // STEP 2: DATA ENTRY FORMS
  // ============================================================================

  const renderDataEntry = () => {
    switch (method) {
      case 'idiq':
        return renderIDIQForm();
      case 'manual':
        return renderManualForm();
      case 'pdf':
        return renderPDFForm();
      default:
        return null;
    }
  };

  // IDIQ Form
  const renderIDIQForm = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
            <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              IDIQ Credit Report Request
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We'll pull the credit report automatically
            </p>
          </div>
        </div>

        <form onSubmit={handleIDIQSubmit} className="space-y-4">
          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                maxLength={15}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                maxLength={15}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SSN (9 digits) *
              </label>
              <input
                type="text"
                name="ssn"
                value={formData.ssn}
                onChange={handleInputChange}
                required
                maxLength={9}
                pattern="[0-9]{9}"
                placeholder="123456789"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              required
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                maxLength={30}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                maxLength={2}
                placeholder="CA"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zip Code *
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                required
                maxLength={5}
                pattern="[0-9]{5}"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Client Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Goal (Optional)
            </label>
            <select
              name="primaryGoal"
              value={formData.primaryGoal}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General Credit Improvement</option>
              <option value="house">Buy a House</option>
              <option value="car">Buy a Car</option>
              <option value="business">Start/Grow Business</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setMethod(null);
              }}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit Request
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Manual Entry Form
  const renderManualForm = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Manual Credit Report Entry
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter credit scores and client info manually
            </p>
          </div>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-4">
          {/* Client Info (reuse) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Credit Scores */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Credit Scores (Enter at least one)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VantageScore
                </label>
                <input
                  type="number"
                  name="manualScores.vantage"
                  value={formData.manualScores.vantage}
                  onChange={handleNestedInputChange}
                  min="300"
                  max="850"
                  placeholder="300-850"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  FICO 8
                </label>
                <input
                  type="number"
                  name="manualScores.fico8"
                  value={formData.manualScores.fico8}
                  onChange={handleNestedInputChange}
                  min="300"
                  max="850"
                  placeholder="300-850"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Experian
                </label>
                <input
                  type="number"
                  name="manualScores.experian"
                  value={formData.manualScores.experian}
                  onChange={handleNestedInputChange}
                  min="300"
                  max="850"
                  placeholder="300-850"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Equifax
                </label>
                <input
                  type="number"
                  name="manualScores.equifax"
                  value={formData.manualScores.equifax}
                  onChange={handleNestedInputChange}
                  min="300"
                  max="850"
                  placeholder="300-850"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  TransUnion
                </label>
                <input
                  type="number"
                  name="manualScores.transunion"
                  value={formData.manualScores.transunion}
                  onChange={handleNestedInputChange}
                  min="300"
                  max="850"
                  placeholder="300-850"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Client Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Goal
            </label>
            <select
              name="primaryGoal"
              value={formData.primaryGoal}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="general">General Credit Improvement</option>
              <option value="house">Buy a House</option>
              <option value="car">Buy a Car</option>
              <option value="business">Start/Grow Business</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setMethod(null);
              }}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit Report
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // PDF Upload Form
  const renderPDFForm = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3">
            <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Upload Credit Report PDF
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI will extract data automatically
            </p>
          </div>
        </div>

        <form onSubmit={handlePDFSubmit} className="space-y-4">
          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Credit Report PDF *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-purple-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="pdf-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="pdf-upload"
                      name="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF up to 10MB
                </p>
                {formData.pdfFile && (
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    ✓ {formData.pdfFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Client Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Goal
            </label>
            <select
              name="primaryGoal"
              value={formData.primaryGoal}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="general">General Credit Improvement</option>
              <option value="house">Buy a House</option>
              <option value="car">Buy a Car</option>
              <option value="business">Start/Grow Business</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setMethod(null);
              }}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !formData.pdfFile}
              className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Upload & Process
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ============================================================================
  // STEP 3: PROCESSING
  // ============================================================================

  const renderProcessing = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Brain className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Processing Credit Report
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          AI is analyzing the report and generating recommendations...
        </p>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Loader className="w-4 h-4 mr-2 animate-spin text-blue-600" />
            Pulling credit report data
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Loader className="w-4 h-4 mr-2 animate-spin text-blue-600" />
            Analyzing credit profile
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Loader className="w-4 h-4 mr-2 animate-spin text-blue-600" />
            Generating AI recommendations
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Loader className="w-4 h-4 mr-2 animate-spin text-blue-600" />
            Matching affiliate products
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // STEP 4: SUCCESS
  // ============================================================================

  const renderSuccess = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Success!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Credit report processed and AI review generated
        </p>

        {results && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Results:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Report ID:</span>
                <span className="font-mono text-gray-900 dark:text-white">{results.reportId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Review ID:</span>
                <span className="font-mono text-gray-900 dark:text-white">{results.reviewId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Client:</span>
                <span className="text-gray-900 dark:text-white">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Provider:</span>
                <span className="text-gray-900 dark:text-white">{results.provider}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/admin/ai-reviews')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Review Dashboard
          </button>
          <button
            onClick={resetForm}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Process Another
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // ERROR DISPLAY
  // ============================================================================

  const renderError = () => error && (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-900 dark:text-red-100">
            Error Processing Report
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {error}
          </p>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNestedInputChange = (e) => {
    const [parent, child] = e.target.name.split('.');
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [child]: e.target.value
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({
        ...formData,
        pdfFile: file
      });
    } else {
      alert('Please select a PDF file');
    }
  };

  // ============================================================================
  // SUBMIT HANDLERS
  // ============================================================================

  const handleIDIQSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStep(3); // Show processing

    try {
      // Step 1: Fetch credit report via IDIQ
      console.log('🔵 Fetching IDIQ report...');
      const reportResult = await fetchCreditReport(PROVIDERS.IDIQ, formData);

      if (!reportResult.success) {
        throw new Error('Failed to fetch credit report');
      }

      // Step 2: Generate AI review
      console.log('🧠 Generating AI review...');
      const reviewResult = await generateInitialReview(
        { ...reportResult, parsedData: reportResult.parsedData || {} },
        { primary: formData.primaryGoal }
      );

      if (!reviewResult.success) {
        throw new Error('Failed to generate AI review');
      }

      // Success!
      setResults({
        reportId: reportResult.reportId,
        reviewId: reviewResult.reviewId,
        provider: PROVIDERS.IDIQ
      });
      setSuccess(true);
      setStep(4);

    } catch (err) {
      console.error('❌ IDIQ submission error:', err);
      setError(err.message || 'An error occurred processing the report');
      setStep(2); // Go back to form
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    // Validate at least one score is entered
    const hasScore = Object.values(formData.manualScores).some(score => score && parseInt(score) > 0);
    if (!hasScore) {
      setError('Please enter at least one credit score');
      return;
    }

    setLoading(true);
    setError('');
    setStep(3); // Show processing

    try {
      // Prepare manual entry data
      const manualData = {
        clientEmail: formData.email,
        clientName: `${formData.firstName} ${formData.lastName}`,
        scores: {
          vantage: parseInt(formData.manualScores.vantage) || null,
          fico8: parseInt(formData.manualScores.fico8) || null,
          experian: parseInt(formData.manualScores.experian) || null,
          equifax: parseInt(formData.manualScores.equifax) || null,
          transunion: parseInt(formData.manualScores.transunion) || null
        },
        reportDate: new Date().toISOString(),
        enteredBy: 'admin' // You can get this from auth context
      };

      // Step 1: Process manual entry
      console.log('✍️ Processing manual entry...');
      const reportResult = await fetchCreditReport(PROVIDERS.MANUAL, manualData);

      if (!reportResult.success) {
        throw new Error('Failed to process manual entry');
      }

      // Step 2: Generate AI review
      console.log('🧠 Generating AI review...');
      const reviewResult = await generateInitialReview(
        { ...reportResult, parsedData: reportResult.parsedData || {} },
        { primary: formData.primaryGoal }
      );

      if (!reviewResult.success) {
        throw new Error('Failed to generate AI review');
      }

      // Success!
      setResults({
        reportId: reportResult.reportId,
        reviewId: reviewResult.reviewId,
        provider: PROVIDERS.MANUAL
      });
      setSuccess(true);
      setStep(4);

    } catch (err) {
      console.error('❌ Manual submission error:', err);
      setError(err.message || 'An error occurred processing the report');
      setStep(2); // Go back to form
    } finally {
      setLoading(false);
    }
  };

  const handlePDFSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pdfFile) {
      setError('Please select a PDF file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setStep(3); // Show processing

    try {
      // Prepare PDF data
      const pdfData = {
        file: formData.pdfFile,
        clientEmail: formData.email,
        clientName: `${formData.firstName} ${formData.lastName}`
      };

      // Step 1: Process PDF
      console.log('📄 Processing PDF...');
      const reportResult = await fetchCreditReport(PROVIDERS.PDF, pdfData);

      if (!reportResult.success) {
        throw new Error('Failed to process PDF');
      }

      // Step 2: Generate AI review
      console.log('🧠 Generating AI review...');
      const reviewResult = await generateInitialReview(
        { ...reportResult, parsedData: reportResult.parsedData || {} },
        { primary: formData.primaryGoal }
      );

      if (!reviewResult.success) {
        throw new Error('Failed to generate AI review');
      }

      // Success!
      setResults({
        reportId: reportResult.reportId,
        reviewId: reviewResult.reviewId,
        provider: PROVIDERS.PDF
      });
      setSuccess(true);
      setStep(4);

    } catch (err) {
      console.error('❌ PDF submission error:', err);
      setError(err.message || 'An error occurred processing the PDF');
      setStep(2); // Go back to form
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // UTILITY
  // ============================================================================

  const resetForm = () => {
    setStep(1);
    setMethod(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      birthDate: '',
      ssn: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      offerCode: import.meta.env.VITE_IDIQ_OFFER_CODE || '',
      planCode: import.meta.env.VITE_IDIQ_PLAN_CODE || '',
      primaryGoal: 'general',
      manualScores: {
        vantage: '',
        fico8: '',
        experian: '',
        equifax: '',
        transunion: ''
      },
      pdfFile: null
    });
    setError('');
    setSuccess(false);
    setResults(null);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {renderError()}
      
      {step === 1 && renderMethodSelection()}
      {step === 2 && renderDataEntry()}
      {step === 3 && renderProcessing()}
      {step === 4 && renderSuccess()}
    </div>
  );
}
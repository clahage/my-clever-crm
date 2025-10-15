// src/components/forms/MegaContactForm.jsx
// MEGA CONTACT/CLIENT FORM - VERSION 1.0
// ULTRA-DETAILED WITH AI SCORING, AUTO-COMPLETE, PRONUNCIATION
// LAST UPDATED: 2025-10-12

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Save, UserPlus, Volume2, Sparkles, AlertCircle, CheckCircle,
  Phone, Mail, MapPin, Calendar, DollarSign, TrendingUp, Info,
  FileText, Users, Building, Globe, Hash, CreditCard, Clock
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { askAI } from '@/lib/ai';

// ============================================================================
// ZIPCODE API HELPER (Using free Zippopotam.us API)
// ============================================================================
const fetchLocationFromZip = async (zipcode) => {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipcode}`);
    if (!response.ok) throw new Error('Invalid zipcode');
    const data = await response.json();
    
    return {
      city: data.places[0]['place name'],
      state: data.places[0]['state'],
      stateCode: data.places[0]['state abbreviation'],            
      county: data.places[0]['county'] || '',
      latitude: data.places[0]['latitude'],
      longitude: data.places[0]['longitude']
    };
  } catch (error) {
    console.error('Zipcode lookup failed:', error);
    return null;
  }
};

// ============================================================================
// NAME PRONUNCIATION HELPER (Text-to-Speech)
// ============================================================================
const pronounceName = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Text-to-speech not supported in your browser');
  }
};

// ============================================================================
// MEGA CONTACT FORM COMPONENT
// ============================================================================
const MegaContactForm = ({ onClose, onSuccess, existingContact = null, mode = 'create' }) => {
  const isEditMode = mode === 'edit' && existingContact;
  
  // ===== FORM STATE (50+ FIELDS) =====
  const [formData, setFormData] = useState({
    // BASIC INFO
    contactType: 'prospect', // prospect, client, lead
    status: 'new', // new, contacted, qualified, onboarding, active, inactive
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '', // "Tom" instead of "Thomas"
    suffix: '', // Jr, Sr, III, etc.
    
    // CONTACT INFO
    email: '',
    emailSecondary: '',
    phone: '',
    phoneSecondary: '',
    phoneType: 'mobile', // mobile, home, work
    preferredContact: 'email', // email, phone, sms, text
    
    // ADDRESS
    address1: '',
    address2: '', // Apt, Suite, etc.
    city: '',
    state: '',
    stateCode: '',
    zipcode: '',
    county: '',
    country: 'USA',
    latitude: '',
    longitude: '',
    
    // DEMOGRAPHICS
    dateOfBirth: '',
    age: '',
    gender: '',
    language: 'English',
    timezone: 'America/Los_Angeles',
    
    // IDENTIFICATION
    ssnLast4: '',
    driverLicense: '',
    dlState: '',
    
    // FINANCIAL
    employmentStatus: '', // employed, self-employed, unemployed, retired
    employer: '',
    jobTitle: '',
    annualIncome: '',
    monthlyIncome: '',
    housingStatus: '', // own, rent, other
    monthlyRent: '',
    
    // CREDIT INFO
    currentCreditScore: '',
    desiredCreditScore: '',
    creditGoal: '',
    bankruptcyHistory: false,
    bankruptcyDate: '',
    hasCollections: false,
    collectionsAmount: '',
    
    // SERVICE INTEREST
    serviceInterest: 'credit-repair', // credit-repair, business-credit, both
    referralSource: '', // google, facebook, referral, other
    referredBy: '',
    campaign: '',
    
    // CLIENT SPECIFIC (if converting to client)
    clientNumber: '',
    contractDate: '',
    serviceStartDate: '',
    servicePlan: '', // basic, standard, premium
    monthlyFee: '',
    paymentMethod: '', // ach, card, check
    
    // ENGAGEMENT
    initialContactDate: '',
    lastContactDate: '',
    nextFollowupDate: '',
    appointmentDate: '',
    consultationCompleted: false,
    contractSigned: false,
    
    // NOTES & CUSTOM
    notes: '',
    tags: [],
    priority: 'medium', // low, medium, high, urgent
    assignedTo: '',
    
    // AI FIELDS
    leadScore: 0, // 1-100
    aiObservations: '',
    aiRecommendations: '',
    engagementLevel: '', // cold, warm, hot
    conversionProbability: 0, // 0-100
    
    // METADATA
    source: 'manual-entry',
    ipAddress: '',
    userAgent: '',
    createdBy: '',
    lastModifiedBy: ''
  });

// ===== UI STATE =====
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [zipcodeLoading, setZipcodeLoading] = useState(false);
  const [aiScoring, setAiScoring] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [existingContacts, setExistingContacts] = useState([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // ===== REFS =====
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  // ===== LOAD EXISTING CONTACTS FOR AUTO-COMPLETE =====
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const contactsRef = collection(db, 'contacts');
        const snapshot = await getDocs(contactsRef);
        const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExistingContacts(contacts);
      } catch (error) {
        console.error('Failed to load contacts:', error);
      }
    };
    
    loadContacts();
  }, []);

  // ===== POPULATE FORM IF EDITING =====
  useEffect(() => {
    if (isEditMode) {
      setFormData(prev => ({
        ...prev,
        ...existingContact
      }));
    }
  }, [isEditMode, existingContact]);

  // ===== AUTO-CALCULATE AGE FROM DOB =====
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [formData.dateOfBirth]);

  // ===== HANDLE INPUT CHANGE =====
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  // ===== ZIPCODE AUTO-POPULATE =====
  const handleZipcodeChange = async (e) => {
    const zipcode = e.target.value.replace(/\D/g, '').slice(0, 5);
    setFormData(prev => ({ ...prev, zipcode }));

    if (zipcode.length === 5) {
      setZipcodeLoading(true);
      const location = await fetchLocationFromZip(zipcode);
      
      if (location) {
        setFormData(prev => ({
          ...prev,
          city: location.city,
          state: location.state,
          stateCode: location.stateCode,
          county: location.county,
          latitude: location.latitude,
          longitude: location.longitude
        }));
      } else {
        setError('Invalid zipcode or location not found');
      }
      
      setZipcodeLoading(false);
    }
  };

  // ===== NAME PRONUNCIATION =====
  const handlePronounceName = () => {
    const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim();
    if (fullName) {
      pronounceName(fullName);
    }
  };

  // ===== DUPLICATE DETECTION =====
  const checkForDuplicates = async () => {
    try {
      const contactsRef = collection(db, 'contacts');
      
      // Check by email
      if (formData.email) {
        const emailQuery = query(contactsRef, where('email', '==', formData.email));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty && (!isEditMode || emailSnapshot.docs[0].id !== existingContact.id)) {
          setDuplicateCheck({
            type: 'email',
            contact: emailSnapshot.docs[0].data()
          });
          setShowDuplicateWarning(true);
          return true;
        }
      }
      
      // Check by phone
      if (formData.phone) {
        const phoneQuery = query(contactsRef, where('phone', '==', formData.phone));
        const phoneSnapshot = await getDocs(phoneQuery);
        if (!phoneSnapshot.empty && (!isEditMode || phoneSnapshot.docs[0].id !== existingContact.id)) {
          setDuplicateCheck({
            type: 'phone',
            contact: phoneSnapshot.docs[0].data()
          });
          setShowDuplicateWarning(true);
          return true;
        }
      }
      
      setDuplicateCheck(null);
      setShowDuplicateWarning(false);
      return false;
    } catch (error) {
      console.error('Duplicate check failed:', error);
      return false;
    }
  };

  // ===== AI LEAD SCORING =====
  const runAIScoring = async () => {
    setAiScoring(true);
    
    try {
      const prompt = `
Analyze this lead and provide:
1. Lead score (1-100) based on:
   - Credit score range: ${formData.currentCreditScore}
   - Desired improvement: ${formData.desiredCreditScore}
   - Annual income: ${formData.annualIncome}
   - Employment: ${formData.employmentStatus}
   - Service interest: ${formData.serviceInterest}
   - Has collections: ${formData.hasCollections}
   - Bankruptcy: ${formData.bankruptcyHistory}

2. Engagement level: cold/warm/hot
3. Conversion probability (0-100)
4. Key observations (2-3 sentences)
5. Recommended next actions (2-3 bullet points)

Format response as JSON:
{
  "leadScore": number,
  "engagementLevel": "cold|warm|hot",
  "conversionProbability": number,
  "observations": "string",
  "recommendations": "string"
}
`;

      const response = await askAI({ prompt, model: 'gpt-4.1-mini' });
      const aiData = JSON.parse(response);
      
      setFormData(prev => ({
        ...prev,
        leadScore: aiData.leadScore || 50,
        engagementLevel: aiData.engagementLevel || 'warm',
        conversionProbability: aiData.conversionProbability || 50,
        aiObservations: aiData.observations || '',
        aiRecommendations: aiData.recommendations || ''
      }));
      
    } catch (error) {
      console.error('AI scoring failed:', error);
      setError('AI scoring failed. Please try again.');
    }
    
    setAiScoring(false);
  };

  // ===== VALIDATION =====
  const validate = () => {
    // Required fields check
    if (!formData.firstName || !formData.lastName) {
      setError('First and last name are required');
      return false;
    }
    
    if (!formData.email && !formData.phone) {
      setError('Either email or phone is required');
      return false;
    }
    
    // Email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    
    // Phone format (10 digits)
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Phone must be 10 digits');
      return false;
    }
    
    // SSN format (4 digits)
    if (formData.ssnLast4 && !/^\d{4}$/.test(formData.ssnLast4)) {
      setError('SSN must be last 4 digits');
      return false;
    }
    
    // Zipcode format
    if (formData.zipcode && !/^\d{5}$/.test(formData.zipcode)) {
      setError('Zipcode must be 5 digits');
      return false;
    }
    
    return true;
  };

  // ===== SAVE AS DRAFT =====
  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      
      const draftData = {
        ...formData,
        status: 'draft',
        lastModified: serverTimestamp()
      };
      
      await addDoc(collection(db, 'contactDrafts'), draftData);
      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Save draft failed:', error);
      setError('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  // ===== SUBMIT FORM =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Check for duplicates
    const hasDuplicates = await checkForDuplicates();
    if (hasDuplicates && !window.confirm('Duplicate contact found. Continue anyway?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const contactData = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (isEditMode) {
        // Update existing contact
        const contactRef = doc(db, 'contacts', existingContact.id);
        await updateDoc(contactRef, contactData);
      } else {
        // Create new contact
        await addDoc(collection(db, 'contacts'), contactData);
      }
      
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess(contactData);
      }
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Form submission failed:', error);
      setError('Failed to save contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== AUTO-COMPLETE SUGGESTIONS =====
  const getAutoCompleteSuggestions = (field, value) => {
    if (value.length < 2) return [];
    
    const searchValue = value.toLowerCase();
    return existingContacts
      .filter(contact => {
        const fieldValue = contact[field];
        return fieldValue && fieldValue.toLowerCase().includes(searchValue);
      })
      .slice(0, 5);
  };

  // ===== RENDER STEP INDICATOR =====
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {[1, 2, 3, 4, 5].map(step => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step === currentStep
                ? 'bg-blue-600 text-white'
                : step < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}
          >
            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 5 && (
            <div
              className={`w-full h-1 mx-2 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // ===== RENDER =====
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Contact' : 'New Contact / Lead / Client'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEditMode ? 'Update contact information' : 'Comprehensive contact management form'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* STEP INDICATOR */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          {renderStepIndicator()}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            Step {currentStep} of {totalSteps}:
            {currentStep === 1 && ' Basic Information'}
            {currentStep === 2 && ' Contact & Address'}
            {currentStep === 3 && ' Financial & Credit'}
            {currentStep === 4 && ' Service & Engagement'}
            {currentStep === 5 && ' AI Scoring & Review'}
          </div>
        </div>

        {/* ERROR/SUCCESS MESSAGES */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-600 dark:text-green-400">
              Contact {isEditMode ? 'updated' : 'created'} successfully!
            </p>
          </div>
        )}

        {/* DUPLICATE WARNING */}
        {showDuplicateWarning && duplicateCheck && (
          <div className="mx-6 mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Potential duplicate found!
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  A contact with the same {duplicateCheck.type} already exists:
                  <br />
                  <strong>
                    {duplicateCheck.contact.firstName} {duplicateCheck.contact.lastName}
                  </strong>
                </p>
                <button
                  onClick={() => setShowDuplicateWarning(false)}
                  className="text-sm text-yellow-600 dark:text-yellow-400 underline mt-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* STEP 1: BASIC INFO */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                
                {/* Contact Type & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Type *
                    </label>
                    <select
                      name="contactType"
                      value={formData.contactType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="prospect">Prospect</option>
                      <option value="lead">Lead</option>
                      <option value="client">Client</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="onboarding">Onboarding</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Pronunciation & Preferred Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Volume2 className="w-4 h-4 mr-1" />
                      Name Pronunciation
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={`${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim()}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handlePronounceName}
                        disabled={!formData.firstName && !formData.lastName}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Play</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Click "Play" to hear the name pronunciation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preferred Name (Nickname)
                    </label>
                    <input
                      type="text"
                      name="preferredName"
                      value={formData.preferredName}
                      onChange={handleChange}
                      placeholder='e.g., "Tom" for Thomas'
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      What should we call this person?
                    </p>
                  </div>
                </div>

                {/* Suffix & Demographics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Suffix
                    </label>
                    <select
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      <option value="Jr">Jr</option>
                      <option value="Sr">Sr</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age (auto-calculated)
                    </label>
                    <input
                      type="text"
                      name="age"
                      value={formData.age}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next: Contact Info →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT & ADDRESS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primary Email *
                    </label>
                    <input
                      ref={emailInputRef}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={checkForDuplicates}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required={!formData.phone}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Secondary Email
                    </label>
                    <input
                      type="email"
                      name="emailSecondary"
                      value={formData.emailSecondary}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primary Phone *
                    </label>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={checkForDuplicates}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required={!formData.email}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Secondary Phone
                    </label>
                    <input
                      type="tel"
                      name="phoneSecondary"
                      value={formData.phoneSecondary}
                      onChange={handleChange}
                      placeholder="(555) 987-6543"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Type
                    </label>
                    <select
                      name="phoneType"
                      value={formData.phoneType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mobile">Mobile</option>
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preferred Contact Method
                    </label>
                    <select
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone Call</option>
                      <option value="sms">Text Message (SMS)</option>
                      <option value="text">Text Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Address Information
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address Line 1
                    </label>
                    <input
                      type="text"
                      name="address1"
                      value={formData.address1}
                      onChange={handleChange}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address Line 2 (Apt, Suite, etc.)
                    </label>
                    <input
                      type="text"
                      name="address2"
                      value={formData.address2}
                      onChange={handleChange}
                      placeholder="Apt 4B"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        Zipcode
                        {zipcodeLoading && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400 animate-pulse">
                            Looking up...
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="zipcode"
                        value={formData.zipcode}
                        onChange={handleZipcodeChange}
                        maxLength={5}
                        placeholder="90210"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Auto-populates city & state
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        readOnly={zipcodeLoading}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        readOnly={zipcodeLoading}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        County (auto-populated)
                      </label>
                      <input
                        type="text"
                        name="county"
                        value={formData.county}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next: Financial Info →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FINANCIAL & CREDIT */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* TO BE CONTINUED IN NEXT MESSAGE DUE TO LENGTH */}
              {/* Financial, Credit, Employment fields go here */}
              
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Step 3 content continues... (form is getting very long)
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  This is a preview - full implementation will include all 50+ fields
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next: Service Info →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SERVICE & ENGAGEMENT */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Service fields go here */}
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Step 4: Service & Engagement fields...
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next: AI Scoring →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: AI SCORING & REVIEW */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* AI Scoring Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  AI Lead Scoring & Analysis
                </h3>

                <button
                  type="button"
                  onClick={runAIScoring}
                  disabled={aiScoring || !formData.currentCreditScore}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 mb-4"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{aiScoring ? 'Analyzing with AI...' : 'Run AI Analysis'}</span>
                </button>

                {formData.leadScore > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lead Score</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {formData.leadScore}/100
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Engagement</p>
                        <p className="text-2xl font-bold capitalize">
                          {formData.engagementLevel || 'N/A'}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conversion Probability</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {formData.conversionProbability}%
                        </p>
                      </div>
                    </div>

                    {formData.aiObservations && (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          AI Observations:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formData.aiObservations}
                        </p>
                      </div>
                    )}

                    {formData.aiRecommendations && (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recommended Actions:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                          {formData.aiRecommendations}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Final Review */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Review & Submit
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Please review all information before submitting. You can save as draft or submit now.
                </p>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    ← Back
                  </button>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="px-6 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Draft</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>{isEditMode ? 'Update Contact' : 'Create Contact'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MegaContactForm;
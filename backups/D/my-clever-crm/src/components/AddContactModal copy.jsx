
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export default function AddContactModal({ isOpen, onClose, onSave, existingContacts = [], contact = null }) {
  const isEditMode = contact !== null;
  const [form, setForm] = useState({
    prefix: contact?.prefix || '',
    firstName: contact?.firstName || '',
    middleName: contact?.middleName || '',
    lastName: contact?.lastName || '',
    suffix: contact?.suffix || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    source: contact?.source || '',
    category: contact?.category || '',
    urgencyLevel: contact?.urgencyLevel || '',
    timeline: contact?.timeline || '',
    responseStatus: contact?.responseStatus || '',
    notes: contact?.notes || '',
    conversationNotes: contact?.conversationNotes || '',
    leadScore: contact?.leadScore || '',
    platformResponseTime: contact?.platformResponseTime || '',
    aiCategory: contact?.aiCategory || '',
    budgetMentioned: contact?.budgetMentioned || '',
    streetAddress: contact?.streetAddress || '',
    city: contact?.city || '',
    state: contact?.state || '',
    zipCode: contact?.zipCode || '',
    country: contact?.country || 'United States',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (contact) {
      setForm({
        prefix: contact.prefix || '',
        firstName: contact.firstName || '',
        middleName: contact.middleName || '',
        lastName: contact.lastName || '',
        suffix: contact.suffix || '',
        email: contact.email || '',
        phone: contact.phone || '',
        source: contact.source || '',
        category: contact.category || '',
        urgencyLevel: contact.urgencyLevel || '',
        timeline: contact.timeline || '',
        responseStatus: contact.responseStatus || '',
        notes: contact.notes || '',
        conversationNotes: contact.conversationNotes || '',
        leadScore: contact.leadScore || '',
        platformResponseTime: contact.platformResponseTime || '',
        aiCategory: contact.aiCategory || '',
        budgetMentioned: contact.budgetMentioned || '',
        streetAddress: contact.streetAddress || '',
        city: contact.city || '',
        state: contact.state || '',
        zipCode: contact.zipCode || '',
        country: contact.country || 'United States',
      });
    }
  }, [contact]);

  function validate() {
    if (!form.firstName || !form.lastName) return 'First and Last Name are required.';
    if (!form.email && !form.phone) return 'Email or Phone is required.';
    return '';
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      if (isEditMode) {
        const contactRef = doc(db, 'contacts', contact.id);
        await updateDoc(contactRef, {
          ...form,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'contacts'), {
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      if (onSave) onSave();
      onClose();
      if (!isEditMode) {
        setForm({
          prefix: '',
          firstName: '',
          middleName: '',
          lastName: '',
          suffix: '',
          email: '',
          phone: '',
          source: '',
          category: '',
          urgencyLevel: '',
          timeline: '',
          responseStatus: '',
          notes: '',
          conversationNotes: '',
          leadScore: '',
          platformResponseTime: '',
          aiCategory: '',
          budgetMentioned: '',
          streetAddress: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States',
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving contact:', error);
      setError('Failed to save contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} aria-label="Close modal backdrop" />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto overflow-y-auto max-h-[90vh] flex flex-col">
        <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose} aria-label="Close modal">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-center">{isEditMode ? 'Edit Contact' : 'Add New Contact'}</h2>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
          <div>
            {loading && <div className="text-blue-600 font-semibold mb-2">Saving contact...</div>}
            {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}
            {/* Basic Info Section */}
            <div className="space-y-4 mb-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Prefix</label>
                  <input type="text" name="prefix" value={form.prefix} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" placeholder="Dr., Mr., Mrs., etc." />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input type="text" name="middleName" value={form.middleName} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Suffix</label>
                  <input type="text" name="suffix" value={form.suffix} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" placeholder="Jr., Sr., III, etc." />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
              </div>
            </div>
            {/* Address Information Section */}
            <div className="space-y-4 mb-4">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Address Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input type="text" name="streetAddress" value={form.streetAddress} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <select name="state" value={form.state} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2">
                    <option value="">Select State</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input type="text" name="zipCode" value={form.zipCode} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input type="text" name="country" value={form.country} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" placeholder="United States" />
                </div>
              </div>
            </div>
            {/* Categorization Section */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Lead Source</label>
                <select name="source" value={form.source} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2">
                  <option value="">Select Source</option>
                  <option value="Website">Website</option>
                  <option value="Yelp">Yelp</option>
                  <option value="Google">Google</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
                <select name="urgencyLevel" value={form.urgencyLevel} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2">
                  <option value="">Select Urgency</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2">
                  <option value="">Select Category</option>
                  <option value="Lead">Lead</option>
                  <option value="Client">Client</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Affiliate">Affiliate</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timeline</label>
                <select name="timeline" value={form.timeline} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2">
                  <option value="">Select Timeline</option>
                  <option value="ASAP">ASAP</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="Next Month">Next Month</option>
                  <option value="3+ Months">3+ Months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Response Status</label>
                <select name="responseStatus" value={form.responseStatus} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2">
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Responded">Responded</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            {/* Advanced Intelligence Section */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Lead Score</label>
                <input type="number" name="leadScore" value={form.leadScore} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" min="1" max="10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Platform Response Time</label>
                <input type="text" name="platformResponseTime" value={form.platformResponseTime} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">AI Category</label>
                <input type="text" name="aiCategory" value={form.aiCategory} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget Mentioned</label>
                <input type="text" name="budgetMentioned" value={form.budgetMentioned} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Conversation Notes</label>
                <textarea name="conversationNotes" value={form.conversationNotes} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">General Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" rows={2} />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={loading}>{loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Contact')}</button>
          </div>
          {success && <div className="text-green-600 font-semibold mt-4">Contact saved!</div>}
        </form>
      </div>
    </div>
  );
}

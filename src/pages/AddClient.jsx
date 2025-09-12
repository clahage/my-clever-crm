import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '../services/clientService';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AddClient() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editId = params.get('edit');
  const [form, setForm] = useState({
    // Basic
    prefix: '', firstName: '', lastName: '', suffix: '', name: '', email: '', phone: '', address: '',
    // Personal
    middleName: '', dob: '', ssn: '', driversLicense: '', street: '', city: '', state: '', zip: '',
    company: '', occupation: '',
    // Contact Preferences
    bestTimeToCall: '', preferredContact: '', secondaryPhone: '', secondaryEmail: '',
    // Financial
    monthlyIncome: '', creditScoreRange: '', negativeItems: '', bankruptcy: '', collections: '', latePayments: '',
    // Service
    servicePackage: '', referralSource: '', urgency: '', targetCreditScore: '', timeline: '',
    // Notes
    consultationNotes: '', specialCircumstances: '',
    // Category
    category: 'lead',
    status: 'Active',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (editId) {
      setLoading(true);
      getDoc(doc(db, 'contacts', editId)).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm(f => ({ ...f, ...data }));
        }
        setLoading(false);
      }).catch(err => {
        console.error('Error loading contact:', err);
        setLoading(false);
      });
    }
  }, [editId]);

  const validate = () => {
    if (!form.firstName || !form.lastName || !form.email) return 'First Name, Last Name, and Email are required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Invalid email address.';
    return '';
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const contactData = {
        ...form,
        status: form.status || 'Active',
        name: [form.prefix, form.firstName, form.middleName, form.lastName, form.suffix].filter(Boolean).join(' ')
      };
      if (editId) {
        await updateDoc(doc(db, 'contacts', editId), contactData);
        alert('Contact updated successfully!');
        navigate('/contacts');
      } else {
        await addDoc(collection(db, 'contacts'), contactData);
        alert('Contact added successfully!');
        setForm({
          prefix: '', firstName: '', lastName: '', suffix: '', name: '', email: '', phone: '', address: '',
          middleName: '', dob: '', ssn: '', driversLicense: '', street: '', city: '', state: '', zip: '',
          company: '', occupation: '',
          bestTimeToCall: '', preferredContact: '', secondaryPhone: '', secondaryEmail: '',
          monthlyIncome: '', creditScoreRange: '', negativeItems: '', bankruptcy: '', collections: '', latePayments: '',
          servicePackage: '', referralSource: '', urgency: '', targetCreditScore: '', timeline: '',
          consultationNotes: '', specialCircumstances: '',
          category: 'lead',
          status: 'Active',
        });
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        {editId ? 'Edit Contact' : `Add New ${form.category === 'client' ? 'Client' : form.category === 'lead' ? 'Lead' : 'Contact'}`}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium mb-2">Contact Type *</label>
          <select
            name="category"
            value={form.category || 'lead'}
            onChange={handleChange}
            className="w-full p-2 border rounded text-lg font-semibold"
            required
          >
            <option value="lead">Lead (Potential Client)</option>
            <option value="client">Client (Active)</option>
            <option value="vendor">Vendor</option>
            <option value="affiliate">Affiliate</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={form.status || 'Active'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prefix</label>
            <select
              name="prefix"
              value={form.prefix}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">None</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
              <option value="Rev.">Rev.</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Suffix</label>
            <input
              type="text"
              name="suffix"
              value={form.suffix}
              onChange={handleChange}
              placeholder="Jr., Sr., III, PhD, etc."
              className="w-full p-2 border rounded"
              list="suffix-options"
            />
            <datalist id="suffix-options">
              <option value="Jr."/>
              <option value="Sr."/>
              <option value="II"/>
              <option value="III"/>
              <option value="IV"/>
              <option value="PhD"/>
              <option value="MD"/>
              <option value="JD"/>
              <option value="CPA"/>
              <option value="Esq."/>
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="w-full p-2 border rounded min-h-[60px]" />
          </div>
        </div>
        {/* Personal Information */}
        <div>
          <h2 className="font-semibold mb-2">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input name="dob" value={form.dob} onChange={handleChange} type="date" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SSN (last 4 digits)</label>
              <input name="ssn" value={form.ssn} onChange={handleChange} maxLength={4} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Driver's License</label>
              <input name="driversLicense" value={form.driversLicense} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
            <input name="street" value={form.street} onChange={handleChange} placeholder="Street" className="w-full px-3 py-2 border rounded" />
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="w-full px-3 py-2 border rounded" />
            <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="w-full px-3 py-2 border rounded" />
            <input name="zip" value={form.zip} onChange={handleChange} placeholder="Zip" className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
        {/* Contact Preferences */}
        <div>
          <h2 className="font-semibold mb-2">Contact Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="bestTimeToCall" value={form.bestTimeToCall} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Best Time to Call</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
            <select name="preferredContact" value={form.preferredContact} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Preferred Contact Method</option>
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
              <option value="Text">Text</option>
            </select>
            <input name="secondaryPhone" value={form.secondaryPhone} onChange={handleChange} placeholder="Secondary Phone" className="w-full px-3 py-2 border rounded" />
            <input name="secondaryEmail" value={form.secondaryEmail} onChange={handleChange} placeholder="Secondary Email" className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
        {/* Financial Information */}
        <div>
          <h2 className="font-semibold mb-2">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} placeholder="Monthly Income" className="w-full px-3 py-2 border rounded" />
            <select name="creditScoreRange" value={form.creditScoreRange} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Credit Score Range</option>
              <option value="<500">{'<500'}</option>
              <option value="500-579">500-579</option>
              <option value="580-669">580-669</option>
              <option value="670-739">670-739</option>
              <option value="740+">740+</option>
            </select>
            <input name="negativeItems" value={form.negativeItems} onChange={handleChange} placeholder="Number of Negative Items" className="w-full px-3 py-2 border rounded" />
            <select name="bankruptcy" value={form.bankruptcy} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Bankruptcy History</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <input name="collections" value={form.collections} onChange={handleChange} placeholder="Collections Count" className="w-full px-3 py-2 border rounded" />
            <input name="latePayments" value={form.latePayments} onChange={handleChange} placeholder="Late Payments Count" className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
        {/* Service Information */}
        <div>
          <h2 className="font-semibold mb-2">Service Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="servicePackage" value={form.servicePackage} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Service Package</option>
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
            <select name="referralSource" value={form.referralSource} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Referral Source</option>
              <option value="Google">Google</option>
              <option value="Facebook">Facebook</option>
              <option value="Yelp">Yelp</option>
              <option value="Referral">Referral</option>
              <option value="Other">Other</option>
            </select>
            <select name="urgency" value={form.urgency} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Urgency Level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
            <input name="targetCreditScore" value={form.targetCreditScore} onChange={handleChange} placeholder="Target Credit Score" className="w-full px-3 py-2 border rounded" />
            <select name="timeline" value={form.timeline} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              <option value="">Timeline Expectation</option>
              <option value="3mo">3mo</option>
              <option value="6mo">6mo</option>
              <option value="9mo">9mo</option>
              <option value="12mo+">12mo+</option>
            </select>
          </div>
        </div>
        {/* Notes Section */}
        <div>
          <h2 className="font-semibold mb-2">Notes</h2>
          <textarea name="consultationNotes" value={form.consultationNotes} onChange={handleChange} placeholder="Initial Consultation Notes" className="w-full px-3 py-2 border rounded mb-2" rows={3} />
          <textarea name="specialCircumstances" value={form.specialCircumstances} onChange={handleChange} placeholder="Special Circumstances" className="w-full px-3 py-2 border rounded" rows={2} />
        </div>
        {error && <div className="text-red-500 font-semibold">{error}</div>}
        {success && <div className="text-green-600 font-semibold">Client added successfully!</div>}
        <div className="flex gap-4 mt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-semibold disabled:opacity-50"
          >
            {isSubmitting ? (editId ? 'Updating...' : 'Adding...') : (editId ? 'Save Changes' : 'Add Contact')}
          </button>
          <button type="button" className="bg-gray-300 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-400 font-semibold" onClick={() => navigate('/clients')}>Back to Client List</button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '../services/clientService';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ZIP code lookup function
const lookupZipCode = async (zip) => {
  if (zip.length !== 5) return;
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (response.ok) {
      const data = await response.json();
      return {
        city: data.places[0]['place name'],
        state: data.places[0]['state abbreviation'],
        county: data.places[0]['state'] // Note: This API doesn't provide county
      };
    }
  } catch (error) {
    console.log('ZIP lookup failed:', error);
  }
  return null;
};

export default function AddClient() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editId = params.get('edit');
  const [form, setForm] = useState({
    // Basic
    prefix: '', firstName: '', lastName: '', suffix: '', name: '', email: '', phone: '',
    // Address fields
    streetAddress: '', city: '', state: '', county: '', zipCode: '',
    // Personal
    middleName: '', dob: '', ssn: '', driversLicense: '',
    company: '', occupation: '',
    // Contact Preferences (new structure)
    bestTimeAnytime: false,
    bestTimeMorning: false,
    bestTimeAfternoon: false,
    bestTimeEvening: false,
    bestTimeNotes: '',
    preferPhone: false,
    preferText: false,
    preferEmail: false,
    preferInPerson: '',
    // Financial
    monthlyIncome: '', creditScoreRange: '', negativeItems: '', bankruptcy: '', collections: '', latePayments: '',
    // Service
    servicePackage: '', referralSource: '', urgency: '', targetCreditScore: '', timeline: '',
    // Notes
    consultationNotes: '', specialCircumstances: '',
    // Category
    category: 'lead',
    status: 'Active',
    // Phones
    workPhone: '',
    phoneExtension: '',
    workPhoneExtension: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExtension, setShowExtension] = useState({ phone: false, workPhone: false });
  const [additionalPhones, setAdditionalPhones] = useState([]);
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [showSSN, setShowSSN] = useState(false);
  const navigate = useNavigate();

  // Phone formatting utility
  const formatPhoneNumber = (value) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length === 0) return '';
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `(${phone.slice(0,3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6,10)}`;
  };

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

  const addPhoneField = () => {
    setAdditionalPhones([...additionalPhones, {
      id: Date.now(),
      type: 'Other',
      number: '',
      extension: ''
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const contactData = {
        ...form,
        additionalPhones: additionalPhones,
        status: form.status || 'Active',
        name: [form.prefix, form.firstName, form.middleName, form.lastName, form.suffix].filter(Boolean).join(' '),
        leadScore: form.urgencyLevel === 'High' ? 8 : form.urgencyLevel === 'Medium' ? 5 : 3,
        urgencyLevel: form.urgencyLevel || 'Medium',
        source: form.referralSource || 'Direct',
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
          streetAddress: '', city: '', state: '', county: '', zipCode: '',
          middleName: '', dob: '', ssn: '', driversLicense: '',
          company: '', occupation: '',
          bestTimeToCall: '', preferredContact: '', secondaryPhone: '', secondaryEmail: '',
          monthlyIncome: '', creditScoreRange: '', negativeItems: '', bankruptcy: '', collections: '', latePayments: '',
          servicePackage: '', referralSource: '', urgency: '', targetCreditScore: '', timeline: '',
          consultationNotes: '', specialCircumstances: '',
          category: 'lead',
          status: 'Active',
          workPhone: '',
          phoneExtension: '',
          workPhoneExtension: '',
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
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Contact</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-bold text-blue-700 mb-3">Personal Information</h3>
            {/* Category and Status */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
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
              <div>
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
            </div>
            {/* Name Fields - ENSURE THIS IS VISIBLE */}
            <label className="block text-sm font-medium mb-1">Name</label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              <select
                name="prefix"
                value={form.prefix}
                onChange={handleChange}
                className="col-span-1 p-2 border rounded"
              >
                <option value="">Prefix</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Rev.">Rev.</option>
              </select>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="col-span-2 p-2 border rounded" required />
              <input name="middleName" value={form.middleName} onChange={handleChange} placeholder="Middle" className="col-span-1 p-2 border rounded" />
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="col-span-2 p-2 border rounded" required />
            </div>
            <div className="mb-3">
              <input name="suffix" value={form.suffix} onChange={handleChange} placeholder="Jr., Sr., III, etc." className="w-32 p-2 border rounded" />
            </div>
            {/* Address fields directly after name fields */}
            <div className="mb-3">
              <input name="streetAddress" value={form.streetAddress || ''} onChange={handleChange} placeholder="123 Main St" className="w-full p-2 border rounded mb-2" />
              <div className="grid grid-cols-3 gap-2">
                <input name="zipCode" value={form.zipCode || ''} onChange={handleChange} placeholder="ZIP" className="p-2 border rounded" />
                <input name="city" value={form.city || ''} onChange={handleChange} placeholder="City" className="p-2 border rounded" />
                <input name="state" value={form.state || ''} onChange={handleChange} placeholder="State" className="p-2 border rounded" />
              </div>
            </div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} className="p-2 border rounded" />
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Social Security Number</label>
                    <input
                      type={showSSN ? "text" : "password"}
                      name="ssn"
                      value={form.ssn || ''}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setForm(f => ({ ...f, ssn: value, ssnLast4: value.slice(-4) }));
                      }}
                      placeholder="XXX-XX-XXXX"
                      className="p-2 border rounded w-full"
                      maxLength="9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSSN(!showSSN)}
                      className="text-xs text-blue-600 mt-1"
                    >
                      {showSSN ? 'Hide' : 'Show'} SSN
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last 4 of SSN</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={form.ssnLast4 || ''}
                        readOnly
                        className="w-16 p-2 border rounded bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(form.ssnLast4)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Driver's License</label>
                <input type="text" name="driversLicense" value={form.driversLicense} onChange={handleChange} className="p-2 border rounded" placeholder="State and Number" />
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Company</label>
              <input type="text" name="company" value={form.company} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Employer's Name" />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Occupation</label>
              <input type="text" name="occupation" value={form.occupation} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Job Title" />
            </div>
          </div>
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold text-blue-700 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Phone with extension */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Personal Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone || ''}
                      onChange={e => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setForm(f => ({ ...f, phone: formatted }));
                      }}
                      placeholder="(555) 555-1212"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExtension({ ...showExtension, phone: !showExtension.phone })}
                    className="mt-6 px-2 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    title="Add Extension"
                  >
                    Ext
                  </button>
                </div>
                {showExtension.phone && (
                  <input
                    type="text"
                    name="phoneExtension"
                    value={form.phoneExtension || ''}
                    onChange={handleChange}
                    placeholder="Extension"
                    className="w-full p-2 border rounded mt-2"
                  />
                )}
              </div>
              {/* Work Phone with extension */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Work Phone</label>
                    <input
                      type="tel"
                      name="workPhone"
                      value={form.workPhone || ''}
                      onChange={e => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setForm(f => ({ ...f, workPhone: formatted }));
                      }}
                      placeholder="(555) 555-1212"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExtension({ ...showExtension, workPhone: !showExtension.workPhone })}
                    className="mt-6 px-2 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    title="Add Extension"
                  >
                    Ext
                  </button>
                </div>
                {showExtension.workPhone && (
                  <input
                    type="text"
                    name="workPhoneExtension"
                    value={form.workPhoneExtension || ''}
                    onChange={handleChange}
                    placeholder="Extension"
                    className="w-full p-2 border rounded mt-2"
                  />
                )}
              </div>
              {/* Additional Phones */}
              {additionalPhones.map((phone, index) => (
                <div key={phone.id} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <select
                      value={phone.type}
                      onChange={e => {
                        const updated = [...additionalPhones];
                        updated[index].type = e.target.value;
                        setAdditionalPhones(updated);
                      }}
                      className="p-2 border rounded"
                    >
                      <option value="Other">Other</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Home">Home</option>
                      <option value="Fax">Fax</option>
                    </select>
                    <input
                      type="tel"
                      value={phone.number}
                      onChange={e => {
                        const formatted = formatPhoneNumber(e.target.value);
                        const updated = [...additionalPhones];
                        updated[index].number = formatted;
                        setAdditionalPhones(updated);
                      }}
                      placeholder="(555) 555-1212"
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = additionalPhones.filter((_, i) => i !== index);
                        setAdditionalPhones(updated);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={addPhoneField}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 inline-block mt-2"
                >
                  + Add Another Phone
                </button>
              </div>
              {/* Best Time and Preferred Contact Method side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 md:col-span-2">
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-bold mb-2">Best Time to Call</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center">
                      <input type="checkbox" name="bestTimeAnytime" className="mr-2" checked={form.bestTimeAnytime} onChange={e => setForm(f => ({ ...f, bestTimeAnytime: e.target.checked }))} />
                      Anytime
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="bestTimeMorning" className="mr-2" checked={form.bestTimeMorning} onChange={e => setForm(f => ({ ...f, bestTimeMorning: e.target.checked }))} />
                      Morning (8am-12pm)
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="bestTimeAfternoon" className="mr-2" checked={form.bestTimeAfternoon} onChange={e => setForm(f => ({ ...f, bestTimeAfternoon: e.target.checked }))} />
                      Afternoon (12pm-5pm)
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="bestTimeEvening" className="mr-2" checked={form.bestTimeEvening} onChange={e => setForm(f => ({ ...f, bestTimeEvening: e.target.checked }))} />
                      Evening (5pm-8pm)
                    </label>
                  </div>
                  <textarea
                    name="bestTimeNotes"
                    value={form.bestTimeNotes || ''}
                    onChange={handleChange}
                    placeholder="Special instructions (e.g., Never on Sundays)"
                    className="w-full p-2 border rounded mt-2"
                    rows="2"
                  />
                </div>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-bold mb-2">Preferred Contact Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center">
                      <input type="checkbox" name="preferPhone" className="mr-2" checked={form.preferPhone} onChange={e => setForm(f => ({ ...f, preferPhone: e.target.checked }))} />
                      Phone Call
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="preferText" className="mr-2" checked={form.preferText} onChange={e => setForm(f => ({ ...f, preferText: e.target.checked }))} />
                      Text Message
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="preferEmail" className="mr-2" checked={form.preferEmail} onChange={e => setForm(f => ({ ...f, preferEmail: e.target.checked }))} />
                      Email
                    </label>
                  </div>
                </div>
              </div>
              {/* Email Fields */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="flex space-x-2">
                  <input name="email" value={form.email} onChange={handleChange} className="flex-1 p-2 border rounded" required />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(form.email)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Secondary Email</label>
                <div className="flex space-x-2">
                  <input name="secondaryEmail" value={form.secondaryEmail || ''} onChange={handleChange} className="flex-1 p-2 border rounded" />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(form.secondaryEmail || '')}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {/* Additional Emails */}
              {additionalEmails.map((email, index) => (
                <div key={email.id} className="mt-2 flex items-center space-x-2 md:col-span-2">
                  <select
                    value={email.type}
                    onChange={e => {
                      const updated = [...additionalEmails];
                      updated[index].type = e.target.value;
                      setAdditionalEmails(updated);
                    }}
                    className="p-2 border rounded"
                  >
                    <option value="Other">Other</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                  </select>
                  <input
                    type="email"
                    value={email.email}
                    onChange={e => {
                      const updated = [...additionalEmails];
                      updated[index].email = e.target.value;
                      setAdditionalEmails(updated);
                    }}
                    placeholder="email@example.com"
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(email.email)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Copy
                  </button>
                  <div className="flex justify-between items-center mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = additionalEmails.filter((_, i) => i !== index);
                        setAdditionalEmails(updated);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-2 md:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdditionalEmails([...additionalEmails, { id: Date.now(), type: 'Other', email: '' }]);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 inline-block"
                >
                  + Add Another Email
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Financial & Service Information Stacked */}
        <div>
          <h3 className="text-xl font-bold text-blue-700 mb-2 mt-6">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Income</label>
              <input
                type="text"
                name="monthlyIncome"
                value={form.monthlyIncome}
                onChange={handleChange}
                className="p-2 border rounded w-full"
                placeholder="Estimated Monthly Income"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of Negative Items</label>
              <input
                type="text"
                name="negativeItems"
                value={form.negativeItems}
                onChange={handleChange}
                className="p-2 border rounded w-full"
                placeholder="e.g., 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bankruptcy History</label>
              <input
                type="text"
                name="bankruptcy"
                value={form.bankruptcy}
                onChange={handleChange}
                className="p-2 border rounded w-full"
                placeholder="Yes/No or details"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Collections Count</label>
              <input
                type="text"
                name="collections"
                value={form.collections}
                onChange={handleChange}
                className="p-2 border rounded w-full"
                placeholder="e.g., 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Late Payments Count</label>
              <input
                type="text"
                name="latePayments"
                value={form.latePayments}
                onChange={handleChange}
                className="p-2 border rounded w-full"
                placeholder="e.g., 3"
              />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-bold text-blue-700 mb-2">Service Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Service Package</label>
              <select name="servicePackage" value={form.servicePackage || ''} onChange={handleChange} className="p-2 border rounded w-full">
                <option value="">Select Package</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Credit Score Range</label>
              <select name="creditScoreRange" value={form.creditScoreRange || ''} onChange={handleChange} className="p-2 border rounded w-full">
                <option value="">Select Range</option>
                <option value="<500">Below 500</option>
                <option value="500-579">500-579</option>
                <option value="580-669">580-669</option>
                <option value="670-739">670-739</option>
                <option value="740+">740+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Referral Source</label>
              <select name="referralSource" value={form.referralSource || ''} onChange={handleChange} className="p-2 border rounded w-full">
                <option value="">Select Source</option>
                <option value="Google">Google</option>
                <option value="Facebook">Facebook</option>
                <option value="Yelp">Yelp</option>
                <option value="BBB">BBB</option>
                <option value="Current Client">Current Client</option>
                <option value="Previous Client">Previous Client</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timeline Expectation</label>
              <select name="timelineExpectation" value={form.timelineExpectation || ''} onChange={handleChange} className="p-2 border rounded w-full">
                <option value="">Select Timeline</option>
                <option value="3mo">3 Months</option>
                <option value="6mo">6 Months</option>
                <option value="9mo">9 Months</option>
                <option value="12mo+">12+ Months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Urgency Level</label>
              <input
                type="text"
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
                className="p-2 border rounded w-full"
                placeholder="e.g., High, Medium, Low"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Credit Score</label>
              <input
                type="text"
                name="targetCreditScore"
                value={form.targetCreditScore}
                onChange={handleChange}
                className="p-2 border rounded w-full"
                placeholder="e.g., 700"
              />
            </div>
          </div>
        </div>
        {/* Notes Section */}
        <h2 className="text-xl font-bold text-blue-700 mt-4 mb-2">Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Initial Consultation Notes</label>
            <textarea
              name="consultationNotes"
              value={form.consultationNotes}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              rows="3"
              placeholder="Notes from initial consultation"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Special Circumstances</label>
            <textarea
              name="specialCircumstances"
              value={form.specialCircumstances}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              rows="3"
              placeholder="Any special circumstances or considerations"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate('/contacts')}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isSubmitting ? 'Saving...' : (editId ? 'Save Changes' : 'Add Contact')}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState } from 'react';

// Credit Report Intake Form Component
export function CreditReportIntake({ onSuccess }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', birthDate: '', ssn: '', street: '', city: '', state: '', zip: '', offerCode: '', planCode: ''
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        onSuccess && onSuccess(data);
      } else {
        setStatus('error');
        setError(data.message || 'Submission failed.');
      }
    } catch (err) {
      setStatus('error');
      setError('Network or server error.');
    }
  };

  if (status === 'success') return <div>Thank you! Your application was received. We will contact you soon.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Get Your Free Credit Report & Review</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required maxLength={15} className="p-2 border rounded" />
        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required maxLength={15} className="p-2 border rounded" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="p-2 border rounded col-span-2" />
        <input name="birthDate" value={form.birthDate} onChange={handleChange} placeholder="Date of Birth" type="date" required className="p-2 border rounded col-span-2" />
        <input name="ssn" value={form.ssn} onChange={handleChange} placeholder="SSN (9 digits)" required maxLength={9} className="p-2 border rounded col-span-2" />
        <input name="street" value={form.street} onChange={handleChange} placeholder="Street Address" required maxLength={50} className="p-2 border rounded col-span-2" />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City" required maxLength={30} className="p-2 border rounded" />
        <input name="state" value={form.state} onChange={handleChange} placeholder="State (CA)" required maxLength={2} className="p-2 border rounded" />
        <input name="zip" value={form.zip} onChange={handleChange} placeholder="Zip" required maxLength={5} className="p-2 border rounded" />
        <input name="offerCode" value={form.offerCode} onChange={handleChange} placeholder="Offer Code" required className="p-2 border rounded" />
        <input name="planCode" value={form.planCode} onChange={handleChange} placeholder="Plan Code" required className="p-2 border rounded" />
      </div>
      <button type="submit" className="bg-green-700 text-white py-2 px-4 rounded w-full">{status === 'submitting' ? 'Submitting...' : 'Start My Free Credit Review'}</button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
}

// Credit Report Analysis Workflow Component
export function CreditReportAnalysis({ memberEmail }) {
  const [report, setReport] = useState(null);
  const [ai, setAI] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/report?email=${encodeURIComponent(memberEmail)}`);
      const data = await res.json();
      if (res.ok) {
        setReport(data.report);
        setAI(data.aiAnalysis);
      } else {
        setError(data.message || 'Could not fetch report.');
      }
    } catch (err) {
      setError('Network or server error.');
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (memberEmail) fetchReport();
  }, [memberEmail]);

  if (loading) return <div>Loading credit report...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!report) return <div>No report found.</div>;

  return (
    <div className="bg-gray-50 p-4 rounded shadow max-w-2xl mx-auto mt-6">
      <h2 className="text-lg font-bold mb-2">Credit Report Summary</h2>
      <ul className="mb-4">
        <li><b>Open Accounts:</b> {report.openAccounts}</li>
        <li><b>Closed Accounts:</b> {report.closedAccounts}</li>
        <li><b>Delinquent Accounts:</b> {report.delinquentAccounts}</li>
        <li><b>Derogatory Accounts:</b> {report.derogatoryAccounts}</li>
        <li><b>Total Balances:</b> ${report.totalBalances}</li>
        <li><b>Utilization:</b> {report.utilization}</li>
        <li><b>On-Time Payment %:</b> {report.onTimePaymentPercentage}</li>
        <li><b>Late Payment %:</b> {report.latePaymentPercentage}</li>
        {/* Add more fields as needed */}
      </ul>
      {ai && (
        <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-2">
          <b>AI Analysis:</b><br />
          <div><b>Urgency:</b> {ai.urgency}</div>
          <div><b>Contact Type:</b> {ai.contactType}</div>
          <div><b>Notes:</b> {ai.notes}</div>
        </div>
      )}
      {/* Staff actions: notes, flag, follow-up, etc. */}
      <textarea className="w-full p-2 border rounded mt-2" placeholder="Add staff notes or follow-up actions..."></textarea>
    </div>
  );
}

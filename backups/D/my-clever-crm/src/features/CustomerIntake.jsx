import React, { useState } from 'react';

function CustomerIntake() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate API call
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Customer Intake</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full" />
        <input name="company" value={form.company} onChange={handleChange} placeholder="Company" className="w-full" />
        <button type="submit" className="btn w-full">Submit</button>
      </form>
      {submitted && <div className="mt-3 text-blue-600 font-bold">Submitted!</div>}
    </div>
  );
}

export default CustomerIntake;

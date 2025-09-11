import React, { useState } from 'react';

function EmailSystem() {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');

  const handleSend = () => {
    // Simulate sending email
    setStatus('Sending...');
    setTimeout(() => setStatus('Email sent!'), 1200);
  };

  return (
    <div className="card p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Send Email</h2>
      <input
        type="text"
        placeholder="Recipients (comma separated)"
        value={recipients}
        onChange={e => setRecipients(e.target.value)}
        className="mb-4 w-full"
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={e => setSubject(e.target.value)}
        className="mb-4 w-full"
      />
      <textarea
        placeholder="Email body..."
        value={body}
        onChange={e => setBody(e.target.value)}
        className="mb-4 w-full"
        rows={6}
      />
      <button className="btn w-full" onClick={handleSend}>Send Email</button>
      {status && <div className="mt-3 text-green-600 font-bold">{status}</div>}
    </div>
  );
}

export default EmailSystem;

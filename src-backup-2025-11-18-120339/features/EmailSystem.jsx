
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const templates = [
  {
    name: 'Welcome',
    subject: 'Welcome to SpeedyCRM!',
    body: 'Hi {{name}},\n\nThank you for joining SpeedyCRM. We are excited to help you on your credit journey!\n\nBest,\nThe SpeedyCRM Team'
  },
  {
    name: 'Dispute Update',
    subject: 'Your Dispute Status Update',
    body: 'Hi {{name}},\n\nYour dispute status has been updated. Please log in to your portal for details.\n\nBest,\nSpeedyCRM Support'
  },
  {
    name: 'Lead Follow-Up',
    subject: 'Quick Follow-Up',
    body: 'Hi {{name}},\n\nJust checking in to see if you have any questions about your credit report.\n\nBest,\nSpeedyCRM Team'
  }
];

function EmailSystem() {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [sendTime, setSendTime] = useState('');

  const handleSend = () => {
    setStatus('Sending...');
    setTimeout(() => {
      setStatus('Email sent! 🎉');
      setTimeout(() => setStatus(''), 2000);
    }, 1200);
  };

  const handleTemplateSelect = (e) => {
    const template = templates.find(t => t.name === e.target.value);
    setSelectedTemplate(e.target.value);
    if (template) {
      setSubject(template.subject);
      setBody(template.body.replace('{{name}}', recipients.split(',')[0] || 'Client'));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="card p-6 max-w-xl mx-auto bg-white rounded-2xl shadow-2xl border">
      <h2 className="text-2xl font-bold mb-4">Send Email</h2>
      <div className="mb-4 flex gap-2">
        <select value={selectedTemplate} onChange={handleTemplateSelect} className="border rounded px-3 py-2">
          <option value="">Choose Template</option>
          {templates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
        </select>
        <input type="text" placeholder="Recipients (comma separated)" value={recipients} onChange={e => setRecipients(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
      <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="mb-4 w-full border rounded px-3 py-2" />
      <textarea placeholder="Email body..." value={body} onChange={e => setBody(e.target.value)} className="mb-4 w-full border rounded px-3 py-2" rows={6} />
      <div className="mb-4 flex gap-2 items-center">
        <label className="font-semibold">Schedule:</label>
        <input type="checkbox" checked={scheduled} onChange={e => setScheduled(e.target.checked)} />
        {scheduled && <input type="datetime-local" value={sendTime} onChange={e => setSendTime(e.target.value)} className="border rounded px-2 py-1" />}
      </div>
      <motion.button whileTap={{ scale: 0.95 }} className="btn w-full bg-blue-600 text-white font-bold py-2 rounded-xl shadow hover:bg-blue-700 transition-all duration-200" onClick={handleSend} aria-label="Send Email">
        Send Email
      </motion.button>
      {status && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="mt-3 text-green-600 font-bold text-center text-lg">{status}</motion.div>}
    </motion.div>
  );
}

export default EmailSystem;

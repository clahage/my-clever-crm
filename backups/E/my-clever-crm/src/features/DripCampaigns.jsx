import React, { useState } from 'react';

function DripCampaigns() {
  const [campaigns, setCampaigns] = useState([
    { name: 'Welcome Series', status: 'Active', emailsSent: 120 },
    { name: 'Re-engagement', status: 'Paused', emailsSent: 45 }
  ]);
  const [newName, setNewName] = useState('');

  const addCampaign = () => {
    if (newName.trim()) {
      setCampaigns([...campaigns, { name: newName, status: 'Active', emailsSent: 0 }]);
      setNewName('');
    }
  };

  return (
    <div className="card p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Drip Campaigns</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="New Campaign Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="mr-2"
        />
        <button className="btn" onClick={addCampaign}>Add Campaign</button>
      </div>
      <ul className="space-y-3">
        {campaigns.map((c, idx) => (
          <li key={idx} className="card p-3 flex justify-between items-center">
            <span className="font-bold text-brand-primary">{c.name}</span>
            <span className={c.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}>{c.status}</span>
            <span className="text-gray-500">Emails Sent: {c.emailsSent}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DripCampaigns;

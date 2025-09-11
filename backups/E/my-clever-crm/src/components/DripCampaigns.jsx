// scr-admin-vite/src/components/DripCampaigns.jsx
import React, { useState } from 'react';
import Card from './ui/card'; // Relative path
import Button from './ui/button'; // Relative path

function DripCampaigns() {
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'New Lead Welcome', status: 'Active', emails: 3 },
    { id: 2, name: 'Follow-up Series', status: 'Paused', emails: 5 },
  ]);

  const toggleCampaignStatus = (id) => {
    setCampaigns(campaigns.map(campaign =>
      campaign.id === id ? { ...campaign, status: campaign.status === 'Active' ? 'Paused' : 'Active' } : campaign
    ));
  };

  return (
    <Card className="p-6 flex flex-col">
      <h3 className="text-xl font-semibold mb-4">Drip Campaigns & Autoresponders</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Manage automated email sequences to nurture leads and communicate with clients.
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Campaign Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Emails</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">{campaign.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-900 dark:text-white">{campaign.emails}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    campaign.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <Button onClick={() => toggleCampaignStatus(campaign.id)} className="text-xs px-2 py-1">
                    {campaign.status === 'Active' ? 'Pause' : 'Activate'}
                  </Button>
                  <Button className="text-xs px-2 py-1 ml-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button className="self-start">Create New Campaign</Button>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        (Future: Full campaign builder with email templates, scheduling, and analytics.)
      </p>
    </Card>
  );
}

export default DripCampaigns;
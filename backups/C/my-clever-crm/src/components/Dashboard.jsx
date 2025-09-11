import React from 'react';
console.log('[Dashboard] Component loaded');
import { Link } from 'react-router-dom';
// ...existing code...
import RevenueForecastWidget from './RevenueForecastWidget.jsx';
import AdvancedAnalytics from './AdvancedAnalytics.jsx';
import DisputeLetterDashboardWidget from './DisputeLetterDashboardWidget.jsx';

const metrics = [
  { label: "Total Clients", value: 128, icon: "👥", color: "bg-blue-100 text-blue-700" },
  { label: "Active Disputes", value: 34, icon: "⚡", color: "bg-yellow-100 text-yellow-700" },
  { label: "Success Rate", value: "92%", icon: "✅", color: "bg-green-100 text-green-700" },
  { label: "Monthly Revenue", value: "$12,400", icon: "💰", color: "bg-purple-100 text-purple-700" },
];

const recentActivity = [
  { id: 1, type: "Dispute Created", client: "John Doe", date: "2025-08-14", status: "Open" },
  { id: 2, type: "Client Added", client: "Jane Smith", date: "2025-08-13", status: "Active" },
  { id: 3, type: "Dispute Resolved", client: "Carlos Ruiz", date: "2025-08-12", status: "Resolved" },
  { id: 4, type: "Payment Received", client: "Emily Chen", date: "2025-08-11", status: "Completed" },
];

const quickActions = [
  { label: "Add Client", href: "/contacts", color: "bg-blue-600" },
  { label: "New Dispute", href: "/dispute-center", color: "bg-yellow-500" },
  { label: "Generate Report", href: "/analytics", color: "bg-green-600" },
  { label: "Send Letter", href: "/letters", color: "bg-purple-600" },
];

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'contacts'), (snapshot) => {
      const allContacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const validContacts = allContacts.filter(contact =>
        contact.firstName && contact.lastName && contact.email &&
        contact.firstName !== 'N/A' && contact.lastName !== 'N/A' && contact.email !== 'N/A'
      );
      setContacts(validContacts);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    console.log('[Dashboard] contacts loaded:', contacts.length);
  }, [contacts]);

  // Conversion funnel
  const totalLeads = contacts.filter(c => (c.category && c.category.toLowerCase() === 'lead')).length;
  const totalClients = contacts.filter(c => (c.category && c.category.toLowerCase() === 'client')).length;
  const totalContacts = contacts.length;
  const leadToClient = totalLeads ? Math.round((totalClients / totalLeads) * 100) : 0;

  // Lead source performance
  const sources = ['Yelp', 'Google', 'Facebook', 'Website', 'Affiliate'];
  const sourceStats = sources.map(src => {
    const srcContacts = contacts.filter(c =>
      c.source && c.source.toLowerCase() === src.toLowerCase() &&
      c.firstName && c.lastName && c.email &&
      c.firstName !== 'N/A' && c.lastName !== 'N/A' && c.email !== 'N/A'
    );
    const conversions = srcContacts.filter(c => c.category && c.category.toLowerCase() === 'client').length;
    return {
      source: src,
      total: srcContacts.length,
      conversionRate: srcContacts.length ? Math.round((conversions / srcContacts.length) * 100) : 0
    };
  });

  const responseStats = sources.map(src => {
    const srcContacts = contacts.filter(c => c.source === src && c.platformResponseTime);
    const avg = srcContacts.length ? Math.round(srcContacts.reduce((sum, c) => sum + Number(c.platformResponseTime || 0), 0) / srcContacts.length) : null;
    let color = 'bg-gray-200';
    if (avg !== null) {
      if (src === 'Yelp' && avg <= 5) color = 'bg-green-200';
      else if (avg <= 60) color = 'bg-yellow-200';
      else color = 'bg-red-200';
    }
    return { source: src, avg, color };
  });

  const scoreBuckets = [1,2,3,4,5,6,7,8,9,10];
  const scoreStats = scoreBuckets.map(score => {
    const bucketContacts = contacts.filter(c => Number(c.leadScore) === score);
    const conversions = bucketContacts.filter(c => c.category === 'client' || c.status === 'Client').length;
    return {
      score,
      total: bucketContacts.length,
      conversionRate: bucketContacts.length ? Math.round((conversions / bucketContacts.length) * 100) : 0
    };
  });
  const highValueLeads = contacts.filter(c => Number(c.leadScore) >= 8).length;

  // --- AdvancedAnalytics Data Preparation ---
  const revenueHistory = [
    { label: 'Mar', actual: 9000, forecast: 8500 },
    { label: 'Apr', actual: 10500, forecast: 10000 },
    { label: 'May', actual: 12000, forecast: 11500 },
    { label: 'Jun', actual: 11000, forecast: 10800 },
    { label: 'Jul', actual: 13000, forecast: 12500 },
    { label: 'Aug', actual: 14000, forecast: 13500 },
  ];

  const forecastAccuracy = [
    { label: 'Mar', actual: 9000, predicted: 8500 },
    { label: 'Apr', actual: 10500, predicted: 10000 },
    { label: 'May', actual: 12000, predicted: 11500 },
    { label: 'Jun', actual: 11000, predicted: 10800 },
    { label: 'Jul', actual: 13000, predicted: 12500 },
    { label: 'Aug', actual: 14000, predicted: 13500 },
  ];

  const conversionTrends = [
    { label: 'Mar', rate: 32 },
    { label: 'Apr', rate: 35 },
    { label: 'May', rate: 38 },
    { label: 'Jun', rate: 36 },
    { label: 'Jul', rate: 40 },
    { label: 'Aug', rate: 42 },
  ];

  const leadSourceStats = [
    { source: 'Yelp', value: 10 },
    { source: 'Google', value: 15 },
    { source: 'Facebook', value: 8 },
    { source: 'Website', value: 12 },
    { source: 'Affiliate', value: 5 },
  ];

  // EARLY DEBUG: Confirm Dashboard is rendering
  console.log('[Dashboard] EARLY render');
  console.log('[Dashboard] AdvancedAnalytics imported');
  console.log('[Dashboard] Rendering AdvancedAnalytics');

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome to Speedy Credit Repair CRM</h1>
        <p className="mb-8 text-lg text-gray-700">Your business hub for managing contacts, analytics, and revenue.</p>

        {/* Migration tool removed for production. Professional dashboard layout. */}

        {/* Contact Conversion Funnel */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Contact Conversion Funnel</h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{totalLeads}</div>
              <div className="text-sm text-gray-600">Leads</div>
            </div>
            <span className="mx-2 text-2xl">→</span>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{totalClients}</div>
              <div className="text-sm text-gray-600">Clients</div>
              <div className="text-green-600 text-xs">{leadToClient}% conversion <span className="ml-1">↑</span></div>
            </div>
          </div>
        </div>

        {/* Revenue Forecast Widget (NEW) */}
        <div style={{background: 'red', color: 'white', padding: '10px', marginBottom: '10px'}}>
          TEST: Revenue Widget Should Appear Below This
        </div>
        <RevenueForecastWidget
          leads={contacts}
          month={new Date().getMonth() + 1}
          year={new Date().getFullYear()}
        />

        {/* Lead Source Performance */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Lead Source Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sourceStats.map(stat => (
              <div key={stat.source} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
                <div className="font-bold text-lg">{stat.source}</div>
                <div className="flex items-center gap-2">
                  <div className="text-gray-700">Total: {stat.total}</div>
                  <div className="text-green-600 font-semibold">Conversion: {stat.conversionRate}%</div>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded">
                  <div style={{ width: `${stat.conversionRate}%` }} className="h-3 bg-blue-500 rounded transition-all duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Response Time Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {responseStats.map(stat => (
              <div key={stat.source} className={`rounded-lg shadow p-4 flex flex-col gap-2 ${stat.color}`}>
                <div className="font-bold text-lg">{stat.source}</div>
                <div className="text-gray-700">Avg Response: {stat.avg !== null ? `${stat.avg} min` : 'N/A'}</div>
                <div className="text-xs text-gray-500">Target: {stat.source === 'Yelp' ? '<5min critical' : '<1hr'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Scoring Effectiveness */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Lead Scoring Effectiveness</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="font-bold mb-2">Score Distribution</div>
              <div className="flex gap-1 items-end h-24">
                {scoreStats.map(stat => (
                  <div key={stat.score} className="flex flex-col items-center justify-end" style={{ width: 24 }}>
                    <div className="bg-blue-400 rounded w-4" style={{ height: `${stat.total * 6}px` }}></div>
                    <div className="text-xs mt-1">{stat.score}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="font-bold mb-2">Conversion by Score</div>
              {scoreStats.map(stat => (
                <div key={stat.score} className="flex items-center gap-2">
                  <div className="text-gray-700">Score {stat.score}:</div>
                  <div className="text-green-600 font-semibold">{stat.conversionRate}%</div>
                </div>
              ))}
              <div className="mt-2 text-blue-700 font-bold">High-Value Leads (8+): {highValueLeads}</div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Component */}
        <AdvancedAnalytics
          revenueHistory={revenueHistory}
          forecastAccuracy={forecastAccuracy}
          conversionTrends={conversionTrends}
          leadSourceStats={leadSourceStats}
        />

        {/* Dispute Letter Summary Widget */}
        <DisputeLetterDashboardWidget />

        {/* ...existing metrics, quick actions, recent activity... */}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { getPartnerTokenViaHttp } from '@/services/idiqService';

const IDIQDashboard = () => {
  const [partnerToken, setPartnerToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      setLoading(true);
      setError("");
      try {
        const token = await getPartnerTokenViaHttp();
        setPartnerToken(token);
      } catch (err) {
        setError(err?.message || "Failed to connect to IDIQ.");
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-lg text-gray-700">Connecting to IDIQ…</div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">IDIQ Error: {error}</div>
    );
  }
  return (
    <div className="idiq-dashboard p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">IDIQ Credit Integration</h2>
      <div className="mb-4 text-green-700 font-semibold">Connected to IDIQ</div>
      <div className="mt-4 p-4 bg-green-50 rounded">
        <h3>Partner Token:</h3>
        <pre className="text-sm break-all">{partnerToken}</pre>
      </div>
      {/* Render real IDIQ UI here */}
    </div>
  );
};

export default IDIQDashboard;

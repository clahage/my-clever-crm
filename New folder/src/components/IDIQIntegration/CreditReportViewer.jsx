import React, { useState } from 'react';

const CreditReportViewer = ({ reportData }) => {
  const [expanded, setExpanded] = useState(false);

  if (!reportData) {
    return <div className="p-4 bg-gray-100 rounded">No credit report available.</div>;
  }

  return (
    <div className="credit-report-viewer p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold mb-2">Credit Report</h3>
      <button
        className="text-blue-500 underline mb-2"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>
      {expanded && (
        <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(reportData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default CreditReportViewer;

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { fetchIDIQReport } from "../utils/idiqProvider";
import { parseCreditReport } from "../utils/aiCreditReportParser";
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { saveAs } from 'file-saver';

const ClientCreditReports = ({ clientId, enrollmentDate, refreshIntervalDays = 30 }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!clientId) return;
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, "creditReports"), where("clientId", "==", clientId), orderBy("pulledAt", "desc"));
        const querySnapshot = await getDocs(q);
        setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError("Failed to load credit reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [clientId]);

  // Calculate next eligible pull date
  const lastReport = reports[0];
  const lastPull = lastReport ? new Date(lastReport.pulledAt) : (enrollmentDate ? new Date(enrollmentDate) : null);
  const nextEligible = lastPull ? new Date(lastPull.getTime() + refreshIntervalDays * 24 * 60 * 60 * 1000) : null;
  const canPull = !nextEligible || new Date() >= nextEligible;

  const handlePullReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const report = await fetchIDIQReport({ clientId });
      await addDoc(collection(db, "creditReports"), { ...report, clientId });
      setReports(r => [report, ...r]);
    } catch (err) {
      setError("Failed to pull credit report");
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async (rawReport) => {
    setParsing(true);
    setParsed(null);
    try {
      const result = await parseCreditReport(rawReport);
      setParsed(result);
    } catch {
      setParsed({ summary: "Failed to parse report." });
    } finally {
      setParsing(false);
    }
  };

  // Filtering state
  const filteredTradelines = parsed && parsed.tradelines
    ? parsed.tradelines.filter(t => filter === 'all' ? true : t.status === filter)
    : [];

  // Export handlers
  const handleExportCSV = () => {
    if (parsed && parsed.tradelines) exportToCSV(parsed.tradelines, 'credit_report_tradelines.csv');
  };
  const handleExportPDF = () => {
    if (parsed && parsed.tradelines) exportToPDF(parsed.tradelines, 'credit_report_tradelines.pdf');
  };

  // Dispute letter generation (simple template)
  const handleGenerateLetter = (tradeline) => {
    const letter = `To Whom It May Concern,\n\nI am writing to dispute the following item on my credit report:\n\nAccount: ${tradeline.account}\nType: ${tradeline.type}\nStatus: ${tradeline.status}\nRemarks: ${tradeline.remarks}\n\nReason: ${tradeline.suggestedDispute || 'N/A'}\n\nPlease investigate and remove this item if it is found to be inaccurate.\n\nSincerely,\n[Your Name]`;
    const blob = new Blob([letter], { type: 'text/plain' });
    saveAs(blob, `${tradeline.account}_dispute_letter.txt`);
  };

  // AI Precontract summary
  const [precontractSummary, setPrecontractSummary] = useState(null);
  const handlePrecontractSummary = async () => {
    if (!parsed) return;
    // Simulate AI summary (replace with LLM call in production)
    const positives = parsed.tradelines.filter(t => t.status === 'Positive').length;
    const negatives = parsed.tradelines.filter(t => t.status === 'Negative').length;
    const likelyActions = parsed.recommendations?.join('\n') || 'No actions recommended.';
    setPrecontractSummary(
      `Precontract Summary:\n\nPositives: ${positives} tradelines in good standing.\nNegatives: ${negatives} tradelines with issues.\n\nSpeedy Credit Repair suggests:\n${likelyActions}`
    );
  };

  // Compare two reports for changes
  const [comparison, setComparison] = useState(null);
  const handleCompareReports = async () => {
    if (reports.length < 2) return;
    const [latest, previous] = reports;
    // Simulate AI comparison (replace with LLM call in production)
    const changes = [];
    // For demo, just compare tradeline counts
    const latestNeg = (parsed?.tradelines || []).filter(t => t.status === 'Negative').length;
    const prevNeg = 2; // Placeholder, should parse previous.rawReport
    if (latestNeg < prevNeg) changes.push('Negative tradelines decreased.');
    if (latestNeg > prevNeg) changes.push('Negative tradelines increased.');
    setComparison({
      summary: `Compared to previous report: ${changes.join(' ') || 'No major changes detected.'}`
    });
  };

  return (
    <div className="mb-8">
      <h4 className="text-lg font-semibold mb-2">Credit Reports</h4>
      {canPull ? (
        <button className="mb-2 px-3 py-1 bg-blue-500 text-white rounded" onClick={handlePullReport} disabled={loading}>
          {loading ? "Pulling..." : "Pull New Report"}
        </button>
      ) : (
        <div className="mb-2 text-gray-500 text-sm">Next eligible pull: {nextEligible && nextEligible.toLocaleDateString()}</div>
      )}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <ul className="space-y-2">
        {reports.map(report => (
          <li key={report.id} className="bg-gray-50 p-2 rounded flex flex-col">
            <span className="font-semibold">{report.provider} - {new Date(report.pulledAt).toLocaleString()}</span>
            <button className="text-blue-600 underline w-fit" onClick={() => handleParse(report.rawReport)} disabled={parsing}>Parse & Suggest Disputes</button>
          </li>
        ))}
      </ul>
      {parsing && <div className="text-gray-500 mt-2">Parsing report...</div>}
      {parsed && (
        <div className="mt-4 p-3 bg-green-50 rounded">
          <div className="font-semibold mb-2">AI Dispute Suggestions</div>
          <div className="mb-2 text-sm">{parsed.summary}</div>
          {parsed.aiSummary && <div className="mb-2 text-xs italic text-gray-700">{parsed.aiSummary}</div>}
          {parsed.recommendations && (
            <div className="mb-2">
              <div className="font-semibold">Recommendations:</div>
              <ul className="list-disc pl-5">
                {parsed.recommendations.map((rec, i) => (
                  <li key={i} className="text-blue-700">{rec}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-2 mb-2">
            <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={handleExportCSV}>Export CSV</button>
            <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={handleExportPDF}>Export PDF</button>
            <select className="border p-1 rounded text-xs" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="Negative">Negative Only</option>
              <option value="Positive">Positive Only</option>
            </select>
            <button className="px-2 py-1 bg-orange-500 text-white rounded text-xs" onClick={handlePrecontractSummary}>AI Precontract Summary</button>
            <button className="px-2 py-1 bg-teal-600 text-white rounded text-xs" onClick={handleCompareReports}>Compare to Previous</button>
          </div>
          {precontractSummary && (
            <div className="mb-2 p-2 bg-orange-100 rounded text-xs whitespace-pre-wrap">{precontractSummary}</div>
          )}
          {comparison && (
            <div className="mb-2 p-2 bg-teal-100 rounded text-xs whitespace-pre-wrap">{comparison.summary}</div>
          )}
          <table className="w-full text-xs border mt-2">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-1 border">Account</th>
                <th className="p-1 border">Type</th>
                <th className="p-1 border">Status</th>
                <th className="p-1 border">Balance</th>
                <th className="p-1 border">Opened</th>
                <th className="p-1 border">Last Reported</th>
                <th className="p-1 border">Remarks</th>
                <th className="p-1 border">Dispute</th>
                <th className="p-1 border">Letter</th>
                <th className="p-1 border">AI Notes</th>
                <th className="p-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTradelines.map((t, i) => (
                <tr key={i} className={t.status === 'Negative' ? 'bg-red-50' : 'bg-green-50'}>
                  <td className="border p-1">{t.account}</td>
                  <td className="border p-1">{t.type}</td>
                  <td className="border p-1">{t.status}</td>
                  <td className="border p-1">{t.balance !== undefined ? `$${t.balance}` : ''}</td>
                  <td className="border p-1">{t.opened}</td>
                  <td className="border p-1">{t.lastReported}</td>
                  <td className="border p-1">{t.remarks}</td>
                  <td className="border p-1">{t.suggestedDispute}</td>
                  <td className="border p-1">{t.letterTemplate}</td>
                  <td className="border p-1">{t.aiNotes}</td>
                  <td className="border p-1">
                    {t.status === 'Negative' && (
                      <button className="px-2 py-1 bg-purple-600 text-white rounded text-xs" onClick={() => handleGenerateLetter(t)}>
                        Generate Dispute Letter
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientCreditReports;

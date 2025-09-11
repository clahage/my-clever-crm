import React, { useState } from "react";

const now = new Date().toLocaleString();
console.log(`BILLING ACTIVE: pages/Billing.jsx (${now})`);

const samplePayments = [
  { id: 1, date: "2025-08-01", amount: 99, method: "Visa ****1234", status: "Paid" },
  { id: 2, date: "2025-07-01", amount: 99, method: "Visa ****1234", status: "Paid" },
  { id: 3, date: "2025-06-01", amount: 99, method: "Visa ****1234", status: "Paid" },
];
const sampleInvoices = [
  { id: 101, due: "2025-09-10", amount: 99, status: "Outstanding" },
];
const paymentMethods = [
  { type: "Visa", last4: "1234", exp: "08/27", primary: true },
  { type: "ACH", last4: "6789", exp: null, primary: false },
];

export default function Billing() {
  const totalRevenue = samplePayments.reduce((sum, p) => sum + p.amount, 0);
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div className="bg-green-200 text-green-900 font-bold p-2 rounded mb-2 text-center">
        BILLING ACTIVE: pages/Billing.jsx ({now})
      </div>
      <h1 className="text-2xl font-bold mb-2">Billing</h1>
      {/* Revenue Summary */}
      <div className="bg-blue-50 rounded p-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-700">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="text-sm text-blue-700">All time</div>
      </div>
      {/* Outstanding Invoices */}
      <div>
        <h2 className="font-semibold text-lg mb-1">Outstanding Invoices</h2>
        {sampleInvoices.length === 0 ? (
          <div className="text-green-600">No outstanding invoices.</div>
        ) : (
          <table className="w-full text-sm border rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Invoice #</th>
                <th className="p-2 text-left">Due</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleInvoices.map(inv => (
                <tr key={inv.id} className="border-t">
                  <td className="p-2">{inv.id}</td>
                  <td className="p-2">{inv.due}</td>
                  <td className="p-2">${inv.amount}</td>
                  <td className="p-2 text-yellow-700 font-semibold">{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Payment History */}
      <div>
        <h2 className="font-semibold text-lg mb-1">Payment History</h2>
        <table className="w-full text-sm border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Method</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {(showAll ? samplePayments : samplePayments.slice(0, 2)).map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.date}</td>
                <td className="p-2">${p.amount}</td>
                <td className="p-2">{p.method}</td>
                <td className="p-2 text-green-700 font-semibold">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {samplePayments.length > 2 && (
          <button
            className="mt-2 text-blue-600 hover:underline text-sm"
            onClick={() => setShowAll(v => !v)}
          >
            {showAll ? "Show Less" : `Show All (${samplePayments.length})`}
          </button>
        )}
      </div>
      {/* Payment Methods */}
      <div>
        <h2 className="font-semibold text-lg mb-1">Payment Methods</h2>
        <div className="flex flex-col gap-2">
          {paymentMethods.map((pm, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 p-3 rounded border ${pm.primary ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            >
              <span className="font-semibold">{pm.type}</span>
              <span>****{pm.last4}</span>
              {pm.exp && <span>Exp {pm.exp}</span>}
              {pm.primary && <span className="ml-auto text-xs text-blue-700 font-bold">Primary</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

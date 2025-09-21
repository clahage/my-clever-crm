import React from 'react';
import { FileCheck, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function CreditReports() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Reports</h1>
        <p className="text-gray-600">IDIQ Integration - Full credit report analysis</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <FileCheck className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold">Reports Pulled</h3>
          <p className="text-2xl font-bold">324</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-semibold">Avg Score Increase</h3>
          <p className="text-2xl font-bold">+78</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
          <h3 className="font-semibold">Negative Items</h3>
          <p className="text-2xl font-bold">892</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-semibold">Items Removed</h3>
          <p className="text-2xl font-bold">567</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Credit Reports</h2>
        <div className="text-gray-600">IDIQ credit report integration will display here...</div>
      </div>
    </div>
  );
}

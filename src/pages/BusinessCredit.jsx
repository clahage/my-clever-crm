import React from 'react';
import { Building2, TrendingUp, CreditCard, FileText } from 'lucide-react';

export default function BusinessCredit() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Credit Builder</h1>
        <p className="text-gray-600">Build business credit from scratch or repair existing</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <Building2 className="h-10 w-10 text-blue-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">Build From Scratch</h3>
          <p className="text-gray-700 mb-4">Start building business credit with our proven blueprint</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Get Started</button>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <TrendingUp className="h-10 w-10 text-green-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">Repair Existing</h3>
          <p className="text-gray-700 mb-4">Fix and improve your current business credit profile</p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Start Repair</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <CreditCard className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-semibold">Tradelines</h3>
          <p className="text-sm text-gray-600">Access to premium tradeline options</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <FileText className="h-8 w-8 text-orange-600 mb-2" />
          <h3 className="font-semibold">LOC Discovery</h3>
          <p className="text-sm text-gray-600">Find lines of credit opportunities</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold">Funding Tools</h3>
          <p className="text-sm text-gray-600">Business funding resources</p>
        </div>
      </div>
    </div>
  );
}

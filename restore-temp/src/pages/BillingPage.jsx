import React from 'react';
import { CreditCard as LucideCreditCard, DollarSign, TrendingUp, Users } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Invoices</h1>
        <p className="text-gray-600">Manage client billing, plans, and payments</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <DollarSign className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Monthly Revenue</h3>
          <p className="text-2xl font-bold">$24,580</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Growth</h3>
          <p className="text-2xl font-bold">+12%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Users className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Active Plans</h3>
          <p className="text-2xl font-bold">156</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <LucideCreditCard className="h-8 w-8 text-orange-600 mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Pending</h3>
          <p className="text-2xl font-bold">8</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Service Plans</h2>
          <div className="space-y-2 text-gray-600">
            <div>• Standard Credit Repair - $99/mo</div>
            <div>• Pay-for-Delete - $149/mo</div>
            <div>• Premium Bundle - $249/mo</div>
            <div>• Business Credit - $399/mo</div>
          </div>
        </div>
      </div>
    </div>
  );
}

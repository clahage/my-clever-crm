


import React from 'react';

export default function Location() {
  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Business Location & Contact Information</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Address Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Business Address</h2>
          <p className="text-gray-700 font-medium">117 Main Street Suite 202<br />Huntington Beach, CA 92648</p>
        </div>

        {/* Business Model Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Business Model</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-2">
            <li>No walk-in clients (virtual services only)</li>
            <li>Serves all 50 states</li>
            <li>Full-service credit building and restoration provider</li>
            <li>World-class credit services delivered virtually via phone, email, text</li>
          </ul>
        </div>

        {/* Consultation Services Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Consultation Services</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-2">
            <li>Live credit repair expert consultations by appointment during business hours</li>
            <li>Callers can be transferred to live experts during business hours</li>
            <li>24/7 AI receptionist expertly trained for detailed credit and finance questions</li>
          </ul>
        </div>

        {/* Experience & Credentials Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Experience & Credentials</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-2">
            <li>Over 35 years in credit restoration industry</li>
            <li>5-star rated on Yelp, Google, Yellow Pages.com, and Facebook</li>
            <li>A+ Rating with Better Business Bureau (even as non-paid member)</li>
            <li>Rare BBB achievement for credit repair industry</li>
          </ul>
        </div>

        {/* Contact & Availability Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Contact & Availability</h2>
          <div className="mb-2">
            <span className="font-semibold">Website:</span> <a href="https://SpeedyCreditRepair.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">SpeedyCreditRepair.com</a> <span className="text-gray-600">(24/7 self-start application)</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Phone:</span> <a href="tel:8887247344" className="text-blue-600 underline">888-724-7344</a> <span className="text-gray-600">(24/7 AI Receptionist)</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Live Credit Experts:</span> <span className="text-gray-700">Monday-Saturday, 8:00 AM - 3:00 PM Pacific</span>
          </div>
        </div>

        {/* Service Delivery Section */}
        <div className="mb-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Service Delivery</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Live expert consultations (by appointment)</li>
            <li>Virtual consultations</li>
            <li>Phone support with live transfer option</li>
            <li>Email communication</li>
            <li>Text messaging support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

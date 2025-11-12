import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">SpeedyCRM</h3>
            <p className="text-sm text-gray-400">
              Professional credit repair management system
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>ScoreView™</li>
              <li>SmartSim™</li>
              <li>Document Management</li>
              <li>Client Portal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Documentation</li>
              <li>Contact Support</li>
              <li>System Status</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>FCRA Compliance</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          © 2025 Speedy Credit Repair. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

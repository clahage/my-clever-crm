import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Database, Save, Check, Rocket, Box } from 'lucide-react';
import InitializeDisputeSystem from '../components/InitializeDisputeSystem';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    // General
    companyName: 'Speedy Credit Repair Inc',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true,
    newLeadAlert: true,
    dailyDigest: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
    ipWhitelist: false,
    
    // Appearance
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false
  });

  const handleSave = () => {
    // In real app, this would save to backend
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application preferences and configurations</p>
      </div>

      {/* Dispute System Initialization Section - Temporary, can be removed after setup */}
      <div className="mb-6">
        <InitializeDisputeSystem />
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                activeTab === 'general' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              General
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-5 h-5" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                activeTab === 'appearance' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Palette className="w-5 h-5" />
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                activeTab === 'integrations' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-5 h-5" />
              Integrations
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                activeTab === 'data' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Database className="w-5 h-5" />
              Data & Storage
            </button>
            {/* New Dispute System Tab */}
            <button
              onClick={() => setActiveTab('dispute')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                activeTab === 'dispute' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Rocket className="w-5 h-5" />
              Dispute System
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">General Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => updateSetting('companyName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => updateSetting('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">SMS Notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Desktop Notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.desktopNotifications}
                      onChange={(e) => updateSetting('desktopNotifications', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">New Lead Alerts</span>
                    <input
                      type="checkbox"
                      checked={settings.newLeadAlert}
                      onChange={(e) => updateSetting('newLeadAlert', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Daily Digest Email</span>
                    <input
                      type="checkbox"
                      checked={settings.dailyDigest}
                      onChange={(e) => updateSetting('dailyDigest', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-700">Two-Factor Authentication</span>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-700">IP Whitelist</span>
                      <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.ipWhitelist}
                      onChange={(e) => updateSetting('ipWhitelist', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Appearance Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Collapsed Sidebar</span>
                  <input
                    type="checkbox"
                    checked={settings.sidebarCollapsed}
                    onChange={(e) => updateSetting('sidebarCollapsed', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Compact Mode</span>
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => updateSetting('compactMode', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Integrations</h2>
                
                <div className="space-y-4">
                  {/* Email Integration */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Email (Google Workspace)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">SMTP Host</label>
                        <input
                          type="text"
                          defaultValue="smtp.gmail.com"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">SMTP Port</label>
                        <input
                          type="text"
                          defaultValue="587"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                        <input
                          type="email"
                          placeholder="chris@speedycreditrepair.com"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Configure in .env file. Use Google App Password for authentication.
                      </p>
                    </div>
                  </div>

                  {/* Fax Integration */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Fax Service (Telnyx)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">API Key</label>
                        <input
                          type="password"
                          placeholder="Enter Telnyx API Key"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Fax Number</label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Connection ID</label>
                        <input
                          type="text"
                          placeholder="Telnyx Connection ID"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Telnyx provides reliable fax service without cover pages. Supports high volume.
                      </p>
                    </div>
                  </div>

                  {/* OpenAI Integration */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">OpenAI API</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">API Key</label>
                        <input
                          type="password"
                          placeholder="sk-..."
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Powers AI letter generation and analysis. Configure in .env file.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Data & Storage</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Database Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Documents</span>
                        <span className="font-medium">12,543</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Storage Used</span>
                        <span className="font-medium">2.4 GB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Collections</span>
                        <span className="font-medium">24</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">API Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">OpenAI Calls</span>
                        <span className="font-medium">1,234</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fax Sent</span>
                        <span className="font-medium">456</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Emails Sent</span>
                        <span className="font-medium">789</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Data Management</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50">
                      Export All Data
                    </button>
                    <button className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50">
                      Backup to Cloud
                    </button>
                    <button className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50 text-red-600">
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dispute' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Dispute System Settings</h2>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-medium text-gray-900 mb-2">System Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">All systems operational</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Templates: Active | AI: Enabled | Automation: Running
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => window.location.href = '/dispute-letters'}
                        className="w-full text-left px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Go to Dispute Letters
                      </button>
                      <button
                        onClick={() => window.location.href = '/admin/disputes'}
                        className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50"
                      >
                        Admin Panel
                      </button>
                      <button className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50">
                        View Templates
                      </button>
                      <button className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50">
                        Check API Status
                      </button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Default Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Default AI Strategy</label>
                        <select className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="conservative">Conservative</option>
                          <option value="moderate">Moderate</option>
                          <option value="aggressive" selected>Aggressive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Auto Follow-up Days</label>
                        <input
                          type="number"
                          defaultValue="30"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="text-blue-600" />
                        <span className="text-sm">Enable automatic response tracking</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="text-blue-600" />
                        <span className="text-sm">AI-powered template selection</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                {saved ? (
                  <>
                    <Check className="w-5 h-5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
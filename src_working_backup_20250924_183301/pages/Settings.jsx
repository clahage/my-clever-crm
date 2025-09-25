import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Database, Save, Check } from 'lucide-react';

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
                <div className="text-center py-12">
                  <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Integration settings coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Data & Storage</h2>
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Data management settings coming soon</p>
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
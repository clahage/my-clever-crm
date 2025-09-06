import React, { useState } from "react";

const initialProfile = {
  name: "",
  email: "",
  avatar: "",
};
const initialPrefs = {
  theme: "system",
  notifications: true,
};
const initialSecurity = {
  password: "",
  confirmPassword: "",
};

export default function Settings() {
  const [profile, setProfile] = useState(initialProfile);
  const [prefs, setPrefs] = useState(initialPrefs);
  const [security, setSecurity] = useState(initialSecurity);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleProfileChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const handlePrefsChange = e => {
    const { name, value, type, checked } = e.target;
    setPrefs({ ...prefs, [name]: type === "checkbox" ? checked : value });
  };
  const handleSecurityChange = e => {
    setSecurity({ ...security, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      setSuccess("Settings saved successfully.");
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Section */}
        <section className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              Name
              <input name="name" value={profile.name} onChange={handleProfileChange} className="input input-bordered mt-1" required />
            </label>
            <label className="flex flex-col">
              Email
              <input name="email" type="email" value={profile.email} onChange={handleProfileChange} className="input input-bordered mt-1" required />
            </label>
            <label className="flex flex-col">
              Avatar URL
              <input name="avatar" value={profile.avatar} onChange={handleProfileChange} className="input input-bordered mt-1" />
            </label>
            {profile.avatar && (
              <img src={profile.avatar} alt="avatar" className="w-16 h-16 rounded-full border mt-2" />
            )}
          </div>
        </section>
        {/* Preferences Section */}
        <section className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Preferences</h2>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              Theme
              <select name="theme" value={prefs.theme} onChange={handlePrefsChange} className="input input-bordered mt-1">
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="notifications" checked={prefs.notifications} onChange={handlePrefsChange} />
              Enable notifications
            </label>
          </div>
        </section>
        {/* Security Section */}
        <section className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Security</h2>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              New Password
              <input name="password" type="password" value={security.password} onChange={handleSecurityChange} className="input input-bordered mt-1" minLength={6} />
            </label>
            <label className="flex flex-col">
              Confirm Password
              <input name="confirmPassword" type="password" value={security.confirmPassword} onChange={handleSecurityChange} className="input input-bordered mt-1" minLength={6} />
            </label>
            {security.password && security.confirmPassword && security.password !== security.confirmPassword && (
              <span className="text-red-500 text-sm">Passwords do not match.</span>
            )}
          </div>
        </section>
        {/* Actions */}
        <div className="flex gap-4 items-center">
          <button type="submit" className="btn btn-primary" disabled={saving || (security.password && security.password !== security.confirmPassword)}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {success && <span className="text-green-600">{success}</span>}
          {error && <span className="text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}

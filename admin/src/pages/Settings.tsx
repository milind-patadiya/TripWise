import { useState } from 'react';
import { User, Lock, Bell, Shield, Key, Save, Server, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'api' | 'notifications'>('general');
  const [loading, setLoading] = useState(false);

  // Form states
  const [siteName, setSiteName] = useState('TripWise Administration');
  const [supportEmail, setSupportEmail] = useState('support@tripwise.com');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Workspace settings updated successfully');
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-title-dashboard mb-1">Workspace Settings</h1>
        <p className="text-body-main">Configure system parameters, security policies, and platform defaults.</p>
      </div>

      <div className="enterprise-card flex flex-col md:flex-row min-h-[500px]">
        {/* Settings Navigation Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/40 p-4 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Preferences</p>
          {[
            { id: 'general', label: 'General Configuration', icon: Globe },
            { id: 'security', label: 'Security & Auth', icon: Lock },
            { id: 'api', label: 'API Keys & Webhooks', icon: Key },
            { id: 'notifications', label: 'Alert Preferences', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-brand-600 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panel Content */}
        <div className="flex-1 p-6 md:p-8 bg-white">
          <form onSubmit={handleSave} className="max-w-2xl space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-title-section">General Settings</h3>
                  <p className="text-body-small mt-0.5">Manage workspace identity and regional defaults.</p>
                </div>
                
                <div>
                  <label className="form-label">Platform Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="enterprise-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Support Contact Email</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="enterprise-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Default Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="enterprise-select"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Primary System Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="enterprise-select"
                  >
                    <option value="Asia/Kolkata">(UTC+05:30) India Standard Time - Kolkata</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">(UTC-05:00) Eastern Time - New York</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-title-section">Security & Authentication</h3>
                  <p className="text-body-small mt-0.5">Update credentials and password rules.</p>
                </div>

                <div>
                  <label className="form-label">Current Admin Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="enterprise-input"
                  />
                </div>

                <div>
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="enterprise-input"
                  />
                  <p className="text-[12px] text-slate-500 mt-1">Must be at least 8 characters with numbers and symbols.</p>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-title-section">API & Integrations</h3>
                  <p className="text-body-small mt-0.5">Secret keys for external travel services and payment gateways.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-bold text-slate-900">Stripe Live Key</span>
                      <p className="text-[12px] text-slate-500">pk_live_************************</p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={() => toast.success('Key copied')}>Copy Key</Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-bold text-slate-900">Google Maps API</span>
                      <p className="text-[12px] text-slate-500">AI_zap_************************</p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={() => toast.success('Key copied')}>Copy Key</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-title-section">System Alert Rules</h3>
                  <p className="text-body-small mt-0.5">Control automated notification triggers.</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div>
                      <span className="text-[14px] font-bold text-slate-900 block">Email Transaction Summaries</span>
                      <span className="text-[12px] text-slate-500">Receive daily digest of gross revenue and bookings.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div>
                      <span className="text-[14px] font-bold text-slate-900 block">Critical System Alerts (SMS)</span>
                      <span className="text-[12px] text-slate-500">Instant SMS dispatch on database error spikes.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" loading={loading} leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

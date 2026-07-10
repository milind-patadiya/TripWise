import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Lock, Bell, Palette, Shield,
  Save, Eye, EyeOff, Check
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { toast } from 'react-hot-toast';

// ─── Section wrapper ────────────────────────────────────────
function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Toggle switch ──────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between w-full py-3 group"
    >
      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
      <div
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
        )}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </div>
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function Settings() {
  const { user } = useAuthStore();

  // Profile form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Notification prefs
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [tripReminders, setTripReminders] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);
  const [bookingUpdates, setBookingUpdates] = useState(true);

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const handleProfileSave = () => {
    // In production, this would call the API
    setProfileSaved(true);
    toast.success('Profile updated successfully!');
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences.</p>
      </motion.div>

      {/* Profile Information */}
      <SettingsSection title="Profile Information" description="Update your personal details" icon={User} delay={0.1}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <div className="flex justify-end">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleProfileSave} className="bg-indigo-600 text-white gap-2">
                {profileSaved ? <Check size={16} /> : <Save size={16} />}
                {profileSaved ? 'Saved!' : 'Save Changes'}
              </Button>
            </motion.div>
          </div>
        </div>
      </SettingsSection>

      {/* Change Password */}
      <SettingsSection title="Change Password" description="Update your account password" icon={Lock} delay={0.2}>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPwd ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <div className="flex justify-end">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handlePasswordChange}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                className="bg-indigo-600 text-white gap-2"
              >
                <Lock size={16} /> Update Password
              </Button>
            </motion.div>
          </div>
        </div>
      </SettingsSection>

      {/* Notification Preferences */}
      <SettingsSection title="Notifications" description="Choose what you want to be notified about" icon={Bell} delay={0.3}>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} label="Email notifications" />
          <Toggle checked={tripReminders} onChange={() => setTripReminders(!tripReminders)} label="Trip reminders" />
          <Toggle checked={bookingUpdates} onChange={() => setBookingUpdates(!bookingUpdates)} label="Booking updates" />
          <Toggle checked={promoEmails} onChange={() => setPromoEmails(!promoEmails)} label="Promotional emails" />
        </div>
      </SettingsSection>

      {/* Theme */}
      <SettingsSection title="Appearance" description="Customize the look and feel" icon={Palette} delay={0.4}>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTheme(t)}
              className={cn(
                'p-4 rounded-xl border-2 text-center transition-all',
                theme === t
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full mx-auto mb-2',
                t === 'light' ? 'bg-amber-400' : t === 'dark' ? 'bg-slate-700' : 'bg-gradient-to-br from-amber-400 to-slate-700'
              )} />
              <span className={cn(
                'text-xs font-medium capitalize',
                theme === t ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'
              )}>
                {t}
              </span>
            </motion.button>
          ))}
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
            <Shield size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-red-600">Danger Zone</h3>
            <p className="text-xs text-slate-500">Irreversible actions</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Once you delete your account, there is no going back. All your data, trips, and history will be permanently removed.
        </p>
        <Button variant="danger" className="gap-2">
          <Shield size={14} /> Delete Account
        </Button>
      </motion.div>
    </div>
  );
}

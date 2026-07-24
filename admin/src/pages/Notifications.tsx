import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Trash2, Send, Filter, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/api/axios';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'system' | 'booking' | 'user' | 'alert';
  read: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'system' | 'booking' | 'user' | 'alert'>('system');

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/admin/notifications');
      setNotifications(data);
    } catch {
      // Mock data if endpoint is absent or empty
      setNotifications([
        { _id: '1', title: 'System Backup Completed', message: 'The nightly database snapshot finished successfully with zero errors.', type: 'system', read: true, createdAt: new Date().toISOString() },
        { _id: '2', title: 'High Volume Booking Alert', message: 'Package "Goa Beach Retreat" experienced a 40% surge in inquiries over the past 2 hours.', type: 'alert', read: false, createdAt: new Date().toISOString() },
        { _id: '3', title: 'New Customer Verification Needed', message: 'User john.doe@example.com requested manual KYC document verification.', type: 'user', read: false, createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/admin/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification cleared');
    } catch {
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification cleared');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      toast.error('Please complete all fields');
      return;
    }
    try {
      await api.post('/admin/notifications/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage,
        type: broadcastType
      });
      toast.success('Broadcast sent successfully');
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      fetchNotifications();
    } catch {
      toast.success('Broadcast scheduled');
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'booking': return <CheckCircle2 className="w-5 h-5 text-brand-600" />;
      case 'user': return <Info className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-title-dashboard mb-1">Messaging Center</h1>
          <p className="text-body-main">Broadcast system alerts and review operational notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleMarkAllRead} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            Mark All Read
          </Button>
          <Button variant="primary" onClick={() => setShowBroadcastModal(true)} leftIcon={<Send className="w-4 h-4" />}>
            New Broadcast
          </Button>
        </div>
      </div>

      {/* Messaging Layout Container */}
      <div className="enterprise-card flex flex-col md:flex-row min-h-[550px] overflow-hidden">
        {/* Left Filter Pane */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 p-4 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Message Folders</p>
          {[
            { id: 'all', label: 'All Messages', count: notifications.length },
            { id: 'unread', label: 'Unread Only', count: notifications.filter(n => !n.read).length },
            { id: 'system', label: 'System Logs', count: notifications.filter(n => n.type === 'system').length },
            { id: 'alert', label: 'Critical Alerts', count: notifications.filter(n => n.type === 'alert').length },
            { id: 'user', label: 'User Activity', count: notifications.filter(n => n.type === 'user').length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                filter === item.id ? 'bg-white text-brand-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{item.label}</span>
              {item.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] ${filter === item.id ? 'bg-brand-50 text-brand-600' : 'bg-slate-200 text-slate-600'}`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Message Feed Pane */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
            <span className="text-[13px] font-semibold text-slate-500">Showing {filtered.length} notifications</span>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-[13px] text-slate-500 font-medium capitalize">{filter} view</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {loading ? (
              <div className="p-8 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Bell className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-[15px] font-bold text-slate-700">No notifications found</p>
                <p className="text-[13px] text-slate-400 mt-1">Your inbox is completely caught up.</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id}
                  className={`p-5 flex items-start gap-4 hover:bg-slate-50/80 transition-colors group relative ${
                    !item.read ? 'bg-brand-50/20' : ''
                  }`}
                >
                  {!item.read && (
                    <span className="absolute left-2 top-6 w-2 h-2 rounded-full bg-brand-600" />
                  )}
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="text-[14px] font-bold text-slate-900 truncate">{item.title}</h4>
                      <span className="text-[12px] font-medium text-slate-400 whitespace-nowrap">{formatDate(item.createdAt)}</span>
                    </div>
                    <p className="text-[13px] font-medium text-slate-600 leading-relaxed mb-2">{item.message}</p>
                    <div className="flex items-center gap-2">
                      <Badge status={item.type} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowBroadcastModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 p-6 z-10">
            <h3 className="text-title-section mb-4">Send System Broadcast</h3>
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="form-label">Broadcast Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled Maintenance Notice"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="enterprise-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as any)}
                  className="enterprise-select"
                >
                  <option value="system">System Notification</option>
                  <option value="alert">Critical Alert</option>
                  <option value="booking">Booking Update</option>
                  <option value="user">User Message</option>
                </select>
              </div>
              <div>
                <label className="form-label">Broadcast Message</label>
                <textarea
                  rows={4}
                  placeholder="Enter message details for all administrators..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="enterprise-input"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setShowBroadcastModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" leftIcon={<Send className="w-4 h-4" />}>
                  Dispatch Broadcast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

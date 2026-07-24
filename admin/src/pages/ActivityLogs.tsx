import { useEffect, useState } from 'react';
import { Activity, ShieldCheck, UserCheck, CreditCard, Settings, RefreshCw, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/api/axios';
import { formatDate } from '@/lib/utils';

interface LogItem {
  _id: string;
  action: string;
  performedBy: string;
  ipAddress: string;
  timestamp: string;
  details: string;
  type: 'auth' | 'booking' | 'system' | 'financial';
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/activity-logs');
      setLogs(data);
    } catch {
      // Mock activity timeline data
      setLogs([
        { _id: '1', action: 'User Role Promotion', performedBy: 'Admin (System)', ipAddress: '192.168.1.1', timestamp: new Date().toISOString(), details: 'Promoted user test@tripwise.com to Admin privileges.', type: 'auth' },
        { _id: '2', action: 'Payment Captured', performedBy: 'Stripe Webhook', ipAddress: '54.187.21.12', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Successfully processed ₹45,000 for booking REF-8921.', type: 'financial' },
        { _id: '3', action: 'Destination Inventory Modified', performedBy: 'Admin (Sarah)', ipAddress: '192.168.1.45', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Updated cover image and pricing tier for Goa Beach Resort.', type: 'booking' },
        { _id: '4', action: 'API Key Rotated', performedBy: 'Admin (System)', ipAddress: '127.0.0.1', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Rotated Google Maps Geocoding API production key.', type: 'system' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'auth': return <UserCheck className="w-4 h-4 text-brand-600" />;
      case 'financial': return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'booking': return <Activity className="w-4 h-4 text-amber-600" />;
      default: return <Settings className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-title-dashboard mb-1">Activity Timeline</h1>
          <p className="text-body-main">Audit trail of system events, user authentications, and administrative modifications.</p>
        </div>
        <Button variant="secondary" onClick={fetchLogs} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Refresh Audit Feed
        </Button>
      </div>

      <div className="enterprise-card p-6 md:p-8">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex-1 h-12 bg-slate-50 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 space-y-8 py-2">
            {logs.map((log) => (
              <div key={log._id} className="relative pl-8 group">
                {/* Timeline Bullet Node */}
                <div className="absolute -left-4 top-0.5 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-brand-500 transition-colors z-10">
                  {getLogIcon(log.type)}
                </div>

                {/* Log Item Content */}
                <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[14px] font-bold text-slate-900">{log.action}</h4>
                      <Badge status={log.type} />
                    </div>
                    <span className="text-[12px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(log.timestamp)}
                    </span>
                  </div>

                  <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-3">
                    {log.details}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-2.5">
                    <span>Actor: <strong className="text-slate-700">{log.performedBy}</strong></span>
                    <span className="font-mono">IP: {log.ipAddress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

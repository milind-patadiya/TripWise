import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell, PlaneTakeoff, CreditCard, Sparkles,
  AlertCircle, Trash2, Check, Wallet
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import api from '@/api/axios';

// ─── Types (mirrors server/models/Notification.js) ──────────
interface ApiNotification {
  _id: string;
  type: 'System' | 'Booking' | 'Payment' | 'Alert' | 'Promotional';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ─── Notification config ────────────────────────────────────
const TYPE_CONFIG: Record<ApiNotification['type'], { icon: typeof Bell; color: string }> = {
  Booking: { icon: PlaneTakeoff, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' },
  Payment: { icon: Wallet, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
  System: { icon: AlertCircle, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
  Alert: { icon: CreditCard, color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' },
  Promotional: { icon: Sparkles, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' },
};

// ─── Main Component ─────────────────────────────────────────
export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<ApiNotification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: invalidate,
  });

  const clearAllMutation = useMutation({
    mutationFn: () => api.delete('/notifications'),
    onSuccess: invalidate,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold"
              >
                {unreadCount}
              </motion.span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">Stay updated with your travel activity.</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllReadMutation.mutate()}
              className="text-xs gap-1.5"
            >
              <Check size={14} /> Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              onClick={() => clearAllMutation.mutate()}
              className="text-xs gap-1.5 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
            >
              <Trash2 size={14} /> Clear all
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        {(['all', 'unread'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              filter === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            {tab === 'all' ? 'All' : `Unread (${unreadCount})`}
          </button>
        ))}
      </motion.div>

      {/* Notification list */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {filtered.length > 0 ? (
              filtered.map((notif, i) => {
                const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.System;
                const Icon = config.icon;
                return (
                  <motion.div
                    key={notif._id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    onClick={() => !notif.read && markAsReadMutation.mutate(notif._id)}
                    className={cn(
                      'bg-white dark:bg-slate-900 rounded-2xl border p-5 flex gap-4 cursor-pointer group transition-all hover:shadow-md',
                      notif.read
                        ? 'border-slate-100 dark:border-slate-800'
                        : 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20'
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.color)}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className={cn(
                            'text-sm font-semibold truncate',
                            notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                          )}>
                            {notif.title}
                          </h3>
                          {!notif.read && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0"
                            />
                          )}
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(notif._id);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 self-center"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Bell size={48} className="mx-auto text-slate-300 mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'All clear!'}
                </h3>
                <p className="text-slate-500">
                  {filter === 'unread' ? "You've read all your notifications." : "You don't have any notifications yet."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}

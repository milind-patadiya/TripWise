import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import {
  Receipt, Plus, Trash2, Hotel, Utensils,
  Car, Landmark, ShoppingBag, AlertTriangle, HelpCircle,
  X, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────
interface Expense {
  _id: string;
  type: string;
  amount: number;
  note: string;
  date: string;
}

// ─── Category config ─────────────────────────────────────────
const CATEGORIES = [
  { key: 'Hotel', label: 'Accommodation', icon: Hotel, color: '#4f46e5', bg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' },
  { key: 'Food', label: 'Food & Dining', icon: Utensils, color: '#10b981', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
  { key: 'Transport', label: 'Transport', icon: Car, color: '#f59e0b', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
  { key: 'Attraction', label: 'Activities', icon: Landmark, color: '#0ea5e9', bg: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600' },
  { key: 'Shopping', label: 'Shopping', icon: ShoppingBag, color: '#ec4899', bg: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' },
  { key: 'Emergency', label: 'Emergency', icon: AlertTriangle, color: '#ef4444', bg: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
  { key: 'Other', label: 'Other', icon: HelpCircle, color: '#94a3b8', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600' },
];

const getCategoryConfig = (type: string) =>
  CATEGORIES.find((c) => c.key === type) || CATEGORIES[CATEGORIES.length - 1];

// ─── Main Component ─────────────────────────────────────────
export default function ExpenseTracker() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Food',
    amount: '',
    note: '',
  });

  // Get user's trips to find a tripId for the expenses
  const { data: trips } = useQuery({
    queryKey: ['user_trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data;
    }
  });
  
  const tripId = trips?.[0]?._id; // Attach to latest trip by default

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const res = await api.get(`/expenses/${tripId}`);
      return res.data;
    },
    enabled: !!tripId
  });

  const addMutation = useMutation({
    mutationFn: async (newExpense: any) => {
      return api.post('/expenses', newExpense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      setFormData({ type: 'Food', amount: '', note: '' });
      setShowForm(false);
      toast.success('Expense added');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      toast.success('Expense deleted');
    }
  });

  // Computed data
  const totalSpent = useMemo(() => expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0), [expenses]);
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e: Expense) => {
      map[e.type] = (map[e.type] || 0) + e.amount;
    });
    return CATEGORIES.map((c) => ({
      name: c.label,
      value: map[c.key] || 0,
      color: c.color,
      key: c.key,
    })).filter((c) => c.value > 0);
  }, [expenses]);

  const handleAdd = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0 || !tripId) {
      if (!tripId) toast.error('You need a trip first to add expenses.');
      return;
    }
    addMutation.mutate({
      tripId,
      type: formData.type,
      amount: parseFloat(formData.amount),
      note: formData.note,
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Expense Tracker</h1>
          <p className="text-slate-500 mt-1">Track and manage your trip spending.</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white shadow-md"
          >
            <Plus size={16} /> Add Expense
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Total */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <span className="text-sm text-slate-500 font-medium">Total Spent</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-1">{expenses.length} transaction{expenses.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Highest category */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm text-slate-500 font-medium">Highest Category</span>
          </div>
          {categoryTotals.length > 0 ? (() => {
            const top = [...categoryTotals].sort((a, b) => b.value - a.value)[0];
            return (
              <>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{top.value.toLocaleString('en-IN')}</div>
                <p className="text-xs text-slate-400 mt-1">{top.name}</p>
              </>
            );
          })() : (
            <>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">—</div>
              <p className="text-xs text-slate-400 mt-1">No expenses yet</p>
            </>
          )}
        </div>

        {/* Avg per transaction */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <span className="text-sm text-slate-500 font-medium">Average / Entry</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            ₹{expenses.length > 0 ? Math.round(totalSpent / expenses.length).toLocaleString('en-IN') : '0'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Per transaction</p>
        </div>
      </motion.div>

      {/* Pie Chart + Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Spending Breakdown</h3>
          {categoryTotals.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryTotals}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
              Add expenses to see the chart
            </div>
          )}
        </div>

        {/* Category Breakdown List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">By Category</h3>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const catTotal = expenses.filter((e: Expense) => e.type === cat.key).reduce((s: number, e: Expense) => s + e.amount, 0);
              const pct = totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0;
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', cat.bg)}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{cat.label}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">₹{catTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Expense List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
      >
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Recent Transactions</h3>
        {expenses.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
              {expenses.map((expense: Expense) => {
                const cat = getCategoryConfig(expense.type);
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={expense._id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cat.bg)}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-900 dark:text-white">{cat.label}</div>
                      {expense.note && (
                        <p className="text-xs text-slate-500 truncate">{expense.note}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(expense._id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium mb-1">No expenses recorded</p>
            <p className="text-xs text-slate-400">Start adding expenses to track your spending.</p>
          </div>
        )}
      </motion.div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Expense</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Category selector */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <motion.button
                          key={cat.key}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, type: cat.key })}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all',
                            formData.type === cat.key
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                          )}
                        >
                          <Icon size={14} />
                          {cat.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                {/* Note */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Note (optional)</label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="e.g., Hotel room for 2 nights"
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                    className="flex-1 bg-indigo-600 text-white"
                  >
                    Add Expense
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

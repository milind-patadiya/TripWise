import { useEffect, useState, useMemo } from 'react';
import { Edit3, Download, TrendingUp, IndianRupee, ArrowUpRight } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/api/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PaymentItem {
  _id: string; amount: number; currency: string; status: string; createdAt: string;
  stripePaymentIntentId: string;
  user?: { name: string; email: string };
  booking?: { bookingRef: string; itemName: string; destinationName: string; totalAmount: number };
  [key: string]: unknown;
}

export default function Payments() {
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPayment, setEditPayment] = useState<PaymentItem | null>(null);
  const [editStatus, setEditStatus] = useState('');

  const fetchData = async () => {
    try { const { data } = await api.get('/admin/payments'); setItems(data); }
    catch { toast.error('Failed to load payments'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async () => {
    if (!editPayment) return;
    try {
      const { data } = await api.put(`/admin/payments/${editPayment._id}`, { status: editStatus });
      setItems((prev) => prev.map((i) => (i._id === data._id ? data : i)));
      toast.success('Ledger updated successfully');
      setEditPayment(null);
    } catch { toast.error('Failed to update ledger'); }
  };

  const totalVolume = useMemo(() => items.filter(i => i.status === 'Succeeded' || i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0), [items]);
  const pendingVolume = useMemo(() => items.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0), [items]);

  const columns = [
    { key: 'createdAt', label: 'Date', sortable: true, render: (p: PaymentItem) => <span className="text-[13px] font-medium text-slate-600">{formatDate(p.createdAt)}</span> },
    { key: 'booking', label: 'Reference', render: (p: PaymentItem) => <span className="font-mono text-[12px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded font-bold">{p.booking?.bookingRef || 'Direct'}</span> },
    { key: 'user', label: 'Client', render: (p: PaymentItem) => <span className="font-medium text-[13px] text-slate-800">{p.user?.name || 'Guest Checkout'}</span> },
    { key: 'amount', label: 'Gross Amount', sortable: true, render: (p: PaymentItem) => <span className="font-bold text-[14px] text-slate-900">{formatCurrency(p.amount)}</span> },
    { key: 'status', label: 'Payment Status', sortable: true, render: (p: PaymentItem) => <Badge status={p.status} /> },
    { key: 'actions', label: '', render: (p: PaymentItem) => (
      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => { setEditPayment(p); setEditStatus(p.status); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors" title="Manage Invoice">
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Finance Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-title-dashboard mb-1">Financial Operations</h1>
          <p className="text-body-main">Monitor transaction ledgers, refunds, and payment gateways.</p>
        </div>
        <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>Export Ledger</Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="enterprise-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
          <h3 className="text-title-card text-slate-600 mb-4 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Net Processed</h3>
          <p className="text-[32px] font-bold text-slate-900 tracking-tight leading-none mb-2">{formatCurrency(totalVolume)}</p>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600"><ArrowUpRight className="w-3.5 h-3.5" /> +22.4% vs last month</div>
        </div>
        <div className="enterprise-card p-5">
          <h3 className="text-title-card text-slate-600 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-amber-500" /> Pending Settlement</h3>
          <p className="text-[32px] font-bold text-slate-900 tracking-tight leading-none mb-2">{formatCurrency(pendingVolume)}</p>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">Requires capture action</div>
        </div>
        <div className="enterprise-card p-5 flex flex-col justify-center items-center text-center bg-slate-50 border-none">
          <p className="text-[14px] font-semibold text-slate-600 mb-2">Stripe Payment Gateway</p>
          <Badge status="Active" className="mb-3" />
          <p className="text-[12px] text-slate-400">Next payout scheduled in 2 days</p>
        </div>
      </div>

      <DataTable columns={columns} data={items} loading={loading} exportFilename="tripwise-ledger" searchPlaceholder="Search by ref, client, or intent ID..." />
      
      <Modal isOpen={!!editPayment} onClose={() => setEditPayment(null)} title="Manage Transaction">
        {editPayment && (
          <div className="space-y-6">
            
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest">Transaction Details</span>
                <Badge status={editPayment.status} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-slate-600 mb-1">Gross Amount</p>
                  <p className="text-[24px] font-bold text-slate-900 leading-none">{formatCurrency(editPayment.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium text-slate-600 mb-1">Intent ID</p>
                  <p className="font-mono text-[12px] font-bold text-slate-700 bg-white px-2 py-1 border border-slate-200 rounded">{editPayment.stripePaymentIntentId || 'Manual'}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Override Ledger Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="enterprise-select">
                <option value="Succeeded">Succeeded</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
              <p className="text-[12px] text-slate-500 mt-2">Warning: Modifying this status will not trigger a refund in Stripe. This only updates the internal ledger.</p>
            </div>
            
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditPayment(null)}>Close</Button>
              <Button variant="primary" onClick={handleUpdate}>Update Ledger</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

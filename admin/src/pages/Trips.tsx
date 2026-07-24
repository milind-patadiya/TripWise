import { useEffect, useState } from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import api from '@/api/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TripItem {
  _id: string; title: string; source: string; destination: string; budget: number;
  days: number; travelers: number; travelStyle: string; travelerType: string;
  status: string; createdAt: string;
  userId?: { name: string; email: string };
  budgetAllocation?: { transport: number; hotel: number; food: number; attractions: number; emergency: number };
  [key: string]: unknown;
}

export default function Trips() {
  const [items, setItems] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTrip, setEditTrip] = useState<TripItem | null>(null);
  const [editStatus, setEditStatus] = useState('');

  const fetchData = async () => {
    try { const { data } = await api.get('/admin/trips'); setItems(data); }
    catch { toast.error('Failed to load trips'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/admin/trips/${deleteId}`); setItems((prev) => prev.filter((i) => i._id !== deleteId)); toast.success('Trip deleted'); }
    catch { toast.error('Failed to delete trip'); } finally { setDeleteId(null); }
  };

  const handleUpdate = async () => {
    if (!editTrip) return;
    try {
      const { data } = await api.put(`/admin/trips/${editTrip._id}`, { status: editStatus });
      setItems((prev) => prev.map((i) => (i._id === data._id ? data : i)));
      toast.success('Trip status updated');
      setEditTrip(null);
    } catch { toast.error('Failed to update trip'); }
  };

  const columns = [
    { key: 'title', label: 'Trip Title', sortable: true, render: (t: TripItem) => <span className="font-semibold text-slate-100">{t.title}</span> },
    { key: 'userId', label: 'User', render: (t: TripItem) => t.userId?.name || '—' },
    { key: 'destination', label: 'Destination', sortable: true },
    { key: 'days', label: 'Duration (Days)', sortable: true },
    { key: 'budget', label: 'Total Budget', sortable: true, render: (t: TripItem) => <span className="font-semibold text-white">{formatCurrency(t.budget)}</span> },
    { key: 'travelStyle', label: 'Style', render: (t: TripItem) => <span className="badge badge-info">{t.travelStyle}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (t: TripItem) => <Badge status={t.status} /> },
    { key: 'createdAt', label: 'Created Date', sortable: true, render: (t: TripItem) => formatDate(t.createdAt) },
    { key: 'actions', label: 'Actions', render: (t: TripItem) => (
      <div className="flex items-center gap-2">
        <button onClick={() => { setEditTrip(t); setEditStatus(t.status); }} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
        <button onClick={() => setDeleteId(t._id)} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-lg font-bold text-white tracking-tight">Trip Plans</h2><p className="text-xs text-slate-400">{items.length} planned itineraries</p></div>
      <DataTable columns={columns} data={items} loading={loading} exportFilename="tripwise-trips" />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
      <Modal isOpen={!!editTrip} onClose={() => setEditTrip(null)} title="Update Trip Status">
        {editTrip && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-200">{editTrip.title} — {editTrip.destination}</p>
            {editTrip.budgetAllocation && (
              <div className="grid grid-cols-5 gap-2 p-3 rounded-lg bg-slate-900 border border-slate-700">
                {Object.entries(editTrip.budgetAllocation).map(([k, v]) => (
                  <div key={k} className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{k}</p>
                    <p className="text-xs font-bold text-slate-100">{formatCurrency(v)}</p>
                  </div>
                ))}
              </div>
            )}
            <div><label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="admin-select w-full">
                <option value="planned">Planned</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
              <button onClick={() => setEditTrip(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleUpdate} className="btn-primary">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Trash2, Edit3, MessageSquare, ShieldCheck, ShieldAlert, Star } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/api/axios';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  user: { name: string; email: string };
  package: { title: string };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  [key: string]: unknown;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/admin/reviews');
      setReviews(data);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchReviews(); }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { data } = await api.put(`/admin/reviews/${id}`, { status });
      setReviews(prev => prev.map(r => r._id === id ? data : r));
      toast.success(`Review ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/admin/reviews/${deleteId}`); setReviews(prev => prev.filter(r => r._id !== deleteId)); toast.success('Review deleted'); }
    catch { toast.error('Delete failed'); } finally { setDeleteId(null); }
  };

  const columns = [
    { key: 'user', label: 'Author', render: (r: Review) => (
      <div className="flex flex-col">
        <span className="font-semibold text-[13px] text-slate-900">{r.user?.name || 'Unknown'}</span>
        <span className="text-[11px] font-medium text-slate-500">{formatDate(r.createdAt)}</span>
      </div>
    )},
    { key: 'package', label: 'Target', render: (r: Review) => <span className="text-[13px] font-medium text-slate-600 line-clamp-1 max-w-[150px]">{r.package?.title || 'Unknown'}</span> },
    { key: 'content', label: 'Review Content', render: (r: Review) => (
      <div className="flex flex-col gap-1 py-1 min-w-[300px]">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
          ))}
        </div>
        <p className="text-[13px] text-slate-700 italic line-clamp-2">"{r.comment}"</p>
      </div>
    )},
    { key: 'status', label: 'Moderation', render: (r: Review) => <Badge status={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'} /> },
    { key: 'actions', label: '', render: (r: Review) => (
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
        {r.status !== 'approved' && <button onClick={() => handleUpdateStatus(r._id, 'approved')} className="p-1.5 hover:bg-emerald-50 rounded text-slate-400 hover:text-emerald-600" title="Approve"><ShieldCheck className="w-4 h-4" /></button>}
        {r.status !== 'rejected' && <button onClick={() => handleUpdateStatus(r._id, 'rejected')} className="p-1.5 hover:bg-amber-50 rounded text-slate-400 hover:text-amber-600" title="Reject"><ShieldAlert className="w-4 h-4" /></button>}
        <button onClick={() => setDeleteId(r._id)} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 ml-2" title="Delete"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-title-dashboard mb-1">Moderation Queue</h1>
          <p className="text-body-main">Review user feedback before it is published on the platform.</p>
        </div>
      </div>
      
      <DataTable columns={columns} data={reviews} loading={loading} emptyMessage="No reviews in queue" />
      
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Review" message="This will permanently delete this review from the system." />
    </div>
  );
}

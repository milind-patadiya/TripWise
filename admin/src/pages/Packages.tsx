import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Package as PkgIcon } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/api/axios';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Pkg {
  _id: string; title: string; destination: { _id: string; name: string } | string;
  durationDays: number; durationNights: number; price: number; discountPrice: number;
  featured: boolean; image: string;
  [key: string]: unknown;
}

const emptyForm = { title: '', destination: '', durationDays: 3, durationNights: 2, price: 0, discountPrice: 0, description: '', image: '', inclusions: '', tags: '', featured: false };

export default function Packages() {
  const [items, setItems] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [destinations, setDestinations] = useState<{ _id: string; name: string }[]>([]);

  const fetchData = async () => {
    try {
      const [pkgRes, destRes] = await Promise.all([api.get('/admin/packages'), api.get('/admin/destinations')]);
      setItems(pkgRes.data); setDestinations(destRes.data);
    } catch { toast.error('Failed to load packages'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const payload = { ...form, price: Number(form.price), discountPrice: Number(form.discountPrice), durationDays: Number(form.durationDays), durationNights: Number(form.durationNights) };
    try {
      if (editId) {
        const { data } = await api.put(`/admin/packages/${editId}`, payload);
        setItems(prev => prev.map(i => i._id === editId ? data : i));
        toast.success('Package updated');
      } else {
        const { data } = await api.post('/admin/packages', payload);
        setItems(prev => [data, ...prev]);
        toast.success('Package deployed');
      }
      setModalOpen(false);
    } catch { toast.error('Save failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/admin/packages/${deleteId}`); setItems(prev => prev.filter(i => i._id !== deleteId)); toast.success('Package deleted'); }
    catch { toast.error('Delete failed'); } finally { setDeleteId(null); }
  };

  const getDestName = (d: Pkg['destination']) => (typeof d === 'object' && d !== null ? d.name : String(d));

  const columns = [
    { key: 'title', label: 'Package Name', sortable: true, render: (p: Pkg) => (
      <div className="flex items-center gap-3">
        {p.image ? <img src={p.image} className="w-9 h-9 rounded object-cover" alt="" /> : <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center"><PkgIcon className="w-4 h-4 text-slate-400" /></div>}
        <div className="flex flex-col">
          <span className="font-bold text-[13px] text-slate-900">{p.title}</span>
          <span className="text-[11px] text-slate-500 font-medium">ID: {p._id.slice(-6)}</span>
        </div>
      </div>
    )},
    { key: 'destination', label: 'Location', render: (p: Pkg) => <span className="text-[13px] font-medium text-slate-600">{getDestName(p.destination)}</span> },
    { key: 'durationDays', label: 'Duration', render: (p: Pkg) => <span className="text-[13px] font-medium text-slate-600">{p.durationDays}D / {p.durationNights}N</span> },
    { key: 'price', label: 'Pricing', sortable: true, render: (p: Pkg) => (
      <div className="flex flex-col">
        <span className="font-bold text-[13px] text-slate-800">{formatCurrency(p.price)}</span>
        {p.discountPrice > 0 && <span className="text-[11px] font-bold text-emerald-600">Sale: {formatCurrency(p.discountPrice)}</span>}
      </div>
    )},
    { key: 'featured', label: 'Visibility', render: (p: Pkg) => (p.featured ? <Badge status="featured" /> : <span className="text-[12px] text-slate-400 font-medium">Standard</span>) },
    { key: 'actions', label: '', render: (p: Pkg) => (
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
        <button onClick={() => { setEditId(p._id); setForm({ ...p, destination: typeof p.destination === 'object' ? p.destination._id : String(p.destination) } as any); setModalOpen(true); }} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-brand-600"><Edit3 className="w-4 h-4" /></button>
        <button onClick={() => setDeleteId(p._id)} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-title-dashboard mb-1">Travel Packages</h1>
          <p className="text-body-main">Inventory control for curated tours and experiences.</p>
        </div>
        <Button variant="primary" onClick={() => { setEditId(null); setForm(emptyForm); setModalOpen(true); }} leftIcon={<Plus className="w-4 h-4" />}>Deploy Package</Button>
      </div>
      
      <DataTable columns={columns} data={items} loading={loading} exportFilename="packages-inventory" enableBulkSelect={true} />
      
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Package" />
      
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Package' : 'New Package'}>
        <div className="space-y-4">
          <div><label className="form-label">Package Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="enterprise-input" /></div>
          <div><label className="form-label">Destination Mapping</label>
            <select value={form.destination as string} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="enterprise-select">
              <option value="">Select Target...</option>
              {destinations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Duration (Days)</label><input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} className="enterprise-input" /></div>
            <div><label className="form-label">Duration (Nights)</label><input type="number" value={form.durationNights} onChange={(e) => setForm({ ...form, durationNights: Number(e.target.value) })} className="enterprise-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Base Price (₹)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="enterprise-input" /></div>
            <div><label className="form-label">Discount Price (₹)</label><input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })} className="enterprise-input" /></div>
          </div>
          <div><label className="form-label">Image URL</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="enterprise-input" /></div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300" />
            <span className="text-[13px] font-semibold text-slate-700">Promote as Featured Package</span>
          </label>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Package</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Hotel as HotelIcon, MapPin, Grid, List } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/api/axios';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface HotelItem {
  _id: string; name: string; destination: string; pricePerNight: number; rating: number;
  category: string; image: string; amenities: string[];
  [key: string]: unknown;
}

const emptyForm = { name: '', destination: '', pricePerNight: 0, rating: 3, category: 'Standard', image: '', amenities: '' };

export default function Hotels() {
  const [items, setItems] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table'); // Hotels default to table

  const fetchData = async () => {
    try { const { data } = await api.get('/admin/hotels'); setItems(data); }
    catch { toast.error('Failed to load hotels'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const payload = { ...form, pricePerNight: Number(form.pricePerNight), rating: Number(form.rating), amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean) };
    try {
      if (editId) {
        const { data } = await api.put(`/admin/hotels/${editId}`, payload);
        setItems(prev => prev.map(i => i._id === editId ? data : i));
        toast.success('Property updated');
      } else {
        const { data } = await api.post('/admin/hotels', payload);
        setItems(prev => [data, ...prev]);
        toast.success('Property added to network');
      }
      setModalOpen(false);
    } catch { toast.error('Save failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/admin/hotels/${deleteId}`); setItems(prev => prev.filter(i => i._id !== deleteId)); toast.success('Property removed'); }
    catch { toast.error('Delete failed'); } finally { setDeleteId(null); }
  };

  const columns = [
    { key: 'name', label: 'Property', sortable: true, render: (h: HotelItem) => (
      <div className="flex items-center gap-3">
        {h.image ? <img src={h.image} className="w-10 h-10 rounded-md object-cover" alt="" /> : <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center"><HotelIcon className="w-4 h-4 text-slate-400" /></div>}
        <span className="font-bold text-[14px] text-slate-900">{h.name}</span>
      </div>
    )},
    { key: 'destination', label: 'Location', sortable: true, render: (h: HotelItem) => <span className="text-[13px] font-medium text-slate-600 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{h.destination}</span> },
    { key: 'category', label: 'Tier', sortable: true, render: (h: HotelItem) => <Badge status={h.category === 'Luxury' ? 'success' : h.category === 'Standard' ? 'info' : 'warning'} /> },
    { key: 'pricePerNight', label: 'Rate (Night)', sortable: true, render: (h: HotelItem) => <span className="font-bold text-[13px] text-slate-800">{formatCurrency(h.pricePerNight)}</span> },
    { key: 'rating', label: 'Rating', sortable: true, render: (h: HotelItem) => <span className="font-semibold text-[13px]">{h.rating}/5</span> },
    { key: 'actions', label: '', render: (h: HotelItem) => (
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
        <button onClick={() => { setEditId(h._id); setForm({ ...h, amenities: h.amenities?.join(', ') || '' }); setModalOpen(true); }} className="p-1.5 hover:bg-slate-100 rounded text-slate-400"><Edit3 className="w-4 h-4" /></button>
        <button onClick={() => setDeleteId(h._id)} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-title-dashboard mb-1">Accommodation Network</h1>
          <p className="text-body-main">Manage your {items.length} partnered hotels and stays.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><Grid className="w-4 h-4" /></button>
          </div>
          <Button variant="primary" onClick={() => { setEditId(null); setForm(emptyForm); setModalOpen(true); }} leftIcon={<Plus className="w-4 h-4" />}>Add Property</Button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
      ) : viewMode === 'table' ? (
        <DataTable columns={columns} data={items} loading={false} exportFilename="hotels-network" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((h) => (
            <div key={h._id} className="enterprise-card flex gap-4 p-4 hover:border-brand-300 cursor-pointer" onClick={() => { setEditId(h._id); setForm({ ...h, amenities: h.amenities?.join(', ') || '' }); setModalOpen(true); }}>
              <img src={h.image || '/placeholder.svg'} className="w-24 h-24 rounded-lg object-cover bg-slate-100" alt="" />
              <div className="flex flex-col py-1">
                <h3 className="text-[15px] font-bold text-slate-900 leading-tight mb-1">{h.name}</h3>
                <p className="text-[12px] text-slate-500 mb-2">{h.destination}</p>
                <div className="mt-auto">
                  <span className="font-bold text-[14px] text-slate-800">{formatCurrency(h.pricePerNight)}<span className="text-[11px] text-slate-400 font-medium">/night</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Remove Property" message="Remove this hotel from the network?" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Property' : 'New Property'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Property Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="enterprise-input" /></div>
            <div><label className="form-label">Destination Node</label><input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="enterprise-input" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="form-label">Rate / Night</label><input type="number" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })} className="enterprise-input" /></div>
            <div><label className="form-label">Tier</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="enterprise-select"><option>Budget</option><option>Standard</option><option>Luxury</option></select></div>
            <div><label className="form-label">Rating</label><input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="enterprise-input" /></div>
          </div>
          <div><label className="form-label">Cover Image URL</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="enterprise-input" /></div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Property</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

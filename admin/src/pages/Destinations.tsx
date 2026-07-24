import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, MapPin, Grid, List } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/api/axios';
import toast from 'react-hot-toast';

interface Destination {
  _id: string; name: string; state: string; country: string; description: string;
  image: string; rating: number; bestTimeToVisit: string; estimatedCostPerDay: number;
  lat: number; lng: number; travelStyles: string[];
  [key: string]: unknown;
}

const emptyForm = { name: '', state: '', country: '', description: '', image: '', rating: 4, bestTimeToVisit: '', estimatedCostPerDay: 0, lat: 0, lng: 0, travelStyles: '' };

export default function Destinations() {
  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const fetchData = async () => {
    try { const { data } = await api.get('/admin/destinations'); setItems(data); }
    catch { toast.error('Failed to load destinations'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const payload = { ...form, travelStyles: form.travelStyles.split(',').map(s => s.trim()).filter(Boolean), rating: Number(form.rating), estimatedCostPerDay: Number(form.estimatedCostPerDay) };
    try {
      if (editId) {
        const { data } = await api.put(`/admin/destinations/${editId}`, payload);
        setItems(prev => prev.map(i => i._id === editId ? data : i));
        toast.success('Catalog updated');
      } else {
        const { data } = await api.post('/admin/destinations', payload);
        setItems(prev => [data, ...prev]);
        toast.success('Destination added');
      }
      setModalOpen(false);
    } catch { toast.error('Failed to save destination'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/admin/destinations/${deleteId}`); setItems(prev => prev.filter(i => i._id !== deleteId)); toast.success('Removed from catalog'); }
    catch { toast.error('Failed to delete'); } finally { setDeleteId(null); }
  };

  const columns = [
    { key: 'name', label: 'Destination', sortable: true, render: (d: Destination) => (
      <div className="flex items-center gap-3">
        {d.image ? <img src={d.image} className="w-10 h-10 rounded object-cover shadow-sm" alt="" /> : <div className="w-10 h-10 rounded bg-slate-100" />}
        <span className="font-bold text-[13px] text-slate-900">{d.name}</span>
      </div>
    )},
    { key: 'location', label: 'Location', render: (d: Destination) => <span className="text-[13px] text-slate-600">{d.state}, {d.country}</span> },
    { key: 'rating', label: 'Score', sortable: true, render: (d: Destination) => <span className="font-semibold">{d.rating}/5</span> },
    { key: 'actions', label: '', render: (d: Destination) => (
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
        <button onClick={() => { setEditId(d._id); setForm({ ...d, travelStyles: d.travelStyles?.join(', ') || '' }); setModalOpen(true); }} className="p-1.5 hover:bg-slate-100 rounded text-slate-400"><Edit3 className="w-4 h-4" /></button>
        <button onClick={() => setDeleteId(d._id)} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-title-dashboard mb-1">Destinations Directory</h1>
          <p className="text-body-main">Manage your global inventory of travel locations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-4 h-4" /></button>
          </div>
          <Button variant="primary" onClick={() => { setEditId(null); setForm(emptyForm); setModalOpen(true); }} leftIcon={<Plus className="w-4 h-4" />}>Add Location</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((d) => (
            <div key={d._id} className="enterprise-card overflow-hidden group cursor-pointer flex flex-col" onClick={() => { setEditId(d._id); setForm({ ...d, travelStyles: d.travelStyles?.join(', ') || '' }); setModalOpen(true); }}>
              <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                {d.image ? (
                  <img src={d.image} alt={d.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><MapPin className="w-8 h-8" /></div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[11px] font-bold text-slate-700 shadow-sm">
                  ★ {d.rating}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-[15px] font-bold text-slate-900 leading-tight mb-1">{d.name}</h3>
                <p className="text-[12px] font-medium text-slate-500 mb-3">{d.state}, {d.country}</p>
                <div className="mt-auto flex gap-2">
                  {d.travelStyles?.slice(0, 2).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={items} loading={false} />
      )}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Remove Location" message="Permanently remove this destination from the global catalog?" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Location' : 'New Location'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Location Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="enterprise-input" /></div>
            <div><label className="form-label">Country</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="enterprise-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">State/Region</label><input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="enterprise-input" /></div>
            <div><label className="form-label">Score (1-5)</label><input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="enterprise-input" /></div>
          </div>
          <div><label className="form-label">Cover Image URL</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="enterprise-input" /></div>
          <div><label className="form-label">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="enterprise-input" rows={3} /></div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Location</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

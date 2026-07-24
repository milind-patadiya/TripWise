import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Landmark, MapPin } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/api/axios';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Attraction {
  _id: string;
  name: string;
  destination: string;
  category: string;
  entryFee: number;
  rating: number;
  image: string;
  description: string;
  [key: string]: unknown;
}

const emptyForm = {
  name: '',
  destination: '',
  category: 'Sightseeing',
  entryFee: 0,
  rating: 4,
  image: '',
  description: '',
};

export default function Attractions() {
  const [items, setItems] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/admin/attractions');
      setItems(data);
    } catch {
      toast.error('Failed to load attractions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    const payload = {
      ...form,
      entryFee: Number(form.entryFee),
      rating: Number(form.rating),
    };
    try {
      if (editId) {
        const { data } = await api.put(`/admin/attractions/${editId}`, payload);
        setItems(prev => prev.map(i => i._id === editId ? data : i));
        toast.success('Attraction updated');
      } else {
        const { data } = await api.post('/admin/attractions', payload);
        setItems(prev => [data, ...prev]);
        toast.success('Attraction created');
      }
      setModalOpen(false);
    } catch {
      toast.error('Failed to save attraction');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/attractions/${deleteId}`);
      setItems(prev => prev.filter(i => i._id !== deleteId));
      toast.success('Attraction removed');
    } catch {
      toast.error('Failed to delete attraction');
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Attraction Title',
      sortable: true,
      render: (a: Attraction) => (
        <div className="flex items-center gap-3">
          {a.image ? (
            <img src={a.image} className="w-10 h-10 rounded-md object-cover" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-[14px] text-slate-900">{a.name}</span>
            <span className="text-[11px] text-slate-500 font-medium">{a.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'destination',
      label: 'Location',
      sortable: true,
      render: (a: Attraction) => (
        <span className="text-[13px] font-medium text-slate-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {a.destination}
        </span>
      ),
    },
    {
      key: 'entryFee',
      label: 'Admission Fee',
      sortable: true,
      render: (a: Attraction) => (
        <span className="font-semibold text-[13px] text-slate-900">
          {a.entryFee === 0 ? 'Free Entry' : formatCurrency(a.entryFee)}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Score',
      sortable: true,
      render: (a: Attraction) => <span className="font-semibold text-[13px]">{a.rating}/5</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (a: Attraction) => (
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditId(a._id);
              setForm(a);
              setModalOpen(true);
            }}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-brand-600"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(a._id)}
            className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-title-dashboard mb-1">Attractions & Points of Interest</h1>
          <p className="text-body-main">Manage regional sights, landmarks, and activity spots.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditId(null);
            setForm(emptyForm);
            setModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Attraction
        </Button>
      </div>

      <DataTable columns={columns} data={items} loading={loading} exportFilename="attractions-catalog" />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Attraction"
        message="Are you sure you want to remove this attraction from the catalog?"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Attraction' : 'New Attraction'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Attraction Title</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="enterprise-input"
              />
            </div>
            <div>
              <label className="form-label">Destination Location</label>
              <input
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="enterprise-input"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="enterprise-select"
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Historical">Historical</option>
                <option value="Adventure">Adventure</option>
                <option value="Nature">Nature</option>
              </select>
            </div>
            <div>
              <label className="form-label">Entry Fee (₹)</label>
              <input
                type="number"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: Number(e.target.value) })}
                className="enterprise-input"
              />
            </div>
            <div>
              <label className="form-label">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="enterprise-input"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Cover Image URL</label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="enterprise-input"
            />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="enterprise-input"
              rows={3}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Attraction
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

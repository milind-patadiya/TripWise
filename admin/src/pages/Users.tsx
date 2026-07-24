import { useEffect, useState } from 'react';
import { Trash2, Eye, Shield, MoreHorizontal, Mail, Phone, Calendar } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/api/axios';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  createdAt: string;
  [key: string]: unknown;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/users/${deleteId}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteId));
      toast.success('User removed successfully', { 
        icon: '🗑️',
        style: { borderRadius: '8px', background: '#333', color: '#fff' }
      });
    } catch { toast.error('Failed to delete user'); }
    finally { setDeleteId(null); }
  };

  const handleBulkAction = async (selectedIds: string[], action: string) => {
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) {
        try {
          // Implement bulk delete via API if supported, or loop (pseudo for now)
          await Promise.all(selectedIds.map(id => api.delete(`/admin/users/${id}`)));
          setUsers(prev => prev.filter(u => !selectedIds.includes(u._id)));
          toast.success(`${selectedIds.length} users deleted`);
        } catch { toast.error('Bulk deletion failed'); }
      }
    }
  };

  const columns = [
    {
      key: 'name', label: 'Customer Profile', sortable: true,
      render: (u: User) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold shadow-sm">
            {u.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[14px] text-slate-900 leading-tight">{u.name}</span>
            <span className="text-[12px] font-medium text-slate-500 leading-tight mt-0.5">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Access Level', sortable: true,
      render: (u: User) => (
        <Badge status={u.role === 'admin' ? 'admin' : 'customer'} />
      ),
    },
    { 
      key: 'phone', label: 'Contact', 
      render: (u: User) => <span className="text-[13px] font-medium text-slate-600">{u.phone || '—'}</span> 
    },
    { 
      key: 'createdAt', label: 'Joined Date', sortable: true, 
      render: (u: User) => <span className="text-[13px] font-medium text-slate-600">{formatDate(u.createdAt)}</span> 
    },
    {
      key: 'actions', label: '',
      render: (u: User) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setViewUser(u)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          {u.role !== 'admin' && (
            <button onClick={() => setDeleteId(u._id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Delete User">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-title-dashboard mb-1">Customers CRM</h1>
          <p className="text-body-main">Manage your {users.length} registered accounts and system administrators.</p>
        </div>
        <Button variant="primary" onClick={() => toast.success('Invite feature coming soon')}>
          Invite User
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading} 
        exportFilename="tripwise-customers" 
        pageSize={10} 
        searchPlaceholder="Search customers by name, email..."
        enableBulkSelect={true}
        onBulkAction={handleBulkAction}
        bulkActions={[
          { label: 'Delete Selected', action: 'delete', variant: 'danger' }
        ]}
      />

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Customer Account" message="Are you absolutely sure you want to permanently delete this user? All associated data will be removed." />

      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="Customer Profile Details">
        {viewUser && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 text-2xl font-bold shadow-sm">
                {viewUser.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-[20px] font-bold text-slate-900 leading-tight">{viewUser.name}</h3>
                <p className="text-[13px] font-medium text-slate-500 mb-2">{viewUser._id}</p>
                <Badge status={viewUser.role === 'admin' ? 'admin' : 'customer'} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-[14px] font-medium text-slate-800">{viewUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-[14px] font-medium text-slate-800">{viewUser.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center"><Calendar className="w-4 h-4" /></div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Registration Date</p>
                  <p className="text-[14px] font-medium text-slate-800">{formatDate(viewUser.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setViewUser(null)}>Close Profile</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

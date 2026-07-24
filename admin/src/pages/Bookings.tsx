import { useEffect, useState, useMemo } from 'react';
import { Trash2, Edit3, Filter, X } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/api/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Booking {
  _id: string;
  bookingRef: string;
  itemType: string;
  itemName: string;
  destinationName: string;
  checkIn: string;
  checkOut: string;
  travelers: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user?: { name: string; email: string };
  [key: string]: unknown;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  
  // Custom filters
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/admin/bookings');
      setBookings(data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/bookings/${deleteId}`);
      setBookings((prev) => prev.filter((b) => b._id !== deleteId));
      toast.success('Reservation deleted successfully');
    } catch { toast.error('Failed to delete booking'); }
    finally { setDeleteId(null); }
  };

  const handleUpdate = async () => {
    if (!editBooking) return;
    try {
      const { data } = await api.put(`/admin/bookings/${editBooking._id}`, {
        status: editStatus,
        paymentStatus: editPaymentStatus,
      });
      setBookings((prev) => prev.map((b) => (b._id === data._id ? data : b)));
      toast.success('Reservation updated');
      setEditBooking(null);
    } catch { toast.error('Failed to update booking'); }
  };

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'All') return bookings;
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const columns = [
    { 
      key: 'bookingRef', label: 'Reservation', sortable: true, 
      render: (b: Booking) => (
        <div className="flex flex-col">
          <span className="font-mono text-[12px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded w-fit">{b.bookingRef}</span>
          <span className="text-[11px] font-medium text-slate-400 mt-1">{formatDate(b.createdAt)}</span>
        </div>
      )
    },
    { 
      key: 'user', label: 'Guest / Lead', 
      render: (b: Booking) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
            {b.user?.name?.charAt(0) || '?'}
          </div>
          <span className="font-semibold text-[13px] text-slate-800">{b.user?.name || 'Guest'}</span>
        </div>
      )
    },
    { 
      key: 'itemName', label: 'Itinerary Details', 
      render: (b: Booking) => (
        <div className="flex flex-col">
          <span className="font-medium text-[13px] text-slate-800 line-clamp-1">{b.itemName}</span>
          <span className="text-[11px] font-medium text-slate-500">{b.itemType} • {b.travelers} Guests</span>
        </div>
      ) 
    },
    { 
      key: 'totalAmount', label: 'Net Total', sortable: true, 
      render: (b: Booking) => <span className="font-bold text-[14px] text-slate-900">{formatCurrency(b.totalAmount)}</span> 
    },
    { key: 'status', label: 'Status', sortable: true, render: (b: Booking) => <Badge status={b.status} /> },
    { key: 'paymentStatus', label: 'Payment', sortable: true, render: (b: Booking) => <Badge status={b.paymentStatus} /> },
    {
      key: 'actions', label: '',
      render: (b: Booking) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => { setEditBooking(b); setEditStatus(b.status); setEditPaymentStatus(b.paymentStatus); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors" title="Edit Booking">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(b._id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Cancel Booking">
            <X className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-title-dashboard mb-1">Bookings Management</h1>
          <p className="text-body-main">Manage itineraries, modify reservations, and track fulfillment.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            {['All', 'Confirmed', 'Pending', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${
                  statusFilter === status ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>Advanced</Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredBookings} 
        loading={loading} 
        exportFilename="tripwise-bookings" 
        pageSize={12} 
        enableBulkSelect={true}
        bulkActions={[
          { label: 'Mark Confirmed', action: 'confirm', variant: 'primary' },
          { label: 'Cancel Selected', action: 'cancel', variant: 'danger' }
        ]}
      />

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Reservation" message="Are you sure you want to permanently delete this reservation? This cannot be undone." />

      <Modal isOpen={!!editBooking} onClose={() => setEditBooking(null)} title="Manage Reservation">
        {editBooking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reference ID</p>
                <p className="font-mono text-[16px] font-bold text-brand-600">{editBooking.bookingRef}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-[18px] font-bold text-slate-900 leading-none">{formatCurrency(editBooking.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[14px] font-bold text-slate-800">Reservation Lifecycle</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Booking Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="enterprise-select">
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Payment Status</label>
                  <select value={editPaymentStatus} onChange={(e) => setEditPaymentStatus(e.target.value)} className="enterprise-select">
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Refunded">Refunded</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditBooking(null)}>Discard Changes</Button>
              <Button variant="primary" onClick={handleUpdate}>Save Modifications</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

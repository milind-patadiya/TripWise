import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import api from '@/api/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ExpenseItem {
  _id: string; type: string; amount: number; note: string; date: string;
  userId?: { name: string; email: string };
  tripId?: { title: string; destination: string };
  [key: string]: unknown;
}

export default function Expenses() {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try { const { data } = await api.get('/admin/expenses'); setItems(data); }
    catch { toast.error('Failed to load expenses'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const columns = [
    { key: 'userId', label: 'User', render: (e: ExpenseItem) => e.userId?.name || '—' },
    { key: 'tripId', label: 'Trip Title', render: (e: ExpenseItem) => e.tripId?.title || '—' },
    { key: 'type', label: 'Category', sortable: true, render: (e: ExpenseItem) => <Badge status={e.type} /> },
    { key: 'amount', label: 'Amount', sortable: true, render: (e: ExpenseItem) => <span className="font-semibold text-white">{formatCurrency(e.amount)}</span> },
    { key: 'note', label: 'Note', render: (e: ExpenseItem) => e.note || '—' },
    { key: 'date', label: 'Expense Date', sortable: true, render: (e: ExpenseItem) => formatDate(e.date) },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-lg font-bold text-white tracking-tight">Expenses Oversight</h2><p className="text-xs text-slate-400">{items.length} total user expense records</p></div>
      <DataTable columns={columns} data={items} loading={loading} exportFilename="tripwise-expenses" />
    </div>
  );
}

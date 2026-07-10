import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Package, Plus, Trash2, Edit2, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminPackages() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  const { data: packages, isLoading } = useQuery({
    queryKey: ['admin_packages', search],
    queryFn: async () => {
      // In a real app we'd pass search to the backend
      const res = await axios.get(`http://localhost:5000/api/packages?limit=100`);
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://localhost:5000/api/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success('Package deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin_packages'] });
    },
    onError: () => toast.error('Failed to delete package')
  });

  const filteredPackages = packages?.filter((p: any) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="text-indigo-600" /> Packages
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage travel packages and itineraries.</p>
        </div>
        <Button className="flex items-center gap-2 bg-indigo-600 text-white shadow-md">
          <Plus size={16} /> Add Package
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search packages..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading packages...
                  </td>
                </tr>
              ) : filteredPackages?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No packages found.
                  </td>
                </tr>
              ) : (
                filteredPackages?.map((pkg: any) => (
                  <tr key={pkg._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={pkg.image} alt={pkg.title} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">{pkg.title}</span>
                        {pkg.featured && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">Featured</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {pkg.destination?.name || 'Multiple'}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ₹{(pkg.discountPrice || pkg.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {pkg.durationDays}D / {pkg.durationNights}N
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this package?')) {
                              deleteMutation.mutate(pkg._id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

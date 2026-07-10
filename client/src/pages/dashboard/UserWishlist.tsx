import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function UserWishlist() {
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`http://localhost:5000/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const wishlist = userProfile?.wishlist || [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Wishlist</h1>
          <p className="text-slate-500 mt-1">Packages you have saved for later.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((pkg: any) => (
            <Link key={pkg._id} to={`/packages`} className="block group">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all flex flex-col h-full">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                  <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:scale-110 transition-transform">
                    <Heart size={18} className="fill-current" />
                  </button>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{pkg.title}</h3>
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                  ₹{(pkg.discountPrice || pkg.price).toLocaleString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Heart size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h3>
          <p className="text-slate-500 mb-6">Save packages you like to quickly find them later.</p>
          <Link to="/packages">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl h-12">
              Explore Packages
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';

export default function AISmartSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const { data } = await api.post('/ai/search', { query });
      
      // Navigate to destinations page with parsed filters
      const params = new URLSearchParams();
      if (data.destination) params.append('search', data.destination);
      if (data.budget?.max) params.append('maxPrice', data.budget.max.toString());
      if (data.vibe && data.vibe.length > 0) params.append('category', data.vibe[0]);
      
      navigate(`/destinations?${params.toString()}`);
    } catch (error) {
      console.error('AI Search failed', error);
      // Fallback
      navigate(`/destinations?search=${encodeURIComponent(query)}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Sparkles className="h-5 w-5 text-indigo-500" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Try 'A romantic beach getaway under ₹30,000'..."
        className="block w-full pl-11 pr-32 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base shadow-xl"
      />
      <div className="absolute inset-y-1.5 right-1.5 flex items-center">
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          {isSearching ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              Search <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

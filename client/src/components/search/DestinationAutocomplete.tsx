import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Building2, Globe2, Landmark } from 'lucide-react';
import api from '@/api/axios';

export interface PlaceResult {
  name: string;
  type: 'Destination' | 'Country' | 'State' | 'City';
  country?: string;
  state?: string;
  image?: string;
  destinationId?: string;
}

const TYPE_ICON: Record<string, typeof MapPin> = {
  Destination: Landmark,
  City: Building2,
  State: MapPin,
  Country: Globe2,
};

interface Props {
  placeholder?: string;
  className?: string;
  onSelect: (place: PlaceResult) => void;
  initialValue?: string;
}

export default function DestinationAutocomplete({ placeholder = 'Where do you want to go?', className, onSelect, initialValue = '' }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [], isFetching } = useQuery<PlaceResult[]>({
    queryKey: ['autocomplete', query],
    queryFn: async () => {
      const res = await api.get(`/search/autocomplete?q=${encodeURIComponent(query)}`);
      return res.data;
    },
    enabled: query.trim().length > 0,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (place: PlaceResult) => {
    setQuery(place.name);
    setOpen(false);
    onSelect(place);
  };

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <div className="flex-1 flex items-center bg-white dark:bg-slate-900 rounded-xl px-4 py-3 gap-3">
        <MapPin className="text-slate-400 flex-shrink-0" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query && setOpen(true)}
          placeholder={placeholder}
          className="bg-transparent w-full focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          autoComplete="off"
        />
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {isFetching ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((place, idx) => {
              const Icon = TYPE_ICON[place.type] || MapPin;
              return (
                <button
                  key={`${place.name}-${idx}`}
                  onClick={() => handleSelect(place)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{place.name}</div>
                    <div className="text-xs text-slate-400 truncate">
                      {place.type === 'Country' ? 'Country' : [place.state, place.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-sm text-slate-400 text-center">No matching destinations found.</div>
          )}
        </div>
      )}
    </div>
  );
}

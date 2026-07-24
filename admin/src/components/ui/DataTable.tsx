import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, 
  Download, Search, Maximize2, Minimize2, Copy, Check 
} from 'lucide-react';
import { exportToCSV } from '@/lib/utils';
import Button from './Button';
import toast from 'react-hot-toast';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pageSize?: number;
  exportFilename?: string;
  enableBulkSelect?: boolean;
  onBulkAction?: (selectedIds: string[], action: string) => void;
  bulkActions?: { label: string; action: string; variant?: 'primary' | 'danger' | 'secondary' }[];
  emptyMessage?: string;
  searchPlaceholder?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  pageSize = 10,
  exportFilename,
  enableBulkSelect = false,
  onBulkAction,
  bulkActions = [],
  emptyMessage = 'No records found',
  searchPlaceholder = 'Search records...',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      columns.some((col) => {
        const val = item[col.key];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paged.map((item) => String(item._id))));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('ID copied to clipboard', { duration: 2000, position: 'bottom-right' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  if (loading) {
    return (
      <div className="enterprise-card p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="w-64 h-10 bg-slate-100 rounded-lg animate-pulse" />
          <div className="w-32 h-10 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full h-14 bg-slate-50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const containerClasses = isFullScreen
    ? 'fixed inset-0 z-[100] bg-surface-bg flex flex-col p-6'
    : 'enterprise-card flex flex-col';

  return (
    <div className={containerClasses}>
      {/* Table Toolbar */}
      <div className="enterprise-card-header flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="enterprise-input pl-10 h-10 bg-slate-50 border-slate-200"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          {enableBulkSelect && selectedIds.size > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2 mr-2 pr-4 border-r border-slate-200">
              <span className="text-[13px] font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-md">
                {selectedIds.size} selected
              </span>
              {bulkActions.map((action) => (
                <Button
                  key={action.action}
                  variant={action.variant || 'secondary'}
                  size="sm"
                  onClick={() => onBulkAction?.(Array.from(selectedIds), action.action)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          
          {exportFilename && (
            <Button variant="outline" size="sm" onClick={() => exportToCSV(sorted, exportFilename)} leftIcon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={toggleFullScreen} title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Table Content Wrapper */}
      <div className={`overflow-x-auto flex-1 ${isFullScreen ? 'min-h-0 bg-white border border-slate-200 rounded-xl mt-4 shadow-sm' : ''}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {enableBulkSelect && (
                <th className="py-3 px-4 w-12 border-r border-slate-100">
                  <input
                    type="checkbox"
                    checked={paged.length > 0 && selectedIds.size === paged.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-600 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`py-3.5 px-5 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors select-none' : ''
                  } ${idx !== columns.length - 1 ? 'border-r border-slate-100/50' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <span className="flex flex-col opacity-50">
                        <ChevronUp className={`w-3 h-3 -mb-1 ${sortKey === col.key && sortDir === 'asc' ? 'text-brand-600 opacity-100' : ''}`} />
                        <ChevronDown className={`w-3 h-3 ${sortKey === col.key && sortDir === 'desc' ? 'text-brand-600 opacity-100' : ''}`} />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (enableBulkSelect ? 1 : 0)} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Search className="w-10 h-10 mb-4 opacity-20" />
                    <p className="text-[14px] font-medium text-slate-500">{emptyMessage}</p>
                    {search && <p className="text-[13px] text-slate-400 mt-1">Try adjusting your search criteria</p>}
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((item, idx) => {
                const id = String(item._id || idx);
                const isSelected = selectedIds.has(id);
                return (
                  <tr 
                    key={id}
                    className={`hover:bg-slate-50/80 transition-colors group ${isSelected ? 'bg-brand-50/30' : ''}`}
                  >
                    {enableBulkSelect && (
                      <td className="py-3 px-4 border-r border-slate-100 w-12">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelect(id, e.target.checked)}
                          className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-600 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td 
                        key={col.key} 
                        className={`py-3.5 px-5 text-[14px] text-slate-700 ${colIdx !== columns.length - 1 ? 'border-r border-slate-100/50' : ''}`}
                      >
                        {col.key === '_id' ? (
                          <div className="flex items-center gap-2 group/id">
                            <span className="font-mono text-[12px] text-slate-500 truncate max-w-[100px]">{String(item[col.key])}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCopyId(String(item[col.key])); }}
                              className="opacity-0 group-hover/id:opacity-100 p-1 text-slate-400 hover:text-brand-600 transition-all rounded hover:bg-slate-100"
                              title="Copy ID"
                            >
                              {copiedId === String(item[col.key]) ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : (
                          col.render ? col.render(item) : <span className="text-[14px]">{String(item[col.key] ?? '—')}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Pagination */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <span className="text-[13px] font-medium text-slate-500">
          Showing <strong className="text-slate-900">{sorted.length === 0 ? 0 : page * pageSize + 1}</strong> to <strong className="text-slate-900">{Math.min((page + 1) * pageSize, sorted.length)}</strong> of <strong className="text-slate-900">{sorted.length}</strong> results
        </span>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i;
                else if (page < 3) pageNum = i;
                else if (page > totalPages - 4) pageNum = totalPages - 5 + i;
                else pageNum = page - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-[13px] font-semibold transition-all ${
                      page === pageNum
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

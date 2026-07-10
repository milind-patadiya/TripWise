import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Plus, Trash2, X,
  Shirt, Sparkles, Smartphone, FileText, Luggage,
  Pill, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// ─── Types ───────────────────────────────────────────────────
interface PackingItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
}

// ─── Category config ─────────────────────────────────────────
const CATEGORIES = [
  { key: 'essentials', label: 'Essentials', icon: Sparkles, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' },
  { key: 'clothing', label: 'Clothing', icon: Shirt, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
  { key: 'toiletries', label: 'Toiletries', icon: Pill, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' },
  { key: 'electronics', label: 'Electronics', icon: Smartphone, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
  { key: 'documents', label: 'Documents', icon: FileText, color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600' },
  { key: 'misc', label: 'Miscellaneous', icon: Luggage, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600' },
];

// ─── Default items ──────────────────────────────────────────
const DEFAULT_ITEMS: PackingItem[] = [
  { id: '1', name: 'Passport / ID Card', category: 'documents', checked: false },
  { id: '2', name: 'Flight / Train Tickets', category: 'documents', checked: false },
  { id: '3', name: 'Hotel Booking Confirmation', category: 'documents', checked: false },
  { id: '4', name: 'Travel Insurance', category: 'documents', checked: false },
  { id: '5', name: 'Phone Charger', category: 'electronics', checked: false },
  { id: '6', name: 'Power Bank', category: 'electronics', checked: false },
  { id: '7', name: 'Earphones', category: 'electronics', checked: false },
  { id: '8', name: 'Camera', category: 'electronics', checked: false },
  { id: '9', name: 'T-Shirts (3–4)', category: 'clothing', checked: false },
  { id: '10', name: 'Trousers / Shorts', category: 'clothing', checked: false },
  { id: '11', name: 'Underwear & Socks', category: 'clothing', checked: false },
  { id: '12', name: 'Comfortable Shoes', category: 'clothing', checked: false },
  { id: '13', name: 'Light Jacket', category: 'clothing', checked: false },
  { id: '14', name: 'Sunglasses', category: 'essentials', checked: false },
  { id: '15', name: 'Sunscreen', category: 'essentials', checked: false },
  { id: '16', name: 'Water Bottle', category: 'essentials', checked: false },
  { id: '17', name: 'Cash & Cards', category: 'essentials', checked: false },
  { id: '18', name: 'Toothbrush & Toothpaste', category: 'toiletries', checked: false },
  { id: '19', name: 'Shampoo & Soap', category: 'toiletries', checked: false },
  { id: '20', name: 'Deodorant', category: 'toiletries', checked: false },
  { id: '21', name: 'Medications', category: 'toiletries', checked: false },
  { id: '22', name: 'First Aid Kit', category: 'toiletries', checked: false },
  { id: '23', name: 'Umbrella', category: 'misc', checked: false },
  { id: '24', name: 'Snacks', category: 'misc', checked: false },
  { id: '25', name: 'Day Backpack', category: 'misc', checked: false },
];

// ─── Local storage ──────────────────────────────────────────
const STORAGE_KEY = 'tripwise_packing';

const loadItems = (): PackingItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ITEMS;
  } catch {
    return DEFAULT_ITEMS;
  }
};

const saveItems = (items: PackingItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

// ─── Main Component ─────────────────────────────────────────
export default function PackingChecklist() {
  const [items, setItems] = useState<PackingItem[]>(loadItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('essentials');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const updateItems = useCallback((newItems: PackingItem[]) => {
    setItems(newItems);
    saveItems(newItems);
  }, []);

  const toggleItem = useCallback((id: string) => {
    updateItems(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  }, [items, updateItems]);

  const deleteItem = useCallback((id: string) => {
    updateItems(items.filter((item) => item.id !== id));
  }, [items, updateItems]);

  const addItem = useCallback(() => {
    if (!newItemName.trim()) return;
    const newItem: PackingItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: newItemCategory,
      checked: false,
    };
    updateItems([...items, newItem]);
    setNewItemName('');
    setShowAddForm(false);
  }, [newItemName, newItemCategory, items, updateItems]);

  const resetAll = useCallback(() => {
    updateItems(DEFAULT_ITEMS);
  }, [updateItems]);

  const toggleCategory = useCallback((cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  // Stats
  const totalItems = items.length;
  const checkedItems = useMemo(() => items.filter((i) => i.checked).length, [items]);
  const progressPct = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  const groupedItems = useMemo(() => {
    const groups: Record<string, PackingItem[]> = {};
    CATEGORIES.forEach((c) => {
      groups[c.key] = items.filter((i) => i.category === c.key);
    });
    return groups;
  }, [items]);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Packing Checklist</h1>
          <p className="text-slate-500 mt-1">Never forget an essential again.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetAll} className="text-xs">
            Reset
          </Button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white">
              <Plus size={16} /> Add Item
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Packing Progress</h3>
          <span className="text-sm font-bold text-indigo-600">
            {checkedItems} / {totalItems}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full transition-colors',
              progressPct === 100
                ? 'bg-emerald-500'
                : progressPct > 50
                ? 'bg-indigo-600'
                : 'bg-amber-500'
            )}
          />
        </div>
        {progressPct === 100 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-emerald-600 text-sm font-medium mt-2 flex items-center gap-1.5"
          >
            <CheckSquare size={14} /> All packed! You&apos;re ready to go 🎉
          </motion.p>
        )}
      </motion.div>

      {/* Category Sections */}
      <div className="space-y-4">
        {CATEGORIES.map((cat, catIndex) => {
          const catItems = groupedItems[cat.key] || [];
          if (catItems.length === 0) return null;
          const isCollapsed = collapsedCategories[cat.key];
          const catChecked = catItems.filter((i) => i.checked).length;
          const Icon = cat.icon;

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + catIndex * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat.key)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', cat.color)}>
                    <Icon size={16} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cat.label}</h3>
                    <p className="text-xs text-slate-400">{catChecked}/{catItems.length} packed</p>
                  </div>
                </div>
                <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} className="text-slate-400" />
                </motion.div>
              </button>

              {/* Items */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 space-y-1">
                      {catItems.map((packItem) => (
                        <motion.div
                          key={packItem.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleItem(packItem.id)}
                            className={cn(
                              'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                              packItem.checked
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                            )}
                          >
                            {packItem.checked && (
                              <motion.svg
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.2 }}
                                viewBox="0 0 24 24"
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <motion.path d="M5 13l4 4L19 7" />
                              </motion.svg>
                            )}
                          </motion.button>
                          <span
                            className={cn(
                              'text-sm flex-1 transition-all',
                              packItem.checked
                                ? 'line-through text-slate-400'
                                : 'text-slate-700 dark:text-slate-300'
                            )}
                          >
                            {packItem.name}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteItem(packItem.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                          >
                            <Trash2 size={13} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowAddForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Packing Item</h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Item name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    placeholder="e.g., Travel pillow"
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <motion.button
                          key={cat.key}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setNewItemCategory(cat.key)}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all',
                            newItemCategory === cat.key
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                          )}
                        >
                          <CatIcon size={14} />
                          {cat.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={addItem} disabled={!newItemName.trim()} className="flex-1 bg-indigo-600 text-white">
                    Add Item
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

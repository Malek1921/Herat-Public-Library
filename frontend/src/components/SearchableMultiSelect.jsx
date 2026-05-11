import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const SearchableMultiSelect = ({
  endpoint,               // e.g. '/authors'
  placeholder = 'Search...',
  selectedItems = [],     // array of { id, full_name (or name) }
  onChange,               // (newIds, newItems) => void
}) => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selectedIds = selectedItems.map(i => i.id);

  const fetchItems = async (q) => {
    setLoading(true);
    try {
      const params = q ? { q, limit: 10 } : { limit: 10 };
      const res = await api.get(endpoint, { params });
      const list = Array.isArray(res.data) ? res.data : res.data.data || [];
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => fetchItems(query), 300);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addItem = (item) => {
    if (!selectedIds.includes(item.id)) {
      const newItems = [...selectedItems, item];
      onChange(newItems.map(i => i.id), newItems);
    }
  };

  const removeItem = (id) => {
    const newItems = selectedItems.filter(i => i.id !== id);
    onChange(newItems.map(i => i.id), newItems);
  };

  const handleCreate = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const res = await api.post(endpoint, { full_name: trimmed });
      const newItem = res.data; // expects { id, full_name } or { id, name }
      addItem(newItem);
      setQuery('');
      fetchItems('');
      toast.success('Created');
    } catch (err) {
      toast.error('Could not create entry');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!query.trim()) return;

      const exact = items.find(
        (i) => (i.full_name || i.name || '').toLowerCase() === query.trim().toLowerCase()
      );
      if (exact) {
        addItem(exact);
        setQuery('');
        fetchItems('');
      } else {
        handleCreate(query);
      }
    } else if (e.key === 'Backspace' && !query && selectedItems.length > 0) {
      removeItem(selectedItems[selectedItems.length - 1].id);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="flex flex-wrap items-center gap-1 p-2 border rounded min-h-10 bg-white cursor-text"
        onClick={() => { inputRef.current?.focus(); setIsOpen(true); }}
      >
        {selectedItems.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded"
          >
            {item.full_name || item.name}
            <button
              type="button"
              className="ml-1 text-red-500 hover:text-red-700"
              onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 outline-none border-none bg-transparent min-w-[120px]"
          placeholder={selectedItems.length ? '' : placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1 max-h-60 overflow-y-auto">
          {loading && <div className="px-3 py-2 text-gray-500">Loading...</div>}

          {!loading &&
            query.trim() &&
            !items.find(
              (i) => (i.full_name || i.name || '').toLowerCase() === query.trim().toLowerCase()
            ) && (
              <div
                className="px-3 py-2 text-blue-600 cursor-pointer border-b hover:bg-blue-50"
                onClick={() => handleCreate(query)}
              >
                + Create "{query.trim()}"
              </div>
            )}

          {!loading &&
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => addItem(item)}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => {}}
                  className="mr-2"
                />
                <span>{item.full_name || item.name}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchableMultiSelect;
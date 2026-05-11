// frontend/src/features/publishers/components/PublishersList.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import api from '../../../services/api';
import { useEdit } from '../../store/useEdit';

const PublishersList = ({ onEdit }) => {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const setEditing = useEdit((s) => s.setEditing);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.q = query;
      const res = await api.get('/lookups/publishers', { params });
      setItems(res.data);
    } catch {
      toast.error('خطا در بارگذاری ناشران');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [query]);

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این ناشر اطمینان دارید؟')) return;
    try {
      await api.delete(`/lookups/publishers/${id}`);
      toast.success('ناشر حذف شد');
      fetchItems();
    } catch {
      toast.error('خطا در حذف ناشر');
    }
  };

  const handleEdit = (item) => {
    setEditing(item, 'publisher');
    onEdit();
  };

  return (
    <div className="space-y-4 max-w-full">
      {/* Search */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px] max-w-md">
          <label className="block text-sm text-gray-600 mb-1">جستجو</label>
          <input
            type="text"
            placeholder="نام ناشر..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <th className="text-right px-6 py-3">نام ناشر</th>
                <th className="text-right px-6 py-3">شهر</th>
                <th className="text-right px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">در حال بارگذاری...</td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">ناشری یافت نشد.</td>
                </tr>
              )}
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600">{p.city || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline ml-3">ویرایش</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PublishersList;
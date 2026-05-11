import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import api from '../../../services/api';
import { useEdit } from '../../store/useEdit';

const TranslatorsList = ({ onEdit }) => {
  const [translators, setTranslators] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const setEditing = useEdit((s) => s.setEditing);

  const fetchTranslators = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (query) params.q = query;
      const res = await api.get('/translators', { params });
      setTranslators(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('خطا در بارگذاری مترجمان');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslators();
  }, [page, query]);

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این مترجم اطمینان دارید؟')) return;
    try {
      await api.delete(`/translators/${id}`);
      toast.success('مترجم حذف شد');
      fetchTranslators();
    } catch {
      toast.error('خطا در حذف مترجم');
    }
  };

  const handleEdit = (translator) => {
    setEditing(translator, 'translator');
    onEdit();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 max-w-full">
      {/* Search */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm text-gray-600 mb-1">جستجو</label>
          <input
            type="text"
            placeholder="جستجوی نام مترجم..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
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
                <th className="text-right px-6 py-3">نام مترجم</th>
                <th className="text-right px-6 py-3">تعداد کتاب‌ها</th>
                <th className="text-right px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">در حال بارگذاری...</td>
                </tr>
              )}
              {!loading && translators.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">مترجمی یافت نشد.</td>
                </tr>
              )}
              {translators.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{t.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{t.book_count}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(t)} className="text-blue-600 hover:underline ml-3">ویرایش</button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">مجموع: {total} مترجم</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              قبلی
            </button>
            <span className="px-3 py-1 text-sm">{page} / {totalPages || 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              بعدی
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatorsList;
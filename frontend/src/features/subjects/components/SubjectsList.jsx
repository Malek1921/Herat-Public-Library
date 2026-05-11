// frontend/src/features/subjects/components/SubjectsList.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { useEdit } from '../../store/useEdit';

const SubjectsList = ({ onEdit }) => {
  const [subjects, setSubjects] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const setEditing = useEdit((s) => s.setEditing);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (query) params.q = query;
      const res = await api.get('/lookups/subjects', { params });
      setSubjects(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('خطا در بارگذاری موضوعات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [page, query]);

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این موضوع اطمینان دارید؟')) return;
    try {
      await api.delete(`/lookups/subjects/${id}`);
      toast.success('موضوع حذف شد');
      fetchSubjects();
    } catch {
      toast.error('خطا در حذف موضوع');
    }
  };

  const handleEdit = (subject) => {
    setEditing(subject, 'subject');
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
            placeholder="جستجوی نام موضوع..."
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
                <th className="text-right px-6 py-3">نام</th>
                <th className="text-right px-6 py-3">شماره دیویی</th>
                <th className="text-right px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">در حال بارگذاری...</td>
                </tr>
              )}
              {!loading && subjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">موضوعی یافت نشد.</td>
                </tr>
              )}
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{s.name}</td>
                  <td className="px-6 py-4 text-gray-600">{s.dewey_number || '-'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(s)} className="text-blue-600 hover:underline ml-3">ویرایش</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">مجموع: {total} موضوع</span>
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

export default SubjectsList;
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import api from '../../../services/api';
import { useEdit } from '../../store/useEdit';
import BookDetail from './BookDetail';

const BooksList = ({ onEdit }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const [expandedId, setExpandedId] = useState(null);
  const [bookDetail, setBookDetail] = useState(null);
  const [copies, setCopies] = useState([]);

  const setEditing = useEdit((s) => s.setEditing);

  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          api.get('/lookups/categories'),
          api.get('/lookups/subjects'),
        ]);
        setCategories(catRes.data);
        setSubjects(subRes.data);
      } catch { }
    };
    fetchLookups();
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (query) params.q = query;
      if (categoryId) params.category_id = categoryId;
      if (subjectId) params.subject_id = subjectId;

      const res = await api.get('/books', { params });
      setBooks(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('خطا در بارگذاری کتاب‌ها');
    } finally {
      setLoading(false);
    }
  }, [page, limit, query, categoryId, subjectId]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleToggleExpand = async (book) => {
    if (expandedId === book.id) {
      setExpandedId(null);
      setBookDetail(null);
      setCopies([]);
    } else {
      setExpandedId(book.id);
      try {
        const [detailRes, copiesRes] = await Promise.all([
          api.get(`/books/${book.id}`),
          api.get(`/books/${book.id}/copies`),
        ]);
        setBookDetail(detailRes.data);
        setCopies(copiesRes.data);
      } catch {
        toast.error('خطا در دریافت جزئیات کتاب');
        setExpandedId(null);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این کتاب اطمینان دارید؟')) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success('کتاب حذف شد');
      fetchBooks();
    } catch {
      toast.error('خطا در حذف کتاب');
    }
  };

  const handleEdit = (book) => {
    setEditing(book, 'book');
    onEdit();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 max-w-full">
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-600 mb-1">جستجو</label>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="عنوان، شابک..."
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
        <div className="w-48">
          <label className="block text-sm text-gray-600 mb-1">دسته‌بندی</label>
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">همه</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <label className="block text-sm text-gray-600 mb-1">موضوع</label>
          <select
            value={subjectId}
            onChange={(e) => { setSubjectId(e.target.value); setPage(1); }}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">همه</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { setQuery(''); setCategoryId(''); setSubjectId(''); setPage(1); }}
          className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition"
        >
          پاک کردن
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <th className="text-right px-6 py-3">عنوان</th>
                <th className="text-right px-6 py-3">نویسنده(ها)</th>
                <th className="text-right px-6 py-3">ناشر</th>
                <th className="text-right px-6 py-3">سال</th>
                <th className="text-right px-6 py-3">نسخه‌ها</th>
                <th className="text-right px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">در حال بارگذاری...</td>
                </tr>
              )}
              {!loading && books.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">کتابی یافت نشد.</td>
                </tr>
              )}
              {books.map((book) => (
                <>
                  <tr
                    key={book.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleToggleExpand(book)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{book.title}</td>
                    <td className="px-6 py-4 text-gray-600">{book.authors?.join('، ') ?? '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{book.publisher ?? '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{book.publication_year ?? '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{book.copy_count}</td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEdit(book)} className="text-blue-600 hover:underline ml-3">ویرایش</button>
                        <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:underline">حذف</button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === book.id && bookDetail && (
                    <tr key={`expanded-${book.id}`}>
                      <td colSpan={6} className="bg-gray-50 p-4">
                        <BookDetail book={bookDetail} copies={copies} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">مجموع: {total} کتاب</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              قبلی
            </button>
            <span className="px-3 py-1 text-sm">{page} / {totalPages || 1}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
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

export default BooksList;
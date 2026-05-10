import { useEffect, useState } from 'react';
import { booksAPI, lookupsAPI } from '../../../services/endpoints';
import { useEdit } from '../../store/useEdit';
import { toast } from 'react-toastify';
import { Trash2, Edit, Search } from 'lucide-react';

export function BooksList({ setTab }) {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const { setEditing } = useEdit();

  const limit = 10;

  // Load books
  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          q: search || undefined,
          category_id: categoryFilter || undefined,
        };
        const response = await booksAPI.getBooks(params);
        setBooks(response.data.data || []);
        setTotal(response.data.total || 0);
      } catch (err) {
        toast.error('❌ خطا در دریافت کتاب‌ها');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadBooks, 300);
    return () => clearTimeout(timer);
  }, [page, search, categoryFilter]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await lookupsAPI.getLookupsBy('categories', { limit: 100 });
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این کتاب را حذف کنید؟')) {
      try {
        await booksAPI.deleteBook(id);
        toast.success('✅ کتاب با موفقیت حذف شد');
        setBooks(books.filter((b) => b.id !== id));
      } catch (err) {
        toast.error('❌ خطا در حذف کتاب');
      }
    }
  };

  const handleEdit = (book) => {
    setEditing(book, 'book');
    setTab('edit');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute right-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="جستجو در عنوان یا شابک..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- همه دسته‌بندی‌ها --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">⏳ در حال بارگذاری...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">❌ کتابی یافت نشد</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-right font-medium">عنوان</th>
                  <th className="px-4 py-3 text-right font-medium">نویسنده</th>
                  <th className="px-4 py-3 text-right font-medium">دسته‌بندی</th>
                  <th className="px-4 py-3 text-right font-medium">قیمت</th>
                  <th className="px-4 py-3 text-right font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{book.title}</td>
                    <td className="px-4 py-3">
                      {book.authors?.length > 0
                        ? book.authors.join(', ')
                        : '-'}
                    </td>
                    <td className="px-4 py-3">{book.category || '-'}</td>
                    <td className="px-4 py-3">{book.unit_price || '-'}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(book)}

                        className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs transition"
                      >
                        <Edit size={14} />
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                      >
                        <Trash2 size={14} />
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              {total} کتاب از {(page - 1) * limit + 1} تا {Math.min(page * limit, total)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                قبلی
              </button>
              <span className="px-3 py-1">
                صفحه {page} از {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                بعدی
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
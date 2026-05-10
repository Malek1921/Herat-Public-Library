import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { booksAPI, lookupsAPI } from '../../../services/endpoints';
import { useEffect } from 'react';
import { BookPlus } from 'lucide-react';

export function AddBook({ onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: '',
      edition: '',
      page_count: '',
      isbn: '',
      unit_price: '',
      publication_year: '',
      category_id: '',
      subject_id: '',
      language_id: '',
      publisher_id: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          lookupsAPI.getLookupsBy('categories', { limit: 100 }),
          lookupsAPI.getLookupsBy('subjects', { limit: 100 }),
        ]);
        setCategories(catRes.data || []);
        setSubjects(subRes.data || []);
      } catch (err) {
        console.error('Error loading lookups:', err);
      }
    };
    loadLookups();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        page_count: data.page_count ? parseInt(data.page_count) : null,
        unit_price: data.unit_price ? parseFloat(data.unit_price) : null,
        publication_year: data.publication_year ? parseInt(data.publication_year) : null,
        category_id: data.category_id ? parseInt(data.category_id) : null,
        subject_id: data.subject_id ? parseInt(data.subject_id) : null,
        language_id: data.language_id ? parseInt(data.language_id) : null,
        publisher_id: data.publisher_id ? parseInt(data.publisher_id) : null,
        author_ids: [],
        translator_ids: [],
      };

      await booksAPI.createBook(payload);
      toast.success('✅ کتاب با موفقیت اضافه شد');
      reset();
      onSuccess?.();
    } catch (err) {
      const message = err.response?.data?.error || 'خطا در افزودن کتاب';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            📖 عنوان کتاب *
          </label>
          <input
            {...register('title', { required: 'عنوان الزامی است' })}
            type="text"
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="عنوان کتاب را وارد کنید"
          />
          {errors.title && <p className="text-xs text-red-600 text-right mt-1">{errors.title.message}</p>}
        </div>

        {/* Edition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            📚 نوبت چاپ
          </label>
          <input
            {...register('edition')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مثال: اول، دوم"
          />
        </div>

        {/* Page Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            📄 تعداد صفحات
          </label>
          <input
            {...register('page_count')}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="300"
          />
        </div>

        {/* ISBN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            🔢 شابک (ISBN)
          </label>
          <input
            {...register('isbn')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="978-3-16-148410-0"
          />
        </div>

        {/* Unit Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            💰 قیمت واحد
          </label>
          <input
            {...register('unit_price')}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="75.00"
          />
        </div>

        {/* Publication Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            📅 سال انتشار
          </label>
          <input
            {...register('publication_year')}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1403"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            🏷️ دسته‌بندی
          </label>
          <select
            {...register('category_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- انتخاب دسته‌بندی --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            📚 موضوع
          </label>
          <select
            {...register('subject_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- انتخاب موضوع --</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded transition"
        >
          <BookPlus size={20} />
          {isLoading ? 'در حال افزودن...' : 'افزودن کتاب'}
        </button>
      </div>
    </form>
  );
}
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { booksAPI, lookupsAPI } from '../../../services/endpoints';
import { useEdit } from '../../store/useEdit';
import { Edit2 } from 'lucide-react';

export function EditBook({ onSuccess, setTab }) {
  const { editingItem, clearEditing } = useEdit();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (editingItem) {
      reset(editingItem);
    }
  }, [editingItem, reset]);

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
    if (!editingItem?.id) {
      toast.error('❌ لطفاً ابتدا کتابی را برای ویرایش انتخاب کنید');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: data.title || undefined,
        edition: data.edition || undefined,
        page_count: data.page_count ? parseInt(data.page_count) : undefined,
        isbn: data.isbn || undefined,
        unit_price: data.unit_price ? parseFloat(data.unit_price) : undefined,
        publication_year: data.publication_year ? parseInt(data.publication_year) : undefined,
        category_id: data.category_id ? parseInt(data.category_id) : undefined,
        subject_id: data.subject_id ? parseInt(data.subject_id) : undefined,
      };

      await booksAPI.updateBook(editingItem.id, payload);
      toast.success('✅ کتاب با موفقیت بروز شد');
      clearEditing();
      reset();
      onSuccess?.();
    } catch (err) {
      const message = err.response?.data?.error || 'خطا در بروزرسانی کتاب';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!editingItem) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">❌ لطفاً کتابی را برای ویرایش انتخاب کنید</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            📖 عنوان کتاب
          </label>
          <input
            {...register('title')}
            type="text"
            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
          />
        </div>

        {/* Edition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            📚 نوبت چاپ
          </label>
          <input
            {...register('edition')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-1">
            🏷️ دسته‌بندی
          </label>
          <select
            {...register('category_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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

          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded transition"
        >
          <Edit2 size={20} />
          {isLoading ? 'در حال بروزرسانی...' : 'بروزرسانی کتاب'}
        </button>
        <button
          type="button"
          onClick={() => {
            clearEditing();
            reset();
          }}
          className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded transition"
        >
          لغو
        </button>
      </div>
    </form >
  );
}
// frontend/src/features/authors/components/EditAuthor.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { useEdit } from '../../store/useEdit';

const EditAuthor = ({ onSuccess }) => {
  const { editingItem, clearEditing } = useEdit();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (editingItem) {
      reset({ full_name: editingItem.full_name || '' });
    }
  }, [editingItem, reset]);

  const onSubmit = async (data) => {
    if (!editingItem) return;
    try {
      await api.put(`/authors/${editingItem.id}`, { full_name: data.full_name });
      toast.success('نویسنده با موفقیت ویرایش شد');
      clearEditing();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'خطا در ویرایش نویسنده');
    }
  };

  if (!editingItem) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">هیچ نویسنده‌ای انتخاب نشده است.</p>
        <p className="text-gray-400 text-sm mt-2">به لیست بروید و روی ویرایش کلیک کنید.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm max-w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">ویرایش نویسنده #{editingItem.id}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام کامل نویسنده *</label>
          <input
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
            {...register('full_name', { required: 'نام نویسنده الزامی است' })}
          />
          {errors.full_name && <span className="text-red-500 text-xs">{errors.full_name.message}</span>}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
          به‌روزرسانی
        </button>
        <button
          type="button"
          onClick={() => { clearEditing(); onSuccess(); }}
          className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          انصراف
        </button>
      </div>
    </form>
  );
};

export default EditAuthor;
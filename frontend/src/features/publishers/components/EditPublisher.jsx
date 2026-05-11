// frontend/src/features/publishers/components/EditPublisher.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { useEdit } from '../../store/useEdit';

const EditPublisher = ({ onSuccess }) => {
  const { editingItem, clearEditing } = useEdit();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (editingItem) {
      reset({
        name: editingItem.name || '',
        city: editingItem.city || '',
      });
    }
  }, [editingItem, reset]);

  const onSubmit = async (data) => {
    if (!editingItem) return;
    try {
      await api.put(`/lookups/publishers/${editingItem.id}`, {
        name: data.name,
        city: data.city || null,
      });
      toast.success('ناشر با موفقیت ویرایش شد');
      clearEditing();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'خطا در ویرایش ناشر');
    }
  };

  if (!editingItem) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">هیچ ناشری انتخاب نشده است.</p>
        <p className="text-gray-400 text-sm mt-2">به لیست بروید و روی ویرایش کلیک کنید.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm max-w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">ویرایش ناشر #{editingItem.id}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام ناشر *</label>
          <input
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
            {...register('name', { required: 'نام ناشر الزامی است' })}
          />
          {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">شهر</label>
          <input
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
            {...register('city')}
          />
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

export default EditPublisher;
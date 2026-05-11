// frontend/src/features/subjects/components/EditSubject.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { useEdit } from '../../store/useEdit';

const EditSubject = ({ onSuccess }) => {
  const { editingItem, clearEditing } = useEdit();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (editingItem) {
      reset({
        name: editingItem.name || '',
        dewey_number: editingItem.dewey_number || '',
      });
    }
  }, [editingItem, reset]);

  const onSubmit = async (data) => {
    if (!editingItem) return;
    try {
      await api.put(`/lookups/subjects/${editingItem.id}`, {
        name: data.name,
        dewey_number: data.dewey_number || null,
      });
      toast.success('موضوع بروزرسانی شد');
      clearEditing();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'خطا در بروزرسانی موضوع');
    }
  };

  if (!editingItem) {
    return <div className="text-center py-10 text-gray-500">موضوعی انتخاب نشده است. به لیست بروید و روی ویرایش کلیک کنید.</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm max-w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">ویرایش موضوع #{editingItem.id}</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">نام *</label>
        <input
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
          {...register('name', { required: 'نام الزامی است' })}
        />
        {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">شماره دیویی</label>
        <input
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
          {...register('dewey_number')}
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
          بروزرسانی
        </button>
        <button type="button" onClick={() => { clearEditing(); onSuccess(); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
          انصراف
        </button>
      </div>
    </form>
  );
};

export default EditSubject;
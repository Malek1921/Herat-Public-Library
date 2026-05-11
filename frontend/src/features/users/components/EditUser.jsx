// frontend/src/features/users/components/EditUser.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { useEdit } from '../../store/useEdit';

const EditUser = ({ onSuccess }) => {
  const { editingItem, clearEditing } = useEdit();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (editingItem) {
      reset({
        role: editingItem.role || 'staff',
        is_active: editingItem.is_active,
      });
    }
  }, [editingItem, reset]);

  const onSubmit = async (data) => {
    if (!editingItem) return;
    try {
      await api.patch(`/auth/users/${editingItem.id}`, {
        role: data.role,
        is_active: data.is_active === 'true' || data.is_active === true,
      });
      toast.success('کاربر با موفقیت به‌روزرسانی شد');
      clearEditing();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'خطا در به‌روزرسانی کاربر');
    }
  };

  if (!editingItem) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">هیچ کاربری انتخاب نشده است.</p>
        <p className="text-gray-400 text-sm mt-2">به لیست بروید و روی ویرایش کلیک کنید.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm max-w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-2">ویرایش کاربر #{editingItem.id}</h2>
      <p className="mb-6 text-sm text-gray-600">نام کاربری: <strong>{editingItem.username}</strong></p>
      <p className="mb-6 text-sm text-gray-600">ایمیل: <strong>{editingItem.email}</strong></p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نقش</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
            {...register('role')}
          >
            <option value="staff">کارمند</option>
            <option value="admin">مدیر</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">فعال</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
            {...register('is_active')}
          >
            <option value="true">بله</option>
            <option value="false">خیر</option>
          </select>
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

export default EditUser;
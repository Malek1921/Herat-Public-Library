// frontend/src/features/users/components/AddUser.jsx
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const AddUser = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { role: 'staff' },
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', data);
      toast.success('کاربر با موفقیت ایجاد شد');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'خطا در ایجاد کاربر');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm max-w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">افزودن کاربر جدید</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری *</label>
          <input
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
            {...register('username', { required: 'نام کاربری الزامی است' })}
          />
          {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل *</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
            {...register('email', { required: 'ایمیل الزامی است' })}
          />
          {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور *</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
            {...register('password', { required: 'رمز عبور الزامی است' })}
          />
          {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
        </div>

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
      </div>

      <button type="submit" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
        افزودن کاربر
      </button>
    </form>
  );
};

export default AddUser;
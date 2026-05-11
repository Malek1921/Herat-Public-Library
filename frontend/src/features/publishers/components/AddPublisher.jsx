// frontend/src/features/publishers/components/AddPublisher.jsx
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const AddPublisher = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/lookups/publishers', {
        name: data.name,
        city: data.city || null,
      });
      toast.success('ناشر با موفقیت اضافه شد');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'خطا در افزودن ناشر');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm max-w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">افزودن ناشر جدید</h2>

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

      <button type="submit" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
        افزودن ناشر
      </button>
    </form>
  );
};

export default AddPublisher;
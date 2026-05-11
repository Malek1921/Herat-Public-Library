// frontend/src/features/subjects/components/AddSubject.jsx
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const AddSubject = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/lookups/subjects', {
        name: data.name,
        dewey_number: data.dewey_number || null,
      });
      toast.success('موضوع با موفقیت افزوده شد');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'خطا در افزودن موضوع');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm max-w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">افزودن موضوع</h2>
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
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        افزودن موضوع
      </button>
    </form>
  );
};

export default AddSubject;
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useUser } from '../../store/useUser';
import { authAPI } from '../../../services/endpoints';
import { Mail, Lock, LogIn } from 'lucide-react';

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
  });
  const navigate = useNavigate();
  const { setUser, setLoading, setError } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoading(true);
    try {
      const response = await authAPI.login(data.email, data.password);
      const { token, user } = response.data;

      setUser(user, token);
      toast.success('✅ خوش آمدید! ' + user.username);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'خطا در ورود';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">📚 کتابخانه</h2>
        <p className="mt-2 text-sm text-gray-600">سیستم مدیریت کتابخانه</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-2">
            📧 ایمیل
          </label>
          <div className="relative">
            <Mail className="absolute right-3 top-3 text-gray-400" size={20} />
            <input
              {...register('email', {
                required: 'ایمیل الزامی است',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'ایمیل نامعتبر',
                },
              })}
              type="email"
              className={`w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="admin@library.local"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 text-right">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-2">
            🔐 رمز عبور
          </label>
          <div className="relative">
            <Lock className="absolute right-3 top-3 text-gray-400" size={20} />
            <input
              {...register('password', {
                required: 'رمز عبور الزامی است',
                minLength: {
                  value: 6,
                  message: 'رمز عبور باید حداقل 6 حرف باشد',
                },
              })}
              type="password"
              className={`w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 text-right">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          <LogIn size={20} />
          {isLoading ? 'در حال ورود...' : 'ورود'}
        </button>
      </form>
    </div>
  );
}
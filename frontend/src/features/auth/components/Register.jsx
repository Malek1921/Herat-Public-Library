import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useUser } from '../../store/useUser';
import { authAPI } from '../../../services/endpoints';
import { User, Mail, Lock, UserPlus, Shield } from 'lucide-react';

export function Register() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            role: 'staff',
        },
    });
    const { isAdmin } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        if (!isAdmin()) {
            toast.error('❌ فقط مدیران می‌توانند کاربران جدید ایجاد کنند');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authAPI.register(
                data.username,
                data.email,
                data.password,
                data.role
            );
            toast.success('✅ کاربر ' + response.data.username + ' با موفقیت ایجاد شد');
            reset();
        } catch (err) {
            const message = err.response?.data?.error || 'خطا در ایجاد کاربر';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">👤 کاربر جدید</h3>
                <p className="text-sm text-gray-600">فقط مدیران می‌توانند کاربران ایجاد کنند</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Username */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                        👤 نام کاربری
                    </label>
                    <div className="relative">
                        <User className="absolute right-3 top-3 text-gray-400" size={18} />
                        <input
                            {...register('username', { required: 'نام کاربری الزامی است' })}
                            type="text"
                            className={`w-full pr-10 pl-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.username ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="staff1"
                        />
                    </div>
                    {errors.username && (
                        <p className="mt-1 text-xs text-red-600 text-right">{errors.username.message}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                        📧 ایمیل
                    </label>
                    <div className="relative">
                        <Mail className="absolute right-3 top-3 text-gray-400" size={18} />
                        <input
                            {...register('email', {
                                required: 'ایمیل الزامی است',
                                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'نامعتبر' },
                            })}
                            type="email"
                            className={`w-full pr-10 pl-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="staff@library.local"
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-600 text-right">{errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                        🔐 رمز عبور
                    </label>
                    <div className="relative">
                        <Lock className="absolute right-3 top-3 text-gray-400" size={18} />
                        <input
                            {...register('password', {
                                required: 'رمز عبور الزامی است',
                                minLength: { value: 6, message: 'حداقل 6 حرف' },
                            })}
                            type="password"
                            className={`w-full pr-10 pl-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="••••••••"
                        />
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-600 text-right">{errors.password.message}</p>
                    )}
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                        🛡️ نقش
                    </label>
                    <div className="relative">
                        <Shield className="absolute right-3 top-3 text-gray-400" size={18} />
                        <select
                            {...register('role')}
                            className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="staff">👨‍💼 کارمند</option>
                            <option value="admin">👨‍💻 مدیر</option>
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded text-sm transition"
                >
                    <UserPlus size={18} />
                    {isLoading ? 'در حال ایجاد...' : 'ایجاد کاربر'}
                </button>
            </form>
        </div>
    );
}
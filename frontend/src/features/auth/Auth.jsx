import { useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { useUser } from '../store/useUser';

export function Auth() {
    const [tab, setTab] = useState('login');
    const { isAdmin } = useUser();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b">
                    <button
                        onClick={() => setTab('login')}
                        className={`pb-2 px-4 font-medium transition ${tab === 'login'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        ورود
                    </button>
                    {isAdmin() && (
                        <button
                            onClick={() => setTab('register')}
                            className={`pb-2 px-4 font-medium transition ${tab === 'register'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            ➕ کاربر جدید
                        </button>
                    )}
                </div>

                {/* Content */}
                {tab === 'login' ? <Login /> : <Register />}
            </div>
        </div>
    );
}
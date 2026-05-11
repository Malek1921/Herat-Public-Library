import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../features/store/useUser';
import {
    LayoutDashboard,
    Book,
    Users,
    UserCog,
    Languages,
    Building2,
    UserPlus,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Tags
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export function Sidebar() {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('با موفقیت خارج شدید');
        navigate('/login');
    };

    const navLinks = [
        { label: 'داشبورد', path: '/dashboard', icon: LayoutDashboard },
        { label: 'کتاب‌ها', path: '/books', icon: Book },
        { label: 'تراکنش‌ها', path: '/transactions', icon: Users },
        { label: 'نویسندگان', path: '/authors', icon: UserCog },
        { label: 'مترجمان', path: '/translators', icon: Languages },
        { label: 'ناشران', path: '/publishers', icon: Building2 },
        { label: 'کاربران', path: '/users', icon: UserPlus },
        { label: 'موضوعات', path: '/subjects', icon: Tags },

    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div
            className={`bg-white border-r border-gray-200 text-gray-700 h-screen flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
                } sticky top-0`}
        >
            {/* Logo / Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                {!collapsed && (
                    <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-gray-800">
                        <div className="bg-blue-500 p-1.5 rounded-lg">
                            <Book size={20} className="text-white" />
                        </div>
                        کتابخانه
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-gray-100 transition text-gray-500"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4 px-2">
                <ul className="space-y-1">
                    {navLinks.map((link) => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive(link.path)
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <link.icon size={20} />
                                {!collapsed && <span>{link.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Info & Logout */}
            <div className="border-t border-gray-100 p-4">
                {!collapsed ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-gray-800">{user?.username}</p>
                                <p className="text-gray-400 text-xs">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                            title="خروج"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="w-full p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition flex justify-center"
                        title="خروج"
                    >
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../features/store/useUser';
import {
    Menu,
    X,
    Home,
    Book,
    Users,
    UserCheck,
    BookMarked,
    Settings,
    LogOut,
    ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export function Navbar() {
    const { user, logout, isAdmin } = useUser();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('✅ با موفقیت خارج شدید');
        navigate('/login');
    };

    const navLinks = [
        { label: '🏠 داشبورد', path: '/dashboard', icon: Home },
        { label: '📚 کتاب‌ها', path: '/books', icon: Book },
        { label: '👤 تراکنش‌ها', path: '/transactions', icon: Users },
        { label: '✋ وام‌ها', path: '/loans', icon: UserCheck },
        { label: '📖 رزرو‌ها', path: '/reservations', icon: BookMarked },
    ];

    const adminLinks = [
        { label: '👨‍✍️ نویسندگان', path: '/authors', icon: Users },
        { label: '🔤 مترجمان', path: '/translators', icon: Users },
        { label: '⚙️ تنظیمات', path: '/admin', icon: Settings },
    ];

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                        <Book size={28} />
                        کتابخانه
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="flex items-center gap-1 px-3 py-2 rounded hover:bg-blue-500 transition text-sm"
                            >
                                <link.icon size={16} />
                                {link.label}
                            </Link>
                        ))}

                        {isAdmin() && (
                            <div className="relative group">
                                <button className="flex items-center gap-1 px-3 py-2 rounded hover:bg-blue-500 transition text-sm">
                                    <Settings size={16} />
                                    مدیر
                                    <ChevronDown size={14} />
                                </button>
                                <div className="absolute left-0 mt-0 w-48 bg-white text-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50">
                                    {adminLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                                        >
                                            <link.icon size={16} />
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        {/* Desktop User Menu */}
                        <div className="hidden md:block relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-500 transition"
                            >
                                <span>{user?.username}</span>
                                <ChevronDown size={16} />
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50">
                                    <div className="px-4 py-2 border-b">
                                        <p className="font-medium text-sm">{user?.email}</p>
                                        <p className="text-xs text-gray-600">
                                            نقش: {user?.role === 'admin' ? '👨‍💻 مدیر' : '👨‍💼 کارمند'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 transition"
                                    >
                                        <LogOut size={16} />
                                        خروج
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 rounded hover:bg-blue-500 transition"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-500 transition text-sm block"
                            >
                                <link.icon size={16} />
                                {link.label}
                            </Link>
                        ))}

                        {isAdmin() && (
                            <>
                                <div className="border-t border-blue-500 pt-2 mt-2">
                                    {adminLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-500 transition text-sm block"
                                        >
                                            <link.icon size={16} />
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-red-600 transition text-sm w-full"
                        >
                            <LogOut size={16} />
                            خروج
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
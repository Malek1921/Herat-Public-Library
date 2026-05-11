import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  FiBookOpen, FiUserCheck, FiFolder, FiGlobe, FiClock,
} from 'react-icons/fi';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch {
        toast.error('خطا در بارگیری آمار داشبورد');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-lg text-gray-400">در حال بارگیری داشبورد...</div>
    </div>
  );

  if (!stats) return (
    <div className="text-center text-red-500 py-12">ناتوان در بارگیری آمار.</div>
  );

  const {
    totals,
    books_by_category,
    daily_transactions,
    avg_reading_hours_today,
    hourly_transactions,
  } = stats;

  // Fill missing hours with 0
  const hourlyData = Array.from({ length: 24 }, (_, i) => i).map(hour => {
    const found = hourly_transactions.find(h => h.hour === hour);
    return { hour: `${hour}:00`, count: found ? found.count : 0 };
  });

  const formatDuration = (hours) => {
    if (hours === null || hours === undefined) return '-';
    const totalMinutes = Math.round(hours * 60);
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const wholeHours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (mins === 0) return `${wholeHours}h`;
    return `${wholeHours}h ${mins}m`;
  };

  const statCards = [
    { label: 'مجموع کتاب‌ها', value: totals.books, icon: <FiBookOpen size={24} />, color: 'bg-blue-500' },
    { label: 'نویسندگان', value: totals.authors, icon: <FiUserCheck size={24} />, color: 'bg-teal-500' },
    { label: 'ناشران', value: totals.publishers, icon: <FiFolder size={24} />, color: 'bg-orange-500' },
    { label: 'مترجمان', value: totals.translators, icon: <FiGlobe size={24} />, color: 'bg-pink-500' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">داشبورد</h1>
        <p className="text-gray-500 mt-1">مرور کلی کتابخانه در یک نگاه</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex items-center gap-4"
          >
            <div className={`${card.color} text-white p-3 rounded-xl shadow-md`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Avg Reading Time + Transactions by Hour Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Reading Time Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-blue-50 p-3 rounded-xl">
              <FiClock size={24} className="text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">میانگین زمان مطالعه امروز</p>
          </div>
          <p className="text-4xl font-bold text-gray-800 pl-14">
            {avg_reading_hours_today
              ? `${Math.floor(avg_reading_hours_today)}h ${Math.round((avg_reading_hours_today % 1) * 60)}m`
              : 'ن/م'}
          </p>
          <p className="text-xs text-gray-400 pl-14 mt-1">بر اساس کتاب‌های بازگشتی</p>
        </div>

        {/* Hourly Transactions Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">درخواست ها بر اساس ساعت (امروز)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="درخواست ها" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">معاملات امروز</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <th className="text-left px-6 py-3">بازدیدکننده</th>
                <th className="text-left px-6 py-3">کتاب</th>
                <th className="text-left px-6 py-3">گرفته شده در</th>
                <th className="text-left px-6 py-3">مدت</th>
                <th className="text-left px-6 py-3">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {daily_transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {tx.visitor_name} {tx.visitor_lastname}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{tx.book_title}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(tx.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDuration(tx.hours_borrowed)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${tx.status === 'ongoing'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                        }`}
                    >
                      {tx.status === 'ongoing' ? 'جاری' : 'بازگشتی'}
                    </span>
                  </td>
                </tr>
              ))}
              {daily_transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    هیچ درخواستی امروز ثبت نشده.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Books by Category Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">کتاب‌ها بر اساس دسته</h2>
        {books_by_category.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={books_by_category}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="book_count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="کتاب‌ها" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">هیچ داده دسته‌ای موجود نیست.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
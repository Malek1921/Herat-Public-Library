import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaTrashAlt, FaCheck } from 'react-icons/fa';
import { useEdit } from '../../store/useEdit';
import api from '../../../services/api';

const TransactionsList = ({ onEdit }) => {
    const [transactions, setTransactions] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const setEditing = useEdit(state => state.setEditing);

    const fetch = async () => {
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const res = await api.get('/daily-transactions', { params });
            setTransactions(res.data);
        } catch {
            toast.error('خطا در بارگذاری تراکنش‌ها');
        }
    };

    useEffect(() => { fetch(); }, [statusFilter]);

    const handleDelete = async (id) => {
        if (!window.confirm('آیا از حذف این تراکنش اطمینان دارید؟')) return;
        try {
            await api.delete(`/daily-transactions/${id}`);
            toast.success('تراکنش حذف شد');
            fetch();
        } catch { toast.error('خطا در حذف تراکنش'); }
    };

    const handleReturn = async (id) => {
        if (!window.confirm('کتاب بازگردانده شود؟')) return;
        try {
            await api.patch(`/daily-transactions/${id}/return`);
            toast.success('کتاب بازگردانده شد');
            fetch();
        } catch { toast.error('خطا در بازگردانی کتاب'); }
    };

    const handleEdit = (tx) => {
        setEditing(tx, 'transaction');
        onEdit();
    };

    const formatDuration = (hours) => {
        if (hours === null || hours === undefined) return '-';
        const totalMinutes = Math.round(hours * 60);
        if (totalMinutes < 60) return `${totalMinutes} دقیقه`;
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        if (m === 0) return `${h} ساعت`;
        return `${h} ساعت ${m} دقیقه`;
    };

    return (
        <div className="space-y-4 max-w-full">
            {/* Status Filter */}
            <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600">وضعیت:</label>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100"
                >
                    <option value="">همه (امروز)</option>
                    <option value="ongoing">در حال امانت</option>
                    <option value="returned">بازگردانده شده</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                                <th className="text-right px-6 py-3">مراجعه‌کننده</th>
                                <th className="text-right px-6 py-3">کتاب</th>
                                <th className="text-right px-6 py-3">زمان دریافت</th>
                                <th className="text-right px-6 py-3">زمان برگشت</th>
                                <th className="text-right px-6 py-3">مدت</th>
                                <th className="text-right px-6 py-3">وضعیت</th>
                                <th className="text-right px-6 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-400">تراکنشی ثبت نشده است.</td>
                                </tr>
                            )}
                            {transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {tx.visitor_name} {tx.visitor_lastname}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{tx.book_title}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(tx.taken_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {tx.returned_at
                                            ? new Date(tx.returned_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{formatDuration(tx.hours_borrowed)}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${tx.status === 'ongoing'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {tx.status === 'ongoing' ? 'در حال امانت' : 'بازگردانده'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleEdit(tx)} className="text-blue-600 hover:text-blue-800 transition" title="ویرایش">
                                                <FaEdit size={16} />
                                            </button>
                                            {tx.status === 'ongoing' && (
                                                <button onClick={() => handleReturn(tx.id)} className="text-green-600 hover:text-green-800 transition" title="بازگردانی">
                                                    <FaCheck size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(tx.id)} className="text-red-500 hover:text-red-700 transition" title="حذف">
                                                <FaTrashAlt size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionsList;
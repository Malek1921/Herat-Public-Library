import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useEdit } from '../../store/useEdit';
import api from '../../../services/api';  // using your api instance

const TransactionsList = ({ onEdit }) => {
    const [transactions, setTransactions] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const setEditing = useEdit(state => state.setEditing);

    const fetch = async () => {
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const res = await api.get('/daily-transactions', { params });
            setTransactions(res.data);
        } catch (err) {
            toast.error('Failed to load transactions');
        }
    };

    useEffect(() => { fetch(); }, [statusFilter]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await api.delete(`/daily-transactions/${id}`);
            toast.success('Deleted');
            fetch();
        } catch { toast.error('Failed to delete'); }
    };

    const handleReturn = async (id) => {
        if (!window.confirm('Mark as returned?')) return;
        try {
            await api.patch(`/daily-transactions/${id}/return`);
            toast.success('Book returned');
            fetch();
        } catch { toast.error('Failed to return'); }
    };

    const handleEdit = (tx) => {
        setEditing(tx, 'transaction');
        onEdit();
    };

    const formatHours = (h) => {
        if (!h && h !== 0) return '-';
        const hours = Math.floor(h);
        const mins = Math.round((h - hours) * 60);
        return `${hours}h ${mins}m`;
    };

    return (
        <div>
            <div className="mb-4 flex items-center gap-2">
                <label>Status:</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1">
                    <option value="">All (today)</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="returned">Returned</option>
                </select>
            </div>
            <table className="min-w-full bg-white rounded shadow">
                <thead>
                    <tr>
                        <th className="py-2 px-3 border-b">Visitor</th>
                        <th className="py-2 px-3 border-b">Book</th>
                        <th className="py-2 px-3 border-b">Taken</th>
                        <th className="py-2 px-3 border-b">Returned</th>
                        <th className="py-2 px-3 border-b">Duration</th>
                        <th className="py-2 px-3 border-b">Status</th>
                        <th className="py-2 px-3 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id}>
                            <td className="py-2 px-3 border-b">{tx.visitor_name} {tx.visitor_lastname}</td>
                            <td className="py-2 px-3 border-b">{tx.book_title}</td>
                            <td className="py-2 px-3 border-b">{new Date(tx.taken_at).toLocaleTimeString()}</td>
                            <td className="py-2 px-3 border-b">{tx.returned_at ? new Date(tx.returned_at).toLocaleTimeString() : '-'}</td>
                            <td className="py-2 px-3 border-b">{formatHours(tx.hours_borrowed)}</td>
                            <td className="py-2 px-3 border-b">
                                <span className={`px-2 py-1 rounded-full text-xs ${tx.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{tx.status}</span>
                            </td>
                            <td className="py-2 px-3 border-b">
                                <button onClick={() => handleEdit(tx)} className="text-blue-600 mr-2">Edit</button>
                                {tx.status === 'ongoing' && <button onClick={() => handleReturn(tx.id)} className="text-green-600 mr-2">Return</button>}
                                <button onClick={() => handleDelete(tx.id)} className="text-red-600">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionsList;
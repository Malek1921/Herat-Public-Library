import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useEdit } from '../../store/useEdit';
import api from '../../../services/api';

const EditTransaction = ({ onSuccess }) => {
    const { editingItem, clearEditing } = useEdit();
    const [books, setBooks] = useState([]);
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await api.get('/books');
                const data = res.data;
                const bookList = Array.isArray(data) ? data : data.rows || data.data || [];
                setBooks(bookList);
            } catch { }
        };
        fetchBooks();
    }, []);

    useEffect(() => {
        if (editingItem) {
            reset({
                visitor_name: editingItem.visitor_name || '',
                visitor_lastname: editingItem.visitor_lastname || '',
                father_name: editingItem.father_name || '',
                job_or_major: editingItem.job_or_major || '',
                address: editingItem.address || '',
                phone: editingItem.phone || '',
                book_id: editingItem.book_id || '',
                notes: editingItem.notes || '',
            });
        }
    }, [editingItem, reset]);

    const onSubmit = async (data) => {
        try {
            await api.put(`/daily-transactions/${editingItem.id}`, {
                ...data,
                book_id: parseInt(data.book_id),
            });
            toast.success('Updated');
            clearEditing();
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update');
        }
    };

    const handleReturn = async () => {
        if (!window.confirm('Mark as returned?')) return;
        try {
            await api.patch(`/daily-transactions/${editingItem.id}/return`);
            toast.success('Returned');
            clearEditing();
            onSuccess();
        } catch { toast.error('Failed'); }
    };

    if (!editingItem) return <div className="text-center">No transaction selected.</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Transaction #{editingItem.id}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label>First Name *</label>
                    <input className="w-full border p-2 rounded" {...register('visitor_name', { required: true })} />
                </div>
                <div>
                    <label>Last Name *</label>
                    <input className="w-full border p-2 rounded" {...register('visitor_lastname', { required: true })} />
                </div>
                <div>
                    <label>Father's Name</label>
                    <input className="w-full border p-2 rounded" {...register('father_name')} />
                </div>
                <div>
                    <label>Job / Major</label>
                    <input className="w-full border p-2 rounded" {...register('job_or_major')} />
                </div>
                <div className="col-span-2">
                    <label>Address</label>
                    <input className="w-full border p-2 rounded" {...register('address')} />
                </div>
                <div>
                    <label>Phone</label>
                    <input className="w-full border p-2 rounded" {...register('phone')} />
                </div>
            </div>

            <div className="mt-4">
                <label>Book *</label>
                <select className="w-full border p-2 rounded" {...register('book_id', { required: true })}>
                    <option value="">-- Select --</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
            </div>

            <div className="mt-4">
                <label>Notes</label>
                <textarea className="w-full border p-2 rounded" {...register('notes')}></textarea>
            </div>

            <div className="mt-6 flex gap-3">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Update</button>
                {editingItem.status === 'ongoing' && (
                    <button type="button" onClick={handleReturn} className="bg-yellow-500 text-white px-6 py-2 rounded">Mark Returned</button>
                )}
                <button type="button" onClick={() => { clearEditing(); onSuccess(); }} className="bg-gray-300 px-6 py-2 rounded">Cancel</button>
            </div>
        </form>
    );
};

export default EditTransaction;
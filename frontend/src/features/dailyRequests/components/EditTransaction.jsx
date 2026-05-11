import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useEdit } from '../../store/useEdit';
import api from '../../../services/api';

let debounceTimer;

const EditTransaction = ({ onSuccess }) => {
    const { editingItem, clearEditing } = useEdit();
    const [bookResults, setBookResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const searchBooks = (term) => {
        clearTimeout(debounceTimer);
        if (!term || term.length < 1) {
            setBookResults([]);
            return;
        }
        setIsSearching(true);
        debounceTimer = setTimeout(async () => {
            try {
                const res = await api.get('/books', { params: { q: term, limit: 10 } });
                const data = res.data.data || res.data.rows || [];
                setBookResults(Array.isArray(data) ? data.filter(b => b.title) : []);
            } catch {
                toast.error('جستجو با خطا مواجه شد');
                setBookResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    useEffect(() => {
        if (editingItem) {
            reset({
                visitor_name: editingItem.visitor_name || '',
                visitor_lastname: editingItem.visitor_lastname || '',
                father_name: editingItem.father_name || '',
                job_or_major: editingItem.job_or_major || '',
                address: editingItem.address || '',
                phone: editingItem.phone || '',
                notes: editingItem.notes || '',
            });
            setSearchTerm(editingItem.book_title || '');
            setValue('book_id', editingItem.book_id || '');
        }
    }, [editingItem, reset, setValue]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        setValue('book_id', '', { shouldValidate: true });
        if (val.trim()) {
            searchBooks(val);
            setShowDropdown(true);
        } else {
            setBookResults([]);
            setShowDropdown(false);
        }
    };

    const handleSelectBook = (book) => {
        setSearchTerm(book.title);
        setValue('book_id', book.id, { shouldValidate: true });
        setShowDropdown(false);
        setBookResults([]);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onSubmit = async (data) => {
        if (!editingItem) return;
        try {
            await api.put(`/daily-transactions/${editingItem.id}`, {
                ...data,
                book_id: parseInt(data.book_id),
            });
            toast.success('تراکنش بروزرسانی شد');
            clearEditing();
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.error || 'خطا در بروزرسانی');
        }
    };

    const handleReturn = async () => {
        if (!window.confirm('کتاب بازگردانده شود؟')) return;
        try {
            await api.patch(`/daily-transactions/${editingItem.id}/return`);
            toast.success('کتاب بازگردانده شد');
            clearEditing();
            onSuccess();
        } catch { toast.error('خطا در بازگردانی'); }
    };

    if (!editingItem) {
        return <div className="text-center py-10 text-gray-500">تراکنشی انتخاب نشده است. به لیست بروید و روی ویرایش کلیک کنید.</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm max-w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6">ویرایش تراکنش #{editingItem.id}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام *</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2" {...register('visitor_name', { required: true })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تخلص *</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2" {...register('visitor_lastname', { required: true })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام پدر</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2" {...register('father_name')} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">شغل / رشته</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2" {...register('job_or_major')} />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">آدرس</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2" {...register('address')} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تلفن</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2" {...register('phone')} />
                </div>
            </div>

            {/* Book Search */}
            <div className="mt-4 relative" ref={wrapperRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">کتاب *</label>
                <input
                    type="text"
                    placeholder="جستجوی کتاب..."
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => { if (bookResults.length) setShowDropdown(true); }}
                />
                <input type="hidden" {...register('book_id', { required: 'یک کتاب انتخاب کنید' })} />
                {errors.book_id && <span className="text-red-500 text-xs">{errors.book_id.message}</span>}

                {showDropdown && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {isSearching && <div className="px-3 py-2 text-gray-500">در حال جستجو...</div>}
                        {!isSearching && bookResults.length === 0 && searchTerm && (
                            <div className="px-3 py-2 text-gray-500">کتابی یافت نشد</div>
                        )}
                        {bookResults.map(book => (
                            <div
                                key={book.id}
                                className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                onClick={() => handleSelectBook(book)}
                            >
                                <span className="text-gray-800">{book.title}</span>
                                {book.isbn && <span className="text-xs text-gray-400">{book.isbn}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">یادداشت</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-2" {...register('notes')}></textarea>
            </div>

            <div className="mt-6 flex gap-3">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                    بروزرسانی
                </button>
                {editingItem.status === 'ongoing' && (
                    <button type="button" onClick={handleReturn} className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition">
                        بازگردانی کتاب
                    </button>
                )}
                <button type="button" onClick={() => { clearEditing(); onSuccess(); }} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition">
                    انصراف
                </button>
            </div>
        </form>
    );
};

export default EditTransaction;
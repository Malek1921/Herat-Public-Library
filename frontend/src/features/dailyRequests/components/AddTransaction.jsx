import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { debounce } from 'lodash'; // or use your own debounce
import api from '../../../services/api';

const AddTransaction = ({ onSuccess }) => {
    const [bookResults, setBookResults] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null); // { id, title }
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    // Search function – debounced to avoid hammering the server
    const searchBooks = useCallback(
        debounce(async (term) => {
            if (!term || term.length < 1) {
                setBookResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await api.get('/books', { params: { q: term, limit: 10 } });
                // Backend returns { total, page, limit, data: [...] }
                const data = res.data.data || res.data.rows || [];
                setBookResults(Array.isArray(data) ? data.filter(b => b.title) : []);
            } catch {
                toast.error('Search failed');
                setBookResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300),
        []
    );

    // Handle input change
    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        setSelectedBook(null); // clear selection if user starts typing again
        setValue('book_id', '', { shouldValidate: true });
        if (val.trim()) {
            searchBooks(val);
            setShowDropdown(true);
        } else {
            setBookResults([]);
            setShowDropdown(false);
        }
    };

    // Select a book from dropdown
    const handleSelectBook = (book) => {
        setSelectedBook(book);
        setSearchTerm(book.title);
        setValue('book_id', book.id, { shouldValidate: true });
        setShowDropdown(false);
        setBookResults([]);
    };

    // Close dropdown if clicked outside
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
        try {
            await api.post('/daily-transactions', {
                visitor_name: data.visitor_name,
                visitor_lastname: data.visitor_lastname,
                father_name: data.father_name,
                job_or_major: data.job_or_major,
                address: data.address,
                phone: data.phone,
                book_id: parseInt(data.book_id),
                notes: data.notes,
            });
            toast.success('Transaction created');
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Issue a Book</h2>

            {/* Visitor fields (same as before) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label>First Name *</label>
                    <input className="w-full border p-2 rounded" {...register('visitor_name', { required: true })} />
                    {errors.visitor_name && <span className="text-red-500 text-sm">Required</span>}
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

            {/* BOOK SEARCH COMBOBOX */}
            <div className="mt-4 relative" ref={wrapperRef}>
                <label className="block mb-1">Book *</label>
                <input
                    type="text"
                    placeholder="Search book by title..."
                    className="w-full border p-2 rounded"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => { if (bookResults.length) setShowDropdown(true); }}
                />
                {/* Hidden input for actual book_id (validated by react-hook-form) */}
                <input type="hidden" {...register('book_id', { required: 'Please select a book' })} />
                {errors.book_id && <span className="text-red-500 text-sm">{errors.book_id.message}</span>}

                {/* Dropdown */}
                {showDropdown && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {isSearching && <div className="px-3 py-2 text-gray-500">Searching...</div>}
                        {!isSearching && bookResults.length === 0 && searchTerm && (
                            <div className="px-3 py-2 text-gray-500">No books found</div>
                        )}
                        {bookResults.map(book => (
                            <div
                                key={book.id}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                onClick={() => handleSelectBook(book)}
                            >
                                <span>{book.title}</span>
                                <span className="text-xs text-gray-400">{book.isbn}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes */}
            <div className="mt-4">
                <label>Notes</label>
                <textarea className="w-full border p-2 rounded" {...register('notes')}></textarea>
            </div>

            <button type="submit" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded">Issue Book</button>
        </form>
    );
};

export default AddTransaction;
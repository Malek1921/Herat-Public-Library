import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../../services/api';

let debounceTimer;

const AddTransaction = ({ onSuccess }) => {
  const [bookResults, setBookResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

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
      toast.success('کتاب با موفقیت امانت داده شد');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'خطا در ثبت امانت');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm max-w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">امانت کتاب</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام *</label>
          <input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100" {...register('visitor_name', { required: 'نام الزامی است' })} />
          {errors.visitor_name && <span className="text-red-500 text-xs">{errors.visitor_name.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تخلص *</label>
          <input className="w-full border border-gray-300 rounded-lg p-2" {...register('visitor_lastname', { required: 'تخلص الزامی است' })} />
          {errors.visitor_lastname && <span className="text-red-500 text-xs">الزامی</span>}
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
          placeholder="جستجوی کتاب با عنوان..."
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
                className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition"
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
        <textarea className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-100" {...register('notes')}></textarea>
      </div>

      <button type="submit" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
        ثبت امانت
      </button>
    </form>
  );
};

export default AddTransaction;
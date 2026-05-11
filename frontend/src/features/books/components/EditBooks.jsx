import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useEdit } from '../../store/useEdit';
import api from '../../../services/api';
import SearchableMultiSelect from '../../../components/SearchableMultiSelect';

const EditBook = ({ onSuccess }) => {
  const { editingItem, clearEditing } = useEdit();
  const { register, handleSubmit, reset, control, getValues, formState: { errors } } = useForm({
    defaultValues: { copies: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'copies' });

  const [authorItems, setAuthorItems] = useState([]);
  const [translatorItems, setTranslatorItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [removedCopyIds, setRemovedCopyIds] = useState([]);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [cat, sub, lang, pub] = await Promise.all([
          api.get('/lookups/categories'),
          api.get('/lookups/subjects'),
          api.get('/lookups/languages'),
          api.get('/lookups/publishers'),
        ]);
        setCategories(cat.data);
        setSubjects(sub.data);
        setLanguages(lang.data);
        setPublishers(pub.data);
      } catch { }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    if (!editingItem) return;
    const loadCopies = async () => {
      try {
        const res = await api.get(`/books/${editingItem.id}/copies`);
        const existingCopies = res.data || [];
        reset({
          title: editingItem.title || '',
          edition: editingItem.edition || '',
          volume_type: editingItem.volume_type || '',
          page_count: editingItem.page_count || '',
          isbn: editingItem.isbn || '',
          unit_price: editingItem.unit_price || '',
          total_price: editingItem.total_price || '',
          publication_year: editingItem.publication_year || '',
          series_count: editingItem.series_count || 1,
          volume_count: editingItem.volume_count || 1,
          category_id: editingItem.category_id || '',
          subject_id: editingItem.subject_id || '',
          language_id: editingItem.language_id || '',
          publisher_id: editingItem.publisher_id || '',
          keywords: editingItem.keywords || '',
          notes: editingItem.notes || '',
          details: editingItem.details || '',
          copies: existingCopies.map(c => ({
            id: c.id,
            shelf: c.shelf || '',
            row_slot: c.row_slot || '',
            hall: c.hall || '',
            hall_manager: c.hall_manager || '',
            binding_condition: c.binding_condition || '',
            date_received: c.date_received ? c.date_received.slice(0, 10) : '',
          })),
        });
        const authorsArr = editingItem.authors || [];
        const authorIdsArr = editingItem.author_ids || [];
        setAuthorItems(
          authorIdsArr.map((id, idx) => ({ id, full_name: authorsArr[idx] || id.toString() }))
        );
        const translatorsArr = editingItem.translators || [];
        const translatorIdsArr = editingItem.translator_ids || [];
        setTranslatorItems(
          translatorIdsArr.map((id, idx) => ({ id, full_name: translatorsArr[idx] || id.toString() }))
        );
      } catch { }
    };
    loadCopies();
  }, [editingItem, reset]);

  const onSubmit = async (formData) => {
    if (!editingItem) return;
    try {
      await api.put(`/books/${editingItem.id}`, {
        title: formData.title,
        edition: formData.edition,
        volume_type: formData.volume_type,
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
        isbn: formData.isbn,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        total_price: formData.total_price ? parseFloat(formData.total_price) : null,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
        series_count: formData.series_count ? parseInt(formData.series_count) : 1,
        volume_count: formData.volume_count ? parseInt(formData.volume_count) : 1,
        keywords: formData.keywords,
        notes: formData.notes,
        details: formData.details,
        language_id: formData.language_id ? parseInt(formData.language_id) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        subject_id: formData.subject_id ? parseInt(formData.subject_id) : null,
        publisher_id: formData.publisher_id ? parseInt(formData.publisher_id) : null,
        author_ids: authorItems.map(i => i.id),
        translator_ids: translatorItems.map(i => i.id),
      });
      const copies = formData.copies || [];
      for (const copy of copies) {
        if (copy.id) {
          await api.put(`/copies/${copy.id}`, { shelf: copy.shelf, row_slot: copy.row_slot, hall: copy.hall, hall_manager: copy.hall_manager, binding_condition: copy.binding_condition, date_received: copy.date_received || null });
        } else {
          await api.post('/copies', { book_id: editingItem.id, shelf: copy.shelf, row_slot: copy.row_slot, hall: copy.hall, hall_manager: copy.hall_manager, binding_condition: copy.binding_condition, date_received: copy.date_received || null });
        }
      }
      for (const id of removedCopyIds) {
        await api.delete(`/copies/${id}`);
      }
      toast.success('کتاب بروزرسانی شد');
      clearEditing();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'خطا در بروزرسانی کتاب');
    }
  };

  const handleRemoveCopy = (index) => {
    const copyId = getValues(`copies.${index}.id`);
    if (copyId) setRemovedCopyIds(prev => [...prev, parseInt(copyId)]);
    remove(index);
  };

  if (!editingItem) {
    return <div className="text-center py-10 text-gray-500">کتابی انتخاب نشده است. به لیست بروید و روی ویرایش کلیک کنید.</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm max-w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">ویرایش کتاب #{editingItem.id}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">عنوان *</label>
          <input className="w-full border border-gray-300 rounded-lg p-2" {...register('title', { required: 'عنوان الزامی است' })} />
          {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">نویسندگان</label>
          <SearchableMultiSelect endpoint="/authors" selectedItems={authorItems} onChange={(ids, items) => setAuthorItems(items)} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">مترجمان</label>
          <SearchableMultiSelect endpoint="/translators" selectedItems={translatorItems} onChange={(ids, items) => setTranslatorItems(items)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نوبت چاپ</label>
          <input className="w-full border border-gray-300 rounded-lg p-2" {...register('edition')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نوع جلد/نسخه</label>
          <select className="w-full border border-gray-300 rounded-lg p-2" {...register('volume_type')}>
            <option value="">--</option>
            <option value="جلد">جلد</option>
            <option value="دوره">دوره</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تعداد صفحات</label>
          <input type="number" className="w-full border border-gray-300 rounded-lg p-2" {...register('page_count')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">شابک</label>
          <input className="w-full border border-gray-300 rounded-lg p-2" {...register('isbn')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">قیمت واحد</label>
          <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg p-2" {...register('unit_price')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">قیمت کل</label>
          <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg p-2" {...register('total_price')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">سال نشر</label>
          <input type="number" className="w-full border border-gray-300 rounded-lg p-2" {...register('publication_year')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تعداد جلد/دوره</label>
          <input type="number" className="w-full border border-gray-300 rounded-lg p-2" {...register('series_count')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تعداد نسخه</label>
          <input type="number" className="w-full border border-gray-300 rounded-lg p-2" {...register('volume_count')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
          <select className="w-full border border-gray-300 rounded-lg p-2" {...register('category_id')}>
            <option value="">--</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">موضوع</label>
          <select className="w-full border border-gray-300 rounded-lg p-2" {...register('subject_id')}>
            <option value="">--</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">زبان</label>
          <select className="w-full border border-gray-300 rounded-lg p-2" {...register('language_id')}>
            <option value="">--</option>
            {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ناشر</label>
          <select className="w-full border border-gray-300 rounded-lg p-2" {...register('publisher_id')}>
            <option value="">--</option>
            {publishers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.city})</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">کلمات کلیدی</label>
          <input className="w-full border border-gray-300 rounded-lg p-2" {...register('keywords')} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">یادداشت</label>
          <textarea className="w-full border border-gray-300 rounded-lg p-2" {...register('notes')}></textarea>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">جزئیات</label>
          <textarea className="w-full border border-gray-300 rounded-lg p-2" {...register('details')}></textarea>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">نسخه‌های فیزیکی</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
            <input type="hidden" {...register(`copies.${index}.id`)} />
            <div>
              <label className="block text-xs text-gray-600 mb-1">قفسه</label>
              <input className="w-full border border-gray-300 rounded-lg p-1" {...register(`copies.${index}.shelf`)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">ردیف</label>
              <input className="w-full border border-gray-300 rounded-lg p-1" {...register(`copies.${index}.row_slot`)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">تالار</label>
              <input className="w-full border border-gray-300 rounded-lg p-1" {...register(`copies.${index}.hall`)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">مسئول</label>
              <input className="w-full border border-gray-300 rounded-lg p-1" {...register(`copies.${index}.hall_manager`)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">نوع صحافی</label>
              <input className="w-full border border-gray-300 rounded-lg p-1" {...register(`copies.${index}.binding_condition`)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">تاریخ دریافت</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg p-1" {...register(`copies.${index}.date_received`)} />
            </div>
            <div className="flex items-end justify-center">
              <button type="button" onClick={() => handleRemoveCopy(index)} className="text-red-600 text-sm hover:underline">حذف</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => append({ id: null, shelf: '', row_slot: '', hall: '', hall_manager: '', binding_condition: '', date_received: '' })} className="text-blue-600 text-sm underline mt-2">
          + افزودن نسخه دیگر
        </button>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
          بروزرسانی کتاب
        </button>
        <button type="button" onClick={() => { clearEditing(); onSuccess(); }} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition">
          انصراف
        </button>
      </div>
    </form>
  );
};

export default EditBook;
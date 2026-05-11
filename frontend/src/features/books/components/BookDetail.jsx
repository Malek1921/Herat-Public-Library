const BookDetail = ({ book, copies }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
                <h3 className="font-bold text-lg text-gray-800 mb-3">{book.title}</h3>
                <div className="grid grid-cols-2 gap-2">
                    <p><span className="font-medium text-gray-700">شابک:</span> {book.isbn || '-'}</p>
                    <p><span className="font-medium text-gray-700">نوبت چاپ:</span> {book.edition || '-'}</p>
                    <p><span className="font-medium text-gray-700">نوع جلد/نسخه:</span> {book.volume_type || '-'}</p>
                    <p><span className="font-medium text-gray-700">تعداد صفحات:</span> {book.page_count || '-'}</p>
                    <p><span className="font-medium text-gray-700">سال نشر:</span> {book.publication_year || '-'}</p>
                    <p><span className="font-medium text-gray-700">قیمت واحد:</span> {book.unit_price ?? '-'}</p>
                    <p><span className="font-medium text-gray-700">قیمت کل:</span> {book.total_price ?? '-'}</p>
                    <p><span className="font-medium text-gray-700">تعداد جلد/دوره:</span> {book.series_count ?? 1}</p>
                    <p><span className="font-medium text-gray-700">تعداد نسخه:</span> {book.volume_count ?? 1}</p>
                    <p><span className="font-medium text-gray-700">زبان:</span> {book.language || '-'}</p>
                    <p><span className="font-medium text-gray-700">دسته‌بندی:</span> {book.category || '-'}</p>
                    <p><span className="font-medium text-gray-700">موضوع:</span> {book.subject || '-'} {book.dewey_number ? `(دیوئی: ${book.dewey_number})` : ''}</p>
                    <p><span className="font-medium text-gray-700">ناشر:</span> {book.publisher || '-'}{book.publisher_city ? `، ${book.publisher_city}` : ''}</p>
                </div>
                <p><span className="font-medium text-gray-700">کلمات کلیدی:</span> {book.keywords || '-'}</p>
                <p><span className="font-medium text-gray-700">یادداشت:</span> {book.notes || '-'}</p>
                <p><span className="font-medium text-gray-700">جزئیات:</span> {book.details || '-'}</p>
            </div>
            <div className="space-y-4">
                <div>
                    <h4 className="font-bold text-gray-800">نویسندگان ({book.authors?.length || 0})</h4>
                    <ul className="list-disc list-inside text-gray-600">
                        {book.authors?.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800">مترجمان ({book.translators?.length || 0})</h4>
                    <ul className="list-disc list-inside text-gray-600">
                        {book.translators?.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800">نسخه‌های فیزیکی ({copies.length})</h4>
                    {copies.length === 0 ? (
                        <p className="text-gray-500">بدون نسخه</p>
                    ) : (
                        <div className="overflow-x-auto mt-2">
                            <table className="min-w-full text-xs border">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-1">قفسه</th>
                                        <th className="p-1">ردیف</th>
                                        <th className="p-1">تالار</th>
                                        <th className="p-1">مسئول</th>
                                        <th className="p-1">وضعیت</th>
                                        <th className="p-1">تاریخ دریافت</th>
                                        <th className="p-1">امانت</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {copies.map((copy) => (
                                        <tr key={copy.id} className="border-b">
                                            <td className="p-1">{copy.shelf || '-'}</td>
                                            <td className="p-1">{copy.row_slot || '-'}</td>
                                            <td className="p-1">{copy.hall || '-'}</td>
                                            <td className="p-1">{copy.hall_manager || '-'}</td>
                                            <td className="p-1">{copy.binding_condition || '-'}</td>
                                            <td className="p-1">{copy.date_received ? new Date(copy.date_received).toLocaleDateString('fa-IR') : '-'}</td>
                                            <td className="p-1">{copy.is_loaned ? 'بله' : 'خیر'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookDetail;
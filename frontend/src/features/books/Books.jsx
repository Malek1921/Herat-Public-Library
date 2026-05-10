import { useState } from 'react';
import { AddBook } from './components/AddBooks';
import { EditBook } from './components/EditBooks';
import { BooksList } from './components/BooksList';

export function Books() {
  const [tab, setTab] = useState('list');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-right">📚 مدیریت کتاب‌ها</h1>
          <p className="text-gray-600 text-right mt-2">مشاهده، افزودن و ویرایش کتاب‌ها</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 border-b">
          <div className="flex gap-4 p-4 text-right">
            <button
              onClick={() => setTab('list')}
              className={`pb-2 px-4 font-medium transition ${tab === 'list'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              📖 لیست کتاب‌ها
            </button>
            <button
              onClick={() => setTab('add')}
              className={`pb-2 px-4 font-medium transition ${tab === 'add'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              ➕ کتاب جدید
            </button>
            <button
              onClick={() => setTab('edit')}

              className={`pb-2 px-4 font-medium transition ${tab === 'edit'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              ✏️ ویرایش
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {tab === 'list' && <BooksList setTab={setTab} />}
          {tab === 'add' && <AddBook onSuccess={() => setTab('list')} />}
          {tab === 'edit' && <EditBook onSuccess={() => setTab('list')} setTab={setTab} />}
        </div>
      </div>
    </div>
  );
}
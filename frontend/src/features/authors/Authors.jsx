// frontend/src/features/authors/Authors.jsx
import { useState } from 'react';
import AuthorsList from './components/AuthorsList';
import AddAuthor from './components/AddAuthor';
import EditAuthor from './components/EditAuthor';

const Authors = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">نویسندگان</h1>
        <p className="text-gray-500 mt-1">مدیریت نویسندگان کتابخانه</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'list', label: 'لیست نویسندگان' },
          { key: 'add', label: 'افزودن نویسنده' },
          { key: 'edit', label: 'ویرایش نویسنده' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 ${activeTab === tab.key
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'list' && <AuthorsList onEdit={() => setActiveTab('edit')} />}
        {activeTab === 'add' && <AddAuthor onSuccess={() => setActiveTab('list')} />}
        {activeTab === 'edit' && <EditAuthor onSuccess={() => setActiveTab('list')} />}
      </div>
    </div>
  );
};

export default Authors;
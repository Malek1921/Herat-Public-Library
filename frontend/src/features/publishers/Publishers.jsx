// frontend/src/features/publishers/Publishers.jsx
import { useState } from 'react';
import PublishersList from './components/PublishersList';
import AddPublisher from './components/AddPublisher';
import EditPublisher from './components/EditPublisher';

const Publishers = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">ناشران</h1>
        <p className="text-gray-500 mt-1">مدیریت ناشران کتابخانه</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'list', label: 'لیست ناشران' },
          { key: 'add', label: 'افزودن ناشر' },
          { key: 'edit', label: 'ویرایش ناشر' },
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
        {activeTab === 'list' && <PublishersList onEdit={() => setActiveTab('edit')} />}
        {activeTab === 'add' && <AddPublisher onSuccess={() => setActiveTab('list')} />}
        {activeTab === 'edit' && <EditPublisher onSuccess={() => setActiveTab('list')} />}
      </div>
    </div>
  );
};

export default Publishers;
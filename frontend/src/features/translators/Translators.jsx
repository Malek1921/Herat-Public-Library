import { useState } from 'react';
import TranslatorsList from './components/TranslatorsList';
import AddTranslator from './components/AddTranslator';
import EditTranslator from './components/EditTranslator';

const Translators = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">مترجمان</h1>
        <p className="text-gray-500 mt-1">مدیریت مترجمان کتابخانه</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'list', label: 'لیست مترجمان' },
          { key: 'add', label: 'افزودن مترجم' },
          { key: 'edit', label: 'ویرایش مترجم' },
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
        {activeTab === 'list' && <TranslatorsList onEdit={() => setActiveTab('edit')} />}
        {activeTab === 'add' && <AddTranslator onSuccess={() => setActiveTab('list')} />}
        {activeTab === 'edit' && <EditTranslator onSuccess={() => setActiveTab('list')} />}
      </div>
    </div>
  );
};

export default Translators;
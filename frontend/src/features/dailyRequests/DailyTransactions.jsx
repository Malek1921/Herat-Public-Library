import { useState } from 'react';
import TransactionsList from './components/TransactionsList';
import AddTransaction from './components/AddTransaction';
import EditTransaction from './components/EditTransaction';

const DailyTransactions = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">تراکنش‌های روزانه</h1>
        <p className="text-gray-500 mt-1">مدیریت امانت کتاب‌ها به صورت روزانه</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'list', label: 'لیست امروز' },
          { key: 'add', label: 'امانت کتاب' },
          { key: 'edit', label: 'ویرایش تراکنش' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'list' && <TransactionsList onEdit={() => setActiveTab('edit')} />}
        {activeTab === 'add' && <AddTransaction onSuccess={() => setActiveTab('list')} />}
        {activeTab === 'edit' && <EditTransaction onSuccess={() => setActiveTab('list')} />}
      </div>
    </div>
  );
};

export default DailyTransactions;
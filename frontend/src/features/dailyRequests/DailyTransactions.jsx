import { useState } from 'react';
import TransactionsList from './components/TransactionsList';
import AddTransaction from './components/AddTransaction';
import EditTransaction from './components/EditTransaction';

const DailyTransactions = () => {
    const [activeTab, setActiveTab] = useState('list');

    return (
        <div className="p-4">
            <div className="flex space-x-4 mb-4">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-4 py-2 rounded ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Today's List
                </button>
                <button
                    onClick={() => setActiveTab('add')}
                    className={`px-4 py-2 rounded ${activeTab === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Issue Book
                </button>
                <button
                    onClick={() => setActiveTab('edit')}
                    className={`px-4 py-2 rounded ${activeTab === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Edit Transaction
                </button>
            </div>

            {activeTab === 'list' && <TransactionsList onEdit={() => setActiveTab('edit')} />}
            {activeTab === 'add' && <AddTransaction onSuccess={() => setActiveTab('list')} />}
            {activeTab === 'edit' && <EditTransaction onSuccess={() => setActiveTab('list')} />}
        </div>
    );
};

export default DailyTransactions;
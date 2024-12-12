import React, { useState, useEffect } from 'react';
import { UserService, TransactionService } from '../services';
import toast from 'react-hot-toast';
import HistoryFilters from './history/HistoryFilters';
import TransactionList from './history/TransactionList';
import DisputeModal from './DisputeModal';

type FilterStatus = 'all' | 'completed' | 'pending' | 'failed';

interface Transaction {
  id: number;
  taskId?: number;
  amount: string | number;
  type: 'earning' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed';
  created_at?: string;
  createdAt?: string;
  task?: {
    title: string;
  };
}

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [disputeSubmission, setDisputeSubmission] = useState<Transaction | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [profileData, transactionsData] = await Promise.all([
        UserService.getProfile(),
        TransactionService.getTransactions(),
      ]);

      setTransactions(transactionsData);
      setDebugInfo({
        profile: profileData,
        transactions: transactionsData,
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    if (currentFilter === 'all') return true;
    return transaction.status === currentFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Task History</h1>
          <p className="mt-1 text-gray-500">
            View your completed, pending, and rejected tasks
          </p>
        </div>

        <HistoryFilters
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <TransactionList
            transactions={filteredTransactions}
            onDisputeClick={setDisputeSubmission}
          />
        </div>

        {disputeSubmission && (
          <DisputeModal
            submissionId={disputeSubmission.id}
            onClose={() => setDisputeSubmission(null)}
            onSuccess={() => {
              setDisputeSubmission(null);
              fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
}
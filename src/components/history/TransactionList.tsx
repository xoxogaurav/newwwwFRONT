import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { isWithin24Hours } from '../../utils/dateUtils';
import { getTransactionStyles } from './transactionStyles';
import { formatDate } from './dateFormatter';
import TransactionIcon from './TransactionIcon';

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

interface TransactionListProps {
  transactions: Transaction[];
  onDisputeClick: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onDisputeClick }: TransactionListProps) {
  if (!transactions.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {transactions.map((transaction) => {
        const amount =
          typeof transaction.amount === 'string'
            ? parseFloat(transaction.amount)
            : transaction.amount;

        const dateString = transaction.created_at || transaction.createdAt;
        const styles = getTransactionStyles(transaction.type, transaction.status);

        return (
          <div key={transaction.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-full ${styles.bg}`}>
                  <TransactionIcon 
                    type={transaction.type} 
                    status={transaction.status} 
                    className="h-5 w-5"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {transaction.task?.title || 'Withdrawal'}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                    {transaction.status === 'failed' && 
                     transaction.type === 'earning' &&
                     dateString && 
                     isWithin24Hours(dateString) && (
                      <button
                        onClick={() => onDisputeClick(transaction)}
                        className="flex items-center px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Raise Dispute
                      </button>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(dateString)}
                  </div>
                </div>
              </div>
              <div className={`font-medium ${styles.text}`}>
                {styles.prefix}
                {formatCurrency(amount.toFixed(2))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { paginate } from '@/components/TransactionPagination';

// tipe data transaksi
export interface Transaction {
  id: number;
  item: string;
  amount: string;
  date: string;
}

const TransactionSectionUser: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // tampil 2x2

  // Fetch data dari backend (dummy endpoint sekarang)
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // ganti URL ini sesuai endpoint backend kamu
        const res = await fetch('/api/transactions');
        if (!res.ok) throw new Error('Failed to fetch transactions');

        const data: Transaction[] = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTransactions();
  }, []);

  const { data, totalPages } = paginate(transactions, currentPage, pageSize);

  return (
    <section className="max-w-5xl mx-auto">
      {/* Grid 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map(tx => (
          <div
            key={tx.id}
            className="p-4 rounded-xl shadow-sm bg-white flex flex-col justify-between"
          >
            <div>
              <p className="font-medium text-lg">{tx.item}</p>
              <p className="text-sm text-gray-500">{tx.date}</p>
            </div>
            <span className="text-blue-600 font-semibold text-right mt-2">
              {tx.amount}
            </span>
          </div>
        ))}
        {data.length === 0 && (
          <p className="col-span-2 text-center text-gray-500">
            No transactions found.
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      {transactions.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default TransactionSectionUser;

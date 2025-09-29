'use client';

import React from 'react';

const transactions = [
  { id: 1, item: 'Event Ticket', amount: '$25', date: '2025-09-28' },
  { id: 2, item: 'Merch Purchase', amount: '$40', date: '2025-09-29' },
];

const TransactionSectionUser: React.FC = () => {
  return (
    <section className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Transactions</h2>
      <ul className="space-y-4">
        {transactions.map(tx => (
          <li
            key={tx.id}
            className="flex justify-between items-center p-4 border rounded shadow-sm"
          >
            <div>
              <p className="font-medium">{tx.item}</p>
              <p className="text-sm text-gray-500">{tx.date}</p>
            </div>
            <span className="text-blue-600 font-semibold">{tx.amount}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TransactionSectionUser;
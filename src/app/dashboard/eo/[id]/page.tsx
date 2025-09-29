'use client';

import React, { useRef } from 'react';
import ProfileSection from '@/components/ProfileSectionUser';
import TransactionSection from '@/components/TransactionSectionUser';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Dashboard: React.FC = () => {
  const profileRef = useRef<HTMLDivElement>(null);
  const transactionRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r p-6">
          <h2 className="text-lg font-semibold mb-6">Dashboard</h2>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => scrollTo(profileRef)}
              className="w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 transition"
            >
              Profile
            </button>
            <button
              onClick={() => scrollTo(transactionRef)}
              className="w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 transition"
            >
              Transactions
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-10 space-y-12">
          <section ref={profileRef} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-medium mb-4">My Profile</h3>
            <ProfileSection />
          </section>

          <section ref={transactionRef} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-medium mb-4">My Transactions</h3>
            <TransactionSection />
          </section>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;

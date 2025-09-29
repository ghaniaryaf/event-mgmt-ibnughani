'use client';

import { PaginationInfo } from '../types/types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const { currentPage, totalPages, totalEvents, eventsPerPage, hasNextPage, hasPrevPage } = pagination;

  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
      {/* Results info - fixed width */}
      <div className="text-sm text-gray-600 min-w-[200px] text-center sm:text-left">
        Showing {(currentPage - 1) * eventsPerPage + 1} to{' '}
        {Math.min(currentPage * eventsPerPage, totalEvents)} of {totalEvents} events
      </div>

      {/* Pagination controls - centered and fixed width */}
      <div className="flex items-center justify-center space-x-1 min-w-[300px]">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
            hasPrevPage
              ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </div>
        </button>

        {/* Page numbers */}
        <div className="flex space-x-1 mx-2">
          {visiblePages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[40px] flex-shrink-0 ${
                page === currentPage
                  ? 'bg-purple-600 text-white'
                  : typeof page === 'number'
                  ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  : 'text-gray-400 cursor-default'
              }`}
              disabled={typeof page !== 'number'}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
            hasNextPage
              ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center">
            Next
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
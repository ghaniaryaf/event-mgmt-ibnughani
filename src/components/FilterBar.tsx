'use client';

import { FilterOptions } from '../types/types';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  locations: string[];
}

const FilterBar = ({ filters, onFilterChange, categories, locations }: FilterBarProps) => {
  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category });
  };

  const handleLocationChange = (location: string) => {
    onFilterChange({ ...filters, location });
  };

  const handlePriceChange = (priceRange: 'all' | 'free' | 'paid') => {
    onFilterChange({ ...filters, priceRange });
  };

  const handleSortChange = (sortOrder: 'newest' | 'oldest') => {
    onFilterChange({ ...filters, sortOrder });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <select
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
          <select
            value={filters.priceRange}
            onChange={(e) => handlePriceChange(e.target.value as 'all' | 'free' | 'paid')}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Sort by Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort by Date</label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest')}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

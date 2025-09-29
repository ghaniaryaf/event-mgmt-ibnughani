'use client';

import { useState, useMemo, useEffect } from 'react';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import EventList from './EventList';
import Pagination from './Pagination';
import { Event, FilterOptions, PaginationInfo } from '../types/types';

interface EventBrowseClientProps {
  events: Event[];
  categories: string[];
  locations: string[];
  defaultFilters: FilterOptions;
  eventsPerPage?: number;
}

const EventBrowseClient = ({ 
  events, 
  categories, 
  locations, 
  defaultFilters, 
  eventsPerPage = 8 
}: EventBrowseClientProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [previousSearchState, setPreviousSearchState] = useState({
    searchQuery: '',
    filters: defaultFilters
  });

  // Filter + Sort
  const filteredEvents = useMemo(() => {
    let result = events.filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !filters.category || event.category === filters.category;
      const matchesLocation = !filters.location || event.location === filters.location;
      const matchesPrice =
        filters.priceRange === 'all' ||
        (filters.priceRange === 'free' && event.price === 0) ||
        (filters.priceRange === 'paid' && event.price > 0);

      return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
    });

    // ✅ Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return filters.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [searchQuery, filters, events]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    const hasSearchChanged = searchQuery !== previousSearchState.searchQuery;
    const hasFiltersChanged = 
      filters.category !== previousSearchState.filters.category ||
      filters.location !== previousSearchState.filters.location ||
      filters.priceRange !== previousSearchState.filters.priceRange ||
      filters.sortOrder !== previousSearchState.filters.sortOrder;

    if (hasSearchChanged || hasFiltersChanged) {
      setCurrentPage(1);
      setPreviousSearchState({
        searchQuery,
        filters: { ...filters }
      });
    }
  }, [searchQuery, filters, previousSearchState]);

  // Pagination
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, currentPage, eventsPerPage]);

  const paginationInfo: PaginationInfo = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const totalPages = Math.ceil(totalEvents / eventsPerPage);
    return {
      currentPage,
      totalPages,
      totalEvents,
      eventsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [filteredEvents, currentPage, eventsPerPage]);

  return (
    <>
      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <SearchBar 
          onSearch={setSearchQuery}
          placeholder="Search for events, categories, or locations..." 
        />
      </div>

      {/* Filters (includes sort) */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        locations={locations}
      />

      {/* Events */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <span className="text-gray-600">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <EventList events={paginatedEvents} emptyMessage="No events match your criteria" />

        <Pagination pagination={paginationInfo} onPageChange={setCurrentPage} />
      </section>
    </>
  );
};

export default EventBrowseClient;

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventBrowseClient from '@/components/EventBrowseClient';
import { FilterOptions } from '@/types/types';
import { mockEvents } from '@/data/mockData';

const categories = Array.from(new Set(mockEvents.map(event => event.category)));
const locations = Array.from(new Set(mockEvents.map(event => event.location)));

const defaultFilters: FilterOptions = {
  category: '',
  location: '',
  priceRange: 'all',
  sortOrder: 'newest'
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find and book tickets to the best events in your city. From concerts to conferences, 
            we've got you covered with thousands of events to choose from.
          </p>
        </section>

        {/* Event Browse Section - Client Component */}
        <EventBrowseClient 
          events={mockEvents}
          categories={categories}
          locations={locations}
          defaultFilters={defaultFilters}
          eventsPerPage={12}
        />
      </main>

      <Footer />
    </div>
  );
}
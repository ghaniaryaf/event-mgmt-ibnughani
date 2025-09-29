import { Event } from '../types/types';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  return (
    <Link href={`/eventdetail/${event.id}`} className="block h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 w-full flex-shrink-0">
          <img
            src={event.imageUrl || "/placeholder-event.jpg"}
            alt={event.title}
            className="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-md">
            <span className={`font-semibold text-sm ${
              event.price === 0 ? 'text-green-600' : 'text-purple-600'
            }`}>
              {formatPrice(event.price)}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight mb-2 min-h-[3rem]">
            {event.title}
          </h3>

          <div className="flex items-center text-gray-600 mb-2">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm truncate">{formatDate(event.date)} • {event.time}</span>
          </div>

          <div className="flex items-center text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm truncate">{event.venue}, {event.location}</span>
          </div>

          <div className="flex justify-between items-center mt-auto">
            <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              {event.category}
            </span>
            <span className="text-xs text-gray-500">
              {event.availableTickets} tickets left
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;

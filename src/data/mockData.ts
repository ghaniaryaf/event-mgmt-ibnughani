import { Event } from '@/types/types';
import { User } from '@/types/types';
import { Transaction } from '@/types/types';

export const mockEvents: Event[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Sample Event ${i + 1}`,
  description: `This is the description for Sample Event ${i + 1}. Enjoy music, networking, and fun!`,
  date: `2025-11-${(i % 28) + 1}`.padStart(10, "0"),
  time: `${8 + (i % 12)}:00`,
  location: ["Jakarta", "Bandung", "Bali", "Surabaya", "Yogyakarta"][i % 5],
  category: ["Music", "Technology", "Business", "Wellness", "Art"][i % 5],
  price: (i % 5) * 50000,
  imageUrl: `https://picsum.photos/seed/event${i + 1}/600/400`,
  organizer: `Organizer ${i + 1}`,
  venue: `Venue ${i + 1}`,
  availableTickets: 100 + i * 5,
}));

export const mockTransactions: Transaction[] = [

];

export const mockUser : User[] = [

];

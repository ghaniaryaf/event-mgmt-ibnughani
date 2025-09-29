export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  imageUrl: string;
  organizer: string;
  venue: string;
  availableTickets: number;
}

export interface FilterOptions {
  category: string;
  location: string;
  priceRange: 'all' | 'free' | 'paid';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  eventsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FilterOptions {
  category: string;
  location: string;
  priceRange: 'all' | 'free' | 'paid';
  sortOrder: 'newest' | 'oldest'; // ✅ tambahin ini
}

export interface User {
  id: string; // uuid
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  profilePicture?: string;
  role: "customer" | "organizer";
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Transaction {
  id: string; // uuid
  userId: string; // FK to users
  eventId: string; // FK to events
  amount: number;
  status: "completed" | "pending" | "cancelled";
  paymentMethod: "credit_card" | "debit_card" | "bank_transfer" | "ewallet";
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
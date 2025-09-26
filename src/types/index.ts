export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'organizer';
  referral_code: string;
  profile_picture?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  referral_code?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProfileUpdateRequest {
  full_name?: string;
  phone_number?: string;
  profile_picture?: string;
}
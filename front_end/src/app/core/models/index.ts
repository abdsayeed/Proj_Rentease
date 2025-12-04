/**
 * TypeScript interfaces matching backend JSON responses
 */

// User interface
export interface User {
  _id: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  createdAt?: string;
}

// Property interface
export interface Property {
  _id: string;
  type: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  property_type: 'apartment' | 'house' | 'flat' | 'studio' | 'penthouse';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities?: string[];
  images?: string[];
  agent_id?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Favorite interface
export interface Favorite {
  _id: string;
  type: string;
  user_id: string;
  property_id: string;
  createdAt?: string;
}

// Inquiry interface
export interface Inquiry {
  _id: string;
  type: string;
  user_id: string;
  property_id: string;
  agent_id?: string;
  message: string;
  status?: 'pending' | 'responded' | 'closed';
  createdAt?: string;
}

// Auth request/response interfaces
export interface RegisterRequest {
  email: string;
  password: string;
  role?: 'user' | 'agent';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  msg: string;
  access_token: string;
  role: string;
  user_id?: string;
}

export interface RegisterResponse {
  msg: string;
  user_id: string;
  role: string;
}

// Property filter interface
export interface PropertyFilters {
  district?: string;
  type?: string;
  price_min?: number;
  price_max?: number;
}

// Statistics interface
export interface Statistics {
  users: number;
  properties: number;
  favorites: number;
  inquiries: number;
}

// Generic API response interfaces
export interface ApiResponse {
  msg?: string;
  message?: string;
  error?: string;
  id?: string;
}

// JWT Token payload interface
export interface TokenPayload {
  sub?: string;
  identity?: string;
  role: string;
  user_id: string;
  exp: number;
}

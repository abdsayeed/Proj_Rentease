// ============================================
// AUTH MODELS
// ============================================

export interface User {
  _id?: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword?: string;
  role: 'user' | 'agent';
}

// ============================================
// PROPERTY MODELS
// ============================================

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'flat'
  | 'studio'
  | 'penthouse'
  | 'bungalow'
  | 'cottage'
  | 'mews';

export interface Property {
  _id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  property_type: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  available: boolean;
  agent_id?: string;
  createdAt?: Date;
}

export interface PropertyFilters {
  district?: string;
  type?: PropertyType;
  price_min?: number;
  price_max?: number;
  search?: string;
}

// ============================================
// USER ACTION MODELS
// ============================================

export interface Favorite {
  _id?: string;
  user_id?: string;
  property_id: string;
  createdAt?: Date;
}

export interface Inquiry {
  _id?: string;
  user_id?: string;
  property_id: string;
  message: string;
  status?: 'pending' | 'responded' | 'closed';
  createdAt?: Date;
}

export interface InquiryRequest {
  property_id: string;
  message: string;
}

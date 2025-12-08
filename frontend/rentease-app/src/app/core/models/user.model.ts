// user roles
export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  CUSTOMER = 'customer'
}

// user interface
export interface User {
  _id?: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  profile_picture?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  favorites?: string[];
}

// login request
export interface LoginRequest {
  email: string;
  password: string;
}

// register request
export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
}

// auth response
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// refresh token request
export interface RefreshTokenRequest {
  refresh_token: string;
}

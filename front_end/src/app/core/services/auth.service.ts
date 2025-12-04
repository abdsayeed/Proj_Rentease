import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
  User,
  TokenPayload
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly ROLE_KEY = 'role';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>('http://127.0.0.1:5000/auth/register', data);
  }

  /**
   * Login user and store token
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('http://127.0.0.1:5000/auth/login', data).pipe(
      tap(response => {
        if (response.access_token) {
          // Store token
          localStorage.setItem(this.TOKEN_KEY, response.access_token);
          
          // Store role directly from response for easy access
          if (response.role) {
            localStorage.setItem(this.ROLE_KEY, response.role);
          }
          
          // Decode token to get user info
          const payload = this.decodeToken(response.access_token);
          if (payload) {
            const user: User = {
              _id: payload.user_id,
              email: '', // Email not in token, would need separate call
              role: payload.role as 'user' | 'agent' | 'admin'
            };
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }
      })
    );
  }

  /**
   * Logout user and clear storage
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    const payload = this.decodeToken(token);
    if (!payload) {
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    if (user && user.role) {
      return user.role;
    }
    
    // Fallback: check localStorage directly for backward compatibility
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role');
      if (role) {
        return role;
      }
    }
    
    return null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is agent
   */
  isAgent(): boolean {
    return this.hasRole('agent') || this.hasRole('admin');
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded) as TokenPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get user ID from token
   */
  getUserId(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    
    const payload = this.decodeToken(token);
    return payload ? payload.user_id : null;
  }
}

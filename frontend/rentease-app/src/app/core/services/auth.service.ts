import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import {
  User,
  UserRole,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  ApiResponse
} from '../models';

// Auth service - handles login, register, logout and token management
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly API_URL = 'http://127.0.0.1:5000';
  
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Writable Signals (source of truth)
  private readonly userSignal = signal<User | null>(null);
  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly refreshTokenSignal = signal<string | null>(null);

  constructor() {
    // Initialize from storage only in browser
    if (this.isBrowser) {
      this.userSignal.set(this.getUserFromStorage());
      this.accessTokenSignal.set(this.getTokenFromStorage());
      this.refreshTokenSignal.set(this.getRefreshTokenFromStorage());
    }
  }

  // Computed Signals (derived state)
  public readonly currentUser = this.userSignal.asReadonly();
  public readonly accessToken = this.accessTokenSignal.asReadonly();
  public readonly isAuthenticated = computed(() => 
    this.userSignal() !== null && this.accessTokenSignal() !== null
  );
  public readonly isAdmin = computed(() => 
    this.userSignal()?.role === UserRole.ADMIN
  );
  public readonly isAgent = computed(() => 
    this.userSignal()?.role === UserRole.AGENT
  );
  public readonly isCustomer = computed(() => 
    this.userSignal()?.role === UserRole.CUSTOMER
  );

  // For Mutex pattern in interceptor
  public readonly refreshTokenSubject$ = new BehaviorSubject<string | null>(null);

  // login user
  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  // register new user
  register(userData: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/register`, userData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data);
        }
      }),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  // refresh access token
  refreshToken(): Observable<ApiResponse<{ access_token: string }>> {
    const refreshToken = this.refreshTokenSignal();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const payload: RefreshTokenRequest = { refresh_token: refreshToken };
    return this.http.post<ApiResponse<{ access_token: string }>>(
      `${this.API_URL}/auth/refresh`,
      payload
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.accessTokenSignal.set(response.data.access_token);
          if (this.isBrowser) {
            localStorage.setItem('access_token', response.data.access_token);
          }
        }
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // logout and clear data
  logout(): void {
    this.userSignal.set(null);
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.clearStorage();
    this.router.navigate(['/auth/login']);
  }

  // save auth data to signals and storage
  private setAuthData(authData: AuthResponse): void {
    this.userSignal.set(authData.user);
    this.accessTokenSignal.set(authData.access_token);
    this.refreshTokenSignal.set(authData.refresh_token);

    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('access_token', authData.access_token);
      localStorage.setItem('refresh_token', authData.refresh_token);
    }
  }

  // get user from localStorage
  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  // get access token from localStorage
  private getTokenFromStorage(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('access_token');
  }

  // get refresh token from localStorage
  private getRefreshTokenFromStorage(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('refresh_token');
  }

  // clear all auth data from storage
  private clearStorage(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem(environment.tokenKey);
    if (!token) {
      this.logout();
    }
  }

  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => this.saveAuth(response)),
        catchError(err => {
          console.error('Registration error:', err);
          throw err;
        })
      );
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, data)
      .pipe(
        tap(response => this.saveAuth(response)),
        catchError(err => {
          console.error('Login error:', err);
          throw err;
        })
      );
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.userKey);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(environment.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(environment.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  private saveAuth(response: LoginResponse): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(environment.tokenKey, response.token);
    localStorage.setItem(environment.userKey, JSON.stringify(response.user));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { 
  Property, 
  Favorite, 
  Inquiry, 
  Statistics, 
  PropertyFilters,
  AuthResponse,
  RegisterResponse,
  RegisterRequest,
  LoginRequest
} from '../core/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:5000';
  private requestTimeout = 8000; // 8 seconds

  constructor(private http: HttpClient) {}

  // Auth
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {});
  }

  // Properties
  getProperties(filters?: PropertyFilters): Observable<Property[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.district) params = params.set('district', filters.district);
      if (filters.type) params = params.set('type', filters.type);
      if (filters.price_min) params = params.set('price_min', filters.price_min.toString());
      if (filters.price_max) params = params.set('price_max', filters.price_max.toString());
    }
    return this.http.get<Property[]>(`${this.baseUrl}/api/v1/properties/`, { params }).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  getProperty(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.baseUrl}/api/v1/properties/${id}`).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  addProperty(data: Partial<Property>): Observable<Property> {
    return this.http.post<Property>(`${this.baseUrl}/api/v1/properties/`, data);
  }

  // Agent
  getMyProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.baseUrl}/api/v1/agent/properties`).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  getAgentProperties(): Observable<Property[]> {
    return this.getMyProperties();
  }

  createProperty(data: Partial<Property>): Observable<Property> {
    return this.http.post<Property>(`${this.baseUrl}/api/v1/agent/properties`, data);
  }

  createAgentProperty(data: Partial<Property>): Observable<Property> {
    return this.http.post<Property>(`${this.baseUrl}/api/v1/agent/properties`, data);
  }

  updateProperty(id: string, data: Partial<Property>): Observable<Property> {
    return this.http.put<Property>(`${this.baseUrl}/api/v1/agent/properties/${id}`, data);
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/agent/properties/${id}`);
  }

  // User
  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.baseUrl}/api/v1/users/favorites`).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  addFavorite(propertyId: string): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.baseUrl}/api/v1/users/favorites`, { property_id: propertyId });
  }

  removeFavorite(propertyId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/users/favorites/${propertyId}`);
  }

  sendInquiry(data: Partial<Inquiry>): Observable<Inquiry> {
    return this.http.post<Inquiry>(`${this.baseUrl}/api/v1/users/inquiries`, data);
  }

  getInquiries(): Observable<Inquiry[]> {
    return this.http.get<Inquiry[]>(`${this.baseUrl}/api/v1/users/inquiries`);
  }

  // Admin
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/v1/admin/users`).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  getStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.baseUrl}/api/v1/admin/statistics`).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/v1/admin/users/${userId}/role`, { role });
  }

  getAllProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.baseUrl}/api/v1/admin/properties`).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  adminDeleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/admin/properties/${id}`);
  }
}

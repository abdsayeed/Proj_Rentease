import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:5000';
  private requestTimeout = 8000; // 8 seconds

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Auth
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, { headers: this.getHeaders() });
  }

  // Properties
  getProperties(filters?: any): Observable<any> {
    let url = `${this.baseUrl}/api/v1/properties/`;
    if (filters) {
      const params = new URLSearchParams(filters).toString();
      url += `?${params}`;
    }
    return this.http.get(url);
  }

  getProperty(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v1/properties/${id}`).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  addProperty(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v1/properties/`, data);
  }

  // Agent
  getMyProperties(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v1/agent/properties`, { headers: this.getHeaders() }).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  getAgentProperties(): Observable<any> {
    return this.getMyProperties();
  }

  createProperty(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v1/agent/properties`, data, { headers: this.getHeaders() });
  }

  updateProperty(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/v1/agent/properties/${id}`, data, { headers: this.getHeaders() });
  }

  deleteProperty(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/v1/agent/properties/${id}`, { headers: this.getHeaders() });
  }

  // User
  getFavorites(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v1/users/favorites`, { headers: this.getHeaders() }).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  addFavorite(propertyId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v1/users/favorites`, { property_id: propertyId }, { headers: this.getHeaders() });
  }

  removeFavorite(propertyId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/v1/users/favorites/${propertyId}`, { headers: this.getHeaders() });
  }

  sendInquiry(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v1/users/inquiries`, data, { headers: this.getHeaders() });
  }

  getInquiries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v1/users/inquiries`, { headers: this.getHeaders() });
  }

  // Admin
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v1/admin/users`, { headers: this.getHeaders() }).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  getStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v1/admin/statistics`, { headers: this.getHeaders() }).pipe(
      timeout(this.requestTimeout),
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => err);
      })
    );
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/v1/admin/users/${userId}/role`, { role }, { headers: this.getHeaders() });
  }
}

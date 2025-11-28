import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Property, PropertyFilters, Favorite, Inquiry, InquiryRequest, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Properties
  getProperties(filters?: PropertyFilters): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      if (filters.district) params = params.set('district', filters.district);
      if (filters.type) params = params.set('type', filters.type);
      if (filters.price_min) params = params.set('price_min', filters.price_min.toString());
      if (filters.price_max) params = params.set('price_max', filters.price_max.toString());
      if (filters.search) params = params.set('search', filters.search);
    }
    return this.http.get<any>(`${this.apiUrl}/properties`, { params })
      .pipe(catchError(this.handleError));
  }

  getProperty(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/properties/${id}`)
      .pipe(catchError(this.handleError));
  }

  createProperty(data: any): Observable<Property> {
    return this.http.post<Property>(`${this.apiUrl}/properties`, data)
      .pipe(catchError(this.handleError));
  }

  updateProperty(id: string, data: any): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/properties/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  deleteProperty(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/properties/${id}`)
      .pipe(catchError(this.handleError));
  }

  getMyProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties/agent/my-properties`)
      .pipe(catchError(this.handleError));
  }

  // Favorites
  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites`)
      .pipe(catchError(this.handleError));
  }

  addFavorite(propertyId: string): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/favorites`, { property_id: propertyId })
      .pipe(catchError(this.handleError));
  }

  removeFavorite(propertyId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/favorites/${propertyId}`)
      .pipe(catchError(this.handleError));
  }

  // Inquiries
  sendInquiry(data: InquiryRequest): Observable<Inquiry> {
    return this.http.post<Inquiry>(`${this.apiUrl}/inquiries`, data)
      .pipe(catchError(this.handleError));
  }

  getInquiries(): Observable<Inquiry[]> {
    return this.http.get<Inquiry[]>(`${this.apiUrl}/inquiries`)
      .pipe(catchError(this.handleError));
  }

  getSentInquiries(): Observable<Inquiry[]> {
    return this.http.get<Inquiry[]>(`${this.apiUrl}/inquiries/sent`)
      .pipe(catchError(this.handleError));
  }

  updateInquiry(id: string, status: string): Observable<Inquiry> {
    return this.http.patch<Inquiry>(`${this.apiUrl}/inquiries/${id}`, { status })
      .pipe(catchError(this.handleError));
  }

  // User Profile
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`)
      .pipe(catchError(this.handleError));
  }

  updateProfile(data: any): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/profile`, data)
      .pipe(catchError(this.handleError));
  }

  // Admin
  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/statistics`)
      .pipe(catchError(this.handleError));
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/users`)
      .pipe(catchError(this.handleError));
  }

  updateUserRole(userId: string, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/admin/users/${userId}`, { role })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    throw error;
  }
}

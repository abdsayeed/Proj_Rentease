import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { User, Property, Booking, ApiResponse } from '../models';

// Admin service - admin only operations
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://127.0.0.1:5000/api/v1/admin';

  // get all users
  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.API_URL}/users`).pipe(
      catchError(error => {
        console.error('Get all users error:', error);
        return throwError(() => error);
      })
    );
  }

  // delete user
  deleteUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/users/${userId}`).pipe(
      catchError(error => {
        console.error('Delete user error:', error);
        return throwError(() => error);
      })
    );
  }

  // update user role
  updateUserRole(userId: string, role: string): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.API_URL}/users/${userId}/role`, { role }).pipe(
      catchError(error => {
        console.error('Update user role error:', error);
        return throwError(() => error);
      })
    );
  }

  // get all properties
  getAllProperties(): Observable<ApiResponse<Property[]>> {
    return this.http.get<ApiResponse<Property[]>>(`${this.API_URL}/properties`).pipe(
      catchError(error => {
        console.error('Get all properties error:', error);
        return throwError(() => error);
      })
    );
  }

  // delete property
  deleteProperty(propertyId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/properties/${propertyId}`).pipe(
      catchError(error => {
        console.error('Delete property error:', error);
        return throwError(() => error);
      })
    );
  }

  // get all bookings
  getAllBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.API_URL}/bookings`).pipe(
      catchError(error => {
        console.error('Get all bookings error:', error);
        return throwError(() => error);
      })
    );
  }

  // get dashboard stats
  getStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/statistics`).pipe(
      catchError(error => {
        console.error('Get statistics error:', error);
        return throwError(() => error);
      })
    );
  }
}

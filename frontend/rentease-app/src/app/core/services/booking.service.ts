import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {
  Booking,
  BookingPayload,
  AvailabilityCheck,
  AvailabilityResponse,
  ApiResponse
} from '../models';

// Booking service - handles all booking operations
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://127.0.0.1:5000/api/v1';

  // create new booking
  createBooking(payload: BookingPayload): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(`${this.API_URL}/bookings`, payload).pipe(
      catchError(error => {
        console.error('Create booking error:', error);
        return throwError(() => error);
      })
    );
  }

  // get user's bookings
  getUserBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.API_URL}/bookings/my-bookings`).pipe(
      catchError(error => {
        console.error('Get user bookings error:', error);
        return throwError(() => error);
      })
    );
  }

  // get booking by id
  getBookingById(id: string): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(`${this.API_URL}/bookings/${id}`).pipe(
      catchError(error => {
        console.error('Get booking error:', error);
        return throwError(() => error);
      })
    );
  }

  // cancel booking
  cancelBooking(id: string): Observable<ApiResponse<Booking>> {
    return this.http.patch<ApiResponse<Booking>>(`${this.API_URL}/bookings/${id}/cancel`, {}).pipe(
      catchError(error => {
        console.error('Cancel booking error:', error);
        return throwError(() => error);
      })
    );
  }

  // check if property is available
  checkAvailability(check: AvailabilityCheck): Observable<ApiResponse<AvailabilityResponse>> {
    return this.http.post<ApiResponse<AvailabilityResponse>>(
      `${this.API_URL}/bookings/check-availability`,
      check
    ).pipe(
      catchError(error => {
        console.error('Check availability error:', error);
        return throwError(() => error);
      })
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { User, ApiResponse } from '../models';

// User service - profile and favorites management
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://127.0.0.1:5000/api/v1/users';

  // get user profile
  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/profile`).pipe(
      catchError(error => {
        console.error('Get profile error:', error);
        return throwError(() => error);
      })
    );
  }

  // update user profile
  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/profile`, data).pipe(
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => error);
      })
    );
  }

  // upload profile picture
  uploadProfilePicture(file: File): Observable<ApiResponse<{ profile_picture: string }>> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    return this.http.post<ApiResponse<{ profile_picture: string }>>(
      `${this.API_URL}/profile/picture`,
      formData
    ).pipe(
      catchError(error => {
        console.error('Upload profile picture error:', error);
        return throwError(() => error);
      })
    );
  }

  // get user's favorites
  getFavorites(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.API_URL}/favorites`).pipe(
      catchError(error => {
        console.error('Get favorites error:', error);
        return throwError(() => error);
      })
    );
  }

  // add to favorites
  addFavorite(propertyId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/favorites/${propertyId}`, {}).pipe(
      catchError(error => {
        console.error('Add favorite error:', error);
        return throwError(() => error);
      })
    );
  }

  // remove from favorites
  removeFavorite(propertyId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/favorites/${propertyId}`).pipe(
      catchError(error => {
        console.error('Remove favorite error:', error);
        return throwError(() => error);
      })
    );
  }
}

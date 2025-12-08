import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  Property,
  PropertySearchFilters,
  PropertyPayload,
  ApiResponse
} from '../models';

// Property service - CRUD operations for properties
@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://127.0.0.1:5000/api/v1';

  // cache for loaded properties
  public readonly propertiesCache = signal<Property[]>([]);

  // get all properties with filters
  getProperties(filters?: PropertySearchFilters): Observable<ApiResponse<Property[]>> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v.toString()));
          } else {
            params = params.append(key, value.toString());
          }
        }
      });
    }

    return this.http.get<ApiResponse<Property[]>>(`${this.API_URL}/properties`, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.propertiesCache.set(response.data);
        }
      }),
      catchError(error => {
        console.error('Get properties error:', error);
        return throwError(() => error);
      })
    );
  }

  // get single property by id
  getPropertyById(id: string): Observable<ApiResponse<Property>> {
    return this.http.get<ApiResponse<Property>>(`${this.API_URL}/properties/${id}`).pipe(
      catchError(error => {
        console.error('Get property error:', error);
        return throwError(() => error);
      })
    );
  }

  // create new property
  createProperty(payload: PropertyPayload): Observable<ApiResponse<Property>> {
    return this.http.post<ApiResponse<Property>>(`${this.API_URL}/properties`, payload).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Add to cache
          this.propertiesCache.update(props => [...props, response.data!]);
        }
      }),
      catchError(error => {
        console.error('Create property error:', error);
        return throwError(() => error);
      })
    );
  }

  // update existing property
  updateProperty(id: string, payload: Partial<PropertyPayload>): Observable<ApiResponse<Property>> {
    return this.http.put<ApiResponse<Property>>(`${this.API_URL}/properties/${id}`, payload).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update in cache
          this.propertiesCache.update(props =>
            props.map(p => p._id === id ? response.data! : p)
          );
        }
      }),
      catchError(error => {
        console.error('Update property error:', error);
        return throwError(() => error);
      })
    );
  }

  // delete property
  deleteProperty(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/properties/${id}`).pipe(
      tap(response => {
        if (response.success) {
          // Remove from cache
          this.propertiesCache.update(props => props.filter(p => p._id !== id));
        }
      }),
      catchError(error => {
        console.error('Delete property error:', error);
        return throwError(() => error);
      })
    );
  }

  // get agent's own properties
  getAgentProperties(): Observable<ApiResponse<Property[]>> {
    return this.http.get<ApiResponse<Property[]>>(`${this.API_URL}/properties/agent/my-properties`).pipe(
      catchError(error => {
        console.error('Get agent properties error:', error);
        return throwError(() => error);
      })
    );
  }

  // upload property images
  uploadImages(propertyId: string, images: File[]): Observable<ApiResponse<string[]>> {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));

    return this.http.post<ApiResponse<string[]>>(
      `${this.API_URL}/properties/${propertyId}/images`,
      formData
    ).pipe(
      catchError(error => {
        console.error('Upload images error:', error);
        return throwError(() => error);
      })
    );
  }
}

import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Flag to prevent multiple simultaneous token refreshes
 */
let isRefreshing = false;

/**
 * Subject to queue requests during token refresh
 */
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * authInterceptor - Functional HTTP Interceptor with Mutex Pattern
 * 
 * Features:
 * - Automatically adds JWT token to requests
 * - Handles 401 errors with token refresh
 * - Mutex pattern prevents multiple concurrent refresh calls
 * - Queues requests during token refresh
 * 
 * Mutex Pattern Explanation:
 * 1. First 401 error → Sets isRefreshing = true, calls refreshToken()
 * 2. Other 401 errors → Wait on refreshTokenSubject$ BehaviorSubject
 * 3. When refresh completes → Emit new token, all waiting requests retry
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  // Clone request and add Authorization header if token exists
  let authReq = req;
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Handle 401 error with token refresh and mutex pattern
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  // If not already refreshing, acquire lock
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(response => {
        isRefreshing = false;
        if (response.success && response.data) {
          const newToken = response.data.access_token;
          refreshTokenSubject.next(newToken);

          // Retry original request with new token
          return next(addTokenToRequest(request, newToken));
        }
        return throwError(() => new Error('Token refresh failed'));
      }),
      catchError(err => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  }

  // If already refreshing, wait for new token
  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next(addTokenToRequest(request, token!)))
  );
}

/**
 * Add Authorization token to request
 */
function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

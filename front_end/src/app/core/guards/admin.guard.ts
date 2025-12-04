import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Admin Guard
 * Protects routes that require admin role
 * Redirects to home if user doesn't have admin role
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if user has admin role
  if (authService.isAdmin()) {
    return true;
  }

  // Redirect to home if not authorized
  router.navigate(['/']);
  return false;
};

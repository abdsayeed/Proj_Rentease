import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Agent Guard
 * Protects routes that require agent or admin role
 * Redirects to home if user doesn't have required role
 */
export const agentGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Agent Guard - Checking access...');
  console.log('Agent Guard - Is authenticated:', authService.isAuthenticated());
  console.log('Agent Guard - User role:', authService.getUserRole());
  console.log('Agent Guard - Is agent:', authService.isAgent());

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    console.log('Agent Guard - Not authenticated, redirecting to login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if user has agent or admin role
  if (authService.isAgent()) {
    console.log('Agent Guard - Access granted');
    return true;
  }

  // Redirect to home if not authorized
  console.log('Agent Guard - Not authorized, redirecting to home');
  router.navigate(['/']);
  return false;
};

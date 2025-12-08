import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

// auth guard - checks if user is logged in
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (authService.isAuthenticated()) {
    return true;
  }

  // redirect to login
  const returnUrl = isPlatformBrowser(platformId) ? window.location.pathname : '/';
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl }
  });
};

// admin guard - admin only
export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};

// agent guard - agent only
export const agentGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAgent()) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};

// guest guard - non logged in users only
export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // already logged in
  return router.createUrlTree(['/']);
};

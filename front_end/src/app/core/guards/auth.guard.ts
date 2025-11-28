import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    return this.auth.isAuthenticated() ? true : (this.router.navigate(['/login']), false);
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : (router.navigate(['/login']), false);
};

export const agentGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated() && auth.hasRole('agent')) {
    return true;
  }
  router.navigate(['/']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated() && auth.hasRole('admin')) {
    return true;
  }
  router.navigate(['/']);
  return false;
};

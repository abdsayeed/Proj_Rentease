import { Routes } from '@angular/router';
import { authGuard, agentGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/properties/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: 'properties', pathMatch: 'full' },
  { path: 'properties', component: HomeComponent },
  { path: 'properties/:id', component: undefined },

  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes
  {
    path: 'dashboard',
    component: undefined,
    canActivate: [authGuard]
  },
  {
    path: 'favorites',
    component: undefined,
    canActivate: [authGuard]
  },
  {
    path: 'add-property',
    component: undefined,
    canActivate: [agentGuard]
  },

  // Catch-all
  { path: '**', redirectTo: 'properties' }
];

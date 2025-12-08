import { Routes } from '@angular/router';
import { authGuard, adminGuard, agentGuard, guestGuard } from './core/guards/auth.guard';

// App routes
export const routes: Routes = [
  // Home
  {
    path: '',
    loadComponent: () => import('./features/properties/property-list/property-list.component').then(m => m.PropertyListComponent),
    title: 'RentEase - Find Your Perfect Rental'
  },

  // Auth routes (guest only)
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Login - RentEase'
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Register - RentEase'
  },

  // Properties routes
  {
    path: 'properties',
    loadComponent: () => import('./features/properties/property-list/property-list.component').then(m => m.PropertyListComponent),
    title: 'Browse Properties - RentEase'
  },
  {
    path: 'properties/:id',
    loadComponent: () => import('./features/properties/property-detail/property-detail.component').then(m => m.PropertyDetailComponent),
    title: 'Property Details - RentEase'
  },

  // Booking routes
  {
    path: 'bookings/new',
    loadComponent: () => import('./features/bookings/booking-wizard/booking-wizard.component').then(m => m.BookingWizardComponent),
    canActivate: [authGuard],
    title: 'Book Property - RentEase'
  },

  // User routes (authenticated)
  {
    path: 'user',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
        title: 'My Dashboard - RentEase'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
        title: 'My Profile - RentEase'
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
        title: 'My Bookings - RentEase'
      },
      {
        path: 'favorites',
        loadComponent: () => import('./features/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
        title: 'My Favorites - RentEase'
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
        title: 'Settings - RentEase'
      }
    ]
  },

  // Agent routes (agent only)
  {
    path: 'agent',
    canActivate: [authGuard, agentGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/agent/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent),
        title: 'Agent Dashboard - RentEase'
      },
      {
        path: 'properties',
        loadComponent: () => import('./features/agent/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent),
        title: 'My Properties - RentEase'
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/agent/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent),
        title: 'Property Bookings - RentEase'
      }
    ]
  },

  // Admin routes (admin only)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard - RentEase'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Manage Users - RentEase'
      },
      {
        path: 'properties',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Manage Properties - RentEase'
      }
    ]
  },

  // Unauthorized page
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/properties/property-list/property-list.component').then(m => m.PropertyListComponent),
    title: 'Unauthorized - RentEase'
  },

  // 404 Not Found
  {
    path: '**',
    redirectTo: ''
  }
];

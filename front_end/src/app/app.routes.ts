import { Routes } from '@angular/router';
import { authGuard, agentGuard, adminGuard } from './core';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/properties',
    pathMatch: 'full'
  },
  {
    path: 'properties',
    loadComponent: () => import('./home/home').then(m => m.Home)
  },
  {
    path: 'property/:id',
    loadComponent: () => import('./property-details/property-details').then(m => m.PropertyDetails)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register').then(m => m.Register)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'favorites',
    loadComponent: () => import('./favorites/favorites').then(m => m.Favorites),
    canActivate: [authGuard]
  },
  {
    path: 'add-property',
    loadComponent: () => import('./add-property/add-property').then(m => m.AddProperty),
    canActivate: [agentGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then(m => m.Admin),
    canActivate: [adminGuard]
  },
  {
    path: '**',
    redirectTo: '/properties'
  }
];

import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { PropertyDetails } from './property-details/property-details';
import { Dashboard } from './dashboard/dashboard';
import { Favorites } from './favorites/favorites';
import { AddProperty } from './add-property/add-property';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'property/:id', component: PropertyDetails },
  { path: 'dashboard', component: Dashboard },
  { path: 'favorites', component: Favorites },
  { path: 'add-property', component: AddProperty },
  { path: '**', redirectTo: '' }
];

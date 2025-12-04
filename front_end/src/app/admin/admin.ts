import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../core/services/auth.service';

interface User {
  _id: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface Property {
  _id: string;
  title: string;
  location: string;
  price: number;
  property_type?: string;
  available: boolean;
}

interface Statistics {
  users: number;
  properties: number;
  favorites: number;
  inquiries: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  activeTab: 'users' | 'properties' = 'users';
  users: User[] = [];
  properties: Property[] = [];
  statistics: Statistics | null = null;
  loadingUsers = false;
  loadingProperties = false;
  error = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof window === 'undefined') return;
    
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadStatistics();
    this.loadUsers();
    this.loadProperties();
  }

  loadStatistics() {
    this.apiService.getStatistics().subscribe({
      next: (stats: any) => {
        this.statistics = stats;
      },
      error: (err) => {
        console.error('Failed to load statistics', err);
      }
    });
  }

  loadUsers() {
    this.loadingUsers = true;
    this.error = '';

    this.apiService.getAllUsers().subscribe({
      next: (users: any) => {
        this.users = users;
        this.loadingUsers = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load users';
        this.loadingUsers = false;
      }
    });
  }

  loadProperties() {
    this.loadingProperties = true;

    this.apiService.getAllProperties().subscribe({
      next: (properties: any) => {
        this.properties = properties;
        this.loadingProperties = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load properties';
        this.loadingProperties = false;
      }
    });
  }

  updateUserRole(userId: string, newRole: string) {
    this.apiService.updateUserRole(userId, newRole).subscribe({
      next: () => {
        alert('User role updated successfully');
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to update user role';
        this.loadUsers();
      }
    });
  }

  deleteProperty(propertyId: string) {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    this.apiService.adminDeleteProperty(propertyId).subscribe({
      next: () => {
        this.properties = this.properties.filter(p => p._id !== propertyId);
        this.loadStatistics();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to delete property';
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}

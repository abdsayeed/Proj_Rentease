import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  role = '';
  userEmail = '';
  loading = false;
  
  // User data
  favorites: any[] = [];
  inquiries: any[] = [];
  
  // Agent data
  myProperties: any[] = [];
  
  // Admin data
  statistics: any = null;
  allUsers: any[] = [];

  constructor(
    private apiService: ApiService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }
    
    this.role = localStorage.getItem('role') || 'user';
    
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadDashboardData();
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  loadDashboardData() {
    if (this.role === 'admin') {
      this.loadAdminData();
    } else if (this.role === 'agent') {
      this.loadAgentData();
    } else {
      this.loadUserData();
    }
  }

  loadUserData() {
    this.loading = true;
    console.log('Loading user favorites...');
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        console.error('Request timeout');
        this.loading = false;
        alert('Request timeout. Please refresh the page.');
      }
    }, 10000);
    
    this.apiService.getFavorites().subscribe({
      next: (data) => {
        clearTimeout(timeoutId);
        console.log('Favorites loaded:', data);
        this.favorites = data;
        this.loading = false;
      },
      error: (err) => {
        clearTimeout(timeoutId);
        console.error('Error loading favorites:', err);
        this.loading = false;
        alert('Failed to load favorites. Please try logging in again.');
      }
    });
    
    this.apiService.getInquiries().subscribe({
      next: (data) => this.inquiries = data,
      error: (err) => console.error(err)
    });
  }

  loadAgentData() {
    this.loading = true;
    console.log('Loading agent properties...');
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        console.error('Request timeout');
        this.loading = false;
        alert('Request timeout. Please refresh the page.');
      }
    }, 10000);
    
    this.apiService.getAgentProperties().subscribe({
      next: (data: any) => {
        clearTimeout(timeoutId);
        console.log('Agent properties loaded:', data);
        this.myProperties = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err: any) => {
        clearTimeout(timeoutId);
        console.error('Error loading agent properties:', err);
        this.loading = false;
        this.myProperties = [];
        alert('Failed to load properties. Please check your connection.');
      }
    });
  }

  loadAdminData() {
    this.loading = true;
    console.log('Loading admin statistics...');
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        console.error('Request timeout');
        this.loading = false;
        alert('Request timeout. Please refresh the page.');
      }
    }, 10000);
    
    this.apiService.getStatistics().subscribe({
      next: (data) => {
        clearTimeout(timeoutId);
        console.log('Statistics loaded:', data);
        this.statistics = data;
        this.loading = false;
      },
      error: (err) => {
        clearTimeout(timeoutId);
        console.error('Error loading statistics:', err);
        this.loading = false;
        alert('Failed to load statistics. Please try again.');
      }
    });
    
    this.apiService.getAllUsers().subscribe({
      next: (data) => this.allUsers = data,
      error: (err) => console.error(err)
    });
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
        this.router.navigate(['/login']);
      },
      error: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
        this.router.navigate(['/login']);
      }
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToFavorites() {
    this.router.navigate(['/favorites']);
  }

  goToAddProperty() {
    this.router.navigate(['/add-property']);
  }

  viewProperty(id: string) {
    this.router.navigate(['/property', id]);
  }
}

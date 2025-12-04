import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../core/services/auth.service';

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
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }
    
    // Use AuthService for role detection
    this.role = this.authService.getUserRole() || 'user';
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadDashboardData();
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
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
    this.loading = false; // Show content immediately
    console.log('Loading user data...');
    
    this.apiService.getFavorites().subscribe({
      next: (data) => {
        console.log('Favorites loaded:', data);
        this.favorites = data || [];
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.favorites = [];
      }
    });
    
    this.apiService.getInquiries().subscribe({
      next: (data) => {
        this.inquiries = data || [];
      },
      error: (err) => {
        console.error('Error loading inquiries:', err);
        this.inquiries = [];
      }
    });
  }

  loadAgentData() {
    this.loading = false; // Show content immediately
    console.log('Loading agent properties...');
    
    this.apiService.getAgentProperties().subscribe({
      next: (data: any) => {
        console.log('Agent properties loaded:', data);
        this.myProperties = Array.isArray(data) ? data : [];
      },
      error: (err: any) => {
        console.error('Error loading agent properties:', err);
        this.myProperties = [];
      }
    });
  }

  loadAdminData() {
    this.loading = false; // Show content immediately
    console.log('Loading admin statistics...');
    
    this.apiService.getStatistics().subscribe({
      next: (data) => {
        console.log('Statistics loaded:', data);
        this.statistics = data;
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
      }
    });
    
    this.apiService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data || [];
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.allUsers = [];
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
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
    this.router.navigate(['/properties', id]);
  }
}

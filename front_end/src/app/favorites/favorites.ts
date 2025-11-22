import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class Favorites implements OnInit {
  favorites: any[] = [];
  properties: any[] = [];
  loading = true;
  error = '';

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
    
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadFavorites();
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  loadFavorites() {
    this.apiService.getFavorites().subscribe({
      next: (data) => {
        this.favorites = data;
        this.loadPropertyDetails();
      },
      error: (err) => {
        this.error = 'Failed to load favorites';
        this.loading = false;
      }
    });
  }

  loadPropertyDetails() {
    const propertyIds = this.favorites.map(f => f.property_id);
    
    propertyIds.forEach(id => {
      this.apiService.getProperty(id).subscribe({
        next: (property) => {
          this.properties.push(property);
        },
        error: () => {}
      });
    });
    
    this.loading = false;
  }

  removeFavorite(propertyId: string) {
    this.apiService.removeFavorite(propertyId).subscribe({
      next: () => {
        this.properties = this.properties.filter(p => p._id !== propertyId);
        this.favorites = this.favorites.filter(f => f.property_id !== propertyId);
      },
      error: (err) => console.error(err)
    });
  }

  viewProperty(id: string) {
    this.router.navigate(['/property', id]);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}

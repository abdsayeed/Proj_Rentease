import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = [];
  loading = false;
  error = '';
  
  // Filters
  searchQuery = '';
  selectedDistrict = '';
  selectedType = '';
  minPrice = '';
  maxPrice = '';
  
  districts = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol', 'Edinburgh', 'Glasgow', 'Cardiff', 'Newcastle', 'Sheffield', 'Nottingham', 'Southampton', 'Leicester', 'Cambridge', 'Oxford'];
  propertyTypes = ['apartment', 'house', 'flat', 'studio', 'penthouse', 'bungalow', 'cottage'];

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
    this.loadProperties();
  }

  loadProperties() {
    this.loading = true;
    this.error = '';
    
    const filters: any = {};
    if (this.selectedDistrict) filters.district = this.selectedDistrict;
    if (this.selectedType) filters.type = this.selectedType;
    if (this.minPrice) filters.price_min = this.minPrice;
    if (this.maxPrice) filters.price_max = this.maxPrice;
    
    this.apiService.getProperties(filters).subscribe({
      next: (data) => {
        this.properties = data;
        this.filteredProperties = data;
        this.applySearch();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load properties';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applySearch() {
    if (!this.searchQuery) {
      this.filteredProperties = this.properties;
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredProperties = this.properties.filter(p => 
      p.title?.toLowerCase().includes(query) || 
      p.location?.toLowerCase().includes(query)
    );
  }

  viewDetails(propertyId: string) {
    this.router.navigate(['/property', propertyId]);
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedDistrict = '';
    this.selectedType = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.loadProperties();
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
